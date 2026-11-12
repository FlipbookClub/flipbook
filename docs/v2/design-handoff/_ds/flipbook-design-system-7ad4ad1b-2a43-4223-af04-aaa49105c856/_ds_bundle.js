/* @ds-bundle: {"format":4,"namespace":"FlipbookDesignSystem_7ad4ad","components":[{"name":"AppHeader","sourcePath":"components/AppHeader/AppHeader.jsx"},{"name":"Badge","sourcePath":"components/Badge/Badge.jsx"},{"name":"StatusDisc","sourcePath":"components/Banner/Banner.jsx"},{"name":"Banner","sourcePath":"components/Banner/Banner.jsx"},{"name":"BookCard","sourcePath":"components/BookCard/BookCard.jsx"},{"name":"BookCover","sourcePath":"components/BookCard/BookCover.jsx"},{"name":"Button","sourcePath":"components/Button/Button.jsx"},{"name":"Veil","sourcePath":"components/ChatMessage/ChatMessage.jsx"},{"name":"ChatMessage","sourcePath":"components/ChatMessage/ChatMessage.jsx"},{"name":"Composer","sourcePath":"components/Composer/Composer.jsx"},{"name":"Emblem","sourcePath":"components/Emblem/Emblem.jsx"},{"name":"Icon","sourcePath":"components/Icon/Icon.jsx"},{"name":"MarginAhead","sourcePath":"components/MarginReaction/MarginAhead.jsx"},{"name":"MarginReaction","sourcePath":"components/MarginReaction/MarginReaction.jsx"},{"name":"MemberProgress","sourcePath":"components/MemberProgress/MemberProgress.jsx"},{"name":"OptionRow","sourcePath":"components/OptionRow/OptionRow.jsx"},{"name":"REACTIONS","sourcePath":"components/ReactionPicker/ReactionPicker.jsx"},{"name":"ReactionPicker","sourcePath":"components/ReactionPicker/ReactionPicker.jsx"},{"name":"SegmentedTabs","sourcePath":"components/SegmentedTabs/SegmentedTabs.jsx"},{"name":"LiveBar","sourcePath":"components/SessionCard/LiveBar.jsx"},{"name":"SessionCard","sourcePath":"components/SessionCard/SessionCard.jsx"},{"name":"Sheet","sourcePath":"components/Sheet/Sheet.jsx"},{"name":"DEFAULT_TABS","sourcePath":"components/TabBar/TabBar.jsx"},{"name":"TabBar","sourcePath":"components/TabBar/TabBar.jsx"},{"name":"Toast","sourcePath":"components/Toast/Toast.jsx"},{"name":"UnreadDot","sourcePath":"components/UnreadDot/UnreadDot.jsx"},{"name":"VoiceNote","sourcePath":"components/VoiceNote/VoiceNote.jsx"}],"sourceHashes":{"components/AppHeader/AppHeader.jsx":"ae195d099ed0","components/Badge/Badge.jsx":"14b2a7f92b6e","components/Banner/Banner.jsx":"cc35fa5f155b","components/BookCard/BookCard.jsx":"15752db38f19","components/BookCard/BookCover.jsx":"63629525a4e8","components/Button/Button.jsx":"7cb84d69e4d6","components/ChatMessage/ChatMessage.jsx":"c9e24a8d1d83","components/Composer/Composer.jsx":"c455e1ca33c8","components/Emblem/Emblem.jsx":"6896ecb8522b","components/Icon/Icon.jsx":"7b0dee965eeb","components/MarginReaction/MarginAhead.jsx":"dacaae4c1ce4","components/MarginReaction/MarginReaction.jsx":"7dea472bcfa9","components/MemberProgress/MemberProgress.jsx":"8fb4263d759b","components/OptionRow/OptionRow.jsx":"637de34af025","components/ReactionPicker/ReactionPicker.jsx":"65750fbad4c9","components/SegmentedTabs/SegmentedTabs.jsx":"52b4689045e1","components/SessionCard/LiveBar.jsx":"1fd577a8f060","components/SessionCard/SessionCard.jsx":"a85f6b9beced","components/Sheet/Sheet.jsx":"c90380692c43","components/TabBar/TabBar.jsx":"ccd91f400948","components/Toast/Toast.jsx":"c1e305ed6997","components/UnreadDot/UnreadDot.jsx":"ec633e3237c2","components/VoiceNote/VoiceNote.jsx":"c814af17bad7","components/shared/useLook.jsx":"713b6fedf6ab","ui_kits/app/ChatScreen.jsx":"53a5f7322465","ui_kits/app/Chrome.jsx":"427cdd7aa6ee","ui_kits/app/HomeScreen.jsx":"399acd729fd1","ui_kits/app/LobbyScreen.jsx":"af5dafb4f465","ui_kits/app/ReaderScreen.jsx":"2ea21b5819be","ui_kits/app/ios-frame.jsx":"24642b887be3"},"inlinedExternals":[],"unexposedExports":[{"name":"bubbleRadius","sourcePath":"components/ChatMessage/ChatMessage.jsx"},{"name":"statusKinds","sourcePath":"components/Banner/Banner.jsx"},{"name":"useLook","sourcePath":"components/shared/useLook.jsx"}]} */

(() => {

const __ds_ns = (window.FlipbookDesignSystem_7ad4ad = window.FlipbookDesignSystem_7ad4ad || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/Badge/Badge.jsx
try { (() => {
const LABELS = {
  'founding-host': 'Founding Host',
  author: 'Author',
  pro: 'Pro',
  live: 'Live',
  rec: 'REC'
};
function Badge({
  kind = 'pro',
  look,
  children,
  style
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    padding: '0 10px',
    borderRadius: 'var(--radius-full)',
    font: '600 12px/16px var(--font-sans)',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    flex: 'none'
  };
  const k = {
    'founding-host': {
      background: 'var(--founding-host)',
      color: 'var(--on-founding-host)'
    },
    author: {
      color: 'var(--author)',
      border: '1.5px solid var(--author)'
    },
    pro: {
      background: 'var(--primary)',
      color: 'var(--on-primary)'
    },
    live: {
      color: 'var(--live)',
      border: '1.5px solid var(--live)'
    },
    rec: {
      color: 'var(--recording)',
      border: '1.5px solid var(--recording)'
    }
  }[kind];
  const dot = kind === 'live' || kind === 'rec';
  return /*#__PURE__*/React.createElement("span", {
    "data-style": look,
    style: {
      ...base,
      ...k,
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 8,
      height: 8,
      borderRadius: 'var(--radius-full)',
      background: 'currentColor'
    }
  }), children ?? LABELS[kind]);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Badge/Badge.jsx", error: String((e && e.message) || e) }); }

// components/BookCard/BookCover.jsx
try { (() => {
const TONES = {
  indigo: {
    background: 'var(--indigo-900)',
    color: 'var(--ivory)'
  },
  plum: {
    background: 'var(--plum)',
    color: 'var(--ivory)'
  },
  gold: {
    background: 'var(--gold)',
    color: 'var(--black)'
  },
  coral: {
    background: 'var(--coral-400)',
    color: 'var(--black)'
  },
  aqua: {
    background: 'var(--aqua)',
    color: 'var(--black)'
  },
  ivory: {
    background: 'var(--ivory)',
    color: 'var(--indigo-900)'
  }
};
function BookCover({
  title,
  author,
  src,
  tone = 'indigo',
  width = 132,
  style
}) {
  const t = TONES[tone] || TONES.indigo;
  const scale = width / 132;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      aspectRatio: '2 / 3',
      flex: 'none',
      borderRadius: 'var(--radius-cover)',
      border: '1px solid var(--divider)',
      overflow: 'hidden',
      ...(src ? {
        background: `center / cover no-repeat url(${src})`
      } : t),
      padding: src ? 0 : 12 * scale,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      ...style
    }
  }, !src && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `600 ${15 * scale}px/${19 * scale}px var(--font-serif)`
    }
  }, title), !src && author && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `500 ${11 * scale}px/${14 * scale}px var(--font-sans)`,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, author));
}
Object.assign(__ds_scope, { BookCover });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/BookCard/BookCover.jsx", error: String((e && e.message) || e) }); }

// components/BookCard/BookCard.jsx
try { (() => {
function BookCard({
  title,
  author,
  coverSrc,
  coverTone = 'indigo',
  price,
  wasPrice,
  includedWithPro = false,
  social,
  width = 132,
  onClick,
  look,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-style": look,
    role: onClick ? 'button' : undefined,
    tabIndex: onClick ? 0 : undefined,
    onClick: onClick,
    style: {
      width,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      cursor: onClick ? 'pointer' : undefined,
      flex: 'none',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.BookCover, {
    title: title,
    author: author,
    src: coverSrc,
    tone: coverTone,
    width: width
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 15px/20px var(--font-sans)',
      color: 'var(--text)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px/18px var(--font-sans)',
      color: 'var(--text-secondary)'
    }
  }, author)), (includedWithPro || price) && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 13px/18px var(--font-sans)',
      color: includedWithPro ? 'var(--text-accent)' : 'var(--text)'
    }
  }, includedWithPro ? 'Included with Pro' : /*#__PURE__*/React.createElement(React.Fragment, null, wasPrice && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      textDecoration: 'line-through',
      fontWeight: 500,
      marginRight: 4
    }
  }, wasPrice), price)), social && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 12px/16px var(--font-sans)',
      letterSpacing: '0.02em',
      color: 'var(--text-muted)'
    }
  }, social));
}
Object.assign(__ds_scope, { BookCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/BookCard/BookCard.jsx", error: String((e && e.message) || e) }); }

// components/Button/Button.jsx
try { (() => {
const SIZES = {
  lg: {
    height: 'var(--button-height-lg)',
    padding: '0 var(--space-6)',
    font: '600 16px/20px var(--font-sans)',
    radius: 'var(--radius-button)'
  },
  md: {
    height: 'var(--button-height)',
    padding: '0 var(--space-5)',
    font: '600 15px/20px var(--font-sans)',
    radius: 'var(--radius-button)'
  },
  sm: {
    height: 40,
    padding: '0 16px',
    font: '600 13px/18px var(--font-sans)',
    radius: 'var(--radius-button)'
  },
  pill: {
    height: 36,
    padding: '0 14px',
    font: '600 13px/18px var(--font-sans)',
    radius: 'var(--radius-full)'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  pressed: forcePressed,
  focused = false,
  fullWidth = false,
  look,
  onClick,
  type = 'button',
  children,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const [down, setDown] = React.useState(false);
  const pressed = forcePressed ?? (down || loading);
  const s = SIZES[size] || SIZES.md;
  let bg = 'transparent',
    fg;
  if (variant === 'ghost') {
    fg = disabled ? 'var(--ghost-disabled)' : pressed ? 'var(--ghost-pressed)' : hover ? 'var(--ghost-hover)' : 'var(--ghost)';
  } else {
    const k = variant === 'secondary' ? 'button-secondary' : 'primary';
    bg = disabled ? `var(--${k}-disabled)` : pressed ? `var(--${k}-pressed)` : hover ? `var(--${k}-hover)` : `var(--${k})`;
    fg = disabled ? `var(--on-${k}-disabled)` : `var(--on-${k})`;
  }
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    "aria-busy": loading || undefined,
    "data-style": look,
    onClick: disabled || loading ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setDown(false);
    },
    onPointerDown: () => setDown(true),
    onPointerUp: () => setDown(false),
    style: {
      height: s.height,
      minWidth: 'var(--touch-target)',
      padding: variant === 'ghost' && size !== 'md' && size !== 'lg' ? '0 8px' : s.padding,
      border: 0,
      borderRadius: s.radius,
      font: s.font,
      letterSpacing: '0.01em',
      background: bg,
      color: fg,
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      cursor: disabled ? 'default' : 'pointer',
      whiteSpace: 'nowrap',
      transition: 'background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
      outline: focused ? '2px solid var(--focus-ring)' : undefined,
      outlineOffset: focused ? 2 : undefined,
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, loading ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'inline-flex',
      gap: 4
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      width: 6,
      height: 6,
      borderRadius: 'var(--radius-full)',
      background: 'currentColor',
      opacity: 0.6
    }
  }))) : icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Button/Button.jsx", error: String((e && e.message) || e) }); }

// components/Emblem/Emblem.jsx
try { (() => {
const TONES = ['sand', 'aqua', 'rose', 'mint', 'lavender'];
const toneFor = (name = '') => TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
function Emblem({
  name = '',
  src,
  size = 48,
  tone,
  look,
  style
}) {
  const t = tone || toneFor(name);
  const initial = [...name.trim()][0] || '';
  return /*#__PURE__*/React.createElement("span", {
    "data-style": look,
    role: "img",
    "aria-label": name,
    style: {
      width: size,
      height: size,
      flex: 'none',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--highlight-' + t + ')',
      boxShadow: 'var(--glass-hairline)',
      color: 'var(--text)',
      font: '700 ' + Math.round(size * 0.42) + 'px/1 var(--font-serif)',
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }) : initial.toUpperCase());
}
Object.assign(__ds_scope, { Emblem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Emblem/Emblem.jsx", error: String((e && e.message) || e) }); }

// components/Icon/Icon.jsx
try { (() => {
// Hugeicons stroke-rounded (free set, MIT) icon nodes for the glyphs Flipbook uses. Production: @hugeicons/react + @hugeicons/core-free-icons.
// Names keep the earlier Flipbook names; the Hugeicons source glyph is in Icon.sources.
const ICON_NODES = {
  'circle-check': [["path", {
    "d": "M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
  }], ["path", {
    "d": "M8 12.5L10.5 15L16 9",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'triangle-alert': [["path", {
    "d": "M13.9248 21H10.0752C5.44476 21 3.12955 21 2.27636 19.4939C1.42317 17.9879 2.60736 15.9914 4.97574 11.9985L6.90057 8.75333C9.17559 4.91778 10.3131 3 12 3C13.6869 3 14.8244 4.91777 17.0994 8.75332L19.0243 11.9985C21.3926 15.9914 22.5768 17.9879 21.7236 19.4939C20.8704 21 18.5552 21 13.9248 21Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M12 9V13",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'circle-alert': [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M12 8V12",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M12.125 15.75H12M12.25 15.75C12.25 15.8881 12.1381 16 12 16C11.8619 16 11.75 15.8881 11.75 15.75C11.75 15.6119 11.8619 15.5 12 15.5C12.1381 15.5 12.25 15.6119 12.25 15.75Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'eye': [["path", {
    "d": "M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z"
  }], ["path", {
    "d": "M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z"
  }]],
  'eye-off': [["path", {
    "d": "M19.439 15.439C20.3636 14.5212 21.0775 13.6091 21.544 12.955C21.848 12.5287 22 12.3155 22 12C22 11.6845 21.848 11.4713 21.544 11.045C20.1779 9.12944 16.6892 5 12 5C11.0922 5 10.2294 5.15476 9.41827 5.41827M6.74742 6.74742C4.73118 8.1072 3.24215 9.94266 2.45604 11.045C2.15201 11.4713 2 11.6845 2 12C2 12.3155 2.15201 12.5287 2.45604 12.955C3.8221 14.8706 7.31078 19 12 19C13.9908 19 15.7651 18.2557 17.2526 17.2526",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M9.85786 10C9.32783 10.53 9 11.2623 9 12.0711C9 13.6887 10.3113 15 11.9289 15C12.7377 15 13.47 14.6722 14 14.1421",
    "strokeLinecap": "round"
  }], ["path", {
    "d": "M3 3L21 21",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'calendar': [["path", {
    "d": "M16 2V6M8 2V6",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M3 10H21",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M12.1258 14H12.0008M12.1258 18H12.0008M7.625 14H7.5M7.625 18H7.5M16.625 14H16.5M12.2508 14C12.2508 14.1381 12.1389 14.25 12.0008 14.25C11.8628 14.25 11.7508 14.1381 11.7508 14C11.7508 13.8619 11.8628 13.75 12.0008 13.75C12.1389 13.75 12.2508 13.8619 12.2508 14ZM12.2508 18C12.2508 18.1381 12.1389 18.25 12.0008 18.25C11.8628 18.25 11.7508 18.1381 11.7508 18C11.7508 17.8619 11.8628 17.75 12.0008 17.75C12.1389 17.75 12.2508 17.8619 12.2508 18ZM7.75 14C7.75 14.1381 7.63807 14.25 7.5 14.25C7.36193 14.25 7.25 14.1381 7.25 14C7.25 13.8619 7.36193 13.75 7.5 13.75C7.63807 13.75 7.75 13.8619 7.75 14ZM7.75 18C7.75 18.1381 7.63807 18.25 7.5 18.25C7.36193 18.25 7.25 18.1381 7.25 18C7.25 17.8619 7.36193 17.75 7.5 17.75C7.63807 17.75 7.75 17.8619 7.75 18ZM16.75 14C16.75 14.1381 16.6381 14.25 16.5 14.25C16.3619 14.25 16.25 14.1381 16.25 14C16.25 13.8619 16.3619 13.75 16.5 13.75C16.6381 13.75 16.75 13.8619 16.75 14Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'reply': [["path", {
    "d": "M11 6H15.5C17.9853 6 20 8.01472 20 10.5C20 12.9853 17.9853 15 15.5 15H4",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M6.99998 12C6.99998 12 4.00001 14.2095 4 15C3.99999 15.7906 7 18 7 18",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'sparkle': [["path", {
    "d": "M15 2L15.5387 4.39157C15.9957 6.42015 17.5798 8.00431 19.6084 8.46127L22 9L19.6084 9.53873C17.5798 9.99569 15.9957 11.5798 15.5387 13.6084L15 16L14.4613 13.6084C14.0043 11.5798 12.4202 9.99569 10.3916 9.53873L8 9L10.3916 8.46127C12.4201 8.00431 14.0043 6.42015 14.4613 4.39158L15 2Z",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M7 12L7.38481 13.7083C7.71121 15.1572 8.84275 16.2888 10.2917 16.6152L12 17L10.2917 17.3848C8.84275 17.7112 7.71121 18.8427 7.38481 20.2917L7 22L6.61519 20.2917C6.28879 18.8427 5.15725 17.7112 3.70827 17.3848L2 17L3.70827 16.6152C5.15725 16.2888 6.28879 15.1573 6.61519 13.7083L7 12Z",
    "strokeLinejoin": "round"
  }]],
  'play': [["path", {
    "d": "M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z",
    "strokeLinejoin": "round"
  }]],
  'pause': [["path", {
    "d": "M4 7C4 5.58579 4 4.87868 4.43934 4.43934C4.87868 4 5.58579 4 7 4C8.41421 4 9.12132 4 9.56066 4.43934C10 4.87868 10 5.58579 10 7V17C10 18.4142 10 19.1213 9.56066 19.5607C9.12132 20 8.41421 20 7 20C5.58579 20 4.87868 20 4.43934 19.5607C4 19.1213 4 18.4142 4 17V7Z"
  }], ["path", {
    "d": "M14 7C14 5.58579 14 4.87868 14.4393 4.43934C14.8787 4 15.5858 4 17 4C18.4142 4 19.1213 4 19.5607 4.43934C20 4.87868 20 5.58579 20 7V17C20 18.4142 20 19.1213 19.5607 19.5607C19.1213 20 18.4142 20 17 20C15.5858 20 14.8787 20 14.4393 19.5607C14 19.1213 14 18.4142 14 17V7Z"
  }]],
  'mic': [["path", {
    "d": "M7 6.5C7 4.01472 9.01472 2 11.5 2C13.9853 2 16 4.01472 16 6.5V11.5C16 13.9853 13.9853 16 11.5 16C9.01472 16 7 13.9853 7 11.5V6.5Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M11.5 19H11.0828C7.57267 19 4.57706 16.4623 4 13M11.5 19H11.9172C15.4273 19 18.4229 16.4623 19 13M11.5 19V22",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'house': [["path", {
    "d": "M3 11.9896V14.5C3 17.7998 3 19.4497 4.02513 20.4749C5.05025 21.5 6.70017 21.5 10 21.5H14C17.2998 21.5 18.9497 21.5 19.9749 20.4749C21 19.4497 21 17.7998 21 14.5V11.9896C21 10.3083 21 9.46773 20.6441 8.74005C20.2882 8.01237 19.6247 7.49628 18.2976 6.46411L16.2976 4.90855C14.2331 3.30285 13.2009 2.5 12 2.5C10.7991 2.5 9.76689 3.30285 7.70242 4.90855L5.70241 6.46411C4.37533 7.49628 3.71179 8.01237 3.3559 8.74005C3 9.46773 3 10.3083 3 11.9896Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'book-open': [["path", {
    "d": "M7.99978 3.5H6.60021C4.43183 3.5 3.34764 3.5 2.67399 4.17362C2.00034 4.84724 2.00029 5.93144 2.00021 8.09982L2 13.3998C1.99992 15.5684 1.99987 16.6526 2.67353 17.3263C3.34719 18 4.43146 18 6.6 18H8.95042C10.4329 18 11.7092 19.0464 11.9999 20.5V5.5C11.0556 4.24097 9.99989 3.5 7.99978 3.5Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M16.0001 3.5H17.3997C19.5681 3.5 20.6523 3.5 21.3259 4.17362C21.9996 4.84724 21.9996 5.93144 21.9997 8.09982L21.9999 13.3998C22 15.5684 22 16.6526 21.3264 17.3263C20.6527 18 19.5684 18 17.3999 18H15.0495C13.567 18 12.2907 19.0464 12 20.5V5.5C12.9443 4.24097 14 3.5 16.0001 3.5Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'users': [["path", {
    "d": "M18.4995 20.5C18.2663 17.5685 15.8417 15.2477 12.808 15.0521L11.9995 15C11.7107 15.0076 11.4416 15.0178 11.1877 15.0298C8.18075 15.1723 5.7304 17.5974 5.49951 20.5",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M15.2495 9.25C15.2495 11.0449 13.7944 12.5 11.9995 12.5C10.2046 12.5 8.74952 11.0449 8.74952 9.25C8.74952 7.45507 10.2046 6 11.9995 6C13.7944 6 15.2495 7.45507 15.2495 9.25Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M5.50249 8.5C5.17908 7.99485 4.99158 7.39432 4.99158 6.75C4.99158 4.95507 6.44665 3.5 8.24157 3.5C8.68752 3.5 9.1125 3.58982 9.49939 3.75235",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M18.4963 8.5C18.8197 7.99485 19.0072 7.39432 19.0072 6.75C19.0072 4.95507 17.5521 3.5 15.7572 3.5C15.3113 3.5 14.8863 3.58982 14.4994 3.75235",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M22.0007 17.9996C21.8208 15.7374 19.9995 13.5 17.9995 13",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M1.99927 17.9996C2.17923 15.7374 4.00049 13.5 6.00049 13",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'message-circle': [["path", {
    "d": "M8.5 14.5H15.5M8.5 9.5H12",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M14.1706 20.8905C18.3536 20.6125 21.6856 17.2332 21.9598 12.9909C22.0134 12.1607 22.0134 11.3009 21.9598 10.4707C21.6856 6.22838 18.3536 2.84913 14.1706 2.57107C12.7435 2.47621 11.2536 2.47641 9.8294 2.57107C5.64639 2.84913 2.31441 6.22838 2.04024 10.4707C1.98659 11.3009 1.98659 12.1607 2.04024 12.9909C2.1401 14.536 2.82343 15.9666 3.62791 17.1746C4.09501 18.0203 3.78674 19.0758 3.30021 19.9978C2.94941 20.6626 2.77401 20.995 2.91484 21.2351C3.05568 21.4752 3.37026 21.4829 3.99943 21.4982C5.24367 21.5285 6.08268 21.1757 6.74868 20.6846C7.1264 20.4061 7.31527 20.2668 7.44544 20.2508C7.5756 20.2348 7.83177 20.3403 8.34401 20.5513C8.8044 20.7409 9.33896 20.8579 9.8294 20.8905C11.2536 20.9852 12.7435 20.9854 14.1706 20.8905Z",
    "strokeLinejoin": "round"
  }]],
  'chevron-left': [["path", {
    "d": "M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'chevron-right': [["path", {
    "d": "M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'chevron-down': [["path", {
    "d": "M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'x': [["path", {
    "d": "M18 6L6.00081 17.9992M17.9992 18L6 6.00085",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'send': [["path", {
    "d": "M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z"
  }], ["path", {
    "d": "M11.4999 12.5L14.9999 9",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'headphones': [["path", {
    "d": "M20.0849 17C20.5849 15.5 21 13.4368 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4368 3.41512 15.5 3.91512 17",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M8.97651 19.6043L7.23857 14.6127C7.05341 14.1466 6.4617 13.9131 5.97493 14.0297C4.46441 14.5333 3.6462 16.1718 4.14742 17.6895L4.58543 19.0158C5.08664 20.5334 6.71747 21.3555 8.22799 20.8519C8.68896 20.6556 9.10449 20.0897 8.97651 19.6043Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M15.0235 19.6043L16.7614 14.6127C16.9466 14.1466 17.5383 13.9131 18.0251 14.0297C19.5356 14.5333 20.3538 16.1718 19.8526 17.6895L19.4146 19.0158C18.9134 20.5334 17.2825 21.3555 15.772 20.8519C15.311 20.6556 14.8955 20.0897 15.0235 19.6043Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'user': [["path", {
    "d": "M20 21.0001C19.713 17.269 16.7289 14.3151 12.995 14.0662L12 13.9999C11.6446 14.0096 11.3134 14.0225 11.0008 14.0378C7.3 14.2192 4.28417 17.3057 4 21.0001",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["circle", {
    "cx": "12",
    "cy": "6.99988",
    "r": "4",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'wifi-off': [["path", {
    "d": "M8.5 14.5C9.62137 13.3944 10.9643 12.887 12.5 13.0212",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M18.5 11.5C17.0073 10.1794 15.2848 9.27433 13.5 9.00012",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M5.5 11.4999C6.59299 10.5891 7.778 9.91296 9 9.49989",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M22 8.49989C18.0717 5.18273 13.7362 3.92879 9.5 4.73808",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M2 8.5C3.22409 7.46632 4.5 6.5 5.5 6",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["circle", {
    "cx": "12",
    "cy": "18",
    "r": "1.5",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M2 2L22 22",
    "strokeLinecap": "round"
  }]],
  'lock': [["path", {
    "d": "M12 14.5V17.5M13 14.5C13 15.0523 12.5523 15.5 12 15.5C11.4477 15.5 11 15.0523 11 14.5C11 13.9477 11.4477 13.5 12 13.5C12.5523 13.5 13 13.9477 13 14.5Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M16.5 9V6.5C16.5 4.01472 14.4853 2 12 2C9.51471 2 7.49999 4.01472 7.49999 6.5V9",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M4.2678 18.8447C4.49268 20.515 5.87612 21.8235 7.55965 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.8789 17.7547 20 16.6376 20 15.5C20 14.3624 19.8789 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55965 9.09909C5.87612 9.17649 4.49268 10.485 4.2678 12.1553C4.12104 13.2453 3.99999 14.3624 3.99999 15.5C3.99999 16.6376 4.12104 17.7547 4.2678 18.8447Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'bell': [["path", {
    "d": "M15.5 18C15.5 19.933 13.933 21.5 12 21.5C10.067 21.5 8.5 19.933 8.5 18",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M19.2311 18H4.76887C3.79195 18 3 17.208 3 16.2311C3 15.762 3.18636 15.3121 3.51809 14.9803L4.12132 14.3771C4.68393 13.8145 5 13.0514 5 12.2558V9.5C5 5.63401 8.13401 2.5 12 2.5C15.866 2.5 19 5.634 19 9.5V12.2558C19 13.0514 19.3161 13.8145 19.8787 14.3771L20.4819 14.9803C20.8136 15.3121 21 15.762 21 16.2311C21 17.208 20.208 18 19.2311 18Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'shelf': [["path", {
    "d": "M3 11H21",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M3 14V8C3 5.17157 3 3.75736 3.93037 2.87868C4.86073 2 6.35814 2 9.35294 2H14.6471C17.6419 2 19.1393 2 20.0696 2.87868C21 3.75736 21 5.17157 21 8V14C21 16.8284 21 18.2426 20.0696 19.1213C19.1393 20 17.6419 20 14.6471 20H9.35294C6.35814 20 4.86073 20 3.93037 19.1213C3 18.2426 3 16.8284 3 14Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M11.5 11L9.5 6",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M18 11L17 6",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M7 11V6",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M14 11V6",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M11 16L13 16",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M5 20V22M19 20V22",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'more': [["path", {
    "d": "M6.00449 12.5V12M18.0045 12.5V12M12.0045 12.5V12M7.00449 12.5C7.00449 11.9477 6.55677 11.5 6.00449 11.5C5.4522 11.5 5.00449 11.9477 5.00449 12.5C5.00449 13.0523 5.4522 13.5 6.00449 13.5C6.55677 13.5 7.00449 13.0523 7.00449 12.5ZM19.0045 12.5C19.0045 11.9477 18.5568 11.5 18.0045 11.5C17.4522 11.5 17.0045 11.9477 17.0045 12.5C17.0045 13.0523 17.4522 13.5 18.0045 13.5C18.5568 13.5 19.0045 13.0523 19.0045 12.5ZM13.0045 12.5C13.0045 11.9477 12.5568 11.5 12.0045 11.5C11.4522 11.5 11.0045 11.9477 11.0045 12.5C11.0045 13.0523 11.4522 13.5 12.0045 13.5C12.5568 13.5 13.0045 13.0523 13.0045 12.5Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'search': [["path", {
    "d": "M17 17L21 21",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'plus': [["path", {
    "d": "M12 4V20M20 12H4",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'check': [["path", {
    "d": "M5 14L8.5 17.5L19 6.5",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'book': [["path", {
    "d": "M15.5 7H8.5M12.499 11H8.49902",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M20 22H6C4.89543 22 4 21.1046 4 20M4 20C4 18.8954 4.89543 18 6 18H20V6C20 4.11438 20 3.17157 19.4142 2.58579C18.8284 2 17.8856 2 16 2H10C7.17157 2 5.75736 2 4.87868 2.87868C4 3.75736 4 5.17157 4 8V20Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M19.5 18C19.5 18 18.5 18.7628 18.5 20C18.5 21.2372 19.5 22 19.5 22",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]],
  'share': [["path", {
    "d": "M21 6.5C21 8.15685 19.6569 9.5 18 9.5C16.3431 9.5 15 8.15685 15 6.5C15 4.84315 16.3431 3.5 18 3.5C19.6569 3.5 21 4.84315 21 6.5Z"
  }], ["path", {
    "d": "M9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z"
  }], ["path", {
    "d": "M21 17.5C21 19.1569 19.6569 20.5 18 20.5C16.3431 20.5 15 19.1569 15 17.5C15 15.8431 16.3431 14.5 18 14.5C19.6569 14.5 21 15.8431 21 17.5Z"
  }], ["path", {
    "d": "M8.72852 10.7495L15.2285 7.75M8.72852 13.25L15.2285 16.2495"
  }]],
  'smile': [["circle", {
    "cx": "12",
    "cy": "12",
    "r": "10",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M8 15C8.91212 16.2144 10.3643 17 12 17C13.6357 17 15.0879 16.2144 16 15",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }], ["path", {
    "d": "M15.625 8.387V8.91649M8.375 8.387V8.91649M8.75 8.75C8.75 8.33579 8.58211 8 8.375 8C8.16789 8 8 8.33579 8 8.75C8 9.16421 8.16789 9.5 8.375 9.5C8.58211 9.5 8.75 9.16421 8.75 8.75ZM16 8.75C16 8.33579 15.8321 8 15.625 8C15.4179 8 15.25 8.33579 15.25 8.75C15.25 9.16421 15.4179 9.5 15.625 9.5C15.8321 9.5 16 9.16421 16 8.75Z",
    "strokeLinecap": "round",
    "strokeLinejoin": "round"
  }]]
};
const SOURCES = {
  "circle-check": "CheckmarkCircle02Icon",
  "triangle-alert": "Alert02Icon",
  "circle-alert": "AlertCircleIcon",
  "eye": "ViewIcon",
  "eye-off": "ViewOffSlashIcon",
  "calendar": "Calendar03Icon",
  "reply": "ArrowTurnBackwardIcon",
  "sparkle": "SparklesIcon",
  "play": "PlayIcon",
  "pause": "PauseIcon",
  "mic": "Mic01Icon",
  "house": "Home01Icon",
  "book-open": "BookOpen01Icon",
  "users": "UserGroupIcon",
  "message-circle": "Message01Icon",
  "chevron-left": "ArrowLeft01Icon",
  "chevron-right": "ArrowRight01Icon",
  "chevron-down": "ArrowDown01Icon",
  "x": "Cancel01Icon",
  "send": "SentIcon",
  "headphones": "HeadphonesIcon",
  "user": "UserIcon",
  "wifi-off": "WifiOff01Icon",
  "lock": "SquareLock02Icon",
  "bell": "Notification01Icon",
  "shelf": "Bookshelf02Icon",
  "more": "MoreHorizontalIcon",
  "search": "Search01Icon",
  "plus": "PlusSignIcon",
  "check": "Tick02Icon",
  "book": "Book02Icon",
  "share": "Share08Icon",
  "smile": "SmileIcon"
};
function Icon({
  name,
  size = 'md',
  strokeWidth = 1.5,
  color = 'currentColor',
  style,
  title
}) {
  const px = size === 'sm' ? 20 : size === 'md' ? 24 : size;
  const nodes = ICON_NODES[name] || [];
  return React.createElement('svg', {
    width: px,
    height: px,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    role: title ? 'img' : undefined,
    'aria-hidden': title ? undefined : true,
    style: {
      flex: 'none',
      display: 'block',
      ...style
    }
  }, title ? React.createElement('title', null, title) : null, nodes.map(([tag, attrs], i) => React.createElement(tag, {
    key: i,
    ...attrs
  })));
}
Icon.names = Object.keys(ICON_NODES);
Icon.sources = SOURCES;
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Icon/Icon.jsx", error: String((e && e.message) || e) }); }

// components/Composer/Composer.jsx
try { (() => {
function Composer({
  value: valueProp,
  onChange,
  onSend,
  onRecord,
  placeholder = 'Message the room',
  chapterNote,
  look,
  style
}) {
  const [own, setOwn] = React.useState('');
  const value = valueProp ?? own;
  const set = v => {
    setOwn(v);
    onChange && onChange(v);
  };
  const has = value.trim().length > 0;
  const round = {
    width: 'var(--touch-target)',
    height: 'var(--touch-target)',
    borderRadius: 'var(--radius-full)',
    border: 0,
    display: 'grid',
    placeItems: 'center',
    flex: 'none',
    cursor: 'pointer'
  };
  return /*#__PURE__*/React.createElement("form", {
    "data-style": look,
    onSubmit: e => {
      e.preventDefault();
      if (has) {
        onSend && onSend(value.trim());
        set('');
      }
    },
    style: {
      padding: '8px 12px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      background: 'var(--chrome-fill)',
      backdropFilter: 'var(--chrome-blur)',
      WebkitBackdropFilter: 'var(--chrome-blur)',
      boxShadow: 'var(--chrome-edge)',
      ...style
    }
  }, chapterNote && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 12px/16px var(--font-sans)',
      letterSpacing: '0.02em',
      color: 'var(--text-muted)',
      padding: '0 8px'
    }
  }, chapterNote), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      minHeight: 'var(--touch-target)',
      padding: '0 16px',
      borderRadius: 'var(--radius-field)',
      background: 'var(--field-fill)',
      boxShadow: 'var(--glass-hairline)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => set(e.target.value),
    placeholder: placeholder,
    "aria-label": placeholder,
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      background: 'transparent',
      color: 'var(--text)',
      font: '400 15px/22px var(--font-sans)',
      outline: 'none'
    }
  })), has ? /*#__PURE__*/React.createElement("button", {
    type: "submit",
    "aria-label": "Send",
    style: {
      ...round,
      background: 'var(--primary)',
      color: 'var(--on-primary)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "send",
    size: "sm"
  })) : /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Hold to record a voice note",
    onClick: onRecord,
    style: {
      ...round,
      background: 'var(--button-secondary)',
      color: 'var(--on-button-secondary)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "mic",
    size: "sm"
  }))));
}
Object.assign(__ds_scope, { Composer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Composer/Composer.jsx", error: String((e && e.message) || e) }); }

// components/MarginReaction/MarginAhead.jsx
try { (() => {
function MarginAhead({
  chapter,
  children,
  look,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-style": look,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--margin-ahead)',
      font: '500 13px/18px var(--font-sans)',
      borderTop: '1px solid var(--divider)',
      paddingTop: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "sparkle",
    size: "sm"
  }), children ?? 'The room is busy in Chapter ' + chapter);
}
Object.assign(__ds_scope, { MarginAhead });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/MarginReaction/MarginAhead.jsx", error: String((e && e.message) || e) }); }

// components/MarginReaction/MarginReaction.jsx
try { (() => {
function MarginReaction({
  emoji,
  count,
  own = false,
  thread = false,
  replies,
  fresh = false,
  onClick,
  look,
  style
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 28,
    padding: '0 8px',
    borderRadius: 'var(--radius-full)',
    font: '600 12px/16px var(--font-sans)',
    background: 'transparent',
    cursor: onClick ? 'pointer' : 'default',
    animation: fresh ? 'fb-fade-in var(--duration-base) var(--ease-out)' : undefined,
    alignSelf: 'flex-start'
  };
  if (thread) {
    return /*#__PURE__*/React.createElement("button", {
      "data-style": look,
      type: "button",
      onClick: onClick,
      "aria-label": replies + ' replies',
      style: {
        ...base,
        border: 0,
        padding: '0 2px',
        color: 'var(--margin-thread)',
        ...style
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "reply",
      size: 16,
      strokeWidth: 1.5
    }), replies);
  }
  return /*#__PURE__*/React.createElement("button", {
    "data-style": look,
    type: "button",
    onClick: onClick,
    style: {
      ...base,
      border: '1.5px solid ' + (own ? 'var(--margin-own)' : 'var(--margin-reaction)'),
      color: 'var(--reader-text)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", null, emoji), count > 1 && /*#__PURE__*/React.createElement("span", null, count));
}
Object.assign(__ds_scope, { MarginReaction });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/MarginReaction/MarginReaction.jsx", error: String((e && e.message) || e) }); }

// components/OptionRow/OptionRow.jsx
try { (() => {
function OptionRow({
  label,
  description,
  icon,
  selected = false,
  disabled = false,
  onSelect,
  look,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "radio",
    "aria-checked": selected,
    disabled: disabled,
    "data-style": look,
    onClick: onSelect,
    style: {
      width: '100%',
      minHeight: 56,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      border: 0,
      borderRadius: 'var(--radius-option)',
      background: selected ? 'var(--selected-fill)' : 'var(--option-fill)',
      boxShadow: selected ? 'var(--selected-ring)' : undefined,
      color: disabled ? 'var(--text-muted)' : 'var(--text)',
      textAlign: 'left',
      cursor: disabled ? 'default' : 'pointer',
      transition: 'background-color var(--duration-fast) var(--ease-out)',
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 15px/20px var(--font-sans)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px/18px var(--font-sans)',
      color: 'var(--text-secondary)'
    }
  }, description)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 22,
      height: 22,
      flex: 'none',
      borderRadius: 'var(--radius-full)',
      boxShadow: 'inset 0 0 0 1.5px ' + (selected ? 'var(--focus-ring)' : 'var(--text-muted)'),
      display: 'grid',
      placeItems: 'center'
    }
  }, selected && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 'var(--radius-full)',
      background: 'var(--focus-ring)'
    }
  })));
}
Object.assign(__ds_scope, { OptionRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/OptionRow/OptionRow.jsx", error: String((e && e.message) || e) }); }

// components/ReactionPicker/ReactionPicker.jsx
try { (() => {
const REACTIONS = ['♥', '😂', '😮', '😢', '🔥', '🤔'];
function ReactionPicker({
  selected,
  onSelect,
  onComment,
  composing: composingProp,
  overScrim = false,
  look,
  style
}) {
  const [composing, setComposing] = React.useState(composingProp ?? false);
  const [text, setText] = React.useState('');
  const shell = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    padding: 6,
    borderRadius: 'var(--radius-full)',
    background: overScrim ? 'var(--surface-raised)' : 'var(--float-fill-strong)',
    backdropFilter: overScrim ? undefined : 'var(--float-blur)',
    WebkitBackdropFilter: overScrim ? undefined : 'var(--float-blur)',
    boxShadow: overScrim ? 'var(--float-shadow)' : 'var(--float-ring), var(--float-shadow)',
    ...style
  };
  if (composing) {
    return /*#__PURE__*/React.createElement("form", {
      "data-style": look,
      onSubmit: e => {
        e.preventDefault();
        if (text.trim()) {
          onComment && onComment(text.trim());
          setText('');
          setComposing(false);
        }
      },
      style: {
        ...shell,
        padding: '6px 6px 6px 16px',
        width: 340,
        maxWidth: '100%'
      }
    }, /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      value: text,
      maxLength: 200,
      onChange: e => setText(e.target.value),
      placeholder: "Add a comment",
      style: {
        flex: 1,
        minWidth: 0,
        border: 0,
        background: 'transparent',
        color: 'var(--text)',
        font: '400 15px/22px var(--font-sans)',
        outline: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 12px/16px var(--font-sans)',
        color: 'var(--text-muted)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, 200 - text.length), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      "aria-label": "Send",
      style: {
        width: 'var(--touch-target)',
        height: 'var(--touch-target)',
        borderRadius: 'var(--radius-full)',
        border: 0,
        background: 'var(--primary)',
        color: 'var(--on-primary)',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "send",
      size: "sm"
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    "data-style": look,
    role: "toolbar",
    "aria-label": "React to paragraph",
    style: shell
  }, REACTIONS.map(r => /*#__PURE__*/React.createElement("button", {
    key: r,
    type: "button",
    onClick: () => onSelect && onSelect(r),
    "aria-pressed": selected === r,
    style: {
      width: 'var(--touch-target)',
      height: 'var(--touch-target)',
      borderRadius: 'var(--radius-full)',
      display: 'grid',
      placeItems: 'center',
      fontSize: 22,
      border: 0,
      cursor: 'pointer',
      color: 'var(--text)',
      background: selected === r ? 'var(--selected-fill)' : 'transparent',
      boxShadow: selected === r ? 'var(--selected-ring)' : undefined,
      transition: 'transform var(--duration-fast) var(--ease-out)'
    }
  }, r)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 24,
      background: 'var(--tint-3)',
      margin: '0 4px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setComposing(true),
    style: {
      padding: '0 12px',
      height: 'var(--touch-target)',
      border: 0,
      borderRadius: 'var(--radius-full)',
      background: 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      font: '600 13px/18px var(--font-sans)',
      color: 'var(--ghost)',
      cursor: 'pointer'
    }
  }, "Add comment"));
}
Object.assign(__ds_scope, { REACTIONS, ReactionPicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ReactionPicker/ReactionPicker.jsx", error: String((e && e.message) || e) }); }

// components/SegmentedTabs/SegmentedTabs.jsx
try { (() => {
function SegmentedTabs({
  items = [],
  value,
  onChange,
  fullWidth = true,
  look,
  style
}) {
  const opts = items.map(i => typeof i === 'string' ? {
    label: i,
    value: i
  } : i);
  const [own, setOwn] = React.useState(value ?? (opts[0] && opts[0].value));
  const current = value ?? own;
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "data-style": look,
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      gap: 2,
      padding: 4,
      borderRadius: 'var(--radius-button)',
      background: 'var(--segment-track)',
      backdropFilter: 'var(--chrome-blur)',
      WebkitBackdropFilter: 'var(--chrome-blur)',
      boxShadow: 'var(--chrome-edge)',
      ...style
    }
  }, opts.map(o => {
    const on = o.value === current;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "tab",
      "aria-selected": on,
      onClick: () => {
        setOwn(o.value);
        onChange && onChange(o.value);
      },
      style: {
        flex: fullWidth ? 1 : 'none',
        height: 36,
        padding: '0 14px',
        border: 0,
        borderRadius: 'var(--radius-segment)',
        background: on ? 'var(--segment-active)' : 'transparent',
        color: on ? 'var(--text)' : 'var(--text-secondary)',
        font: '600 13px/18px var(--font-sans)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)'
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/SegmentedTabs/SegmentedTabs.jsx", error: String((e && e.message) || e) }); }

// components/SessionCard/LiveBar.jsx
try { (() => {
function LiveBar({
  listening = 0,
  label,
  onJoin,
  joined = false,
  look,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-style": look,
    style: {
      maxWidth: 380,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 6px 6px 18px',
      minHeight: 48,
      borderRadius: 'var(--radius-full)',
      background: 'var(--float-fill)',
      backdropFilter: 'var(--float-blur)',
      WebkitBackdropFilter: 'var(--float-blur)',
      boxShadow: 'var(--float-ring), var(--float-shadow)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 'var(--radius-full)',
      background: 'var(--live)',
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px/18px var(--font-sans)',
      color: 'var(--text)'
    }
  }, label ?? 'Live now · ' + listening + ' listening'), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: joined ? 'secondary' : 'primary',
    size: "pill",
    onClick: onJoin
  }, joined ? 'Leave' : 'Join'));
}
Object.assign(__ds_scope, { LiveBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/SessionCard/LiveBar.jsx", error: String((e && e.message) || e) }); }

// components/SessionCard/SessionCard.jsx
try { (() => {
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
function SessionCard({
  when,
  day,
  title,
  coversChapter,
  going = 0,
  host,
  readerChapter,
  rsvp: rsvpProp,
  onRsvp,
  look,
  style
}) {
  const [rsvpState, setRsvp] = React.useState(false);
  const rsvp = rsvpProp ?? rsvpState;
  const behind = readerChapter != null && coversChapter != null && readerChapter < coversChapter;
  const n = behind ? coversChapter - readerChapter : 0;
  const count = going + (rsvp && rsvpProp == null ? 1 : 0);
  return /*#__PURE__*/React.createElement("div", {
    "data-style": look,
    style: {
      maxWidth: 380,
      padding: 16,
      borderRadius: 'var(--radius-card)',
      background: 'var(--card-fill)',
      boxShadow: 'var(--card-ring)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      color: 'var(--text-secondary)',
      font: '600 13px/18px var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "calendar",
    size: "sm"
  }), when), /*#__PURE__*/React.createElement("p", {
    style: {
      font: '600 17px/24px var(--font-sans)',
      margin: 0,
      color: 'var(--text)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px/18px var(--font-sans)',
      color: 'var(--text-muted)'
    }
  }, "Covers up to Chapter ", coversChapter, " \xB7 ", count, " going"), behind && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      borderRadius: 'var(--radius-inner)',
      background: 'var(--warning-surface)',
      color: 'var(--on-warning-surface)',
      font: '400 13px/18px var(--font-sans)'
    }
  }, "You're in Chapter ", readerChapter, ". ", WORDS[n] || n, " chapter", n === 1 ? '' : 's', " to go", day ? ' before ' + day : '', "."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 12px/16px var(--font-sans)',
      letterSpacing: '0.02em',
      color: 'var(--text-muted)'
    }
  }, "Hosted by ", host), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: rsvp ? 'ghost' : 'secondary',
    size: "sm",
    onClick: () => {
      setRsvp(!rsvp);
      onRsvp && onRsvp(!rsvp);
    }
  }, rsvp ? 'Going' : "I'm going")));
}
Object.assign(__ds_scope, { SessionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/SessionCard/SessionCard.jsx", error: String((e && e.message) || e) }); }

// components/Sheet/Sheet.jsx
try { (() => {
function Sheet({
  title,
  children,
  footer,
  onClose,
  overlay = false,
  look,
  style
}) {
  const panel = /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": overlay || undefined,
    "aria-label": typeof title === 'string' ? title : undefined,
    "data-style": overlay ? undefined : look,
    style: {
      margin: '0 var(--sheet-inset) var(--sheet-inset)',
      borderRadius: 'var(--radius-sheet) var(--radius-sheet) var(--radius-sheet-bottom) var(--radius-sheet-bottom)',
      background: 'var(--sheet-fill)',
      backdropFilter: 'var(--sheet-blur)',
      WebkitBackdropFilter: 'var(--sheet-blur)',
      boxShadow: 'var(--sheet-ring), var(--sheet-shadow)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
      ...(overlay ? {} : style)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      placeItems: 'center',
      height: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 5,
      borderRadius: 'var(--radius-full)',
      background: 'var(--tint-3)'
    }
  })), (title || onClose) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '4px 12px 8px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      font: '600 20px/28px var(--font-sans)'
    }
  }, title), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Close",
    onClick: onClose,
    style: {
      width: 'var(--touch-target)',
      height: 'var(--touch-target)',
      borderRadius: 'var(--radius-full)',
      border: 0,
      background: 'var(--tint-2)',
      color: 'var(--text)',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: "sm"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, footer));
  if (!overlay) return panel;
  return /*#__PURE__*/React.createElement("div", {
    "data-style": look,
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      background: 'var(--scrim)',
      zIndex: 10,
      ...style
    },
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, panel);
}
Object.assign(__ds_scope, { Sheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Sheet/Sheet.jsx", error: String((e && e.message) || e) }); }

// components/UnreadDot/UnreadDot.jsx
try { (() => {
function UnreadDot({
  size = 7,
  label = 'Unread',
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    role: "img",
    "aria-label": label,
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      flex: 'none',
      borderRadius: 'var(--radius-full)',
      background: 'var(--text-accent)',
      ...style
    }
  });
}
Object.assign(__ds_scope, { UnreadDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/UnreadDot/UnreadDot.jsx", error: String((e && e.message) || e) }); }

// components/AppHeader/AppHeader.jsx
try { (() => {
const ctl = {
  height: 'var(--touch-target)',
  border: 0,
  color: 'var(--text)',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  flex: 'none',
  position: 'relative'
};
function AppHeader({
  title,
  subtitle,
  onBack,
  actions = [],
  look,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    "data-style": look,
    style: {
      minHeight: 60,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--chrome-fill)',
      backdropFilter: 'var(--chrome-blur)',
      WebkitBackdropFilter: 'var(--chrome-blur)',
      boxShadow: 'var(--chrome-edge)',
      color: 'var(--text)',
      ...style
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Back",
    onClick: onBack,
    style: {
      ...ctl,
      width: 'var(--touch-target)',
      borderRadius: 'var(--radius-full)',
      background: 'var(--control-fill)',
      boxShadow: 'var(--control-ring)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-left"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      paddingLeft: onBack ? 0 : 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 17px/24px var(--font-sans)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 12px/16px var(--font-sans)',
      letterSpacing: '0.02em',
      color: 'var(--text-muted)'
    }
  }, subtitle)), actions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      borderRadius: 'var(--radius-full)',
      background: 'var(--control-fill)',
      boxShadow: 'var(--control-ring)',
      padding: '0 2px'
    }
  }, actions.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.label,
    type: "button",
    "aria-label": a.label,
    onClick: a.onClick,
    style: {
      ...ctl,
      width: 'var(--touch-target)',
      borderRadius: 'var(--radius-full)',
      background: 'transparent'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: a.icon
  }), a.dot && /*#__PURE__*/React.createElement(__ds_scope.UnreadDot, {
    style: {
      position: 'absolute',
      top: 9,
      right: 9
    }
  })))));
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/AppHeader/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/TabBar/TabBar.jsx
try { (() => {
const DEFAULT_TABS = [{
  value: 'home',
  label: 'Home',
  icon: 'house'
}, {
  value: 'shelf',
  label: 'Shelf',
  icon: 'shelf'
}, {
  value: 'chat',
  label: 'Chat',
  icon: 'message-circle'
}, {
  value: 'you',
  label: 'You',
  icon: 'user'
}];
function TabBar({
  items = DEFAULT_TABS,
  value,
  onChange,
  look,
  style
}) {
  const [own, setOwn] = React.useState(value ?? (items[0] && items[0].value));
  const current = value ?? own;
  return /*#__PURE__*/React.createElement("nav", {
    "data-style": look,
    "aria-label": "Main",
    style: {
      height: 'var(--tabbar-height)',
      margin: '0 var(--tabbar-inset) var(--tabbar-inset)',
      padding: '0 6px',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderRadius: 'var(--tabbar-radius)',
      background: 'var(--chrome-fill)',
      backdropFilter: 'var(--chrome-blur)',
      WebkitBackdropFilter: 'var(--chrome-blur)',
      boxShadow: 'var(--float-ring), var(--float-shadow)',
      ...style
    }
  }, items.map(t => {
    const on = t.value === current;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      type: "button",
      "aria-current": on ? 'page' : undefined,
      onClick: () => {
        setOwn(t.value);
        onChange && onChange(t.value);
      },
      style: {
        flex: 1,
        height: 52,
        position: 'relative',
        border: 0,
        borderRadius: 'var(--radius-full)',
        background: on ? 'var(--tab-active-fill)' : 'transparent',
        color: on ? 'var(--text)' : 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        font: '600 11px/14px var(--font-sans)',
        cursor: 'pointer',
        transition: 'background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: t.icon,
      size: 22
    }), t.label, t.dot && /*#__PURE__*/React.createElement(__ds_scope.UnreadDot, {
      style: {
        position: 'absolute',
        top: 8,
        left: 'calc(50% + 9px)'
      }
    }));
  }));
}
Object.assign(__ds_scope, { DEFAULT_TABS, TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/TabBar/TabBar.jsx", error: String((e && e.message) || e) }); }

// components/shared/useLook.jsx
try { (() => {
// Resolves the style ("classic" | "glass") for a component. An explicit `look` prop wins and is written as data-style on the
// component root so style-scoped tokens recompute there; otherwise the nearest ancestor's --look token is read after layout.
function useLook(lookProp) {
  const ref = React.useRef(null);
  const [inherited, setInherited] = React.useState('glass');
  React.useLayoutEffect(() => {
    if (lookProp || !ref.current) return;
    const v = getComputedStyle(ref.current).getPropertyValue('--look').trim();
    if ((v === 'classic' || v === 'glass') && v !== inherited) setInherited(v);
  });
  return {
    look: lookProp || inherited,
    ref,
    styleAttr: lookProp ? {
      'data-style': lookProp
    } : {}
  };
}
Object.assign(__ds_scope, { useLook });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shared/useLook.jsx", error: String((e && e.message) || e) }); }

// components/ChatMessage/ChatMessage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const R = 'var(--radius-bubble-main)',
  T = 'var(--radius-bubble-corner)';
const bubbleRadius = mine => mine ? `${R} ${R} ${T} ${R}` : `${R} ${R} ${R} ${T}`;
function Veil({
  children,
  onReveal,
  icon = 'eye-off',
  mine = false,
  look,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onReveal,
    "data-style": look,
    style: {
      maxWidth: 280,
      padding: '12px 14px',
      borderRadius: bubbleRadius(mine),
      border: 0,
      background: 'var(--veil)',
      color: 'var(--veil-text)',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      font: '500 14px/20px var(--font-sans)',
      textAlign: 'left',
      cursor: 'pointer',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", null, children));
}
function Reactions({
  items,
  mine
}) {
  if (!items || !items.length) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginTop: -10,
      padding: '0 12px',
      justifyContent: mine ? 'flex-end' : 'flex-start',
      position: 'relative'
    }
  }, items.map(r => /*#__PURE__*/React.createElement("span", {
    key: r.emoji,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      height: 24,
      padding: '0 8px',
      borderRadius: 'var(--radius-full)',
      font: '600 12px/16px var(--font-sans)',
      color: 'var(--text)',
      background: r.own ? 'var(--selected-fill)' : 'var(--float-fill-strong)',
      backdropFilter: 'var(--float-blur)',
      WebkitBackdropFilter: 'var(--float-blur)',
      boxShadow: (r.own ? 'var(--selected-ring), ' : 'var(--float-ring), ') + '0 0 0 2px var(--surface)'
    }
  }, /*#__PURE__*/React.createElement("span", null, r.emoji), r.count > 1 && /*#__PURE__*/React.createElement("span", null, r.count))));
}
function ChatMessage({
  sender,
  senderChapter,
  readerChapter,
  mine = false,
  quote,
  quoteChapter,
  quoteSource,
  removed = false,
  reactions,
  revealed: revealedProp,
  onReveal,
  onOpenQuote,
  look: lookProp,
  children,
  style
}) {
  const {
    look,
    ref,
    styleAttr
  } = __ds_scope.useLook(lookProp);
  const glass = look === 'glass';
  const [revealedState, setRevealed] = React.useState(false);
  const revealed = revealedProp ?? revealedState;
  const ahead = !mine && senderChapter != null && readerChapter != null && senderChapter > readerChapter;
  const quoteAhead = quote && quoteChapter != null && readerChapter != null && quoteChapter > readerChapter;
  const align = mine ? 'flex-end' : 'flex-start';
  const reveal = () => {
    setRevealed(true);
    onReveal && onReveal();
  };
  const who = mine ? 'You' : sender;
  const meta = glass && who && !removed ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 12px/16px var(--font-sans)',
      letterSpacing: '0.02em',
      color: 'var(--text-muted)',
      padding: '0 12px 4px',
      textAlign: mine ? 'right' : 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--text-secondary)'
    }
  }, who), senderChapter != null && ' · Ch ' + senderChapter) : null;
  const wrap = (node, withReactions = true) => /*#__PURE__*/React.createElement("div", _extends({
    ref: ref
  }, styleAttr, {
    style: {
      alignSelf: align,
      display: 'flex',
      flexDirection: 'column',
      alignItems: align,
      maxWidth: '100%',
      ...style
    }
  }), meta, node, withReactions && /*#__PURE__*/React.createElement(Reactions, {
    items: reactions,
    mine: mine
  }));
  if (removed) {
    return wrap(glass ? /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 280,
        padding: '10px 14px',
        borderRadius: bubbleRadius(mine),
        boxShadow: 'inset 0 0 0 1.5px var(--divider)',
        color: 'var(--text-muted)',
        font: 'italic 400 15px/22px var(--font-sans)'
      }
    }, "This message was removed") : /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 280,
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--divider)',
        color: 'var(--text-muted)',
        font: 'italic 400 15px/22px var(--font-sans)'
      }
    }, "This message was removed"), false);
  }
  if ((ahead || quoteAhead) && !revealed) {
    const ch = quoteAhead ? quoteChapter : senderChapter;
    return wrap(/*#__PURE__*/React.createElement(Veil, {
      onReveal: reveal,
      mine: mine,
      icon: quoteAhead ? 'book' : 'eye-off'
    }, (sender || 'Someone') + ' is in Chapter ' + ch + '. Tap to reveal.'), false);
  }
  if (quote) {
    return wrap(/*#__PURE__*/React.createElement("div", {
      style: {
        padding: glass ? 16 : 12,
        borderRadius: glass ? bubbleRadius(mine) : 'var(--radius-md)',
        background: glass ? 'var(--bubble-theirs)' : 'var(--reader-page)',
        boxShadow: 'var(--bubble-theirs-ring)',
        color: glass ? 'var(--text)' : 'var(--reader-text)',
        maxWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-start'
      }
    }, !glass && !mine && sender && /*#__PURE__*/React.createElement("div", {
      style: {
        font: '600 13px/18px var(--font-sans)',
        color: 'var(--reader-text-secondary)'
      }
    }, sender, " shared a passage"), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'italic 400 16px/24px var(--font-serif)',
        margin: 0
      }
    }, quote), glass ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 12px/16px var(--font-sans)',
        letterSpacing: '0.02em',
        color: 'var(--text-muted)'
      }
    }, quoteSource ? quoteSource + ' · ' : '', "Ch ", quoteChapter), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "secondary",
      size: "pill",
      icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: "book-open",
        size: 16
      }),
      onClick: onOpenQuote
    }, "Open in the book")) : /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onOpenQuote,
      style: {
        background: 'none',
        border: 0,
        padding: 0,
        font: '600 12px/16px var(--font-sans)',
        color: 'var(--reader-text-secondary)',
        cursor: 'pointer'
      }
    }, "Ch ", quoteChapter, " \xB7 Open in book")));
  }
  return wrap(/*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 280,
      padding: glass ? '10px 14px' : '10px 12px',
      borderRadius: bubbleRadius(mine),
      background: mine ? 'var(--bubble-mine-fill)' : 'var(--bubble-theirs)',
      boxShadow: mine ? undefined : 'var(--bubble-theirs-ring)',
      color: mine ? 'var(--on-bubble-mine)' : 'var(--text)',
      font: '400 15px/22px var(--font-sans)',
      paddingBottom: glass && reactions && reactions.length ? 16 : undefined
    }
  }, !glass && !mine && sender && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'baseline',
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px/18px var(--font-sans)'
    }
  }, sender), senderChapter != null && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 12px/16px var(--font-sans)',
      color: 'var(--text-muted)'
    }
  }, "Ch ", senderChapter)), children));
}
Object.assign(__ds_scope, { bubbleRadius, Veil, ChatMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ChatMessage/ChatMessage.jsx", error: String((e && e.message) || e) }); }

// components/MemberProgress/MemberProgress.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const initials = n => n.slice(0, 2);
function MemberProgress({
  members = [],
  chapters = 24,
  showList = true,
  look: lookProp,
  style
}) {
  const {
    look,
    ref,
    styleAttr
  } = __ds_scope.useLook(lookProp);
  const glass = look === 'glass';
  const size = glass ? 26 : 32,
    rail = glass ? 6 : 4;
  const placed = members.filter(m => m.chapter != null);
  const pct = c => Math.max(0, Math.min(100, (c - 1) / Math.max(1, chapters - 1) * 100));
  const list = [...members].filter(m => !m.you).sort((a, b) => a.name.localeCompare(b.name));
  return /*#__PURE__*/React.createElement("div", _extends({
    ref: ref
  }, styleAttr, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 56,
      margin: '8px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: -12,
      right: -12,
      top: 28 - rail / 2,
      height: rail,
      borderRadius: 'var(--radius-full)',
      background: 'var(--progress-track)'
    }
  }), placed.map((m, i) => {
    const stack = placed.slice(0, i).filter(o => Math.abs(pct(o.chapter) - pct(m.chapter)) < 4).length;
    const common = {
      position: 'absolute',
      top: 28 - size / 2,
      left: pct(m.chapter) + '%',
      width: size,
      height: size,
      marginLeft: -size / 2 + stack * (size * 0.4),
      borderRadius: 'var(--radius-full)',
      display: 'grid',
      placeItems: 'center',
      font: (glass ? '600 10px/12px' : '600 12px/16px') + ' var(--font-sans)'
    };
    const look = glass ? {
      background: m.you ? 'var(--progress-fill)' : 'var(--surface-raised)',
      color: m.you ? 'var(--surface)' : 'var(--text)',
      boxShadow: '0 0 0 2px var(--surface)' + (m.you ? ', 0 0 0 4px var(--progress-fill)' : '')
    } : {
      border: '2px solid var(--progress-fill)',
      background: m.you ? 'var(--progress-fill)' : 'var(--surface-raised)',
      color: m.you ? 'var(--surface)' : 'var(--text)'
    };
    return /*#__PURE__*/React.createElement("span", {
      key: m.name,
      title: m.name + ' · Ch ' + m.chapter,
      style: {
        ...common,
        ...look,
        zIndex: m.you ? 2 : 1
      }
    }, m.you ? 'You' : initials(m.name));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      font: '500 12px/16px var(--font-sans)',
      letterSpacing: '0.02em',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Ch 1"), /*#__PURE__*/React.createElement("span", null, "Ch ", chapters)), showList && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 8
    }
  }, list.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.name,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      font: '400 15px/22px var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", null, m.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 13
    }
  }, m.chapter != null ? 'Ch ' + m.chapter : 'Not started')))));
}
Object.assign(__ds_scope, { MemberProgress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/MemberProgress/MemberProgress.jsx", error: String((e && e.message) || e) }); }

// components/Toast/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const KINDS = {
  positive: {
    bg: 'var(--positive-surface)',
    fg: 'var(--on-positive-surface)',
    icon: 'var(--positive)',
    glyph: 'circle-check'
  },
  warning: {
    bg: 'var(--warning-surface)',
    fg: 'var(--on-warning-surface)',
    icon: 'var(--warning)',
    glyph: 'triangle-alert'
  },
  error: {
    bg: 'var(--error-surface)',
    fg: 'var(--on-error-surface)',
    icon: 'var(--error)',
    glyph: 'circle-alert'
  }
};
function Toast({
  kind = 'positive',
  children,
  actionLabel,
  onAction,
  look: lookProp,
  style
}) {
  const {
    look,
    ref,
    styleAttr
  } = __ds_scope.useLook(lookProp);
  const k = KINDS[kind] || KINDS.positive;
  const glass = look === 'glass';
  return /*#__PURE__*/React.createElement("div", _extends({
    ref: ref
  }, styleAttr, {
    role: kind === 'error' ? 'alert' : 'status',
    style: {
      display: 'flex',
      gap: glass ? 12 : 10,
      alignItems: 'center',
      minHeight: 48,
      padding: glass ? '8px 18px 8px 8px' : 12,
      borderRadius: 'var(--radius-float)',
      maxWidth: 420,
      font: '500 14px/20px var(--font-sans)',
      background: glass ? 'var(--float-fill)' : k.bg,
      color: glass ? 'var(--text)' : k.fg,
      backdropFilter: 'var(--float-blur)',
      WebkitBackdropFilter: 'var(--float-blur)',
      boxShadow: 'var(--float-ring), var(--float-shadow)',
      ...style
    }
  }), glass ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 32,
      height: 32,
      flex: 'none',
      borderRadius: 'var(--radius-full)',
      background: k.bg,
      color: k.icon,
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: k.glyph,
    size: 18
  })) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: k.glyph,
    size: "sm",
    color: k.icon
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, children), actionLabel && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAction,
    style: {
      marginLeft: 'auto',
      background: 'none',
      border: 0,
      padding: 0,
      color: glass ? 'var(--ghost)' : 'inherit',
      font: '600 13px/20px var(--font-sans)',
      whiteSpace: 'nowrap',
      cursor: 'pointer'
    }
  }, actionLabel));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Toast/Toast.jsx", error: String((e && e.message) || e) }); }

// components/Banner/Banner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const statusKinds = {
  positive: {
    bg: 'var(--positive-surface)',
    fg: 'var(--on-positive-surface)',
    icon: 'var(--positive)',
    glyph: 'circle-check'
  },
  warning: {
    bg: 'var(--warning-surface)',
    fg: 'var(--on-warning-surface)',
    icon: 'var(--warning)',
    glyph: 'triangle-alert'
  },
  error: {
    bg: 'var(--error-surface)',
    fg: 'var(--on-error-surface)',
    icon: 'var(--error)',
    glyph: 'circle-alert'
  }
};
function StatusDisc({
  kind = 'positive',
  size = 32
}) {
  const k = statusKinds[kind] || statusKinds.positive;
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: size,
      height: size,
      flex: 'none',
      borderRadius: 'var(--radius-full)',
      background: k.bg,
      color: k.icon,
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: k.glyph,
    size: size <= 28 ? 16 : 18
  }));
}
function Banner({
  kind = 'positive',
  children,
  actionLabel,
  onAction,
  toast = false,
  pill = false,
  look: lookProp,
  style
}) {
  const {
    look,
    ref,
    styleAttr
  } = __ds_scope.useLook(lookProp);
  if (toast) return /*#__PURE__*/React.createElement(__ds_scope.Toast, {
    kind: kind,
    actionLabel: actionLabel,
    onAction: onAction,
    look: lookProp,
    style: style
  }, children);
  const k = statusKinds[kind] || statusKinds.positive;
  const action = actionLabel && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAction,
    style: {
      marginLeft: 'auto',
      background: 'none',
      border: 0,
      padding: '0 4px',
      color: look === 'glass' ? 'var(--ghost)' : 'inherit',
      font: '600 13px/20px var(--font-sans)',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      alignSelf: 'center'
    }
  }, actionLabel);
  if (look === 'glass') {
    return /*#__PURE__*/React.createElement("div", _extends({
      ref: ref
    }, styleAttr, {
      role: kind === 'error' ? 'alert' : 'status',
      style: {
        display: 'flex',
        gap: 12,
        alignItems: pill ? 'center' : 'flex-start',
        padding: pill ? '6px 16px 6px 6px' : 12,
        borderRadius: pill ? 'var(--radius-full)' : 'var(--radius-row)',
        maxWidth: 420,
        font: '400 14px/20px var(--font-sans)',
        background: 'var(--card-fill)',
        boxShadow: 'var(--card-ring)',
        color: 'var(--text)',
        ...style
      }
    }), /*#__PURE__*/React.createElement(StatusDisc, {
      kind: kind,
      size: pill ? 28 : 32
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        paddingTop: pill ? 0 : 6
      }
    }, children), action);
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    ref: ref
  }, styleAttr, {
    role: kind === 'error' ? 'alert' : 'status',
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      padding: 12,
      borderRadius: 'var(--radius-md)',
      maxWidth: 420,
      font: '400 14px/20px var(--font-sans)',
      background: k.bg,
      color: k.fg,
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: k.glyph,
    size: "sm",
    color: k.icon
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, children), action);
}
Object.assign(__ds_scope, { statusKinds, StatusDisc, Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Banner/Banner.jsx", error: String((e && e.message) || e) }); }

// components/VoiceNote/VoiceNote.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const DEFAULT_BARS = [8, 14, 22, 12, 18, 26, 16, 10, 20, 24, 14, 8, 18, 22, 12, 16, 10, 6, 12, 18, 14, 8];
const SPEEDS = ['1×', '1.5×', '2×'];
const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
function VoiceNote({
  duration = 42,
  elapsed: elapsedProp,
  bars = DEFAULT_BARS,
  recording = false,
  sender,
  senderChapter,
  readerChapter,
  mine = false,
  look: lookProp,
  style
}) {
  const {
    look,
    ref,
    styleAttr
  } = __ds_scope.useLook(lookProp);
  const glass = look === 'glass';
  const [playing, setPlaying] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(elapsedProp ?? 0);
  const [speed, setSpeed] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  React.useEffect(() => {
    if (elapsedProp != null) setElapsed(elapsedProp);
  }, [elapsedProp]);
  React.useEffect(() => {
    if (!playing && !recording) return;
    const id = setInterval(() => setElapsed(e => {
      if (recording) return Math.min(e + 1, 120);
      const n = e + [1, 1.5, 2][speed];
      if (n >= duration) {
        setPlaying(false);
        return 0;
      }
      return n;
    }), 1000);
    return () => clearInterval(id);
  }, [playing, recording, speed, duration]);
  const root = {
    ref,
    ...styleAttr
  };
  if (recording) {
    if (glass) {
      return /*#__PURE__*/React.createElement("div", _extends({}, root, {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '8px 8px 8px 20px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--recording-surface)',
          ...style
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--recording)',
          font: '600 15px/20px var(--font-sans)',
          fontVariantNumeric: 'tabular-nums'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 'var(--radius-full)',
          background: 'var(--recording)'
        }
      }), fmt(elapsed)), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          minWidth: 0,
          font: '500 12px/16px var(--font-sans)',
          letterSpacing: '0.02em',
          color: 'var(--text-secondary)'
        }
      }, "Release to send \xB7 up to 2 minutes"), /*#__PURE__*/React.createElement("span", {
        style: {
          position: 'relative',
          width: 64,
          height: 64,
          flex: 'none',
          display: 'grid',
          placeItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true",
        style: {
          position: 'absolute',
          inset: 0,
          borderRadius: 'var(--radius-full)',
          background: 'var(--recording)',
          animation: 'fb-pulse 1.4s var(--ease-out) infinite'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          position: 'relative',
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-full)',
          background: 'var(--recording)',
          color: 'var(--surface)',
          display: 'grid',
          placeItems: 'center'
        }
      }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: "mic",
        size: 28
      }))));
    }
    return /*#__PURE__*/React.createElement("div", _extends({}, root, {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        ...style
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--recording)',
        font: '600 13px/18px var(--font-sans)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 'var(--radius-full)',
        background: 'var(--recording)'
      }
    }), "REC ", fmt(elapsed)), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 12px/16px var(--font-sans)',
        letterSpacing: '0.02em',
        color: 'var(--text-muted)'
      }
    }, "Hold to record \xB7 up to 2 minutes"));
  }
  if (!mine && senderChapter != null && readerChapter != null && senderChapter > readerChapter && !revealed) {
    return /*#__PURE__*/React.createElement(__ds_scope.Veil, _extends({}, styleAttr, {
      look: lookProp,
      icon: "mic",
      onReveal: () => setRevealed(true),
      style: style
    }), (sender || 'Someone') + ' is in Chapter ' + senderChapter + '. Tap to reveal.');
  }
  const played = Math.round(elapsed / duration * bars.length);
  const wave = /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      height: 28,
      minWidth: 0,
      overflow: 'hidden',
      flex: glass ? 1 : undefined
    }
  }, bars.map((h, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      width: 3,
      height: h,
      borderRadius: glass ? 'var(--radius-full)' : 2,
      flex: 'none',
      background: i < played ? 'var(--text)' : glass ? 'color-mix(in oklab, var(--text) 32%, transparent)' : 'var(--text-muted)'
    }
  })));
  const speedChip = /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSpeed(s => (s + 1) % 3),
    style: {
      font: '600 12px/16px var(--font-sans)',
      padding: '4px 8px',
      borderRadius: 'var(--radius-full)',
      border: glass ? 0 : '1px solid var(--border)',
      background: glass ? 'var(--tint-2)' : 'transparent',
      color: 'var(--text)',
      cursor: 'pointer',
      flex: 'none'
    }
  }, SPEEDS[speed]);
  const play = px => /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": playing ? 'Pause' : 'Play',
    onClick: () => setPlaying(p => !p),
    style: {
      width: px,
      height: px,
      borderRadius: 'var(--radius-full)',
      background: 'var(--primary)',
      color: 'var(--on-primary)',
      border: 0,
      display: 'grid',
      placeItems: 'center',
      flex: 'none',
      cursor: 'pointer',
      margin: px < 44 ? (44 - px) / -2 + 'px 0' : 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: playing ? 'pause' : 'play',
    size: px < 44 ? 18 : 'sm'
  }));
  if (glass) {
    return /*#__PURE__*/React.createElement("div", _extends({}, root, {
      role: "group",
      "aria-label": 'Voice note, ' + fmt(duration),
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: 260,
        maxWidth: '100%',
        padding: '12px 14px 10px',
        borderRadius: __ds_scope.bubbleRadius(mine),
        background: mine ? 'var(--bubble-mine-fill)' : 'var(--bubble-theirs)',
        boxShadow: mine ? undefined : 'var(--bubble-theirs-ring)',
        color: mine ? 'var(--on-bubble-mine)' : 'var(--text)',
        alignSelf: mine ? 'flex-end' : 'flex-start',
        ...style
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, play(36), wave), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 46
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 12px/16px var(--font-sans)',
        color: 'var(--text-muted)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, playing || elapsed ? fmt(elapsed) + ' / ' : '', fmt(duration)), speedChip));
  }
  return /*#__PURE__*/React.createElement("div", _extends({}, root, {
    role: "group",
    "aria-label": 'Voice note, ' + fmt(duration),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-raised)',
      maxWidth: '100%',
      alignSelf: mine ? 'flex-end' : 'flex-start',
      ...style
    }
  }), play(44), wave, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 12px/16px var(--font-sans)',
      color: 'var(--text-muted)',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap'
    }
  }, fmt(elapsed), " / ", fmt(duration)), speedChip);
}
Object.assign(__ds_scope, { VoiceNote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/VoiceNote/VoiceNote.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ChatScreen.jsx
try { (() => {
(() => {
  const {
    ChatMessage,
    VoiceNote,
    Icon,
    Banner,
    Composer
  } = window.FlipbookDesignSystem_7ad4ad;
  function ChatScreen({
    readerChapter
  }) {
    const [msgs, setMsgs] = React.useState([{
      id: 1,
      sender: 'Ada',
      senderChapter: 7,
      text: 'Mrs. Bennet is my aunty in every way',
      reactions: [{
        emoji: '♥',
        count: 3
      }, {
        emoji: '😂',
        count: 2
      }]
    }, {
      id: 2,
      mine: true,
      text: 'She would absolutely send Jane out in the rain'
    }, {
      id: 3,
      sender: 'Bolu',
      senderChapter: 4,
      voice: 42
    }, {
      id: 4,
      sender: 'Tolu',
      senderChapter: 19,
      text: 'Wait until you get to the letter'
    }, {
      id: 5,
      sender: 'Ada',
      senderChapter: 7,
      quote: '“I could easily forgive his pride, if he had not mortified mine.”',
      quoteChapter: 5
    }, {
      id: 6,
      removed: true
    }]);
    const [draft, setDraft] = React.useState('');
    const [rec, setRec] = React.useState(false);
    const listRef = React.useRef(null);
    React.useEffect(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, [msgs.length]);
    const send = () => {
      if (!draft.trim()) return;
      setMsgs([...msgs, {
        id: Date.now(),
        mine: true,
        text: draft.trim()
      }]);
      setDraft('');
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      title: "Chat",
      sub: "Lumee Book Club \xB7 Pride and Prejudice"
    }), /*#__PURE__*/React.createElement("div", {
      ref: listRef,
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '0 var(--space-5) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "t-caption",
      style: {
        textAlign: 'center',
        color: 'var(--text-muted)',
        padding: '4px 0'
      }
    }, "Today"), msgs.map(m => m.voice ? /*#__PURE__*/React.createElement(VoiceNote, {
      key: m.id,
      duration: m.voice,
      sender: m.sender,
      senderChapter: m.senderChapter,
      readerChapter: readerChapter,
      mine: m.mine
    }) : /*#__PURE__*/React.createElement(ChatMessage, {
      key: m.id,
      sender: m.sender,
      senderChapter: m.senderChapter,
      readerChapter: readerChapter,
      mine: m.mine,
      quote: m.quote,
      quoteSource: "Pride and Prejudice",
      reactions: m.reactions,
      quoteChapter: m.quoteChapter,
      removed: m.removed
    }, m.text))), rec ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 'var(--space-2) var(--space-3)'
      },
      onClick: () => setRec(false)
    }, /*#__PURE__*/React.createElement(VoiceNote, {
      recording: true
    })) : /*#__PURE__*/React.createElement(Composer, {
      value: draft,
      onChange: setDraft,
      onSend: t => {
        setMsgs([...msgs, {
          id: Date.now(),
          mine: true,
          text: t
        }]);
        setDraft('');
      },
      onRecord: () => setRec(true),
      placeholder: "Message the club",
      chapterNote: 'Posting from Ch ' + readerChapter
    }));
  }
  Object.assign(window, {
    ChatScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ChatScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Chrome.jsx
try { (() => {
(() => {
  const {
    Icon
  } = window.FlipbookDesignSystem_7ad4ad;
  function ScreenHeader({
    title,
    onBack,
    trailing,
    sub,
    logo
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '58px var(--space-5) var(--space-3)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--surface)'
      }
    }, onBack && /*#__PURE__*/React.createElement("button", {
      onClick: onBack,
      "aria-label": "Back",
      style: {
        width: 44,
        height: 44,
        marginLeft: -12,
        border: 0,
        background: 'none',
        color: 'var(--text)',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-left"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, logo ? /*#__PURE__*/React.createElement("img", {
      src: '../../assets/logo/flipbook-full-' + logo + '-colored.svg',
      alt: "Flipbook",
      style: {
        height: 32,
        display: 'block'
      }
    }) : /*#__PURE__*/React.createElement("div", {
      className: "t-h1",
      style: {
        color: 'var(--text)'
      }
    }, title), sub && /*#__PURE__*/React.createElement("div", {
      className: "t-caption",
      style: {
        color: 'var(--text-muted)'
      }
    }, sub)), trailing);
  }
  function TabBar({
    tab,
    onTab,
    unread,
    look
  }) {
    const DSTabBar = window.FlipbookDesignSystem_7ad4ad.TabBar;
    const items = [{
      value: 'home',
      label: 'Home',
      icon: 'house'
    }, {
      value: 'lobby',
      label: 'Lobby',
      icon: 'users'
    }, {
      value: 'chat',
      label: 'Chat',
      icon: 'message-circle',
      dot: unread && tab !== 'chat'
    }];
    const glass = look !== 'classic';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        paddingBottom: glass ? 10 : 26,
        background: glass ? 'transparent' : 'var(--surface)',
        boxShadow: glass ? 'none' : 'inset 0 1px 0 var(--divider)'
      }
    }, /*#__PURE__*/React.createElement(DSTabBar, {
      items: items,
      value: tab,
      onChange: onTab
    }));
  }
  function Section({
    title,
    children,
    action
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '0 var(--space-5)'
      }
    }, /*#__PURE__*/React.createElement("h2", {
      className: "t-h2",
      style: {
        margin: 0,
        color: 'var(--text)'
      }
    }, title), action), children);
  }
  Object.assign(window, {
    ScreenHeader,
    TabBar,
    Section
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/HomeScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(() => {
  const {
    BookCard
  } = window.FlipbookDesignSystem_7ad4ad;
  const FRIENDS = [{
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    includedWithPro: true,
    social: 'Ada and 2 others reading',
    coverTone: 'indigo'
  }, {
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    price: '₦500',
    coverTone: 'plum',
    social: 'Tolu is reading'
  }, {
    title: 'The Count of Monte Cristo',
    author: 'Alexandre Dumas',
    wasPrice: '₦2,500',
    price: '₦2,125',
    coverTone: 'gold'
  }];
  const PRO = [{
    title: 'Persuasion',
    author: 'Jane Austen',
    includedWithPro: true,
    coverTone: 'aqua'
  }, {
    title: 'Middlemarch',
    author: 'George Eliot',
    includedWithPro: true,
    coverTone: 'coral'
  }, {
    title: 'Emma',
    author: 'Jane Austen',
    includedWithPro: true,
    coverTone: 'ivory'
  }];
  function Shelf({
    books,
    onOpen
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 'var(--space-4)',
        overflowX: 'auto',
        padding: '0 var(--space-5)',
        scrollbarWidth: 'none'
      }
    }, books.map(b => /*#__PURE__*/React.createElement(BookCard, _extends({
      key: b.title
    }, b, {
      onClick: () => onOpen(b)
    }))));
  }
  function HomeScreen({
    onOpen,
    theme
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        paddingBottom: 'var(--space-6)'
      }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      title: "Flipbook",
      logo: theme || 'light'
    }), /*#__PURE__*/React.createElement(Section, {
      title: "Friends are reading"
    }, /*#__PURE__*/React.createElement(Shelf, {
      books: FRIENDS,
      onOpen: onOpen
    })), /*#__PURE__*/React.createElement(Section, {
      title: "Included with Pro"
    }, /*#__PURE__*/React.createElement(Shelf, {
      books: PRO,
      onOpen: onOpen
    })));
  }
  Object.assign(window, {
    HomeScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/LobbyScreen.jsx
try { (() => {
(() => {
  const {
    BookCover,
    Button,
    Badge,
    MemberProgress,
    SessionCard
  } = window.FlipbookDesignSystem_7ad4ad;
  function LobbyScreen({
    onRead,
    readerChapter
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        paddingBottom: 96
      }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      title: "Lumee Book Club",
      sub: "Hosted by Ada \xB7 14 members",
      trailing: /*#__PURE__*/React.createElement(Badge, {
        kind: "founding-host"
      })
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '0 var(--space-5)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-raised)',
        display: 'flex',
        gap: 'var(--space-4)'
      }
    }, /*#__PURE__*/React.createElement(BookCover, {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      width: 72
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "t-h3",
      style: {
        color: 'var(--text)'
      }
    }, "Pride and Prejudice"), /*#__PURE__*/React.createElement("div", {
      className: "t-caption",
      style: {
        color: 'var(--text-muted)'
      }
    }, "You \xB7 Ch ", readerChapter, " \xB7 48%"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'auto'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: onRead
    }, "Keep reading")))), /*#__PURE__*/React.createElement(Section, {
      title: "Where everyone is"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 var(--space-5)'
      }
    }, /*#__PURE__*/React.createElement(MemberProgress, {
      chapters: 61,
      members: [{
        name: 'Bolu',
        chapter: 4
      }, {
        name: 'You',
        chapter: readerChapter,
        you: true
      }, {
        name: 'Ada',
        chapter: 14
      }, {
        name: 'Tolu',
        chapter: 19
      }, {
        name: 'Kemi',
        chapter: null
      }]
    }))), /*#__PURE__*/React.createElement(Section, {
      title: "Next session"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 var(--space-5)'
      }
    }, /*#__PURE__*/React.createElement(SessionCard, {
      when: "Sat 11 Oct \xB7 7:00 pm",
      day: "Saturday",
      title: "Chapters 1 to 10: the Netherfield ball",
      coversChapter: 10,
      going: 12,
      host: "Ada",
      readerChapter: readerChapter
    }))));
  }
  Object.assign(window, {
    LobbyScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/LobbyScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ReaderScreen.jsx
try { (() => {
(() => {
  const {
    MarginReaction,
    MarginAhead,
    ReactionPicker,
    Icon
  } = window.FlipbookDesignSystem_7ad4ad;
  const PARAS = [{
    id: 'p1',
    text: 'Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.',
    hl: 'He had always intended to visit him,',
    reactions: [{
      emoji: '♥',
      count: 2
    }],
    replies: 1
  }, {
    id: 'p2',
    text: 'Observing his second daughter employed in trimming a hat, he suddenly addressed her with, “I hope Mr. Bingley will like it, Lizzy.”',
    reactions: [{
      emoji: '😂',
      count: 3
    }]
  }, {
    id: 'p3',
    text: '“We are not in a way to know what Mr. Bingley likes,” said her mother resentfully, “since we are not to visit.”',
    reactions: []
  }, {
    id: 'p4',
    text: '“But you forget, mamma,” said Elizabeth, “that we shall meet him at the assemblies, and that Mrs. Long promised to introduce him.”',
    reactions: []
  }];
  function Para({
    p,
    mine,
    onPress,
    active
  }) {
    const parts = p.hl ? p.text.split(p.hl) : [p.text];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 56px',
        gap: 10,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("p", {
      onClick: onPress,
      className: "t-reading",
      style: {
        margin: 0,
        color: 'var(--reader-text)',
        cursor: 'pointer',
        borderRadius: 4,
        background: active ? 'var(--highlight-lavender)' : 'transparent',
        transition: 'background-color var(--duration-base) var(--ease-out)'
      }
    }, parts[0], p.hl && /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'var(--highlight-sand)',
        borderRadius: 4,
        padding: '0 2px'
      }
    }, p.hl), parts[1]), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        paddingTop: 4
      }
    }, p.reactions.map(r => /*#__PURE__*/React.createElement(MarginReaction, {
      key: r.emoji,
      emoji: r.emoji,
      count: r.count
    })), mine && /*#__PURE__*/React.createElement(MarginReaction, {
      emoji: mine,
      own: true,
      fresh: true
    }), p.replies && /*#__PURE__*/React.createElement(MarginReaction, {
      thread: true,
      replies: p.replies
    })));
  }
  function ReaderScreen({
    onBack
  }) {
    const [active, setActive] = React.useState(null);
    const [mine, setMine] = React.useState({});
    const [chrome, setChrome] = React.useState(true);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100%',
        background: 'var(--reader-page)',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'sticky',
        top: 0,
        zIndex: 2,
        background: 'var(--reader-page)',
        padding: '54px var(--space-5) 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: chrome ? 1 : 0,
        transition: 'opacity var(--duration-base) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onBack,
      "aria-label": "Back",
      style: {
        width: 44,
        height: 44,
        marginLeft: -12,
        border: 0,
        background: 'none',
        color: 'var(--reader-text)',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-left"
    })), /*#__PURE__*/React.createElement("div", {
      className: "t-caption",
      style: {
        flex: 1,
        color: 'var(--reader-text-secondary)'
      }
    }, "Pride and Prejudice \xB7 Ch 2 \xB7 4%")), /*#__PURE__*/React.createElement("div", {
      onClick: e => {
        if (e.target === e.currentTarget) {
          setActive(null);
          setChrome(c => !c);
        }
      },
      style: {
        padding: '8px var(--space-4) 120px var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "t-caption",
      style: {
        color: 'var(--reader-text-secondary)'
      }
    }, "Long-press a paragraph to react"), /*#__PURE__*/React.createElement("h1", {
      className: "t-reading-chapter",
      style: {
        margin: '0 0 8px',
        color: 'var(--reader-text)'
      }
    }, "Chapter 2"), PARAS.map(p => /*#__PURE__*/React.createElement(React.Fragment, {
      key: p.id
    }, /*#__PURE__*/React.createElement(Para, {
      p: p,
      mine: mine[p.id],
      active: active === p.id,
      onPress: () => setActive(active === p.id ? null : p.id)
    }), active === p.id && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        margin: '-4px 0'
      }
    }, /*#__PURE__*/React.createElement(ReactionPicker, {
      selected: mine[p.id],
      onSelect: r => {
        setMine({
          ...mine,
          [p.id]: r
        });
        setActive(null);
      },
      onComment: () => setActive(null)
    })))), /*#__PURE__*/React.createElement(MarginAhead, {
      chapter: 6
    })));
  }
  Object.assign(window, {
    ReaderScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ReaderScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return (
    /*#__PURE__*/
    // data-om-starter: inert presence marker — Claude Design's starter-usage
    // probe reads it; it renders nothing. Keep it on this root element.
    React.createElement("div", {
      "data-om-starter": "ios-frame",
      style: {
        width,
        height,
        borderRadius: 48,
        overflow: 'hidden',
        position: 'relative',
        background: dark ? '#000' : '#F2F2F7',
        boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
        fontFamily: '-apple-system, system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 11,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 126,
        height: 37,
        borderRadius: 24,
        background: '#000',
        zIndex: 50
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }
    }, /*#__PURE__*/React.createElement(IOSStatusBar, {
      dark: dark
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
      title: title,
      dark: dark
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto'
      }
    }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
      dark: dark
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        height: 34,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 8,
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 139,
        height: 5,
        borderRadius: 100,
        background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
      }
    })))
  );
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ios-frame.jsx", error: String((e && e.message) || e) }); }

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.StatusDisc = __ds_scope.StatusDisc;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.BookCard = __ds_scope.BookCard;

__ds_ns.BookCover = __ds_scope.BookCover;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Veil = __ds_scope.Veil;

__ds_ns.ChatMessage = __ds_scope.ChatMessage;

__ds_ns.Composer = __ds_scope.Composer;

__ds_ns.Emblem = __ds_scope.Emblem;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.MarginAhead = __ds_scope.MarginAhead;

__ds_ns.MarginReaction = __ds_scope.MarginReaction;

__ds_ns.MemberProgress = __ds_scope.MemberProgress;

__ds_ns.OptionRow = __ds_scope.OptionRow;

__ds_ns.REACTIONS = __ds_scope.REACTIONS;

__ds_ns.ReactionPicker = __ds_scope.ReactionPicker;

__ds_ns.SegmentedTabs = __ds_scope.SegmentedTabs;

__ds_ns.LiveBar = __ds_scope.LiveBar;

__ds_ns.SessionCard = __ds_scope.SessionCard;

__ds_ns.Sheet = __ds_scope.Sheet;

__ds_ns.DEFAULT_TABS = __ds_scope.DEFAULT_TABS;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.UnreadDot = __ds_scope.UnreadDot;

__ds_ns.VoiceNote = __ds_scope.VoiceNote;

})();
