var BackScene = function() {
	this.step = function(dt) {}
	this.draw = function(dt, ctx) {
		ctx.save()
		ctx.fillStyle="white"
		ctx.fillRect(0,0,Game.width,Game.height)
		ctx.restore()
	}
}