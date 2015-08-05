var Game = new function() {
	//游戏原始尺寸
	var fullFill = PC ? false : true;
	var ORIGINAL_WIDTH = 320;
	var ORIGINAL_HEIGHT = 480;
	isAPP=false;
	this.initial = function(callNext) {
		this.innerWidth = window.innerWidth;
		this.innerHeight = window.innerHeight;

		if (!PC && this.innerHeight < this.innerWidth) {
			alert(CN ? "本游戏竖屏体验最佳" : "this game displays in portrait best");
			var screenMax = Math.max(window.screen.width, window.screen.height);
			var screenMin = Math.min(window.screen.width, window.screen.height);
			this.innerHeight = this.innerWidth * (0.9 * screenMax / screenMin);
		}
		this.width =ORIGINAL_WIDTH;
		this.height = fullFill ? Math.floor( ORIGINAL_WIDTH * this.innerHeight / this.innerWidth) :  ORIGINAL_HEIGHT;

		this.fullRate = fullFill ? this.innerWidth / this.width : 1;
		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
		this.canvas.width = this.width * this.fullRate;
		this.canvas.height = this.height * this.fullRate;
		this.ctx = this.canvas.getContext && this.canvas.getContext('2d');

		this.ctx.scale(this.fullRate, this.fullRate);
		this.layers = [
			[],
			[],
			[]
		];
		this.addLayer = function(layer) {
			Game.layers.push(layer);
		}
		this.delLayer = function(layer) {
			window.requestFrame(function() {
				Game.layers.splice(Game.layers.indexOf(layer), 1);
			})
		}
		this.setInput = function() {
			this.touch = {
				pageX: null,
				pageY: null,
				touched: false,
				X: null,
				Y: null
			};
			var singleTouch;
			if (!PC) {
				window.addEventListener("touchstart", function(e) {
					e.preventDefault();
					if (!Game.touch.touched) {次
						singleTouch = e.touches[0];
						Game.touch.pageX = Math.round(singleTouch.pageX) - Game.canvas.getBoundingClientRect().left;
						Game.touch.pageY = Math.round(singleTouch.pageY) - Game.canvas.getBoundingClientRect().top;

						Game.touch.touched = true;
						Game.touch.X = Game.touch.pageX / Game.fullRate;
						Game.touch.Y = Game.touch.pageY / Game.fullRate;
						Game.touch.pageX = null;
						Game.touch.pageY = null;
					}
				}, false)
			} else {
				window.addEventListener("mousedown", function(e) {
					e.preventDefault();
					singleTouch = e;
					if (!Game.touch.touched) {
						Game.touch.pageX = Math.round(singleTouch.pageX) - Game.canvas.getBoundingClientRect().left;
						Game.touch.pageY = Math.round(singleTouch.pageY) - Game.canvas.getBoundingClientRect().top;

						Game.touch.touched = true;
						Game.touch.X = Game.touch.pageX;
						Game.touch.Y = Game.touch.pageY;
						Game.touch.pageX = null;
						Game.touch.pageY = null;
					}
				}, false)
			}

		}
		this.setInput();
		var loopLastTime = 0;
		loopInterval = 0;
		this.loop = function(time) {
				loopInterval = Math.round(time - loopLastTime);
				loopIntervalAvg = typeof(loopIntervalAvg) != "undefined" ? (loopIntervalAvg + loopInterval) / 2 : loopInterval;
				Game.layers[1][0].step(loopInterval);
				for (var i = 0, len = Game.layers.length; i < len; i++) {
					for (var j = 0, innerLen = Game.layers[i].length; j < innerLen; j++) {
						if (Game.layers[i][j]) {
							Game.layers[i][j].step(loopInterval);
							Game.layers[i][j].draw(loopInterval, Game.ctx);
						}
					}
				}
				loopLastTime = time;
				window.requestFrame(Game.loop);
			}
		window.requestFrame(Game.loop);
		callNext();
	}
}
var callLoadStage = function() {
	//添加背景图层
	backscene = new BackScene();
	Game.addLayer(backscene);
	Game.addLayer(Loader);
	Loader.load(callGameStage);
	
}
var callGameStage = function() {
	Game.delLayer(Loader);
	lift = new Lift();
	Game.addLayer(lift);
}