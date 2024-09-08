require('../../utils/util.js'), require('../../utils/network.js');
var t = require('../../utils/addr.js'), e = require('../../public/picktime.js'), a = require('../../utils/wxParse/wxParse.js'), i = getApp();
Page({
    data: {
        isplay: 1,
        indicatorDots: true,
        autoplay: true,
        inputDisable: true,
        DateTimePickerNums: 0,
        multiArray: [],
        mulindex: [
            '2017',
            '7',
            '25',
            '16',
            '22'
        ],
        multimes: '请选择预约时间',
        pickerArray: [],
        s_data: {}
    },
    onLoad: function (t) {
        var a = this;
        a.GetPageMsg(), a.GetAgentConfigInfo(), e.inite(this);
    },
    onShareAppMessage: function () {
    },
    onPullDownRefresh: function () {
        var t = this;
        t.data.DateTimePickerNums = 0, t.data.alltime = [], wx.stopBackgroundAudio(), t.setData({ obj: [] }), t.GetAgentConfigInfo(), t.GetPageMsg(), setTimeout(function () {
            wx.showToast({
                title: '刷新成功',
                icon: 'success',
                duration: 500
            }), wx.stopPullDownRefresh(), t.setData({ condition: false });
        }, 1000);
    },
    markertap: function (t) {
        var e = t.currentTarget.id, a = Number(this.data.obj[e].markers[0].latitude), i = Number(this.data.obj[e].markers[0].longitude), s = t.currentTarget.dataset.address;
        wx.openLocation({
            latitude: a,
            longitude: i,
            scale: 28,
            address: s
        });
    },
    makePhoneCall: function () {
        '' != this.data.phoneNumber ? wx.makePhoneCall({ phoneNumber: this.data.phoneNumber }) : wx.showToast({ title: '暂无客服联系电话' });
    },
    previewImageAPI: function (t) {
        for (var e = this.data.obj, a = t.currentTarget.id, i = t.target.dataset.index, s = e[a].items, o = [], n = [], r = [], l = '', d = [], u = {}, c = 0; c < s.length; c++)
            o.push(s[c].imgurl), n.push(s[c].link.split(';'));
        for (c = 0; c < n.length; c++)
            r.push(n[c][0]);
        var g = o[i];
        if (-1 == r[i])
            wx.previewImage({
                current: g,
                urls: o
            });
        else if (1 == r[i]) {
            console.log(n[i][2]);
            var p = n[i][2].split('?')[1];
            if (console.log(p), void 0 != p && null != p) {
                l = n[i][2].split('?')[1].split('&&');
                for (c = 0; c < l.length; c++) {
                    d.push(l[c].split('='));
                    for (var m = 0; m < d.length; m++)
                        u[d[m][0]] = d[m][1];
                }
            }
            console.log(u), wx.navigateToMiniProgram({
                appId: n[i][1],
                path: n[i][2],
                extraData: u,
                success: function (t) {
                    console.log(t);
                },
                fail: function (t) {
                    console.log(t), wx.showModal({
                        title: '提示',
                        content: '跳转失败'
                    });
                }
            });
        }
    },
    previewSingleImage: function (t) {
        var e = t.target.dataset.img, a = [];
        a.push(e);
        var i = a[0];
        console.log(a), wx.previewImage({
            current: i,
            urls: a
        });
    },
    timesure: function (t) {
        this.data.timeindex = t.currentTarget.id, this.data.conditiontime || (this.data.multimes = this.data.year + '-' + this.data.month + '-' + this.data.day + ' ' + this.data.our + ':' + this.data.minue), e.timesure(t, this);
    },
    timecancel: function () {
        e.timecancel(this);
    },
    bindMultiPickerChange: function (t) {
        e.bindMultiPickerChange(t, this);
    },
    clickOk: function (t) {
        var a = this;
        e.clickOk(a), a.setData({
            conditiontime: !a.data.conditiontime,
            value: a.data.value_1
        });
    },
    playvoice: function () {
        if (1 == this.data.isplay)
            return wx.playBackgroundAudio({ dataUrl: this.data.audio }), console.log('背景音乐开始播放'), void this.setData({ isplay: 0 });
        wx.stopBackgroundAudio(), this.setData({ isplay: 1 });
    },
    bindPickerChange: function (t) {
        var e = t.currentTarget.dataset, a = this.data.pickerArray;
        a[e.index].id = t.detail.value, a[e.index].title = e.title, a[e.index].name = e.name, this.setData({ pickerArray: a });
    },
    formSubmit: function (e) {
        var a = this;
        a.data.pickerArray;
        for (var s in e.detail.value)
            if ('' == e.detail.value[s])
                return void wx.showToast({
                    title: '信息未填写完整',
                    icon: 'loading'
                });
        a.data.s_data = e.detail.value, wx.request({
            url: t.Address.SetForm,
            data: {
                formId: e.detail.formId,
                FormTitle: e.detail.target.dataset.name,
                AppId: i.globalData.appid,
                openId: wx.getStorageSync('userInfo').OpenId,
                FormMsg: JSON.stringify(e.detail.value)
            },
            method: 'POST',
            header: { 'content-type': 'application/json' },
            success: function (t) {
                a.setData({ obj: [] }), a.GetPageMsg(), 1 == t.data.isok ? (a.data.DateTimePickerNums = 0, a.data.alltime = [], a.data.pickerArray = [], wx.showToast({
                    title: '报名成功',
                    icon: 'success',
                    duration: 2000
                }), setTimeout(function () {
                    a.setData({ condition: false });
                }, 2000)) : wx.showToast({ title: '报名失败' });
            }
        });
    },
    GetPageMsg: function (e) {
        var s = this, o = (s.data.isplay, s.data.hidden, '');
        wx.request({
            url: t.Address.GetPageMsg,
            data: { AppId: i.globalData.appid },
            method: 'GET',
            header: { 'content-type': 'application/json' },
            success: function (t) {
                if (null != t.data.obj) {
                    var e = JSON.parse(t.data.obj.JsonMsg);
                    console.log(e);
                    for (var i = 0; i < e.length; i++) {
                        if ('Call' == e[i].type && (o = e[i].items[0].phoneNumber), 'video' == e[i].type)
                            if (1 == e[i].items[0].isAutoPlay)
                                n = 1;
                            else
                                var n = 0;
                        if ('form' == e[i].type) {
                            for (var r = [], l = 0; l < e[i].items.length; l++)
                                for (var d = 0; d < e[i].items[l].items.length; d++)
                                    'DateTimePicker' == e[i].items[l].items[d].type && (s.data.alltimeLength = e[i].items[l].items[d].sys_index + 1, s.data.DateTimePickerNums++), 'CheckBox' == e[i].items[l].items[d].type && (r[l] = 0);
                            for (var u = 0; u < r.length; u++)
                                s.data.pickerArray.push({ id: 0 });
                        }
                        if ('editor' == e[i].type && (e[i].items[0].txt = e[i].items[0].txt.replace(/[<]br[/][>]/g, '<div style="height:20px"></div>'), e[i].items[0].txt = e[i].items[0].txt.replace(/&nbsp;/g, '<span style="margin-left:16rpx;"></span>'), e[i].items[0].txt = e[i].items[0].txt.replace(/[<][/]p[>][<]p[>]/g, '<div></div>'), e[i].items[0].txt = a.wxParse('article', 'html', e[i].items[0].txt, s, 5)), 'map' == e[i].type) {
                            var c = [], g = e[i].items[0].mapLat, p = e[i].items[0].mapLng;
                            c.push({
                                id: i,
                                latitude: g,
                                longitude: p
                            }), e[i].markers = c;
                        }
                    }
                    var m = e.find(function (t) {
                        return 'bmg' == t.type;
                    });
                    if (m)
                        h = m.items[0].bmgPath;
                    else
                        var h = '';
                    s.setData({
                        obj: e,
                        phoneNumber: o,
                        hidden: 0,
                        audio: h,
                        isplay: 1,
                        pickerArray: s.data.pickerArray
                    }), wx.setNavigationBarTitle({ title: t.data.obj.PageTitle }), m && 1 != n && s.playvoice();
                }
            },
            fail: function () {
                console.log('获取页面信息出错');
            }
        });
    },
    GetAgentConfigInfo: function (e) {
        var a = this;
        wx.request({
            url: t.Address.GetAgentConfigInfo,
            data: { appid: i.globalData.appid },
            method: 'GET',
            header: { 'content-type': 'application/json' },
            success: function (t) {
                1 == t.data.isok && (0 == t.data.AgentConfig.isdefaul ? t.data.AgentConfig.LogoText = t.data.AgentConfig.LogoText.split(' ') : t.data.AgentConfig.LogoText = t.data.AgentConfig.LogoText, a.setData({ AgentConfig: t.data.AgentConfig }));
            },
            fail: function () {
                console.log('获取水印配置出错');
            }
        });
    }
});