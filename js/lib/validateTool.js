define(function(require, exports, module) {
    'use strict';
    require('./jquery-validate.min');
    var service,
        validator;
    var label;
    //默认配置 $.validator.setDefaults 和 service.init 有先后顺序
    $.validator.setDefaults({
        debug:true,
        errorPlacement: function($label, $inputEle) {
            if(!$label.is(':empty')){
            $inputEle.css('border-color','red');
            if(!label){
            label = $("<label class='url-error'>").html($label.html()) //要自定义lable标签，使用参数提供的标签，会出现一些bug
            $inputEle.parent().append(label);
            }
            }else{
                $inputEle.css('border-color','black');
                var parent = $inputEle.parent();
                parent.children().remove('label.url-error');
                label = null;      
            }
        },
        success: function(label, inputEle) {
        }
    });
    service = {
        validate: function(selector, errorMessage) {
            return validator.element(selector);
        },
        init: function() {
            validateAdd();
            validateCfg();
        }
    };
    service.init();
    module.exports = service;
    //自定义验证方法
    function validateCfg() {
        $.validator.addMethod('url', function(v, e, p) {
            var that = this;
            function IsURL(v) {
                // var strRegex = '^((https|http|ftp|rtsp|mms)?://)' + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@ 
                //     + '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184 
                //     + '|' // 允许IP和DOMAIN（域名） 
                //     + '([0-9a-z_!~*\'()-]+.)*' // 域名- www. 
                //     + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名 
                //     + '[a-z]{2,6})' // first level domain- .com or .museum 
                //     + '(:[0-9]{1,4})?' // 端口- :80 
                //     + '((/?)|' // a slash isn't required if there is no file name 
                //     + '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$';
                var strRegex = '^((https|http|ftp|rtsp|mms|rtmp)?:\/\/)[^\s]+';
                var re = new RegExp(strRegex);
                return that.optional(e) || re.test(v);
            }
            return IsURL(v);
        }, '输入地址有误，请验证后重新输入！');
    }
    //给元素添加验证规则
    function validateAdd() {
        validator = $('#publish-form').validate({
            rules: {
                'publish-url': {
                    required: true,
                    'url': ''
                }
            },
            messages: {
                'publish-url': {
                    required: '请输入url',
                    'url': "输入地址有误，请验证后重新输入！"
                }
            }
        });
    }
})
