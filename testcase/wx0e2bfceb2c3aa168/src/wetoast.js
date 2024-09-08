module.exports = {
    WeToast: function() {
        function t() {
            var t = getCurrentPages(), e = t[t.length - 1];
            return this.__page = e, this.__timeout = null, e.wetoast = this, this;
        }
        return t.prototype.toast = function(t) {
            try {
                t ? this.show(t) : this.hide();
            } catch (e) {
                e = VM2_INTERNAL_STATE_DO_NOT_USE_OR_PROGRAM_WILL_FAIL.handleException(e);
                console.error(e), t && "function" == typeof t.fail && t.fail(t);
            } finally {
                t && "function" == typeof t.complete && t.complete(t);
            }
        }, t.prototype.show = function(t) {
            var e = this, o = this.__page;
            clearTimeout(this.__timeout), o.setData({
                "__wetoast__.reveal": !0
            }), setTimeout(function() {
                var e = wx.createAnimation();
                e.opacity(1).step(), t.animationData = e.export(), t.reveal = !0, t.isHidden = !1, 
                o.setData({
                    __wetoast__: t
                });
            }, 30), 0 === t.duration ? setTimeout(function() {
                "function" == typeof t.success && t.success(t);
            }, 430) : this.__timeout = setTimeout(function() {
                e.toast(), "function" == typeof t.success && t.success(t);
            }, (t.duration || 1500) + 400);
        }, t.prototype.hide = function() {
            var t = this.__page;
            if (clearTimeout(this.__timeout), t.data.__wetoast__.reveal) {
                var e = wx.createAnimation();
                e.opacity(0).step(), t.setData({
                    "__wetoast__.animationData": e.export()
                }), setTimeout(function() {
                    t.setData({
                        __wetoast__: {
                            reveal: !1
                        }
                    });
                }, 400);
            }
        }, new t();
    }
};