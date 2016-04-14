'use strict';
define(function(require,exports,module){
    var tooltip = {};
    tooltip.topMessage = function ($ele, message) {
        if(!$ele.find('.j-tooltip').length) {
            var $span = $("<span class='j-tooltip'>"),
                $eleH = $ele.outerHeight(),
                $eleW = $ele.outerWidth(),
                $spanH,
                $spanW;
            $ele.css('position', 'relative');
            $span.css({
                position: 'absolute',
                'white-space': 'nowrap'
            })
            $span.html(message);
            $ele.append($span);
            $spanW = $span.outerWidth();
            $spanH = $span.outerHeight();
            $span.css({
                top: -$eleH,
                left: ($eleW-$spanW)/2
            })
        }
    };
    tooltip.bottomLeftMessage = function ($ele, message, color) {
        if(!$ele.find('.j-tooltip').length) {
            var $span = $("<span class='j-tooltip'>"),
                $eleH = $ele.outerHeight(),
                $eleW = $ele.outerWidth(),
                $spanH,
                $spanW;
            $ele.css('position', 'relative');
            $span.css({
                position: 'absolute',
                'white-space': 'nowrap'
            });
            if(color) {
                $span.css('color', color);
            }
            $span.html(message);
            $ele.append($span);
            $spanW = $span.outerWidth();
            $spanH = $span.outerHeight();
            $span.css({
                top: $eleH,
                left:0
            });
        }
        console.log($span);
    };
    tooltip.removeTip = function ($ele) {
        if($ele.find('.j-tooltip').length) {
            $ele.children('.j-tooltip').remove();
        }
    }
    module.exports = tooltip;
});