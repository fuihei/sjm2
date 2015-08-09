PC = (function() {
	var userAgentInfo = navigator.userAgent;
	//弹窗浏览器和设备信息
	//alert(userAgentInfo)
	var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
	var flag = true;
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) >= 0) {
			flag = false;
			break;
		}
	}
	return flag;
})();
window.requestFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		// if all else fails, use setTimeout
		function(callback) {
			return window.setTimeout(callback, 1000 / 60); // shoot for 60 fps
		};
})();
CN = (function() {
	var userLang = navigator.language;
	if (userLang.indexOf("zh") >= 0) return true;
	else return false;
})();
function rndf(n) {
	return Math.floor(Math.random() * n);
}
function rndc(n) {
	return Math.ceil(Math.random() * n);
}
var Tween = {
	//这里加参数，后面的arg裁减个数也要改
	create: function(func, loop, dontOverride, callback) {
		//现在除了可以指定循环次数，还可以同类型顺序叠加，不然用callback叠加中间会断帧
		//异类型也是可以叠加的
		this.canRun = true;
		this.runTimes = 0;
		this.runMaxTimes = loop;
		this.callback = this.callback ? (dontOverride ? this.callback : callback) : callback;
		this.nowFrame = 0;
		this.frameTypes = this.frameTypes ? (dontOverride ? this.frameTypes : []) : [];
		this.plusAllFrame = this.plusAllFrame ? (dontOverride ? this.plusAllFrame : 0) : 0;
		this.frameEvents = !this.frameEvents ? {
			translate: [],
			rotate: [],
			scale: [],
			globalAlpha: [],
			imgData: []
		} : (dontOverride ? this.frameEvents : {
			translate: [],
			rotate: [],
			scale: [],
			globalAlpha: [],
			imgData: []
		});
		var args = Array.prototype.slice.call(arguments, 4);
		Tween[func].apply(this, args);
	},
	play: function() {
		if (this.canRun) {
			if (this.nowFrame < this.plusAllFrame) {
				this.frameEvents.translate.length != 0 && Game.ctx.translate(this.frameEvents.translate[2 * this.nowFrame], this.frameEvents.translate[2 * this.nowFrame + 1]);
				if (this.frameEvents.rotate.length != 0) {
					Game.ctx.translate(this.frameEvents.rotate[this.nowFrame][1], this.frameEvents.rotate[this.nowFrame][2]);
					Game.ctx.rotate(this.frameEvents.rotate[this.nowFrame][0]);
					Game.ctx.translate(-1 * this.frameEvents.rotate[this.nowFrame][1], -1 * this.frameEvents.rotate[this.nowFrame][2]);
				}
				if (this.frameEvents.scale.length != 0) {
					//这里也可以用另一种方法：先translate sx，再缩放dx，再translate -sx，即等同于一次translate：（1-dx）*sx
					//Game.ctx.translate(this.frameEvents.scale[3 * this.nowFrame + 1], this.frameEvents.scale[3 * this.nowFrame + 2]);					
					//Game.ctx.scale(this.frameEvents.scale[3 * this.nowFrame], this.frameEvents.scale[3 * this.nowFrame]);
					Game.ctx.translate(this.frameEvents.scale[0], this.frameEvents.scale[1]);
					Game.ctx.scale(this.frameEvents.scale[this.nowFrame + 2], this.frameEvents.scale[this.nowFrame + 2]);
					Game.ctx.translate(-1 * this.frameEvents.scale[0], -1 * this.frameEvents.scale[1]);
				}
				this.frameEvents.globalAlpha.length != 0 && (Game.ctx.globalAlpha = this.frameEvents.globalAlpha[this.nowFrame]);
				this.nowFrame++;
			} else {
				this.runTimes++;
				if (this.runTimes < this.runMaxTimes) {
					this.nowFrame = 0;
				} else {
					this.canRun = false;
					this.nowFrame = null;
					this.allFrame = null;
					this.frameTypes = null;
					this.plusAllFrame = null;
					this.frameEvents = undefined;
					this.callback.call(this);
					//this.callback = null;
				}
			}
		}
	},
	clear: function() {
		this.runTimes = this.runMaxTimes;
		this.canRun = false;
		this.nowFrame = null;
		this.allFrame = null;
		this.frameTypes = null;
		this.plusAllFrame = null;
		this.frameEvents = undefined;
		this.callback = null;
	},
	translate: function(type, sx, sy, ex, ey, duration) {
		//注意这里的sx ex都是指偏移，需要加上对象自身的draw坐标才是最终动画坐标
		this.allFrame = Math.round(duration * 1000 / loopIntervalAvg);
		for (var i = 0; i < this.allFrame; i++) {
			this.frameEvents.translate.push(Tween[type](i, sx, ex - sx, this.allFrame));
			this.frameEvents.translate.push(Tween[type](i, sy, ey - sy, this.allFrame));
		}
		Tween.addFrameByType.call(this, 4);
		//console.log(this.allFrame)
	},
	scale: function(type, sx, sy, begining, ending, duration) {
		//注意这里的sx sy是指缩放中心点
		this.allFrame = Math.round(duration * 1000 / loopIntervalAvg);
		this.frameEvents.scale.push(sx, sy);
		for (var i = 0; i < this.allFrame; i++) {
			var nowScale = Tween[type](i, begining, ending - begining, this.allFrame)
			this.frameEvents.scale.push(nowScale);
			//this.frameEvents.scale.push((1 - nowScale) * sx, (1 - nowScale) * sy);
		}
		//console.log(this.frameEvents.scale)
		Tween.addFrameByType.call(this, 1);
	},
	alpha: function(st, et, duration) {
		this.allFrame = Math.round(duration * 1000 / loopIntervalAvg);
		for (var i = 0; i < this.allFrame; i++) {
			this.frameEvents.globalAlpha.push(st + i * (et - st) / this.allFrame);
		}
		Tween.addFrameByType.call(this, 3);
	},
	linear: function(t, b, c, d) {
		//无缓动
		return c * t / d + b;
	},
	back: function(t, b, c, d) {
		//超过范围的三次方缓动
		var s = 1.7;
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	quad: function(t, b, c, d) {
		//二次方的缓动
		return -c * (t /= d) * (t - 2) + b;
	},
	cubic: function(t, b, c, d) {
		//三次方的缓动（t^3）
		return c * ((t = t / d - 1) * t * t + 1) + b;
	},
	quart: function(t, b, c, d) {
		//四次方的缓动（t^4）
		return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	},
	qunit: function(t, b, c, d) {
		//五次方的缓动（t^5）
		return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
	},
	sine: function(t, b, c, d) {
		//正弦曲线的缓动
		return c * Math.sin(t / d * (Math.PI / 2)) + b;
	},
	expo: function(t, b, c, d) {
		//指数曲线的缓动
		return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
	},
	circ: function(t, b, c, d) {
		//圆形曲线的缓动
		return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
	},
	elastic: function(t, b, c, d, a, p) {
		//指数衰减的正弦曲线
		if (t == 0) return b;
		if ((t /= d) == 1) return b + c;
		if (!p) p = d * .3;
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else var s = p / (2 * Math.PI) * Math.asin(c / a);
		return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
	},
	bounce: function(t, b, c, d) {
		//指数衰减的反弹缓动
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		} else {
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		}
	},
	addFrameByType: function(type) {
		this.frameTypes.push(type);
		var last = this.frameTypes.length - 1;
		//同类型，或者只有一个动画时，帧数增加；异类型，帧数不用改变，需要自己控制好和之前的动画帧数关系(通常应小于等于)
		//用否定符号判断是否存在比较坑爹，如果这个数等于0，也会判断会false
		if (!this.frameTypes[last - 1] || this.frameTypes[last] == this.frameTypes[last - 1]) {
			this.plusAllFrame += this.allFrame;
		}
	}
}