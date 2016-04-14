/**
 * the NetPublisher object.
 * @param container the html container id.
 * @param width a float value specifies the width of publisher.
 * @param height a float value specifies the height of publisher.
 * @param private_object [optional] an object that used as private object, 
 *       for example, the logic chat object which owner this publisher.
 */
(function() {
    /**
     * [NetPublisher 推流器构造函数]
     * @param {IDString} container 容器 id选择器
     * @param {object} initPublish 初始化publisher对象
     *                   initPublish = { compulsory Optional
     *                       
     *                       url: ,//string (Optional) 推流url地址
     *                       width: , //number (Optional) default 862
     *                       height: , //number (Optional) default 446,
     *                       size: ,//string (optional) 分辨率 default '640x480'
     *                       fps: , //number (optional) 帧率 default 15
     *                       bitrate: //number (optional) 码率 default 600
     *                       wmode: ,//(Optional) "window"模式 默认显示方式下flash总是会遮住位置与他重合的所有DHTML层
     *                                "opaque"模式 flash影片就不会在高于浏览器HTML渲染表面而是与其他元素一样在同一
     *                                个页面上,因此你就可以使用z-index值来控制DHTML元素是遮盖flash或者被遮盖。 
     *                                "transparent"模式 这种模式下flashplayer会将stage的背景色alpha值将为0并且只会绘制
     *                                stage上真实可见的对象，同样你也可以使用z-index来控
     *                                制flash影片的深度值，但是与Opaque模式不同的是这样做会降低flash影片的回放效果，而且
                                      在9.0.115之前的flash player版本设置wmode=”opaque”或”transparent”会导致全屏模式失效。
                                      default 'opaque'
                            quality: ,//(Optional)//"low"低呈现品质 "medium"中等呈现品质 "hign"高呈现品质 "best"极高呈现品质
                                      default 'high'
     *                      allowScriptAccess: , //(Optional) "always"WF 文件可以与其嵌入到的 HTML 页进行通信，即使该 SWF 文件来自不
     *                                            同于 HTML 页的域也可以。
     *                                            "sameDomain" 仅当 SWF 文件与其嵌入到的 HTML 页来自相同的域时，
     *                                            该 SWF 文件才能与该 HTML 页进行通信。
     *                                            "never" SWF 文件将无法与任何 HTML 页进行通信 在 Adobe Flash CS4 \
     *                                            Professional 中，不建议使用该值。如果没有在自己的域中提供不受信任
     *                                            的 SWF 文件，则不建议也不应使用该值。如果确实需要使用不受信
     *                                            任的 SWF 文件，则 Adobe 建议您创建一个不同的子域，并将所有不受信任的内容置于其中。
     *                                            default 'always'
     *                   }
     *
     * @return {Object} 返回推流实例
     */
    function NetPublisher(container, initPublish, readyCallbackFun) {
        if (!NetPublisher.__id) {
            NetPublisher.__id = 100;
        }
        if (!NetPublisher.__publishers) {
            NetPublisher.__publishers = [];
        }
        NetPublisher.__publishers.push(this);
        this.id = NetPublisher.__id++;
        this.readyCallbackFun = readyCallbackFun; // 准备就绪回调
        this.errorMessageCallbackFun = null; //推流过程中产生错误信息回调
        // this.errorMessageCallbackFunReady = null; //z准备初始化时产生错误信息回调
        this.initPublish = {
            width: 862,
            height: 446,
            size: '640x480',
            fps: 15,
            bitrate: 600,
            url: '',
            wmode: 'opaque',
            quality: 'high',
            allowScriptAccess: 'always',
        };
        extend(this.initPublish, initPublish);
        this.component = {
            cameraList: [],
            microPhoneList: []
        };
        this.container = container;
        this.width = this.initPublish.width;
        this.height = this.initPublish.height;
        this.callbackObj = null;
        this.url = this.initPublish.url;
        this.vcodec = {};
        this.acodec = {};
        this.code = 0;
        // error code defines.
        this.errors = {
            '100': '*系统检测到您的摄像头异常，请确认正确连接摄像设备.', //error_camera_get 
            '101': '*系统检测您的麦克风异常，请确认正确连接麦克风设备.', //error_microphone_get 
            '102': '摄像头为禁用状态，推流时请允许flash访问摄像头。', //error_camera_muted 
            '103': '服务器关闭了连接。', //error_connection_closed 
            '104': '服务器连接失败。', //error_connection_failed 
            '105': '推流地址错误,请选择网易专用地址',
            '199': '未知错误'
        };
        this.sdkVersion = null;
        this.start();
    }
    /**
     * user can set some callback, then start the publisher.
     * callbacks: flash 回调 js
     *      on_publisher_ready(cameras, microphones):int, when net publisher ready, user can publish.
     *      on_publisher_error(code, desc):int, when net publisher error, callback this method.
     *      on_publisher_warn(code, desc):int, when net publisher warn, callback this method.
     */
    NetPublisher.prototype.start = function () {
        var flashvars = {},
            params = {},
            attributes = {},
            self = this;;
        flashvars.id = this.id;
        flashvars.width = this.width;
        flashvars.height = this.height;
        flashvars.on_publisher_ready = "__net_on_publisher_ready";
        /**
         * [on_publisher_ready2 description] 测试用 用于接收as的返回值
         * @type {String}
         */
        flashvars.on_publisher_ready2 = "__net_on_publisher_ready2";
        flashvars.on_publisher_error = "__net_on_publisher_error";
        flashvars.on_publishInit_error = "__net_on_publishInit_error";
        flashvars.on_publisher_warn = "__net_on_publisher_warn";
        flashvars.on_publisher_getSDKVersion = "__net_on_publisher_getSDKVersion"

        params.wmode = this.initPublish.wmode;
        // params.allowFullScreen = "true";
        params.allowScriptAccess = this.initPublish.allowScriptAccess;
        params.quality = this.initPublish.quality;
        params.align = 'middle';

        swfobject.embedSWF( //现在有个问题 此路径是相对于html页面的
            "swf/publisher/netPublisher.swf?_version=" + net_get_version_code(),// swf路径改成cdn路径
            this.container,
            this.width, this.height,
            "11.1.0", "swf/AdobeFlashPlayerInstall.swf",
            flashvars, params, attributes,
            function(callbackObj) {
                self.callbackObj = callbackObj;
            }
        );
        return this;
    };

    /**
     * [startPublish description] publish stream to server.
     * @param  {UrlString} url                     [description] 推流地址
     * @param  {Object} options                 [description] 推流配置 设置摄像头，麦克风，清晰度
     *                                            options = {
     *                                                cameraIndex:, // (optional) default 0
     *                                                microPhoneIndex: ,// (optional) default 1
     *                                                size: ,string (optional) default '640x480',
     *                                                fps: ,number (optional) default 15,
     *                                                bitrate: number (optional) default 600
     *                                            }
     *     
     * @param  {[fun]} errorMessageCallbackFun    [description] 推流过程中发生错误进行回调 函数参数为(错误代码，错误信息)
     * @return {[type]}                           [description]
     */
    NetPublisher.prototype.startPublish = function () {
        var i = 0;
        if (typeof arguments[i] === 'string') {
            this.url = arguments[i];
            i++;
        }
        if (typeof arguments[i] === 'object') {
            extend(this.initPublish, arguments[i]);
            i++;
        }
        if (typeof arguments[i] === 'function') {
            this.errorMessageCallbackFun = arguments[i];
            i++;
        }
        this.setCamera(this.initPublish.cameraIndex || 0);
        this.setMicroPhone(this.initPublish.microPhoneIndex || 0);
        this.vcodec.size = this.initPublish.size;
        this.vcodec.fps = this.initPublish.fps;
        this.vcodec.bitrate = this.initPublish.bitrate;
        this.stopPublish();
        NetPublisher.__publishers.push(this);
        if (this.url === '') {
            throw new Error("请输入url");
        }
        this.callbackObj.ref.__publish(this.url, this.width, this.height, this.vcodec, this.acodec);
    };

    /**
     * [stopPublish description] 停止推流
     * @return {[type]} [description]
     */
    NetPublisher.prototype.stopPublish = function () {
        var i = 0,
            publisher = null;
        for (i = 0; i < NetPublisher.__publishers.length; i++) {
            publisher = NetPublisher.__publishers[i];
            if (publisher.id != this.id) {
                continue;
            }
            NetPublisher.__publishers.splice(i, 1);
            break;
        }
        this.callbackObj.ref.__stop();
    };
    NetPublisher.prototype.startPreview = function (cameraIndex) {
        // var i = 0,
        //     publisher = null;
        // for (i = 0; i < NetPublisher.__publishers.length; i++) {
        //     publisher = NetPublisher.__publishers[i];
        //     if (publisher.id != this.id) {
        //         continue;
        //     }
        //     NetPublisher.__publishers.splice(i, 1);
        //     break;
        // }
        this.callbackObj.ref.__preview(cameraIndex);
    };
    /**
     * [getDefinedErrors description] 获得所有相关的错误信息,可以根据需求进行改动
     * @return {[object]} [description] 返回定义好的错误信息
     */
    NetPublisher.prototype.getDefinedErrors = function () {
        return this.errors;
    };

    /**
     * [getCameraList description] 获得摄像头列表
     * @return {[Array]} [description] 字符串数组列表
     */
    NetPublisher.prototype.getCameraList = function () {
        return this.component.cameraList;
    };

    /**
     * [setCamera description] 设置摄像头
     * @param {[number]} cameraIndex [description] 摄像头列表的索引
     */
    NetPublisher.prototype.setCamera = function(cameraIndex) {
        var cameraCode = cameraIndex;
        this.initPublish.cameraIndex = cameraIndex;
        if (cameraIndex >= this.component.cameraList.length) {
            throw new Error('未获取到该摄像头');
        }
        cameraName = this.component.cameraList[cameraIndex];
        this.vcodec.device_code = cameraCode;
        this.vcodec.device_name = cameraName;
    };

    /**
     * [getMicroPhoneList description] 获得麦克风列表
     * @return {[type]} [description]  麦克风数组列表
     */
    NetPublisher.prototype.getMicroPhoneList = function () {
        return this.component.microPhoneList;
    }

    /**
     * [setMicroPhone description]  设置麦克风
     * @param {[number]} microPhoneIndex [description] 麦克风列表的索引
     */
    NetPublisher.prototype.setMicroPhone = function (microPhoneIndex) {
        var microPhoneCode = microPhoneIndex;
        this.initPublish.microPhoneIndex = microPhoneIndex;
        // console.log(microPhoneIndex,this.component.cameraList.length);
        if (microPhoneIndex >= this.component.microPhoneList.length) {
            throw new Error('未获取到该麦克风');
        }
        microPhoneName = this.component.microPhoneList[microPhoneIndex];
        this.acodec.device_code = microPhoneCode;
        this.acodec.device_name = microPhoneName;
    };

    /**
     * [setDefination description] 设置清晰度
     * @param {[object]} definationObj [description]  清晰度对象参数配置 definationObj = {
     *                                                                       fps: ,
     *                                                                       size: ,
     *                                                                       bitrate:
     *                                                                   }
     */
    NetPublisher.prototype.setDefination = function (definationObj) {
        extend(this.initPublish, definationObj)
        this.vcodec.fps = this.initPublish.fps;
        this.vcodec.size = this.initPublish.size;
        this.vcodec.bitrate = this.initPublish.bitrate;
    };

    /**
     * [alterDefinedErrors description] 修改提示错误信息 错误代码编号不能更改
     * @param  {[object]} errorObject [description]
     * @return {[object]}             [description] 返回被更改的错误信息
     */
    NetPublisher.prototype.alterDefinedErrors = function (errorObject) {
        return extend(this.errros, errorObject)
    };

    /**
     * [resize description] 重新调整播放器的大小
     * @param  {[type]} width  [description] 
     * @param  {[type]} height [description]
     * @return {[type]}        [description]
     */
    NetPublisher.prototype.resize = function (width, height) {
        this.width = width;
        this.height = height;
    };
    NetPublisher.prototype.getSDKVersion = function () {
        return this.sdkVersion;
    };
    /**
     * [on_publisher_ready description]  推流准备就绪
     * @param  {[array]} cameraList     [description]  cameraList a string array contains the names of cameras.
     * @param  {[array]} microphoneList [description] microphoneList a string array contains the names of microphones.
     * @param  {[function]} callbackFun    [description] 推流准备就绪回调函数 可以初始化摄像头，麦克风列表
     * @return {[type]}                [description]
     */
    NetPublisher.prototype.on_publisher_ready = function (cameraList, microPhoneList, readyCallbackFun) {
        this.component.cameraList = cameraList;
        this.component.microPhoneList = microPhoneList;
        readyCallbackFun.apply(this);
    };

    /**
     * [on_publisher_error description]
     * @param  {[type]} code [description] the error code.
     * @param  {[type]} desc [description] the error desc message.
     * @return {[object]}      [description] 返回错误代码和错误信息的描述
     */
    NetPublisher.prototype.on_publisher_error = function (code, desc) {
        this.errorMessageCallbackFun(code, desc);
    };
    NetPublisher.prototype.on_publishInit_error = function (code, desc) {
        this.readyCallbackFun(code, desc);
    };
    NetPublisher.prototype.on_publisher_warn = function (code, desc) {
        this.errorMessageCallbackFun(code, desc);
    };

    function net_get_version_code () {
        return "0.01"; 
    }
    function isArray(obj) {
        if(Object.prototype.toString.call(obj).slice(8,-1) === "Array"){
            return true;
        }
        return false;
    }
    function isPlainObject(obj) {
        if(Object.prototype.toString.call(obj).slice(8,-1) === "Object"){
            return true;
        }
        return false;
    }
    function extend(obj, copyObject) {
        for(var attr in copyObject) {
            var src = obj[attr];
            var copy = copyObject[attr];
            if(src === copy) {
                continue;
            }
            if(copy &&(copyIsArray = isArray(copy) || isPlainObject(copy))) {
                if(copyIsArray){
                    src = src && isArray(src) ? src : [];
                }else{
                    src = src ? src : {};
                }
                obj[attr] = extend(src,copy);                    
            }else if(copy !== undefined) {
                obj[attr] = copy;
            }
        }
        return obj;
    }

    window.NetPublisher = NetPublisher;

})();
function __net_find_publisher (id) {
    var i,
        publisher;
    for (i = 0; i < NetPublisher.__publishers.length; i++) {
        publisher = NetPublisher.__publishers[i];
        if (publisher.id != id) {
            continue;
        }
        return publisher;
    }
    throw new Error("publisher not found. id=" + id);
}

function __net_on_publisher_ready (id, cameras, microphones) {
    var publisher = __net_find_publisher(id);
    publisher.on_publisher_ready(cameras, microphones, publisher.readyCallbackFun);
}

function __net_on_publisher_ready2 (video, audio) {
    // console.log(video, audio);
}

function __net_on_publisher_error (id, code) {
    var publisher = __net_find_publisher(id);
    publisher.code = code;
    publisher.on_publisher_error(code, publisher.errors["" + code]);
}
function __net_on_publishInit_error (id, code) {
    var publisher = __net_find_publisher(id);
    publisher.on_publishInit_error(code, publisher.errors["" + code])
    // publisher.code = code;
    // publisher.on_publisher_error(code, publisher.errors["" + code]);
}
function __net_on_publisher_warn (id, code) {
    var publisher = __net_find_publisher(id);
    publisher.code = code;
    publisher.on_publisher_warn(code, publisher.errors["" + code]);
}

function __net_on_publisher_getSDKVersion (id, sdkVersion) {
    var publisher = __net_find_publisher(id);
    publisher.sdkVersion = sdkVersion;
}


/*  SWFObject v2.2 <http://code.google.com/p/swfobject/> 
    is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();