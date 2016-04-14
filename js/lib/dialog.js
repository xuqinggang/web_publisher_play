define(function (require, exports, module) {
    'use strict';
    var dialog;
    require('./dialog-plus');
        // console.log(dialogPlus);
    dialog = {
        confirm: function (data) {
            window.dialog({
                fixed: true,
                width:330,
                title: '提示',
                showHeader: true,
                showIcon: false,
                content: typeof data === 'string' ? data : (data.content || ''),
                okValue: data.okValue,
                ok: data.ok,
                cancelValue: data.cancelValue,
                cancel: data.cancel
            }).show();
        }
    };
    module.exports = dialog;
})