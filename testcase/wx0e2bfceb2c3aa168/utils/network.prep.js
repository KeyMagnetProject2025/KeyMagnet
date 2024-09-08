function n() {
    u.log('xxx');
}
function e() {
    d = getApp(), this.page, this.urlTail = '', this.params = {
        pageIndex: 1,
        pageSize: d.globalData.pageSize,
        session_id: d.globalData.session_id
    }, this.netMethod = 'POST', this.callback = {
        onPre: function () {
        },
        onEnd: function () {
        },
        parseJson: function (n) {
        },
        onFillData: function (n, e) {
        },
        onSuccess: function (n) {
        },
        onEmpty: function () {
        },
        onError: function (n, e, a) {
        },
        onUnLogin: function () {
            this.onError('您还没有登录或登录已过期,请登录', g, '');
        },
        onUnFound: function () {
            this.onError('您要的内容没有找到', p, '');
        }
    }, this.send = function () {
        t(this);
    };
}
function a(n, a, t, o, i, r) {
    var s = new e();
    return s.page = a, s.urlTail = o, s.params.pageIndex = t, s.netMethod = n, u.extendObject(s.params, i), null == d.globalData.session_id || '' == d.globalData.session_id ? s.params.session_id = '' : s.params.session_id = d.globalData.session_id, void 0 == s.params.pageIndex || s.params.pageIndex <= 0 || 0 == s.params.pageSize ? s.params.pageSize = 0 : void 0 == s.params.pageSize && (s.params.pageSize = d.globalData.pageSize), u.isFunction(r.onPre) && (s.callback.onPre = r.onPre), u.isFunction(r.onEnd) && (s.callback.onEnd = r.onEnd), u.isFunction(r.onEmpty) && (s.callback.onEmpty = r.onEmpty), u.isFunction(r.onSuccess) && (s.callback.onSuccess = r.onSuccess), u.isFunction(r.onError) && (s.callback.onError = r.onError), u.isFunction(r.onUnLogin) && (s.callback.onUnLogin = r.onUnLogin), u.isFunction(r.onUnFound) && (s.callback.onUnFound = r.onUnFound), s;
}
function t(n) {
    null != n.params.session_id && '' != n.params.session_id || delete n.params.session_id, 0 != n.params.pageIndex && 0 != n.params.pageSize || (delete n.params.pageIndex, delete n.params.pageSize);
    var e = u.objToStr(n.params);
    u.isFunction(n.callback.onPre) && n.callback.onPre();
    var a = n.urlTail;
    a.indexOf('http://') < 0 && a.indexOf('https://') < 0 && (a = d.globalData.Host + n.urlTail);
    var t = '', o = void 0;
    'GET' == n.netMethod ? (a = a + '?' + e, t = 'application/json') : 'POST' == n.netMethod && (o = n.params, t = 'application/x-www-form-urlencoded'), console.log('Params', o), wx.request({
        url: a,
        method: n.netMethod,
        header: { 'Content-Type': t },
        data: o,
        success: function (e) {
            if (u.isFunction(n.callback.onEnd) && n.callback.onEnd(), 200 == e.statusCode) {
                var a = e.data, t = a.result, o = a.msg;
                if (1 == t) {
                    var i = a;
                    u.isOptStrNull(i) ? n.callback.onEmpty() : n.callback.onSuccess(i);
                } else
                    t == p ? u.isOptStrNull(o) ? n.callback.onUnFound() : n.callback.onError(o, t, o) : t == g ? u.isOptStrNull(o) ? n.callback.onUnLogin() : n.callback.onError(o, t, o) : u.isOptStrNull(o) ? u.isOptStrNull(t) ? n.callback.onError('数据异常解析异常,请核查', t, '') : n.callback.onError('数据异常,错误码为' + t, t, '') : n.callback.onError(o, t, '');
            } else
                e.statusCode >= 500 ? n.callback.onError('服务器异常\uFF01', e.statusCode, '') : e.statusCode >= 400 && e.statusCode < 500 ? n.callback.onError('没有找到内容', e.statusCode, '') : n.callback.onError('网络请求异常\uFF01', e.statusCode, '');
        },
        fail: function (e) {
            u.log('fail', e), u.isFunction(n.callback.onEnd) && n.callback.onEnd(), n.callback.onError('网络请求异常\uFF01', e.statusCode, '');
        },
        complete: function (n) {
        }
    });
}
function o(n, e) {
    var a = n.data.netStateBean;
    a.loadMoreHidden = false, a.loadMoreMsg = '加载出错,请上拉重试', a.currentTarget = e, n.setData({ netStateBean: a });
}
function i(n, e) {
    var a = n.data.netStateBean;
    a.loadMoreHidden = false, a.loadMoreMsg = '没有数据了', a.currentTarget = e, n.setData({ netStateBean: a });
}
function r(n, e) {
    u.hideLoadingDialog();
    var a = n.data.netStateBean, t = n.data.emptyMsg;
    u.isOptStrNull(t) && (t = '没有内容,去别的页面逛逛吧'), a.emptyMsg = t, a.emptyHidden = false, a.loadingHidden = true, a.contentHidden = true, a.errorHidden = true, a.currentTarget = e, n.setData({ netStateBean: a });
}
function s(n, e, a) {
    u.hideLoadingDialog();
    var t = n.data.netStateBean;
    t.errorHidden = false, t.errorMsg = e, t.emptyHidden = true, t.loadingHidden = true, t.contentHidden = true, t.currentTarget = a, n.setData({ netStateBean: t });
}
function l(n, e) {
    u.hideLoadingDialog();
    var a = n.data.netStateBean;
    a.errorHidden = true, a.emptyHidden = true, a.contentHidden = false, a.loadingHidden = true, a.currentTarget = e, n.setData({ netStateBean: a });
}
var d, c = function (n) {
        return n && n.__esModule ? n : { default: n };
    }(require('./es6-promise.min.js')), u = require('util');
n.request_none = 0, n.request_firstIn = 1, n.request_refresh = 2, n.request_loadmore = 3;
var g = 4097, p = 4105;
module.exports = {
    Actions: n,
    sendRequestByAction: function (e, t, c, f, h) {
        var m = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : {}, S = arguments.length > 6 && void 0 !== arguments[6] ? arguments[6] : [], E = arguments.length > 7 && void 0 !== arguments[7] ? arguments[7] : 'function', b = h;
        f == n.request_refresh || f == n.request_firstIn ? b = 1 : f == n.request_loadmore && (b += 1), a(e, t, b, c, m, {
            onPre: function () {
                f == n.request_refresh ? u.showNavigationBarLoading() : f == n.request_loadmore ? u.showNavigationBarLoading() : f == n.request_firstIn && u.showLoadingDialog();
            },
            onEnd: function () {
                u.hideNavigationBarLoading(), u.hideLoadingDialog(), u.isFunction(E.onEnd) && E.onEnd();
            },
            onSuccess: function (e) {
                var a = E.parseJson(e);
                if (u.isOptStrNull(a), console.log('infos', a), a instanceof Array && a.length <= 0)
                    this.onEmpty();
                else if (f == n.request_refresh)
                    u.isOptStrNull(a) || E.onFillData(a, m);
                else if (f == n.request_loadmore) {
                    var o = S.concat(a), r = true;
                    void 0 == m.pageSize || null == m.pageSize || 0 == m.pageSize ? a.length < d.globalData.pageSize && (r = false) : a.length < m.pageSize && (r = false), t.setData({ currentPageIndex: b }), u.isOptStrNull(a) || E.onFillData(o, m), r || i(t, c);
                } else
                    f == n.request_firstIn && (l(t, c), u.isOptStrNull(a) || E.onFillData(a, m));
            },
            onEmpty: function () {
                f == n.request_refresh ? console.log('Empty') : f == n.request_loadmore ? i(t, c) : f == n.request_firstIn && r(t, c);
            },
            onError: function (e, a, i) {
                u.log('msg:' + e + '\ncode:' + a + '\nhiddenMsg:' + i), f == n.request_refresh || (f == n.request_loadmore ? (t.setData({ currentPageIndex: --b }), o(t, c)) : f == n.request_firstIn && s(t, e, c));
            },
            onUnLogin: function () {
                this.onError('您还没有登录或登录已过期,请登录', g, '');
            },
            onUnFound: function () {
                this.onError('您要的内容没有找到', p, '');
            }
        }).send();
    },
    netStateBean: function () {
        this.toastHidden = true, this.toastMsg = '', this.loadingHidden = false, this.emptyMsg = '暂时没有内容,去别处逛逛吧', this.emptyHidden = true, this.errorHidden = true, this.errorMsg = '', this.loadMoreMsg = '加载中...', this.loadMoreHidden = true, this.contentHidden = true, this.currentTarget = '';
    },
    showEmptyPage: r,
    uploadFile: function (n, e, a) {
        return new c.default(function (t, o) {
            wx.uploadFile({
                url: n,
                filePath: e,
                name: 'file',
                formData: a,
                header: { 'Content-Type': 'application/x-www-form-urlencoded' },
                success: function (n) {
                    t(n);
                },
                fail: function (n) {
                    o(n);
                }
            });
        });
    },
    requestFormNetByDetail: function (n, e) {
        var a = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 'GET';
        return u.showLoadingDialog(), new c.default(function (t, o) {
            wx.request({
                url: n,
                method: a,
                head: { 'Content-Type': 'application/json' },
                data: e,
                success: function (n) {
                    u.hideLoadingDialog(), t(n);
                },
                fail: function (n) {
                    u.hideLoadingDialog(), o(n);
                }
            });
        });
    }
};