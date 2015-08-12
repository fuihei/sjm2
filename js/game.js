var Game = new function() {
	var ORIGINAL_WIDTH = 320;
	var ORIGINAL_HEIGHT = 480;
	isAPP = false;
	base_font = {
		12: 12 + "px bangers", //小
		14: 14 + "px bangers", //中
		15: 15 + "px bangers",
		17: 17 + "px bangers", //大
		"12b": "bold " + 12 + "px bangers",
		"14b": "bold " + 14 + "px bangers",
		"15b": "bold " + 15 + "px bangers", //按键专用
		"17b": "bold " + 17 + "px bangers", //成就标题专用
		"20b": "bold " + 20 + "px bangers", //皇冠符号专用
		"22b": "bold " + 22 + "px bangers", //游戏标题专用
	}
	this.initial = function(callNext) {
		this.innerWidth = window.innerWidth;
		this.innerHeight = window.innerHeight - (window.innerWidth < 500 ? 35 : 65);

		if (!PC && this.innerHeight < this.innerWidth) {
			alert(CN ? "本游戏竖屏体验最佳" : "this game displays in portrait best");
			var screenMax = Math.max(window.screen.width, window.screen.height);
			var screenMin = Math.min(window.screen.width, window.screen.height);
			this.innerHeight = this.innerWidth * (0.9 * screenMax / screenMin);
		}
		this.width = ORIGINAL_WIDTH
		this.height = PC ? ORIGINAL_HEIGHT : Math.floor(ORIGINAL_WIDTH * this.innerHeight / this.innerWidth)

		this.scale = PC ? 1 : this.innerWidth / this.width
		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
		this.canvas.width = this.width * this.scale;
		this.canvas.height = this.height * this.scale;
		this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
		this.ctx.scale(this.scale, this.scale)
		this.layers = [];
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
					//e.preventDefault();
					singleTouch = e.touches[0];
					Game.touch.pageX = Math.round(singleTouch.pageX) - Game.canvas.getBoundingClientRect().left;
					Game.touch.pageY = Math.round(singleTouch.pageY) - Game.canvas.getBoundingClientRect().top;

					Game.touch.touched = true;
					Game.touch.X = Game.touch.pageX / Game.scale;
					Game.touch.Y = Game.touch.pageY / Game.scale;
					Game.touch.pageX = null;
					Game.touch.pageY = null;
				}, false)
			} else {
				window.addEventListener("mousedown", function(e) {
					//e.preventDefault();
					singleTouch = e;
					Game.touch.pageX = Math.round(singleTouch.pageX) - Game.canvas.getBoundingClientRect().left;
					Game.touch.pageY = Math.round(singleTouch.pageY) - Game.canvas.getBoundingClientRect().top;

					Game.touch.touched = true;
					Game.touch.X = Game.touch.pageX / Game.scale;
					Game.touch.Y = Game.touch.pageY / Game.scale;
					Game.touch.pageX = null;
					Game.touch.pageY = null;
				}, false)
			}

		}
		this.setInput();
		var loopLastTime = 0;
		loopInterval = 0;
		this.loop = function(time) {
			loopInterval = Math.round(time - loopLastTime);
			loopInterval = loopInterval ? Math.min(loopInterval, 60) : 30
			loopIntervalAvg = typeof(loopIntervalAvg) != "undefined" ? (loopIntervalAvg + loopInterval) / 2 : loopInterval;
			for (var i = 0, len = Game.layers.length; i < len; i++) {
				if (Game.layers[i]) {
					Game.layers[i].step(loopInterval);
					Game.layers[i].draw(loopInterval, Game.ctx);
				}
			}
			loopLastTime = time;
			window.requestFrame(Game.loop);
		}
		window.requestFrame(Game.loop);
		callNext();
	}
	list = window.localStorage;
	list.played = list.played ? (parseInt(list.played) + 1) : 1
}
var callLoadStage = function() {
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