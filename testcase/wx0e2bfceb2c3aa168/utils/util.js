function e(e) {
    return (e = e.toString())[1] ? e : "0" + e;
}

function n(e, n) {
    wx.request({
        url: i.Address.AddPayOrder,
        data: {
            itemid: e.itemid,
            paytype: e.paytype,
            extype: e.extype,
            extime: e.extime,
            openId: e.openId,
            quantity: e.quantity,
            areacode: e.areacode,
            appid: getApp().globalData.appid
        },
        method: "POST",
        header: {
            "content-type": "application/x-www-form-urlencoded"
        },
        success: function(o) {
            o.data.result ? t(o.data.obj, e, {
                failed: function() {
                    n.failed("failed");
                },
                success: function(e) {
                    "wxpay" == e ? n.success("wxpay") : "success" == e && n.success("success");
                }
            }) : n.failed("failed");
        }
    });
}

function t(e, n, t) {
    wx.request({
        url: i.Address.PayOrder,
        data: {
            openId: n.openId,
            orderid: e,
            type: 1
        },
        method: "POST",
        header: {
            "content-type": "application/x-www-form-urlencoded"
        },
        success: function(e) {
            if (console.log(e.obj), 1 == e.data.result) {
                var n = e.data.obj, a = JSON.parse(n);
                t.success("wxpay"), o(a, {
                    failed: function() {
                        t.failed("failed");
                    },
                    success: function() {
                        t.success("success");
                    }
                });
            } else t.failed("failed");
        }
    });
}

function o(e) {
    var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "function";
    console.log(e), wx.requestPayment({
        appId: e.appId,
        timeStamp: e.timeStamp,
        nonceStr: e.nonceStr,
        package: e.package,
        signType: e.signType,
        paySign: e.paySign,
        success: function(e) {
            n.success("success");
        },
        fail: function(e) {
            console.log(e), console.log(e.errMsg), n.failed("failed");
        },
        complete: function(e) {
            console.log(e), console.log("pay complete");
        }
    });
}

var a = function(e) {
    return e && e.__esModule ? e : {
        default: e
    };
}(require("./es6-promise.min.js")), i = require("addr");

module.exports = {
    formatTime: function(n, t) {
        var o = n.getFullYear(), a = n.getMonth() + 1, i = n.getDate(), s = n.getHours(), r = n.getMinutes(), c = n.getSeconds();
        return null == t || void 0 == t ? [ o, a, i ].map(e).join("/") + " " + [ s, r, c ].map(e).join(":") : "yyyy.MM.dd HH:mm" == t ? [ o, a, i ].map(e).join(".") + " " + [ s, r ].map(e).join(":") : "yyyy-MM-dd" == t ? [ o, a, i ].map(e).join("-") : void 0;
    },
    log: function(e) {
        getApp().globalData.isDebug && console.log(e);
    },
    isFunction: function(e) {
        return "function" == typeof e;
    },
    objToStr: function(e) {
        var n = "";
        for (var t in e) "function" == typeof e[t] || void 0 != e[t] && null != e[t] && (n += t + "=" + e[t] + "&");
        return n;
    },
    isOptStrNull: function(e) {
        return void 0 == e || null == e || "" == e || "null" == e || "[]" == e || "{}" == e;
    },
    compareDateFormat: function(e, n) {
        var t = new Date(e.replace(/\-/g, "/")), o = new Date(n.replace(/\-/g, "/"));
        return isNaN(t) || isNaN(o) ? null : t > o ? 1 : t < o ? -1 : 0;
    },
    compareDateFormatstr: function(e, n) {
        var t = new Date(e), o = new Date(n);
        return isNaN(t) || isNaN(o) ? null : t > o ? 1 : t < o ? -1 : 0;
    },
    compareTime: function(e, n) {
        var t = e.split(":"), o = n.split(":");
        console.log(t[0]);
        var a = new Date(), i = new Date();
        return a.setHours(t[0], 0 == (t[1] + "").indexOf("0") && t[1].length > 1 ? t[1].substring(1) : t[1], 0), 
        i.setHours(o[0], 0 == (o[1] + "").indexOf("0") && o[1].length > 1 ? o[1].substring(1) : o[1], 30), 
        isNaN(a) || isNaN(i) ? null : a > i ? 1 : a < i ? -1 : 0;
    },
    extendObject: function(e, n) {
        for (var t in n) n.hasOwnProperty(t) && !e.hasOwnProperty(t) && (e[t] = n[t]);
    },
    timeDiff: function(e, n) {
        var t = e - n, o = parseInt(t / 36e5 / 24), a = t - 24 * o * 36e5, i = parseInt(a > 0 ? a / 36e5 : 0), s = a - 36e5 * i;
        return [ o, i, parseInt(s > 0 ? s / 6e4 : 0) ];
    },
    hideLoadingDialog: function() {
        wx.hideToast();
    },
    showLoadingDialog: function() {
        wx.showToast({
            title: "加载中",
            mask: !0,
            icon: "loading",
            duration: 1e4
        });
    },
    showNavigationBarLoading: function() {
        wx.showNavigationBarLoading();
    },
    hideNavigationBarLoading: function() {
        wx.hideNavigationBarLoading();
    },
    showModal: function() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "提示", n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "暂不支持", t = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : "确定";
        return new a.default(function(a, i) {
            wx.showModal({
                title: e,
                content: n,
                showCancel: t,
                confirmText: o,
                confirmColor: "#ff5d38",
                success: function(e) {
                    e.confirm ? a(e) : i(e);
                },
                fail: function(e) {
                    i(e);
                }
            });
        });
    },
    showToast: function(e) {
        var n = e.data.remindBean;
        n.showRemind || (n.showRemind = !0, e.setData(e.data), setTimeout(function() {
            e.data.remindBean.showRemind = !1, e.setData(e.data);
        }, 2500));
    },
    Remind: function() {
        this.showRemind = !1, this.message = "暂无内容";
    },
    cutstr: function(e, n) {
        var t = 0, o = 0, a = new String();
        o = e.length;
        for (var i = 0; i < o; i++) {
            var s = e.charAt(i);
            if (t++, escape(s).length > 4 && t++, a = a.concat(s), t >= n) return a = a.concat("...");
        }
        if (t < n) return e;
    },
    chooseImage: function(e) {
        var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [ "original", "compressed" ], t = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : [ "album", "camera" ];
        return new a.default(function(o, a) {
            wx.chooseImage({
                count: e,
                sizeType: n,
                sourceType: t,
                success: function(e) {
                    o(e);
                },
                fail: function(e) {
                    a(e);
                }
            });
        });
    },
    previewImage: function(e) {
        var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
        wx.previewImage({
            current: e[n],
            urls: e
        });
    },
    makePhoneCall: function(e) {
        wx.makePhoneCall({
            phoneNumber: e,
            fail: function() {
                this.showModal("提示", "号码有误 , 请重试 !");
            }
        });
    },
    jsonReplaceToJSONString: function(e) {
        var n = JSON.stringify(e);
        return n = n.replace(/\&/g, "%26"), n = n.replace(/\?/g, "%3F");
    },
    JSONStringReplaceToJson: function(e) {
        var n = e.replace(/\%26/g, "&");
        return n = n.replace(/\%3F/g, "?");
    },
    wxPayRequst: n,
    AddOrder: function(e, t, o) {
        wx.showNavigationBarLoading(), wx.showToast({
            title: "加载中...",
            icon: "loading",
            duration: 1e4
        }), n(e, {
            failed: function(e) {
                setTimeout(function() {
                    wx.hideToast();
                }, 500), console.log("生成订单失败"), wx.hideNavigationBarLoading(), t(o, 0);
            },
            success: function(e) {
                console.log(e), "wxpay" == e ? (wx.hideNavigationBarLoading(), setTimeout(function() {
                    wx.hideToast();
                }, 100)) : "success" == e && t(o, 1);
            }
        });
    }
};