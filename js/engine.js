var Lift = function() {
	var mallLogos = ["华润万家", "屈臣氏", "正佳广场", "中信大厦", "万达广场"]
	var pressColor = "red"
	var self = this
	this.initial = function() {
		this.lift = {
			speed: 20,
			distance: 0,
			trip: 0,
			lastTrip: -1,
			level: 0,
			levelNeedTrips: 5,
			speedPlusByTrip: 2,
			startHeight: 0.8 * Game.height,
			ratio: -0.25,
			angle: Math.atan(-0.25),
			baseColor: "grey",
			color: "grey"
		}
		this.cat = {
			x: 0.2 * Game.width,
			y: self.lift.startHeight + self.lift.ratio * 0.2 * Game.width,
			tween: {},
			level: 0,
			levelByTimes: [10, 30, 60, 100, 150, 210, 280, 360, 450, 550, 660, 780, 910, 1050, 1200, 1360, 1530, 1710],
			baseColor: "black",
			color: "black"
		}
		this.levelBar = {
			length: 20,
			at: 0
		}
		this.catHeight = {
			now: 25,
			min: 25,
			max: 100,
			reduceByTime: 5,
			plusByTime: 5,
			plusByJump: 5,
			reducePercentByJump: 0.5
		}
		this.catJump = {
			upTime: 1,
			crossTime: 1,
			upTimes: 0,
			freezeTimer: 0,
			crossDirection: 0,
			floatFrame: 0
		}
		this.catTouch = {
			left: 15,
			right: 15
		}
		this.trap = {
			traps: [
				[-0.5 * Game.width, 5]
			],
			lengthByTrip: 5,
			maxToTrips: 20,
			amountOfTrip: 2
		}
		this.sprite = {
			sprites: [],
			box: 20,
			amount: 3,
			effect: -1
		}
	}
	this.initial()
	this.guide = {
		on: list.played <= 1 ? true : false,
		times: 0,
		timer: 0
	}
	this.inPause = false
	this.continueGame = function() {
		//		Tween.clear.call(this.cat.tween)
		//		this.catJump.upTimes = 0
		//		this.trap.traps.splice(0, 1)
		this.initial()
		this.cancelPause()
	}
	this.cancelPause = function() {
		setTimeout("lift.inPause = false", 500)
	}
	this.checkGuide = function(dt) {
		this.guide.timer += dt
		if (this.guide.timer > 1000 && this.guide.times == 0) {
			this.inPause = true
			this.guide.times++
				confirm("点击神经猫上下跳") ? this.cancelPause() : this.cancelPause()
		} else if (this.guide.timer > 3000 && this.guide.times == 1) {
			this.inPause = true
			this.guide.times++
				confirm("点击两侧左右跳\n不要碰到陷阱") ? this.cancelPause() : this.cancelPause()
		}
	}
	this.checkTrapCollision = function() {
		for (var i = 0, length = this.trap.traps.length; i < length; i++) {
			var trapX = Game.width + this.trap.traps[i][0] - this.lift.distance
			if (this.cat.x >= trapX && this.cat.x <= trapX + this.trap.traps[i][1] && !this.cat.tween.nowFrame > 0) {
				Tween.clear.call(this.cat.tween)
				Tween.create.call(this.cat.tween, "translate", 1, false, function() {}, "linear", 0, 0, 0, Game.height - this.lift.startHeight, 1)
				this.inPause = true
				PC ? setTimeout("lift.continueGame()", 1000) : setTimeout("confirm('你乘坐神猫飞船跳了'+lift.catJump.upTimes+'次'+'，继续不') ? lift.continueGame() :''", 1000)
				document.title = "你乘坐神猫" + (this.cat.level + 2) + "号飞船：电梯逃亡" + this.catJump.upTimes + "次"
			}
		}
	}
	this.checkSpriteCollision = function() {
		var jumpHeight = this.cat.tween.nowFrame ? -this.cat.tween.frameEvents.translate[2 * this.cat.tween.nowFrame + 1] : 0
		for (var i = 0; i < this.sprite.sprites.length; i++) {
			var spriteX = Game.width + this.sprite.sprites[i][0] - this.lift.distance
			var spriteY = this.sprite.sprites[i][1] - (Game.width - spriteX) * this.lift.ratio
			var catTop = this.cat.y - this.catHeight.now - jumpHeight
			var catBottom = this.cat.y - jumpHeight
			if ((this.cat.x >= spriteX - 0.5 * this.sprite.box) && (this.cat.x <= spriteX + 0.5 * this.sprite.box) && (catTop <= spriteY + 0.5 * this.sprite.box) && (catBottom >= spriteY - 0.5 * this.sprite.box)) {
				if (this.sprite.sprites[i][2] == 0) {
					this.sprite.effect = 0
					this.catJump.upTime = 0.5
					this.catJump.crossTime = 0.5
					setTimeout("lift.catJump.upTime=1", 5000)
					setTimeout("lift.catJump.crossTime=1", 5000)
					setTimeout("lift.sprite.effect=-1", 5000)
				} else if (this.sprite.sprites[i][2] == 1) {
					this.sprite.effect = 1
					this.catJump.upTime = 2
					this.catJump.crossTime = 2
					setTimeout("lift.catJump.upTime=1", 5000)
					setTimeout("lift.catJump.crossTime=1", 5000)
					setTimeout("lift.sprite.effect=-1", 5000)
				} else if (this.sprite.sprites[i][2] == 2) {
					this.sprite.effect = 2
					this.catJump.floatFrame = 5
					setTimeout("lift.catJump.floatFrame=0", 5000)
					setTimeout("lift.sprite.effect=-1", 5000)
				}
				this.sprite.sprites.splice(i, 1)
				i--
			}
		}
	}
	this.checkHeight = function(dt) {
		if (this.catHeight.now < this.catHeight.min) {
			this.catHeight.now += dt / (1000 / this.catHeight.plusByTime)
		} else {
			this.catHeight.now -= dt / (1000 / this.catHeight.reduceByTime)
		}
	}
	this.checkCross = function(dt) {
		if (this.catJump.crossDirection) {
			this.jcSpeed += this.jcAcc * dt / 1000
			this.cat.x += this.jcSpeed * dt / 1000 - 0.5 * this.jcAcc * Math.pow(dt / 1000, 2)
			this.cat.y = this.lift.startHeight + this.lift.ratio * this.cat.x
			if (this.catJump.crossDirection * this.jcSpeed <= 0) {
				this.jcAcc = 0
				this.jcSpeed = 0
				this.catJump.crossDirection = 0
			}
		}
	}
	this.checkFreeze = function(dt) {
		if (this.catJump.freezeTimer > 0) {
			this.catJump.freezeTimer -= dt / 1000
		}
		if (this.catJump.freezeTimer < 0) {
			this.catJump.freezeTimer = 0
		}
	}
	this.plusLevel = function() {
		this.levelBar.at += 2
		if (this.cat.levelByTimes[this.cat.level] && this.catJump.upTimes == this.cat.levelByTimes[this.cat.level]) {
			this.cat.level++
				if (this.cat.levelByTimes[this.cat.level]) {
					this.levelBar.length = 2 * (this.cat.levelByTimes[this.cat.level] - this.cat.levelByTimes[this.cat.level - 1])
					this.levelBar.at = 0
				}
		}
	}
	this.checkPress = function() {
		if (Game.touch.touched && Game.touch.X > 0 && Game.touch.X < Game.width) {
			var height = this.cat.tween.nowFrame ? Math.floor(this.catHeight.now * this.cat.tween.plusAllFrame / this.cat.tween.nowFrame) : this.catHeight.now
			if (Game.touch.X >= this.cat.x - this.catTouch.left && Game.touch.X <= this.cat.x + this.catTouch.right) {
				this.cat.color = pressColor
				setTimeout("lift.cat.color=lift.cat.baseColor", 200)
				if (this.cat.tween.nowFrame >= 0.5 * this.cat.tween.plusAllFrame || !this.cat.tween.nowFrame) {
					//console.log("now:" + this.cat.tween.nowFrame + ";all:" + this.cat.tween.allFrame + ";plusAll:" + this.cat.tween.plusAllFrame + ";catHeight:" + this.catHeight.now + ";height:" + height)
					if (this.catJump.freezeTimer == 0) {
						Tween.clear.call(this.cat.tween)
						this.startJumpUp(this.catJump.upTime, height)
						this.catJump.upTimes++
							this.plusLevel()
					}
				} else {
					Tween.clear.call(this.cat.tween)
					this.catJump.freezeTimer = 1
				}
			} else {
				this.lift.color = pressColor
				setTimeout("lift.lift.color=lift.lift.baseColor", 200)
				if (this.catJump.crossDirection) {
					this.jcAcc = 0
					this.jcSpeed = 0
					this.catJump.crossDirection = 0
				}
				Tween.clear.call(this.cat.tween)
				this.startJumpCross(this.catJump.crossTime, Game.touch.X - this.cat.x, height)
			}
			Game.touch.touched = false
			Game.touch.X = null
			Game.touch.Y = null
		}
	}
	this.startJumpUp = function(time, height) {
		Tween.create.call(this.cat.tween, "translate", 1, false, function() {}, "linear", 0, 0, 0, -height, time / 2)
		Tween.create.call(this.cat.tween, "translate", 1, true, function() {}, "linear", 0, -height, 0, 0, time / 2)
		if (this.catHeight.now < this.catHeight.max) this.catHeight.now += this.catHeight.plusByJump
	}
	this.startJumpCross = function(time, distance, height) {
		this.catJump.crossDirection = distance < 0 ? -1 : 1
		var realDistance = this.catJump.crossDirection * Math.min(this.catHeight.now, Math.abs(distance))
		var catEndingX = this.cat.x + realDistance
		var catEndingY = this.lift.startHeight + this.lift.ratio * catEndingX
		this.catHeight.now -= Math.abs(realDistance * this.catHeight.reducePercentByJump)
		this.jcSpeed = 2 * realDistance / time //v=2*s/t
		this.jcAcc = -this.jcSpeed / time //a=-v/t
		this.startJumpUp(time, height)
		this.cat.tween.nowFrame = this.catJump.floatFrame
			//Tween.create.call(this.cat.tween, "rotate", 1, false, function() {}, this.cat.x, this.cat.y, this.cat.x, this.cat.y, 0,Math.PI/2+ this.lift.angle,time/2)
			//Tween.create.call(this.cat.tween, "rotate", 1, true, function() {}, catEndingX, catEndingY, catEndingX, catEndingY, 0,Math.PI/2-this.lift.angle,time/2)
	}
	this.spriteGenerator = function() {
		var part = rndc(this.sprite.amount)
		for (var i = 0; i < 1; i++) {
			this.sprite.sprites.push([rndf(Game.width / part) + i * Math.floor(Game.width / part) + Game.width * this.lift.trip, this.lift.startHeight + this.lift.ratio * Game.width - 60 - 5 * this.cat.level - 5 * rndc(this.cat.level), Math.min(Math.floor(this.cat.level / 5), rndf(3))])
		}
	}
	this.spriteUnload = function() {
		for (var i = 0; i < this.sprite.sprites.length; i++) {
			var spriteX = Game.width + this.sprite.sprites[i][0] - this.lift.distance
			if (spriteX < -this.sprite.box) {
				this.sprite.sprites.splice(i, 1)
				i--
			}
		}
	}
	this.trapGenerator = function() {
		var part = rndc(this.trap.amountOfTrip)
		for (var i = 0; i < part; i++) {
			this.trap.traps.push([rndf(Game.width / part) + i * Math.floor(Game.width / part) + Game.width * this.lift.trip, this.trap.lengthByTrip * rndc(1 + Math.min(this.trap.maxToTrips, this.lift.trip))])
		}
	}
	this.trapUnload = function() {
		for (var i = 0; i < this.trap.traps.length; i++) {
			var trapX = Game.width + this.trap.traps[i][0] - this.lift.distance
			if (trapX < -this.trap.traps[i][1]) {
				this.trap.traps.splice(i, 1)
				i--
			}
		}
	}
	this.checkTrip = function() {
		if (this.lift.trip != this.lift.lastTrip) {
			this.lift.lastTrip = this.lift.trip
			if (this.lift.trip % this.lift.levelNeedTrips == 0) {
				this.lift.level++
					if (this.lift.trip > 0) {
						this.inPause = true
						PC ? this.cancelPause() : confirm("恭喜你，是否进入第" + this.lift.level + "关") ? this.cancelPause() : ""
					}
			}
			this.lift.speed += this.lift.speedPlusByTrip
			this.trapGenerator()
			this.spriteGenerator()
		}
		this.trapUnload()
		this.spriteUnload()
	}
	this.drawLevel = function(ctx) {
		ctx.save()
		ctx.lineWidth = 5
		ctx.strokeStyle = "grey"
		ctx.beginPath()
		ctx.moveTo(0.5 * Game.width - this.levelBar.length / 2, 10)
		ctx.lineTo(0.5 * Game.width + this.levelBar.length / 2, 10)
		ctx.stroke()
		ctx.strokeStyle = "red"
		ctx.beginPath()
		ctx.moveTo(0.5 * Game.width - this.levelBar.at / 2, 10)
		ctx.lineTo(0.5 * Game.width + this.levelBar.at / 2, 10)
		ctx.stroke()
		ctx.restore()
	}
	this.drawSprite = function(ctx) {
		ctx.save()
		ctx.textAlign = "center"
		for (var i = 0, length = this.sprite.sprites.length; i < length; i++) {
			var spriteX = Game.width + this.sprite.sprites[i][0] - this.lift.distance
			var spriteY = this.sprite.sprites[i][1] - (Game.width - spriteX) * this.lift.ratio
			if (spriteX < Game.width) {
				ctx.fillStyle = "grey"
				ctx.fillRect(spriteX - 0.5 * this.sprite.box, spriteY - 0.5 * this.sprite.box, this.sprite.box, this.sprite.box)
				ctx.fillStyle = "red"
				ctx.fillText(this.sprite.sprites[i][2] == 0 ? "快" : (this.sprite.sprites[i][2] == 1 ? "缓" : "浮"), spriteX, spriteY + 0.4 * this.sprite.box)
			}
		}
		ctx.restore()
	}
	this.drawTrap = function(ctx) {
		ctx.save()
		ctx.lineWidth = 5
		ctx.strokeStyle = "red"
		for (var i = 0, length = this.trap.traps.length; i < length; i++) {
			ctx.beginPath()
			var trapX = Game.width + this.trap.traps[i][0] - this.lift.distance
			if (trapX < Game.width) {
				ctx.moveTo(trapX, trapX * this.lift.ratio + this.lift.startHeight + 5)
				ctx.lineTo(trapX + this.trap.traps[i][1], (trapX + this.trap.traps[i][1]) * this.lift.ratio + this.lift.startHeight + 5)
				ctx.stroke()
			}
		}
		ctx.restore()
	}
	this.drawCat = function(ctx) {
		ctx.save()
		ctx.fillStyle = this.cat.color
		ctx.textAlign = "center"
		ctx.lineWidth = 5
		ctx.strokeStyle = this.cat.color
		ctx.beginPath()
		ctx.moveTo(this.cat.x, this.cat.y)
		ctx.lineTo(this.cat.x, this.cat.y - this.catHeight.now)
		ctx.fillText(this.sprite.effect == 2 ? "浮" : (this.sprite.effect == 1 ? "缓" : (this.sprite.effect == 0 ? "快" : "猫")), this.cat.x, this.cat.y - this.catHeight.now * (1 - this.catJump.freezeTimer))
		ctx.stroke()
		ctx.restore()
	}
	this.drawMallLogos = function(ctx) {
		this.logo = this.lift.level + "F " + mallLogos[this.lift.trip % 5]
		this.fillX = Game.width - this.lift.distance % Game.width
		ctx.save()
		ctx.font = base_font["20"]
		ctx.fillStyle = "grey"
		ctx.textAlign = "right"
		ctx.fillText(this.logo, this.fillX, this.lift.ratio * this.fillX + 0.5 * Game.height)
		ctx.restore()
	}
	this.drawLift = function(ctx) {
		ctx.save()
		ctx.fillStyle = "red"
		ctx.textAlign = "center"
		ctx.font = base_font["22b"]
			//ctx.fillText("dist:" + Math.round(this.lift.distance) + ";trip:" + this.lift.trip + ";trap:" + this.trap.traps, 0, 20)
		ctx.fillText("神经猫" + (this.cat.level + 2) + "号：电梯逃亡" + this.catJump.upTimes + "次", 0.5 * Game.width, 40)
		ctx.lineWidth = 5
		ctx.beginPath()
		ctx.moveTo(0, this.lift.startHeight)
		ctx.lineTo(Game.width, this.lift.startHeight + this.lift.ratio * Game.width)
		ctx.strokeStyle = this.lift.color
		ctx.stroke()
		ctx.restore();
	}
	this.step = function(dt) {
		if (!this.inPause) {
			this.lift.distance += this.lift.speed * dt / 1000;
			this.lift.trip = Math.floor(this.lift.distance / Game.width)

			this.checkTrip()
			this.checkPress()
			this.checkCross(dt)
			this.checkFreeze(dt)
			this.checkHeight(dt)
			this.checkTrapCollision()
			this.checkSpriteCollision()
			if (this.guide.on) {
				this.checkGuide(dt)
			}
		}
	}
	this.draw = function(dt, ctx) {
		this.drawLift(ctx)
		this.drawMallLogos(ctx)
		ctx.save()
		Tween.play.call(this.cat.tween)
		this.drawCat(ctx)
		ctx.restore()
		this.drawTrap(ctx)
		this.drawSprite(ctx)
		this.drawLevel(ctx)
	}
}