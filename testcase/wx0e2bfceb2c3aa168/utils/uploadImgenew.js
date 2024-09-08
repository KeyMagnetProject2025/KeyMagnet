function t(o, i, s, c, d, g) {
    a.uploadFile(n.Address.uploadImage, o[i], {
        index: i
    }).then(function(a) {
        console.log(a);
        var n = JSON.parse(a.data), i = n.path;
        s.content.imageList.push(i), s.content.imageAddUrlList.push(i), n.index < o.length - 1 ? t(o, n.index + 1, s, c, d, g) : (d[g] = s, 
        c.data.items = d, c.setData(c.data), e.hideNavigationBarLoading(), wx.hideToast());
    }, function(t) {
        wx.showModal({
            title: "提示",
            content: "上传图片失败"
        }), console.log("上传图片失败"), console.log(t), wx.hideToast(), e.hideNavigationBarLoading();
    });
}

var e = require("util.js"), a = require("network"), n = require("addr"), o = getApp();

module.exports = {
    chooseImage: function(a, n) {
        var o = n.data.items, i = a.currentTarget.dataset.row, s = o[i], c = (s.content.imageList, 
        s.content.maxImageCount);
        wx.hideLoading(), wx.chooseImage({
            count: c,
            success: function(a) {
                var d = a.tempFilePaths;
                d.length < c ? s.content.maxImageCount = c - d.length : s.content.images_full = !0, 
                s.content.imageIdList = [], o[i] = s, n.data.items = o, n.setData(n.data);
                for (var g = [], r = 0; r < d.length; r++) {
                    var l = d[r];
                    g.push(l), e.showNavigationBarLoading(), wx.showToast({
                        title: "正在上传图片",
                        icon: "loading",
                        mask: !0,
                        duration: 1e4
                    });
                }
                t(g, 0, s, n, o, i);
            }
        });
    },
    clearImage: function(t, e) {
        var a = e.data.items, i = t.currentTarget.dataset.row, s = t.target.dataset.index, c = a[i], d = (c.content.imageList, 
        c.content.imageIdList[s]), g = o.globalData.userInfo.openId;
        wx.showModal({
            title: "删除图片",
            content: "删除图片后无法回复，确定上传图片",
            success: function(t) {
                if (!t.cancel) return 0 == c.content.imageIdList.length ? (c.content.imageList.splice(s, 1), 
                c.content.imageAddUrlList.splice(s, 1), console.log("是本地的图片"), c.content.imageList.length < c.content.currentmaxImageCount && (c.content.images_full = !1, 
                c.content.maxImageCount = c.content.currentmaxImageCount - c.content.imageList.length), 
                a[i] = c, void e.setData({
                    items: a
                })) : void (null != d ? (a[i] = c, wx.showToast({
                    title: "正在删除图片",
                    icon: "loading",
                    duration: 1e4
                }), wx.request({
                    url: n.Address.deleteImage,
                    data: {
                        imageId: d,
                        openId: g
                    },
                    header: {
                        "content-type": "application/json"
                    },
                    success: function(t) {
                        console.log(t.data), t.data.result ? (c.content.imageIdList.splice(s, 1), c.content.imageList.splice(s, 1), 
                        c.content.maxImageCount = c.content.currentmaxImageCount - c.content.imageList.length, 
                        a[i] = c, c.content.imageList.length < c.content.currentmaxImageCount && (c.content.images_full = !1), 
                        e.data.items = a, e.setData(e.data), wx.hideToast()) : wx.showToast({
                            title: "删除图片失败,请稍后重试",
                            icon: "loading",
                            duration: 1e3
                        });
                    },
                    fail: function() {
                        wx.showToast({
                            title: "删除图片失败,请稍后重试",
                            icon: "loading",
                            duration: 1e3
                        });
                    }
                }), e.data.items = a, e.setData(e.data)) : wx.showToast({
                    title: "删除图片失败",
                    icon: "loading",
                    duration: 1e3
                }));
            }
        });
    },
    previewImage: function(t, e) {
        var a = e.data.items, n = t.currentTarget.dataset.row, o = t.target.dataset.src, i = a[n].content.imageList;
        wx.previewImage({
            current: o,
            urls: i
        });
    }
};