// __mocks__/obsidian.ts
// export const createEl = jest.fn((tag: string, options?: any) => {
//     const el = document.createElement(tag);
//     if (options?.text) el.innerText = options.text;
//     if (options?.cls) el.className = options.cls;
//     return el;
// });

export const createEl = jest.fn(function (this: HTMLElement, tag: string, options?: any) {
    const el = document.createElement(tag);
    //console.log(this);
    this.appendChild(el);

    var i = options?.cls;
    var s = options?.text!;
    var a = options?.attr!;
    var c = options?.title!;
    var u = options?.value!;
    var p = options?.placeholder!;
    var l = options?.type!;
    var f = options?.parent!;
    var d = options?.prepend!;
    var h = options?.href!;

    s && (el.textContent = s);
        a && el.setAttrs(a);
    
    return el;
});

// If your plugin uses it on elements (e.g., containerEl.createEl):
HTMLElement.prototype.createEl = createEl as any;



//minified code
// window.createEl = function(t, e, n) {
//     var r = document.createElement(t);
//     "string" == typeof e && (e = {
//         cls: e
//     });
//     var o = e || {}
//       , i = o.cls
//       , s = o.text
//       , a = o.attr
//       , c = o.title
//       , u = o.value
//       , p = o.placeholder
//       , l = o.type
//       , f = o.parent
//       , d = o.prepend
//       , h = o.href;
//     for (var y in i && (Array.isArray(i) ? r.className = i.join(" ") : r.className = i),
//     s && r.setText(s),
//     a && r.setAttrs(a),
//     void 0 !== c && (r.title = c),
//     void 0 !== u && (r instanceof HTMLInputElement || r instanceof HTMLSelectElement || r instanceof HTMLOptionElement) && (r.value = u),
//     l && r instanceof HTMLInputElement && (r.type = l),
//     l && r instanceof HTMLStyleElement && r.setAttribute("type", l),
//     p && r instanceof HTMLInputElement && (r.placeholder = p),
//     h && (r instanceof HTMLAnchorElement || r instanceof HTMLLinkElement || r instanceof HTMLBaseElement) && (r.href = h),
//     n && n(r),
//     f && (d ? f.insertBefore(r, f.firstChild) : f.appendChild(r)),
//     e)
//         if (e.hasOwnProperty(y) && y.startsWith("on")) {
//             var m = y
//               , v = e[m];
//             "function" == typeof v && r.addEventListener(m.substring(2), v)
//         }
//     return r
// }

// TODO: Clean up extra comments