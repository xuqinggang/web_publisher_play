'use strict';
define(function(require,exports,module){
    var service;
    service = {
        parallaxScroll:function($ele){ //滚动式，让元素的背景图片呈现滚动效果（视差滚动）
            var offsetCoords = $ele.offset();
            var $eleHeight = $ele.outerHeight();
            var windowScrollTop = $(window).scrollTop(),
                windowHeight = $(window).height();
            if( windowScrollTop+windowHeight>(offsetCoords.top+$eleHeight/2)&& windowScrollTop<((offsetCoords.top+$eleHeight))){
                var yPos = -((windowHeight+windowScrollTop-offsetCoords.top)/$ele.data('speed'));
                var coords="50% "+yPos+"px";
                $ele.css({
                    backgroundPosition:coords,
                    transition:'background-position 0.4s linear'
                });
            }
        }
    }
    module.exports = service;
})