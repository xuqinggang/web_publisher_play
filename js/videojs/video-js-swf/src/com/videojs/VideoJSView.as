package com.videojs{

    import com.videojs.events.VideoJSEvent;
    import com.videojs.events.VideoPlaybackEvent;
    import com.videojs.structs.ExternalErrorEventName;

    import flash.display.Bitmap;
    import flash.display.Loader;
    import flash.display.Sprite;
    import flash.events.Event;
    import flash.events.IOErrorEvent;
    import flash.events.SecurityErrorEvent;
    import flash.external.ExternalInterface;
    import flash.geom.Rectangle;
    import flash.media.Video;
    import flash.net.URLRequest;
    import flash.system.LoaderContext;

    public class VideoJSView extends Sprite{

        private var _uiVideo:Video;
        private var _uiBackground:Sprite;

        private var _model:VideoJSModel;

        public function VideoJSView(){

            _model = VideoJSModel.getInstance();
            _model.addEventListener(VideoJSEvent.BACKGROUND_COLOR_SET, onBackgroundColorSet);
            _model.addEventListener(VideoJSEvent.STAGE_RESIZE, onStageResize);
            _model.addEventListener(VideoPlaybackEvent.ON_META_DATA, onMetaData);
            _model.addEventListener(VideoPlaybackEvent.ON_VIDEO_DIMENSION_UPDATE, onDimensionUpdate);

            _uiBackground = new Sprite();
            _uiBackground.graphics.beginFill(_model.backgroundColor, 1);
            _uiBackground.graphics.drawRect(0, 0, _model.stageRect.width, _model.stageRect.height);
            _uiBackground.graphics.endFill();
            _uiBackground.alpha = _model.backgroundAlpha;
            addChild(_uiBackground);

            _uiVideo = new Video();
            _uiVideo.width = _model.stageRect.width;
            _uiVideo.height = _model.stageRect.height;
            ExternalInterface.call('videojs.Flash.test2', _uiVideo.videoWidth,  _uiVideo.width, '!!!!!!!!');
            _uiVideo.smoothing = true;
            addChild(_uiVideo);

            _model.videoReference = _uiVideo;
            //ExternalInterface.call('videojs.Flash.test',  _uiVideo.width, _uiVideo.height);
        }

        private function sizeVideoObject():void{
            var __targetWidth:int;
            var __targetHeight:int;

            var __availableWidth:int = _model.stageRect.width;
            var __availableHeight:int = _model.stageRect.height;
           // ExternalInterface.call('videojs.Flash.test2', _uiVideo.width, '1231231af1233443', _model.metadata.width);
            var __nativeWidth:int = 100;

            if(_model.metadata.width != undefined){
                __nativeWidth = Number(_model.metadata.width);
            }
            if(_uiVideo.videoWidth != 0){
                __nativeWidth = _uiVideo.videoWidth;
            }
            //ExternalInterface.call('videojs.Flash.test', _uiVideo.width, 'qq11');
            var __nativeHeight:int = 100;

            if(_model.metadata.height != undefined){
                __nativeHeight = Number(_model.metadata.height);
            }

            if(_uiVideo.videoHeight != 0){
                __nativeHeight = _uiVideo.videoHeight;
            }
            
            //ExternalInterface.call('videojs.Flash.test2', _uiVideo.width, 'qq11');
            // first, size the whole thing down based on the available width
            __targetWidth = __availableWidth;
            __targetHeight = __targetWidth * (__nativeHeight / __nativeWidth);

            if(__targetHeight > __availableHeight){
                __targetWidth = __targetWidth * (__availableHeight / __targetHeight);
                __targetHeight = __availableHeight;
            }
           // ExternalInterface.call('videojs.Flash.test', _uiVideo.width, 'qq11');
            _uiVideo.width = __targetWidth;
            _uiVideo.height = __targetHeight;

            _uiVideo.x = Math.round((_model.stageRect.width - _uiVideo.width) / 2);
            _uiVideo.y = Math.round((_model.stageRect.height - _uiVideo.height) / 2);
            ExternalInterface.call('videojs.Flash.test2', _uiVideo.width, _uiVideo.height, _model.stageRect.width, _model.stageRect.height,  __nativeHeight,  __nativeWidth, "sizeVideoObject");
        }

        private function onBackgroundColorSet(e:VideoPlaybackEvent):void{
            _uiBackground.graphics.clear();
            _uiBackground.graphics.beginFill(_model.backgroundColor, 1);
            _uiBackground.graphics.drawRect(0, 0, _model.stageRect.width, _model.stageRect.height);
            _uiBackground.graphics.endFill();
        }

        private function onStageResize(e:VideoJSEvent):void{
            ExternalInterface.call('videojs.Flash.test2', 'sizeVideoObject12');
            _uiBackground.graphics.clear();
            _uiBackground.graphics.beginFill(_model.backgroundColor, 1);
            _uiBackground.graphics.drawRect(0, 0, _model.stageRect.width, _model.stageRect.height);
            _uiBackground.graphics.endFill();
            
            sizeVideoObject();
        }

        private function onMetaData(e:VideoPlaybackEvent):void{
            ExternalInterface.call('videojs.Flash.test2', 'sizeVideoObject1');
            sizeVideoObject();
        }

        private function onDimensionUpdate(e:VideoPlaybackEvent):void{
            ExternalInterface.call('videojs.Flash.test2', 'sizeVideoObject133');
            sizeVideoObject();
        }

        public function get uiVideo():Video{
            return _uiVideo;
        }
        public function set uiVideo(video:Video):void {
            _uiVideo = video;
        }

    }
}
