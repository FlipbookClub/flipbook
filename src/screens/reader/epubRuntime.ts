// The JavaScript that runs INSIDE the WebView, alongside epub.js and JSZip.
//
// Exported as a string and inlined into the reader HTML (see epubReaderHtml.ts)
// rather than shipped as a file, so the whole reader is one self-contained
// document that loads over file:// with no network.
//
// Protocol, both directions:
//   web -> RN   window.ReactNativeWebView.postMessage(JSON.stringify(msg))
//   RN  -> web  window.__epubBridge.handle(msg)
//
// Keep this ES5-ish and dependency-free. It is a string, so nothing typechecks
// it and nothing transpiles it.

export const EPUB_RUNTIME = String.raw`
(function () {
  var book = null;
  var rendition = null;
  var ready = false;
  // Set once locations are generated; until then percentages are estimated
  // from the spine index (see percentFor).
  var locationsReady = false;
  var currentCfi = null;

  function post(msg) {
    try {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    } catch (e) {
      // A failed post must never take the reader down with it.
    }
  }

  function debug(tag, detail) {
    post({ type: "debug", tag: tag, detail: detail === undefined ? null : String(detail) });
  }

  function fail(where, err) {
    post({
      type: "error",
      where: where,
      message: err && err.message ? err.message : String(err),
    });
  }

  // epub.js only knows a true percentage once book.locations is generated,
  // which is O(book) and far too slow to block first paint on. Until it lands,
  // approximate from how far through the spine we are. The estimate is coarse
  // but monotonic, which is what a progress bar actually needs.
  function percentFor(location) {
    try {
      if (locationsReady && location && location.start && location.start.cfi) {
        var p = book.locations.percentageFromCfi(location.start.cfi);
        if (typeof p === "number" && !isNaN(p)) return Math.round(p * 100);
      }
      if (location && location.start && typeof location.start.index === "number") {
        var total = (book.spine && book.spine.length) || 1;
        return Math.round(((location.start.index + 1) / total) * 100);
      }
    } catch (e) {
      // fall through
    }
    return 0;
  }

  // epub.js paginates with CSS columns inside a per-section iframe and ships
  // next()/prev() but NO touch navigation, so without this the only way to
  // turn a page is the table of contents. Listeners must go on each section's
  // own document: touches inside the iframe never reach the outer one.
  var SWIPE_MIN_PX = 40;
  var SWIPE_MAX_MS = 800;

  function attachGestures(doc, label) {
    if (!doc) {
      debug("attach:no-document", label);
      return;
    }
    if (doc.__flipbookGestures) {
      debug("attach:already", label);
      return;
    }
    doc.__flipbookGestures = true;
    debug("attach:ok", label);

    var sx = 0, sy = 0, st = 0, tracking = false;

    doc.addEventListener(
      "touchstart",
      function (e) {
        if (!e.changedTouches || !e.changedTouches.length) return;
        var t = e.changedTouches[0];
        sx = t.clientX;
        sy = t.clientY;
        st = Date.now();
        tracking = true;
        debug("touchstart", label + " x=" + Math.round(sx));
      },
      { passive: true }
    );

    doc.addEventListener(
      "touchend",
      function (e) {
        if (!tracking || !e.changedTouches || !e.changedTouches.length) return;
        tracking = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - sx;
        var dy = t.clientY - sy;
        // A slow drag is a text selection, not a page turn.
        if (Date.now() - st > SWIPE_MAX_MS) return;
        if (Math.abs(dx) < SWIPE_MIN_PX) return;
        // Require the gesture to be decisively horizontal, so scrolling a long
        // image or table does not flip the page out from under the reader.
        if (Math.abs(dx) < Math.abs(dy) * 1.5) return;
        try {
          if (dx < 0) rendition.next();
          else rendition.prev();
        } catch (err) {
          fail("swipe", err);
        }
      },
      { passive: true }
    );
  }

  function applyTheme(bg, fg) {
    if (!rendition) return;
    try {
      rendition.themes.override("color", fg);
      rendition.themes.override("background", bg);
      document.body.style.background = bg;
    } catch (e) {
      fail("applyTheme", e);
    }
  }

  function serializeToc(items, depth) {
    var out = [];
    if (!items) return out;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      out.push({ label: (it.label || "").trim(), href: it.href, depth: depth });
      if (it.subitems && it.subitems.length) {
        out = out.concat(serializeToc(it.subitems, depth + 1));
      }
    }
    return out;
  }

  function open(cfg) {
    try {
      book = ePub(cfg.url, { openAs: "epub" });
    } catch (e) {
      fail("open", e);
      return;
    }

    rendition = book.renderTo("viewer", {
      width: "100%",
      height: "100%",
      // Paginated is the closest thing to a book; "always" spread would give
      // two columns on a phone, which is unreadable.
      flow: "paginated",
      spread: "none",
      allowScriptedContent: false,
    });

    rendition.themes.fontSize(cfg.fontSize + "%");
    applyTheme(cfg.bg, cfg.fg);

    // Every section gets its own iframe document as it renders.
    try {
      rendition.hooks.content.register(function (contents) {
        attachGestures(contents.document, "section");
      });
      debug("gestureHook:registered");
    } catch (e) {
      fail("gestureHook", e);
    }
    // The margins around the iframe belong to the outer document.
    attachGestures(document, "outer");

    rendition.on("relocated", function (location) {
      if (!location || !location.start) return;
      currentCfi = location.start.cfi;
      post({
        type: "relocated",
        cfi: currentCfi,
        percent: percentFor(location),
        atStart: !!location.atStart,
        atEnd: !!location.atEnd,
      });
    });

    // A tap that is not a swipe: used by RN to toggle the chrome.
    rendition.on("click", function () {
      post({ type: "tap" });
    });

    book.ready
      .then(function () {
        ready = true;
        post({
          type: "ready",
          toc: serializeToc(book.navigation && book.navigation.toc, 0),
          title:
            (book.packaging &&
              book.packaging.metadata &&
              book.packaging.metadata.title) ||
            null,
          spineLength: (book.spine && book.spine.length) || 0,
        });

        // P4-T7, the Phase 1 lesson in WebView form: display(savedCfi) only
        // after ready resolves. Displaying earlier silently lands on page one,
        // which is exactly the resume bug the native reader had.
        var target = cfg.startCfi || undefined;
        return rendition.display(target).catch(function () {
          // A stored CFI can be stale if the file was replaced. Falling back to
          // the beginning beats showing a dead reader.
          post({ type: "cfiRejected" });
          return rendition.display();
        });
      })
      .then(function () {
        post({ type: "displayed" });
        // Generate locations in the background for accurate percentages. This
        // walks the whole book, so it must never gate first paint.
        return book.locations
          .generate(1024)
          .then(function () {
            locationsReady = true;
            post({ type: "locationsReady", total: book.locations.length() });
          })
          .catch(function () {
            // Estimated percentages remain in use. Not worth surfacing.
          });
      })
      .catch(function (e) {
        fail("ready", e);
      });
  }

  window.__epubBridge = {
    handle: function (msg) {
      try {
        if (!msg || !msg.type) return;
        if (msg.type === "open") return open(msg);
        if (!rendition) return;
        switch (msg.type) {
          case "next":
            rendition.next();
            break;
          case "prev":
            rendition.prev();
            break;
          case "gotoHref":
            rendition.display(msg.href);
            break;
          case "gotoCfi":
            rendition.display(msg.cfi);
            break;
          case "setFontSize":
            rendition.themes.fontSize(msg.value + "%");
            // Reflowing changes where we are; re-anchor on the current CFI so
            // the reader does not jump to the top of the chapter.
            if (currentCfi) rendition.display(currentCfi);
            break;
          case "setTheme":
            applyTheme(msg.bg, msg.fg);
            break;
        }
      } catch (e) {
        fail("handle:" + (msg && msg.type), e);
      }
    },
  };

  post({ type: "runtimeReady" });
})();
`;
