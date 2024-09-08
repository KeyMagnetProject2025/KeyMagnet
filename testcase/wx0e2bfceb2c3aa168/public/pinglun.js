require("../utils/util");

var t = require("../utils/addr"), e = require("../utils/wxParse/html2json.js"), a = getApp();

module.exports = {
    GetStoreComments: function(n) {
        var o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1, d = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1, m = n.data.items[0].content;
        0 == o && (m.comment = [], m.commentdataname = [], m.subcommentdataname = [], m.loadMorecomment[1] = 1);
        var i = m.loadMorecomment[1], s = n.data.storeId;
        wx.request({
            url: t.Address.GetComment,
            data: {
                openId: a.globalData.userInfo.openId,
                commentid: s,
                pageIndex: i,
                pageSize: 5,
                ctype: d
            },
            header: {
                "content-type": "application/json"
            },
            success: function(t) {
                if (setTimeout(function() {
                    wx.hideToast();
                }, 500), console.log(t.data), 1 == t.data.isok) {
                    m.loadMorecomment[1] = m.loadMorecomment[1] + 1, t.data.more ? m.loadMorecomment[0] = "加载更多数据" : m.loadMorecomment[0] = "都显示完了", 
                    n.setData({
                        items: n.data.items
                    });
                    var a = t.data.obj;
                    if (a.length <= 0) return void (n.data.typepl = "");
                    for (var o = m.commentdataname, d = m.subcommentdataname, i = 0; i < a.length; i++) {
                        var s = a[i], r = e.html2json(s.ContentHtml, "commentContent" + s.Id);
                        o.push(r);
                        var c = [];
                        if (s.SubCommentList.length > 0) for (var l = 0; l < s.SubCommentList.length; l++) {
                            var u = s.SubCommentList[l], g = e.html2json(u.ContentHtml, "commentContent" + u.Id);
                            c.push(g);
                        }
                        d.push(c);
                    }
                    m.comment_num = t.data.count, m.comment = m.comment.concat(a), m.commentdataname = o, 
                    m.subcommentdataname = d, m.qqfacehidden = !0, void 0 != n.data.typepl && "" != n.data.typepl && "undefined" != n.data.typepl || (m.pinglunhidden = !0), 
                    n.data.typepl = "", m.imghidden = !0, m.imageList = [], m.imageUrlList = [], m.imageIdList = [], 
                    m.imageAddUrlList = [], m.contenttext = n.data.contenttext, m.loadMorecomment[2] = !1, 
                    m.addcontemt = 0, n.data.items[0].content = m, n.setData({
                        items: n.data.items
                    });
                }
                n.data.typepl = "";
            }
        });
    },
    GetMoreSubComment: function(n, o) {
        var d = o.currentTarget.dataset.index, m = n.data.items[0].content;
        wx.request({
            url: t.Address.GetMoreSubComment,
            data: {
                id: m.comment[d].Id,
                openId: a.globalData.userInfo.openId
            },
            header: {
                "content-type": "application/json"
            },
            success: function(t) {
                if (setTimeout(function() {
                    wx.hideToast();
                }, 500), console.log(t.data), t.data.isok) {
                    var a = [];
                    if (t.data.SubCommentList.length > 0) for (var o = 0; o < t.data.SubCommentList.length; o++) {
                        var i = t.data.SubCommentList[o], s = e.html2json(i.ContentHtml, "commentContent" + i.Id);
                        a.push(s);
                    }
                    m.subcommentdataname[d] = a, m.comment[d].SubCommentList = t.data.SubCommentList, 
                    n.data.items[0].content = m, n.setData({
                        items: n.data.items
                    });
                }
            }
        });
    },
    getqqfacedata: function(t) {
        for (var e = 0; e < 100; e++) {
            var a = "background-position: left " + -29 * e + "px;";
            t.data.items[0].content.qqfacedata.push(a);
        }
        t.setData({
            items: t.data.items
        });
    },
    clickface: function(t, e) {
        var a = t.currentTarget.dataset.title, n = e.data.items[0].content.contenttext;
        void 0 == n ? n = "[" + a + "]" : n += "[" + a + "]", e.data.items[0].content.contenttext = n, 
        e.setData({
            items: e.data.items
        });
    },
    showQQface: function(t) {
        t.data.items[0].content.qqfacehidden = !t.data.items[0].content.qqfacehidden, t.setData({
            items: t.data.items
        });
    },
    commentDidClick: function(t, e) {
        var a = e.currentTarget.dataset.pfloder, n = t.data.items[0].content;
        n.pinglunhidden = !n.pinglunhidden, n.qqfacehidden = !0, n.parentorchild = e.currentTarget.dataset.parentorchild, 
        n.comuserId = e.currentTarget.dataset.comuserid, n.imageList = [], n.imageUrlList = [], 
        n.imageIdList = [], n.imageAddUrlList = [], n.imghidden = !0, n.images_full = !1, 
        n.maxImageCount = 9, n.icon = "../../image/tc-yh-07.png", n.placeholder = "" == a || void 0 == a ? "用户评论：" : a, 
        n.row = 0, t.data.items[0].content = n, t.setData({
            items: t.data.items
        });
    },
    bindinput: function(t, e) {
        var a = t.detail.value;
        e.data.items[0].content.contenttext = a;
    },
    AddStoreComment: function(e, n) {
        var o, d = e.currentTarget.dataset, m = n.data.items[0].content, i = m.ctype, s = m.contenttext;
        o = "0" == d.type ? {
            storeId: n.data.storeId,
            Content: s,
            CType: i
        } : {
            storeId: n.data.storeId,
            Content: s,
            ParentId: d.type,
            DirectUserId: d.comuserid,
            CType: i
        };
        var r = t.Address.AddComment;
        0 == i && (r = t.Address.AddStoreComment);
        var c = "";
        if (m.imageAddUrlList.length > 0) for (var l = 0; l < m.imageAddUrlList.length; l++) l == m.imageAddUrlList.length - 1 ? c += m.imageAddUrlList[l] : c += m.imageAddUrlList[l] + ",";
        var u = JSON.stringify(o);
        wx.request({
            url: r,
            method: "POST",
            data: {
                comment: u,
                openId: a.globalData.userInfo.openId,
                imgs: c
            },
            header: {
                "content-type": "application/json"
            },
            success: function(t) {
                console.log("用户点击了提交"), t.data.result ? (n.GetStoreComments(0), wx.showToast({
                    title: "评论成功"
                })) : (wx.showToast({
                    title: "评论失败"
                }), n.data.items[0].content.addcontemt = 0, setTimeout(function() {
                    commitBtnCanUserClick = !0;
                }, 500)), wx.hideToast();
            }
        });
    },
    delComment: function(e, n) {
        var o = e.currentTarget.dataset.parentorchild;
        o <= 0 ? a.ShowMsg("删除失败，请刷新重试") : wx.request({
            url: t.Address.DeleteComment,
            method: "POST",
            data: {
                id: o,
                TelePhone: a.globalData.userInfo.TelePhone
            },
            header: {
                "content-type": "application/json"
            },
            success: function(t) {
                t.data.result && n.GetStoreComments(0), a.ShowMsg(t.data.msg), wx.hideToast();
            }
        });
    },
    getqqfacenamedata: function() {
        return [ "微笑", "撇嘴", "色", "发呆", "得意", "流泪", "害羞", "闭嘴", "睡", "大哭", "尴尬", "发怒", "调皮", "呲牙", "惊讶", "难过", "酷", "冷汗", "抓狂", "吐", "偷笑", "可爱", "白眼", "傲慢", "饥饿", "困", "惊恐", "流汗", "憨笑", "大兵", "奋斗", "咒骂", "疑问", "嘘", "晕", "折磨", "哀", "骷髅", "敲打", "再见", "擦汗", "抠鼻", "鼓掌", "糗大了", "坏笑", "左哼哼", "右哼哼", "哈欠", "鄙视", "委屈", "快哭了", "阴险", "亲亲", "吓", "可怜", "菜刀", "西瓜", "啤酒", "篮球", "乒乓", "咖啡", "饭", "猪头", "玫瑰", "凋谢", "示爱", "爱心", "心碎", "蛋糕", "闪电", "炸弹", "刀", "足球", "瓢虫", "便便", "月亮", "太阳", "礼物", "拥抱", "强", "弱", "握手", "胜利", "抱拳", "勾引", "拳头", "差劲", "爱你", "no", "ok", "爱情", "飞吻", "跳跳", "发抖", "怄火", "转圈", "磕头", "回头", "跳绳", "挥手" ];
    },
    showimg: function(t) {
        t.data.items[0].content.imghidden = !t.data.items[0].content.imghidden, t.setData({
            items: t.data.items
        });
    }
};