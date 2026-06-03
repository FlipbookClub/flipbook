// This string is injected verbatim into the reader WebView (see
// pdfReaderHtml.ts). It runs INSIDE the WebView (a browser context), not in
// React Native — so it speaks DOM + PDF.js, and talks to RN only through
// window.ReactNativeWebView.postMessage / window.__readerBridge.
//
// Intentionally written without template literals or ${...} so it can be
// embedded in a TS template literal without escaping. Keep it that way.
//
// Message protocol (WebView -> RN, JSON):
//   { type:"loaded", total }            doc opened
//   { type:"page", page, total }         current page changed (scroll)
//   { type:"selection", page, quote, rects }   text selected (rects normalized 0..1 to page)
//   { type:"selectionCleared" }
//   { type:"highlightTap", id }          tapped an existing highlight
//   { type:"error", message }
//   { type:"log", message }              debug
// RN -> WebView via window.__readerBridge.handle(msg):
//   { type:"jumpToPage", page }
//   { type:"setHighlights", items:[{id,page,rects}] }
//   { type:"setTheme", bg, fg }
//   { type:"clearSelection" }
export const READER_RUNTIME = `
(function () {
  var cfg = window.__READER__ || {};
  var RN = window.ReactNativeWebView;
  function post(msg) { try { if (RN) RN.postMessage(JSON.stringify(msg)); } catch (e) {} }
  function log(m) { post({ type: "log", message: String(m) }); }

  var pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) { post({ type: "error", message: "pdfjs not loaded" }); return; }

  // Spin a real worker from the inlined worker <script> block.
  try {
    var workerEl = document.getElementById("pdf-worker");
    var blob = new Blob([workerEl.textContent], { type: "application/javascript" });
    pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
  } catch (e) { post({ type: "error", message: "worker init failed: " + e }); }

  var container = document.getElementById("viewer");
  var pageEls = [];
  var rendered = {};
  var pdfDoc = null;
  var scale = 1;
  var total = 0;
  var currentPage = cfg.startPage || 1;
  var highlights = [];

  function applyTheme() {
    document.body.style.background = cfg.bg || "#ffffff";
  }

  function dpr() { return Math.min(window.devicePixelRatio || 1, 2); }

  function makePageEl(num, w, h) {
    var d = document.createElement("div");
    d.className = "page";
    d.setAttribute("data-page", String(num));
    d.style.width = w + "px";
    d.style.height = h + "px";
    container.appendChild(d);
    pageEls[num] = d;
  }

  function drawHighlights(num) {
    var el = pageEls[num];
    if (!el) return;
    var old = el.querySelectorAll(".hl");
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
    for (var j = 0; j < highlights.length; j++) {
      var h = highlights[j];
      if (h.page !== num || !h.rects) continue;
      for (var k = 0; k < h.rects.length; k++) {
        var rc = h.rects[k];
        var d = document.createElement("div");
        d.className = "hl";
        d.setAttribute("data-id", h.id);
        d.style.left = (rc.x * 100) + "%";
        d.style.top = (rc.y * 100) + "%";
        d.style.width = (rc.w * 100) + "%";
        d.style.height = (rc.h * 100) + "%";
        (function (id) {
          d.addEventListener("click", function () { post({ type: "highlightTap", id: id }); });
        })(h.id);
        el.appendChild(d);
      }
    }
  }

  function renderPage(num) {
    if (rendered[num] || !pdfDoc) return;
    rendered[num] = true;
    pdfDoc.getPage(num).then(function (page) {
      var vp = page.getViewport({ scale: scale });
      var el = pageEls[num];
      el.style.width = vp.width + "px";
      el.style.height = vp.height + "px";
      var ratio = dpr();
      var canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width * ratio);
      canvas.height = Math.floor(vp.height * ratio);
      canvas.style.width = vp.width + "px";
      canvas.style.height = vp.height + "px";
      el.appendChild(canvas);
      var ctx = canvas.getContext("2d");
      page.render({
        canvasContext: ctx,
        viewport: vp,
        transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : null
      });
      page.getTextContent().then(function (tc) {
        var tl = document.createElement("div");
        tl.className = "textLayer";
        tl.style.width = vp.width + "px";
        tl.style.height = vp.height + "px";
        el.appendChild(tl);
        try {
          pdfjsLib.renderTextLayer({ textContentSource: tc, container: tl, viewport: vp });
        } catch (e) {
          try { pdfjsLib.renderTextLayer({ textContent: tc, container: tl, viewport: vp }); } catch (e2) {}
        }
        drawHighlights(num);
      });
    }).catch(function (e) { post({ type: "error", message: "render " + num + ": " + e }); });
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        renderPage(parseInt(entries[i].target.getAttribute("data-page"), 10));
      }
    }
  }, { root: null, rootMargin: "150% 0px" });

  function computeCurrentPage() {
    var mid = window.innerHeight / 2;
    var best = currentPage, bestDist = Infinity;
    for (var n = 1; n <= total; n++) {
      var el = pageEls[n];
      if (!el) continue;
      var r = el.getBoundingClientRect();
      var center = r.top + r.height / 2;
      var dist = Math.abs(center - mid);
      if (dist < bestDist) { bestDist = dist; best = n; }
    }
    if (best !== currentPage) { currentPage = best; post({ type: "page", page: best, total: total }); }
  }

  var scrollT;
  window.addEventListener("scroll", function () {
    clearTimeout(scrollT);
    scrollT = setTimeout(computeCurrentPage, 120);
  }, { passive: true });

  function pageOf(node) {
    var el = node && node.nodeType === 1 ? node : (node ? node.parentElement : null);
    while (el) {
      if (el.classList && el.classList.contains("page")) {
        return parseInt(el.getAttribute("data-page"), 10);
      }
      el = el.parentElement;
    }
    return null;
  }

  function rectsForPage(num, range) {
    var el = pageEls[num];
    if (!el) return [];
    var pr = el.getBoundingClientRect();
    var raw = range.getClientRects();
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var rc = raw[i];
      if (rc.width < 1 || rc.height < 1) continue;
      out.push({
        x: (rc.left - pr.left) / pr.width,
        y: (rc.top - pr.top) / pr.height,
        w: rc.width / pr.width,
        h: rc.height / pr.height
      });
    }
    return out;
  }

  function onSelectionChange() {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) { post({ type: "selectionCleared" }); return; }
    var quote = sel.toString().replace(/\\s+/g, " ").trim();
    if (!quote) { post({ type: "selectionCleared" }); return; }
    var range = sel.getRangeAt(0);
    var num = pageOf(range.startContainer) || currentPage;
    post({ type: "selection", page: num, quote: quote, rects: rectsForPage(num, range) });
  }

  var selT;
  document.addEventListener("selectionchange", function () {
    clearTimeout(selT);
    selT = setTimeout(onSelectionChange, 250);
  });

  window.__readerBridge = {
    handle: function (msg) {
      if (!msg) return;
      if (msg.type === "jumpToPage") {
        var el = pageEls[msg.page];
        if (el) el.scrollIntoView();
      } else if (msg.type === "setHighlights") {
        highlights = msg.items || [];
        for (var n = 1; n <= total; n++) if (rendered[n]) drawHighlights(n);
      } else if (msg.type === "setTheme") {
        cfg.bg = msg.bg; cfg.fg = msg.fg; applyTheme();
      } else if (msg.type === "clearSelection") {
        var s = window.getSelection && window.getSelection();
        if (s) s.removeAllRanges();
      }
    }
  };

  applyTheme();
  pdfjsLib.getDocument({ url: cfg.pdfUrl }).promise.then(function (pdf) {
    pdfDoc = pdf;
    total = pdf.numPages;
    post({ type: "loaded", total: total });
    pdf.getPage(1).then(function (p) {
      var base = p.getViewport({ scale: 1 });
      scale = (window.innerWidth || base.width) / base.width;
      var vp = p.getViewport({ scale: scale });
      for (var n = 1; n <= total; n++) {
        makePageEl(n, vp.width, vp.height);
        io.observe(pageEls[n]);
      }
      if (currentPage > 1 && pageEls[currentPage]) {
        setTimeout(function () { pageEls[currentPage].scrollIntoView(); computeCurrentPage(); }, 60);
      } else {
        computeCurrentPage();
      }
    });
  }).catch(function (e) { post({ type: "error", message: "open failed: " + e }); });
})();
`;
