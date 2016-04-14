'use strict';
define(function(require, exports, module) {
    var parallax = require("../lib/parallax"),
        validateTool = require('../lib/validateTool'),
        scroll = require('../lib/scroll'),
        service,
        netPlayer,
        url,
        flag = 1;
    service = {
        initEvent: function() {
            
            $(window).on('scroll', function() { //底部滚动
                parallax.parallaxScroll($('.m-footer'));
            });
            $('#i-publish-ok').on('click', function() {
                scroll.scrollToScreenCenter($('.g-publish-view')); //滚动
            })
            $('#i-publish-ok').on('click', function() {
                var playHtml,
                    type = '',
                    $this = $(this),
                    urlType;
                if (flag) {
                    if (validateTool.validate('#i-publish-url')) {
                        url = $('#i-publish-url').val();
                        urlType = url.substring(0, 4);

                        switch (urlType) {
                            case 'http':
                                if (url.indexOf('mp4') !== -1) {
                                    type = 'video/mp4';
                                } else if (url.indexOf('flv') !== -1) {
                                    type = 'video/x-flv';
                                } else if (url.indexOf('m3u8') !== -1) {
                                    type = 'application/x-mpegURL';
                                }
                                break;
                            case 'rtmp':
                                type = 'rtmp/flv';
                                break;
                        }
                        
                        netPlayer = videojs('netEase-player');
                        netPlayer.src({ type: type, src: url });
                        // console.log(netPlayer.videoHeight());
                        // console.log(videojs('netEase-player').videoWidth());
                        netPlayer.play();
                        // setTimeout("console.log(videojs('netEase-player').videoWidth())",1000);
                        // console.log(videojs('netEase-player').videoWidth());
                        
                        // netPlayer.enterFullWindow();
                        // netPlayer.requestFullscreen();
                        flag = 0;
                        $this.val('停止播放');
                    }
                } else {
                    $this.val('开始播放');
                    netPlayer.pause();
                    flag = 1;
                }
            })
        },
        init: function() {
            service.initEvent();
        }
    };
    service.init();

})