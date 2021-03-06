(function (console) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var Reflect = function() { };
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
var pixi_plugins_app_Application = function() {
	this._lastTime = new Date();
	this._setDefaultValues();
};
pixi_plugins_app_Application.prototype = {
	set_fps: function(val) {
		this._frameCount = 0;
		return val >= 1 && val < 60?this.fps = val | 0:this.fps = 60;
	}
	,set_skipFrame: function(val) {
		if(val) {
			console.log("pixi.plugins.app.Application > Deprecated: skipFrame - use fps property and set it to 30 instead");
			this.set_fps(30);
		}
		return this.skipFrame = val;
	}
	,_setDefaultValues: function() {
		this.pixelRatio = 1;
		this.set_skipFrame(false);
		this.autoResize = true;
		this.transparent = false;
		this.antialias = false;
		this.forceFXAA = false;
		this.roundPixels = false;
		this.backgroundColor = 16777215;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.set_fps(60);
	}
	,start: function(rendererType,stats,parentDom) {
		if(stats == null) stats = true;
		if(rendererType == null) rendererType = "auto";
		var _this = window.document;
		this.canvas = _this.createElement("canvas");
		this.canvas.style.width = this.width + "px";
		this.canvas.style.height = this.height + "px";
		this.canvas.style.position = "absolute";
		if(parentDom == null) window.document.body.appendChild(this.canvas); else parentDom.appendChild(this.canvas);
		this.stage = new PIXI.Container();
		var renderingOptions = { };
		renderingOptions.view = this.canvas;
		renderingOptions.backgroundColor = this.backgroundColor;
		renderingOptions.resolution = this.pixelRatio;
		renderingOptions.antialias = this.antialias;
		renderingOptions.forceFXAA = this.forceFXAA;
		renderingOptions.autoResize = this.autoResize;
		renderingOptions.transparent = this.transparent;
		if(rendererType == "auto") this.renderer = PIXI.autoDetectRenderer(this.width,this.height,renderingOptions); else if(rendererType == "canvas") this.renderer = new PIXI.CanvasRenderer(this.width,this.height,renderingOptions); else this.renderer = new PIXI.WebGLRenderer(this.width,this.height,renderingOptions);
		if(this.roundPixels) this.renderer.roundPixels = true;
		window.document.body.appendChild(this.renderer.view);
		if(this.autoResize) window.onresize = $bind(this,this._onWindowResize);
		window.requestAnimationFrame($bind(this,this._onRequestAnimationFrame));
		this._lastTime = new Date();
		if(stats) this._addStats();
	}
	,_onWindowResize: function(event) {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.renderer.resize(this.width,this.height);
		this.canvas.style.width = this.width + "px";
		this.canvas.style.height = this.height + "px";
		if(this._stats != null) {
			this._stats.domElement.style.top = "2px";
			this._stats.domElement.style.right = "2px";
		}
		if(this.onResize != null) this.onResize();
	}
	,_onRequestAnimationFrame: function() {
		this._frameCount++;
		if(this._frameCount == (60 / this.fps | 0)) {
			this._frameCount = 0;
			this._calculateElapsedTime();
			if(this.onUpdate != null) this.onUpdate(this._elapsedTime);
			this.renderer.render(this.stage);
		}
		window.requestAnimationFrame($bind(this,this._onRequestAnimationFrame));
		if(this._stats != null) this._stats.update();
	}
	,_calculateElapsedTime: function() {
		this._currentTime = new Date();
		this._elapsedTime = this._currentTime.getTime() - this._lastTime.getTime();
		this._lastTime = this._currentTime;
	}
	,_addStats: function() {
		if(window.Stats != null) {
			var container;
			var _this = window.document;
			container = _this.createElement("div");
			window.document.body.appendChild(container);
			this._stats = new Stats();
			this._stats.domElement.style.position = "absolute";
			this._stats.domElement.style.top = "2px";
			this._stats.domElement.style.right = "2px";
			container.appendChild(this._stats.domElement);
			this._stats.begin();
			var counter;
			var _this1 = window.document;
			counter = _this1.createElement("div");
			counter.style.position = "absolute";
			counter.style.top = "50px";
			counter.style.right = "2px";
			counter.style.width = "76px";
			counter.style.background = "#CCCCC";
			counter.style.backgroundColor = "#105CB6";
			counter.style.fontFamily = "Helvetica,Arial";
			counter.style.padding = "2px";
			counter.style.color = "#0FF";
			counter.style.fontSize = "9px";
			counter.style.fontWeight = "bold";
			counter.style.textAlign = "center";
			window.document.body.appendChild(counter);
			counter.innerHTML = ["Unknown","WebGL","Canvas"][this.renderer.type] + " - " + this.pixelRatio;
		}
	}
};
var samples_spine_Main = function() {
	pixi_plugins_app_Application.call(this);
	this.backgroundColor = 65382;
	pixi_plugins_app_Application.prototype.start.call(this);
	this.stage.interactive = true;
	var assetsToLoader = [];
	this._loader = new PIXI.loaders.Loader();
	this._loader.add("spinedata","assets/spine/spineboy.json");
	this._loader.load($bind(this,this.onAssetsLoaded));
};
samples_spine_Main.main = function() {
	new samples_spine_Main();
};
samples_spine_Main.__super__ = pixi_plugins_app_Application;
samples_spine_Main.prototype = $extend(pixi_plugins_app_Application.prototype,{
	onAssetsLoaded: function() {
		this._spine = new PIXI.spine.Spine(Reflect.field(this._loader.resources,"spinedata").spineData);
		this._spine.position.set(400,600);
		this._spine.scale.set(1.5);
		this._spine.stateData.setMixByName("walk","jump",0.2);
		this._spine.stateData.setMixByName("jump","walk",0.4);
		this._spine.state.setAnimationByName(0,"walk",true);
		this.stage.addChild(this._spine);
		this.stage.on("click",$bind(this,this._stageOnClick));
		this.stage.on("tap",$bind(this,this._stageOnClick));
	}
	,_stageOnClick: function() {
		this._spine.state.setAnimationByName(0,"jump",false);
		this._spine.state.addAnimationByName(0,"walk",true,0);
	}
});
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
samples_spine_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});

//# sourceMappingURL=spine.js.map