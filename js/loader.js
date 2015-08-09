var Loader = new function() {
	var IMGS = 0,
		ALL = IMGS;
	var res_loaded = 0;
	this.load = function(callNext) {
		this.imgs = [];
		for (var i = 0; i < IMGS; i++) {
			this.imgs[i] = new Image();
		}
		//this.imgs[0].id = "title.png"; 
		for (var i = 0; i < IMGS; i++) {
			this.imgs[i].src = "img/" + this.imgs[i].id;
			this.imgs[i].onload = function() {
				res_loaded++;
			}
		}
		this.step = function(dt) {
			if (res_loaded == ALL){
				callNext();
			}				
		}
	}
	this.draw = function(dt, ctx) {
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.font = base_font["17"];
		ctx.fillText(CN ? ("加载进度：" + res_loaded + " / " + ALL) : ("loading:" + res_loaded + " / " + ALL), Game.width / 2, Game.height / 2);
	}
}