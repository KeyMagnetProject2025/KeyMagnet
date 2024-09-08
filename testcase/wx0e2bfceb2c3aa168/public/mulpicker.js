function t(t) {
    var u = new Date();
    e(u.getMonth() + 1, u.getDate(), u.getHours(), u.getMinutes(), t);
}

function e(t, e, u, a, r) {
    for (var i = new Date(), s = [ [], [], [], [], [] ], n = [ [], [], [], [], [] ], l = i.getFullYear(); l <= i.getFullYear() + 1; l++) s[0].push(l + "年"), 
    n[0].push(l);
    for (var h = t; h <= 12; h++) h >= 10 ? (s[1].push(h + "月"), n[1].push(h)) : (s[1].push("0" + h + "月"), 
    n[1].push("0" + h));
    for (var o = e; o <= 31; o++) o >= 10 ? (s[2].push(o + "日"), n[2].push(o)) : (s[2].push("0" + o + "日"), 
    n[2].push("0" + o));
    for (var p = u; p < 24; p++) p >= 10 ? (s[3].push(p + "时"), n[3].push(p)) : (s[3].push("0" + p + "时"), 
    n[3].push("0" + p));
    for (var g = a; g < 60; g++) g >= 10 ? (s[4].push(g + "分"), n[4].push(g)) : (s[4].push("0" + g + "分"), 
    n[4].push("0" + g));
    r.setData({
        multiArray: s,
        multiArray2: n
    });
}

require("../utils/util");

module.exports = {
    initetime: t,
    gettime: e,
    bindMultiPickerChange: function(t, e) {
        var u = t.detail.value, a = e.data.multiArray2, r = e.data.mulindex;
        r[0] = a[0][u[0]], r[1] = a[1][u[1]], r[2] = a[2][u[2]], r[3] = a[3][u[3]], r[4] = a[4][u[4]];
        var i = a[0][u[0]] + "-" + a[1][u[1]] + "-" + a[2][u[2]] + " " + a[3][u[3]] + ":" + a[4][u[4]];
        e.setData({
            multimes: i,
            pctime: i,
            mulindex: r
        });
    },
    bindMultiPickerColumnChange: function(u, a) {
        var r = u.detail.column, i = u.detail.value, s = new Date(), n = a.data.multiArray2[r][i], l = a.data.mulindex;
        l[r] = n, l[0] > s.getFullYear() ? e(1, 1, 0, 0, a) : l[1] > s.getMonth() + 1 ? e(s.getMonth() + 1, 1, 0, 0, a) : l[2] > s.getDate() ? e(s.getMonth() + 1, s.getDate(), 0, 0, a) : l[3] > s.getHours() ? e(s.getMonth() + 1, s.getDate(), s.getHours(), 0, a) : t(a);
    }
};