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
        var o = n.data.items, i = o[0], s = (i.content.imageList, i.content.maxImageCount);
        wx.chooseImage({
            count: s,
            success: function(a) {
                var c = a.tempFilePaths;
                c.length < s ? i.content.maxImageCount = s - c.length : i.content.images_full = !0, 
                i.content.imageIdList = [], o[0] = i, n.data.items = o, n.setData(n.data);
                for (var d = [], g = 0; g < c.length; g++) {
                    var l = c[g];
                    d.push(l), e.showNavigationBarLoading(), wx.showToast({
                        title: "正在上传图片",
                        icon: "loading",
                        mask: !0,
                        duration: 1e4
                    });
                }
                t(d, 0, i, n, o, 0);
            }
        });
    },
    clearImage: function(t, e) {
        var a = e.data.items, i = t.target.dataset.index, s = a[0], c = (s.content.imageList, 
        s.content.imageIdList[i]), d = o.globalData.userInfo.openId;
        wx.showModal({
            title: "删除图片",
            content: "删除图片后无法回复，确定上传图片",
            success: function(t) {
                if (!t.cancel) return 0 == s.content.imageIdList.length ? (s.content.imageList.splice(i, 1), 
                s.content.imageAddUrlList.splice(i, 1), console.log("是本地的图片"), s.content.imageList.length < s.content.currentmaxImageCount && (s.content.images_full = !1, 
                s.content.maxImageCount = s.content.currentmaxImageCount - s.content.imageList.length), 
                a[0] = s, void e.setData({
                    items: a
                })) : void (null != c ? (a[0] = s, wx.showToast({
                    title: "正在删除图片",
                    icon: "loading",
                    duration: 1e4
                }), wx.request({
                    url: n.Address.deleteImage,
                    data: {
                        imageId: c,
                        openId: d
                    },
                    header: {
                        "content-type": "application/json"
                    },
                    success: function(t) {
                        console.log(t.data), t.data.result ? (s.content.imageIdList.splice(i, 1), s.content.imageList.splice(i, 1), 
                        s.content.maxImageCount = s.content.currentmaxImageCount - s.content.imageList.length, 
                        a[0] = s, s.content.imageList.length < s.content.currentmaxImageCount && (s.content.images_full = !1), 
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
        var a = e.data.items, n = t.target.dataset.src, o = a[0].content.imageList;
        wx.previewImage({
            current: n,
            urls: o
        });
    }
};