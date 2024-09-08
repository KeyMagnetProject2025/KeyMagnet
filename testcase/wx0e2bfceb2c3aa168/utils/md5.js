function r(r) {
    return d(n(i(r), r.length * v));
}

function n(r, n) {
    r[n >> 5] |= 128 << n % 32, r[14 + (n + 64 >>> 9 << 4)] = n;
    for (var t = 1732584193, a = -271733879, i = -1732584194, d = 271733878, h = 0; h < r.length; h += 16) {
        var v = t, A = a, l = i, g = d;
        a = f(a = f(a = f(a = f(a = c(a = c(a = c(a = c(a = e(a = e(a = e(a = e(a = u(a = u(a = u(a = u(a, i = u(i, d = u(d, t = u(t, a, i, d, r[h + 0], 7, -680876936), a, i, r[h + 1], 12, -389564586), t, a, r[h + 2], 17, 606105819), d, t, r[h + 3], 22, -1044525330), i = u(i, d = u(d, t = u(t, a, i, d, r[h + 4], 7, -176418897), a, i, r[h + 5], 12, 1200080426), t, a, r[h + 6], 17, -1473231341), d, t, r[h + 7], 22, -45705983), i = u(i, d = u(d, t = u(t, a, i, d, r[h + 8], 7, 1770035416), a, i, r[h + 9], 12, -1958414417), t, a, r[h + 10], 17, -42063), d, t, r[h + 11], 22, -1990404162), i = u(i, d = u(d, t = u(t, a, i, d, r[h + 12], 7, 1804603682), a, i, r[h + 13], 12, -40341101), t, a, r[h + 14], 17, -1502002290), d, t, r[h + 15], 22, 1236535329), i = e(i, d = e(d, t = e(t, a, i, d, r[h + 1], 5, -165796510), a, i, r[h + 6], 9, -1069501632), t, a, r[h + 11], 14, 643717713), d, t, r[h + 0], 20, -373897302), i = e(i, d = e(d, t = e(t, a, i, d, r[h + 5], 5, -701558691), a, i, r[h + 10], 9, 38016083), t, a, r[h + 15], 14, -660478335), d, t, r[h + 4], 20, -405537848), i = e(i, d = e(d, t = e(t, a, i, d, r[h + 9], 5, 568446438), a, i, r[h + 14], 9, -1019803690), t, a, r[h + 3], 14, -187363961), d, t, r[h + 8], 20, 1163531501), i = e(i, d = e(d, t = e(t, a, i, d, r[h + 13], 5, -1444681467), a, i, r[h + 2], 9, -51403784), t, a, r[h + 7], 14, 1735328473), d, t, r[h + 12], 20, -1926607734), i = c(i, d = c(d, t = c(t, a, i, d, r[h + 5], 4, -378558), a, i, r[h + 8], 11, -2022574463), t, a, r[h + 11], 16, 1839030562), d, t, r[h + 14], 23, -35309556), i = c(i, d = c(d, t = c(t, a, i, d, r[h + 1], 4, -1530992060), a, i, r[h + 4], 11, 1272893353), t, a, r[h + 7], 16, -155497632), d, t, r[h + 10], 23, -1094730640), i = c(i, d = c(d, t = c(t, a, i, d, r[h + 13], 4, 681279174), a, i, r[h + 0], 11, -358537222), t, a, r[h + 3], 16, -722521979), d, t, r[h + 6], 23, 76029189), i = c(i, d = c(d, t = c(t, a, i, d, r[h + 9], 4, -640364487), a, i, r[h + 12], 11, -421815835), t, a, r[h + 15], 16, 530742520), d, t, r[h + 2], 23, -995338651), i = f(i, d = f(d, t = f(t, a, i, d, r[h + 0], 6, -198630844), a, i, r[h + 7], 10, 1126891415), t, a, r[h + 14], 15, -1416354905), d, t, r[h + 5], 21, -57434055), i = f(i, d = f(d, t = f(t, a, i, d, r[h + 12], 6, 1700485571), a, i, r[h + 3], 10, -1894986606), t, a, r[h + 10], 15, -1051523), d, t, r[h + 1], 21, -2054922799), i = f(i, d = f(d, t = f(t, a, i, d, r[h + 8], 6, 1873313359), a, i, r[h + 15], 10, -30611744), t, a, r[h + 6], 15, -1560198380), d, t, r[h + 13], 21, 1309151649), i = f(i, d = f(d, t = f(t, a, i, d, r[h + 4], 6, -145523070), a, i, r[h + 11], 10, -1120210379), t, a, r[h + 2], 15, 718787259), d, t, r[h + 9], 21, -343485551), 
        t = o(t, v), a = o(a, A), i = o(i, l), d = o(d, g);
    }
    return Array(t, a, i, d);
}

function t(r, n, t, u, e, c) {
    return o(a(o(o(n, r), o(u, c)), e), t);
}

function u(r, n, u, e, c, f, o) {
    return t(n & u | ~n & e, r, n, c, f, o);
}

function e(r, n, u, e, c, f, o) {
    return t(n & e | u & ~e, r, n, c, f, o);
}

function c(r, n, u, e, c, f, o) {
    return t(n ^ u ^ e, r, n, c, f, o);
}

function f(r, n, u, e, c, f, o) {
    return t(u ^ (n | ~e), r, n, c, f, o);
}

function o(r, n) {
    var t = (65535 & r) + (65535 & n);
    return (r >> 16) + (n >> 16) + (t >> 16) << 16 | 65535 & t;
}

function a(r, n) {
    return r << n | r >>> 32 - n;
}

function i(r) {
    for (var n = Array(), t = (1 << v) - 1, u = 0; u < r.length * v; u += v) n[u >> 5] |= (r.charCodeAt(u / v) & t) << u % 32;
    return n;
}

function d(r) {
    for (var n = h ? "0123456789ABCDEF" : "0123456789abcdef", t = "", u = 0; u < 4 * r.length; u++) t += n.charAt(r[u >> 2] >> u % 4 * 8 + 4 & 15) + n.charAt(r[u >> 2] >> u % 4 * 8 & 15);
    return t;
}

var h = 0, v = 8;

module.exports = {
    hex_md5: r,
    md5_vm_test: function() {
        return "900150983cd24fb0d6963f7d28e17f72" == r("abc");
    }
};