package com.videojs{
    
    import flash.display.Sprite;
    import flash.external.ExternalInterface;
	import flash.geom.Rectangle;
    public class VideoJSApp extends Sprite{
        
        private var _uiView:VideoJSView;
        private var _model:VideoJSModel;
        
        public function VideoJSApp(rectangle:Rectangle){
            
            _model = VideoJSModel.getInstance(rectangle)

            _uiView = new VideoJSView();
            addChild(_uiView);
            //ExternalInterface.call('videojs.Flash.test2',3, 3);

        }
        
        public function get model():VideoJSModel{
            return _model;
        }
        public function get uiView():VideoJSView{
            return _uiView;
        }
        
    }
}