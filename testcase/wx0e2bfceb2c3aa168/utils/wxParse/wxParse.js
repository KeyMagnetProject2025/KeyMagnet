function e(e) {
    return e && e.__esModule ? e : {
        default: e
    };
}

function t(e) {
    console.log(e);
    var t = e.target.dataset.src, r = e.target.dataset.from, a = [];
    a.push(e.target.dataset.src), void 0 !== r && r.length > 0 && wx.previewImage({
        current: t,
        urls: a
    });
}

var r = e(require("./showdown.js")), a = e(require("./html2json.js"));

module.exports = {
    wxParse: function() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "wxParseData", s = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "html", o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : '<div class="color:red;">数据不能为空</div>', n = arguments[3], l = (arguments[4], 
        n), d = {};
        if ("html" == s) d = a.default.html2json(o, e); else if ("md" == s || "markdown" == s) {
            var i = new r.default.Converter().makeHtml(o);
            d = a.default.html2json(i, e);
        }
        return l.wxParseImgTap = t, d;
    },
    wxParseTemArray: function(e, t, r, a) {
        for (var s = [], o = a.data, n = null, l = 0; l < r; l++) {
            var d = o[t + l].nodes;
            s.push(d);
        }
        e = e || "wxParseTemArray", (n = JSON.parse('{"' + e + '":""}'))[e] = s, a.setData(n);
    },
    emojisInit: function() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "/wxParse/emojis/", r = arguments[2];
        a.default.emojisInit(e, t, r);
    }
};