function t(t) {
    var a = t.data.alltime;
    a[t.data.timeindex] = e[t.data.value[0]] + "年" + i[t.data.value[1]] + "月" + n[t.data.value[2]] + "日" + u[t.data.value[3]] + "时" + o[t.data.value[4]] + "分", 
    t.setData({
        year: e[t.data.value[0]],
        month: i[t.data.value[1]],
        day: n[t.data.value[2]],
        our: u[t.data.value[3]],
        minue: o[t.data.value[4]],
        alltime: a
    });
}

require("../utils/util");

for (var a = new Date(), e = [], i = [], n = [], u = [], o = [], d = [], l = 0, r = 1990; r <= 2048; r++) e.push(r), 
r == a.getFullYear() && d.push(l), l++;

for (var s = 0, v = 1; v <= 12; v++) 1 == v.toString().length && (v = "0" + v), 
i.push(v), v == a.getMonth() + 1 && d.push(s), s++;

for (var c = 0, h = 1; h <= 31; h++) n.push(h), h == a.getDate() && d.push(c), c++;

for (var m = 0, g = 1; g <= 23; g++) u.push(g), g == a.getHours() && d.push(m), 
m++;

for (var p = 0, f = 1; f <= 60; f++) o.push(f), f == a.getMinutes() + 1 && d.push(p), 
p++;

module.exports = {
    inite: function(t) {
        t.setData({
            alltime: [],
            hidden: 0,
            conditiontime: !0,
            years: e,
            year: a.getFullYear(),
            months: i,
            month: a.getMonth() + 1,
            days: n,
            day: a.getDate(),
            ours: u,
            our: a.getHours(),
            minues: o,
            minue: a.getMinutes() + 1,
            value: d,
            value_1: d
        });
    },
    timesure: function(t, a) {
        a.setData({
            conditiontime: !a.data.conditiontime,
            condition: !a.data.condition,
            hidden: 1
        });
    },
    timecancel: function(t) {
        t.setData({
            conditiontime: !t.data.conditiontime,
            condition: !t.data.condition
        });
    },
    clickOk: t,
    bindMultiPickerChange: function(a, e) {
        var i = a.detail.value;
        e.data.value = i, t(e);
    }
};