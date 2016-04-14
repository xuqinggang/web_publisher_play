'use strict';
define(function(require,exports,module){
    var scroll = {};
    scroll.scrollToScreenCenter = function($ele){
        var $eleHight = $ele.outerHeight(),
            screenHeight = $(window).height(),
            $eleToTop = $ele.offset().top,
            $eleToCenter = $eleToTop-screenHeight/2+$eleHight/2;
            // alert($eleToCenter);
            $('html,body').animate({
                scrollTop:$eleToCenter
            },1000);


    }
    module.exports = scroll;
});