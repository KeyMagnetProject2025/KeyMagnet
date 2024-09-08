require('./utils/ald-stat/ald-stat.js'), require('./utils/util.js'), require('./utils/network.js');
var e = require('./utils/addr.js'), o = require('./utils/imgresouces.js'), t = require('./public/C_Enum.js'), n = require('src/wetoast.js').WeToast;
App({
    onLaunch: function () {
        var e = this, o = wx.getExtConfigSync();
        void 0 != o && (e.globalData.appid = o.appid), e.login();
    },
    globalData: {
        userInfo: {
            IsValidTelePhone: 0,
            TelePhone: '未绑定'
        }
    },
    WeToast: n,
    imgresouces: o,
    C_Enum: t,
    onHide: function () {
        wx.stopBackgroundAudio();
    },
    login: function () {
        var e = this;
        wx.login({
            success: function (o) {
                e.WxLogin(o.code, getApp().globalData.appid);
            }
        });
    },
    WxLogin: function (o, t) {
        wx.showToast({
            title: '正在登录....',
            icon: 'loading',
            duration: 10000
        });
        wx.request({
            url: e.Address.WxLogin,
            data: {
                code: o,
                appid: t,
                needappsr: 0
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            method: 'POST',
            success: function (e) {
                console.log(e), (e = e.data).isok ? wx.setStorageSync('userInfo', e.dataObj) : wx.showModal({
                    title: '提示',
                    content: e.data.Msg
                }), wx.hideToast();
            },
            fail: function (e) {
                console.log(e);
            }
        });
    },
    pictureTap: function (e) {
        var o = e.currentTarget.dataset.src;
        wx.previewImage({ urls: [o] });
    },
    pictureTaps: function (e, o) {
        wx.previewImage({
            current: e,
            urls: o
        });
    },
    ShowMsg: function (e) {
        wx.showModal({
            title: '提示',
            content: e,
            showCancel: false
        });
    },
    ShowMsgAndUrl: function (e, o) {
        var t = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0, n = this;
        wx.showModal({
            title: '提示',
            showCancel: false,
            content: e,
            success: function (e) {
                e.confirm && (0 == t ? n.goNewPage(o) : 1 == t && n.goBackPage(1));
            }
        });
    },
    showToast: function (e) {
        wx.showToast({ title: e });
    },
    reloadpage: function () {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '', o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
        getCurrentPages()[o].onLoad(e);
    },
    reloadpagebyurl: function () {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '', o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : '', t = getCurrentPages();
        if (t.length > 0)
            for (var n in t) {
                var a = t[n];
                if (a.route == o) {
                    a.onLoad(e);
                    break;
                }
            }
    },
    checkphone: function () {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '';
        return 0 != this.globalData.userInfo.IsValidTelePhone || ('1' != e && wx.showModal({
            title: '提示',
            content: '为了保障您数据的安全\uFF0C请先进行手机号验证',
            success: function (e) {
                e.confirm && wx.navigateTo({ url: '../bind_mobile/bind_mobile' });
            }
        }), false);
    },
    goNewPage: function (e) {
        wx.navigateTo({ url: e });
    },
    goBarPage: function (e) {
        wx.switchTab({ url: e });
    },
    goBackPage: function (e) {
        wx.navigateBack({ delta: e });
    }
});