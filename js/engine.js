var Lift = function() {
	var speedX = 25
	var mallLogos = ["华润万家", "屈臣氏", "正佳广场", "中信大厦", "万达广场"]
	var xyRatio = 0.25
	this.liftLeftHeight = 0.5 * Game.height
	this.distance = 0
	this.catX = 0.2 * Game.width
	this.catY = this.liftLeftHeight + xyRatio * this.catX
	this.trap = [
		[-0.5 * Game.width, 20]
	]
	this.trip = 0
	this.lastTrip = -1
	this.catTween = {}
	this.jcEnergy = 20
	this.jumpUpCount = 0
	this.inFreeze = 0
	this.detectRange = Game.width
	this.inPause = false
	this.guideCount = 0
	this.guideTimes = 0
	this.guideOn = false
	this.continueGame = function() {
		this.jumpUpCount = 0
		this.trap.splice(0, 1)
		this.cancelPause()
	}
	this.cancelPause = function() {
		setTimeout("lift.inPause = false", 500)
	}
	this.guide = function(dt) {
		this.guideCount += dt
		if (this.guideCount > 1000 && this.guideTimes == 0) {
			this.inPause = true
			this.guideTimes++
				confirm("点击空白处开始上下跳绳") ? this.cancelPause() : this.cancelPause()
		} else if (this.guideCount > 3000 & this.guideTimes == 1) {
			this.inPause = true
			this.guideTimes++
				confirm("跳神可以积攒能量") ? this.cancelPause() : this.cancelPause()
		} else if (this.guideCount > 6000 && this.guideTimes == 2) {
			this.inPause = true
			this.guideTimes++
				confirm("点击电梯消耗能量往前跳") ? this.cancelPause() : this.cancelPause()
		}
	}
	this.checkAccident = function() {
		for (var i = 0, length = this.trap.length; i < length; i++) {
			var trapX = Game.width + this.trap[i][0] - this.distance
			if (this.catX >= trapX && this.catX <= trapX + this.trap[i][1] && !this.inJumpCross) {
				Tween.clear.call(this.catTween)
				Tween.create.call(this.catTween, "translate", 1, false, function() {}, "linear", 0, 0, 0, 0.5 * Game.height, 1)
				this.inPause = true
				setTimeout("confirm('神经猫跳了'+lift.jumpUpCount+'次'+'，继续不') ? lift.continueGame() :''", 1000)
			}
		}
	}
	this.adjustVisible = function() {
		this.visibleWidth = this.catX + this.detectRange
	}
	this.drawRange = function(ctx) {
		ctx.save()
		ctx.fillStyle = "red"
		ctx.textAlign = "left"
		ctx.fillText("范围", this.catX + this.detectRange, this.catY)
		ctx.strokeStyle = "red"
		ctx.lineWidth = 1
		ctx.beginPath()
		ctx.arc(this.catX, this.catY, this.detectRange, 0, 2 * Math.PI / 10, false)
		ctx.stroke()
		ctx.restore()
	}
	this.declineRange = function(dt) {
		if (this.detectRange > 30) {
			this.detectRange -= dt / 200
		}
		if (this.detectRange < 30) {
			this.detectRange = 20
		}
	}
	this.drawEnergyBar = function(ctx) {
		ctx.save()
		ctx.fillStyle = "red"
		ctx.textAlign = "left"
		ctx.fillText("能量", 10, Game.height - 20)
		ctx.strokeStyle = "red"
		ctx.lineWidth = 5
		ctx.beginPath()
		ctx.moveTo(10, Game.height - 10)
		ctx.lineTo(10 + 2 * this.jcEnergy, Game.height - 10)
		ctx.stroke()
		ctx.restore()
	}
	this.restoreEnergy = function(dt) {
		if (this.jcEnergy <= 50) {
			this.jcEnergy += dt / 200
		}
	}
	this.checkCoordinate = function(dt) {
		if (this.inJumpCross) {
			this.jcSpeed += this.jcAcc * dt / 1000
			this.catX += this.jcSpeed * dt / 1000 - 0.5 * this.jcAcc * Math.pow(dt / 1000, 2)
			this.catY = this.liftLeftHeight + xyRatio * this.catX
			if (this.inJumpCross * this.jcSpeed <= 0) {
				this.jcAcc = 0
				this.jcSpeed = 0
				this.inJumpCross = false
			}
		}
	}
	this.checkFreeze = function(dt) {
		if (this.inFreeze > 0) {
			this.inFreeze -= dt / 1000
		}
		if (this.inFreeze < 0) {
			this.inFreeze = 0
		}
	}
	this.checkJump = function() {
		if (Game.touch.touched) {
			if (Game.touch.Y <= Game.touch.X * xyRatio + 0.5 * Game.height + 10 && Game.touch.Y >= Game.touch.X * xyRatio + 0.5 * Game.height - 10) {
				if (!this.inJumpCross) {
					Tween.clear.call(this.catTween)
					this.catJumpCross(1, Game.touch.X - this.catX)
				}
			} else {
				if (this.catTween.nowFrame >= 0.5 * this.catTween.plusAllFrame || !this.catTween.nowFrame) {
					if (this.inFreeze == 0) {
						var distance=Math.floor(30*this.catTween.plusAllFrame/this.catTween.allFrame) 
						Tween.clear.call(this.catTween)
						this.catJumpUp(0.5,distance)
						this.jumpUpCount++
					}
				} else {
					Tween.clear.call(this.catTween)
					this.inFreeze = 1
				}
			}
			Game.touch.touched = false;
			Game.touch.X = null;
			Game.touch.Y = null;
		}
	}
	this.catJumpUp = function(time,distance) {
		Tween.create.call(this.catTween, "translate", 1, false, function() {}, "linear", 0, 0, 0, -distance, time)
		Tween.create.call(this.catTween, "translate", 1, true, function() {}, "linear", 0, -distance, 0, 0, time)
			//		if (this.detectRange < Game.width) {
			//			this.detectRange += 6
			//		}
		if (this.jcEnergy < 100) this.jcEnergy += 1
	}
	this.catJumpCross = function(time, distance) {
		//有多少能量，就能跳多远，v=2*s/t,a=-v/t
		this.inJumpCross = distance < 0 ? -1 : 1
		var realDistance = Math.min(this.jcEnergy, Math.abs(distance))
		this.jcEnergy -= realDistance
		this.jcSpeed = 2 * this.inJumpCross * realDistance / time
		this.jcAcc = -this.jcSpeed / time
		this.catJumpUp(time)
	}
	this.trapGenerator = function() {
		if (this.trip != this.lastTrip) {
			this.lastTrip = this.trip
			var part=rndc(2)
			for (var i = 0; i < part; i++) {
				this.trap.push([rndf(Game.width/part)+i*Math.floor(Game.width/part)+ Game.width * this.trip, 10 * rndc(1 + Math.min(10, this.trip))])
			}
		}
	}
	this.trapUnquip = function() {
		for (var i = 0; i < this.trap.length; i++) {
			var trapX = Game.width + this.trap[i][0] - this.distance
			if (trapX < -this.trap[i][1]) {
				this.trap.splice(i, 1)
				i--
			}
		}
	}
	this.drawTrap = function(ctx) {
		ctx.save()
		ctx.fillStyle = "red"
		ctx.textAlign = "left"
		ctx.lineWidth = 5
		ctx.strokeStyle = "red"
		for (var i = 0, length = this.trap.length; i < length; i++) {
			ctx.beginPath()
			var trapX = Game.width + this.trap[i][0] - this.distance
			if (trapX < this.visibleWidth) {
				var visibleTrapWidth = Math.min(this.trap[i][1], this.visibleWidth - trapX)
				ctx.moveTo(trapX, trapX * xyRatio + this.liftLeftHeight)
				ctx.lineTo(trapX + visibleTrapWidth, (trapX + visibleTrapWidth) * xyRatio + this.liftLeftHeight)
				ctx.stroke()
				ctx.fillText("坑", trapX, trapX * xyRatio + this.liftLeftHeight - 10)
			}
		}
		ctx.restore()
	}
	this.drawCat = function(ctx) {
		ctx.save()
		ctx.fillStyle = "black"
		ctx.textAlign = "center"
		ctx.lineWidth = 5
		ctx.strokeStyle = "black"
		ctx.beginPath()
		ctx.moveTo(this.catX, this.catY)
		ctx.lineTo(this.catX, this.catY - 40)
		ctx.fillText("猫", this.catX, this.catY - 40)
		ctx.stroke()
		ctx.restore()
	}
	this.drawMallLogos = function(ctx) {
		this.logo = mallLogos[this.trip % 5]
		this.fillX = Game.width - this.distance % Game.width
		ctx.save()
		ctx.font = base_font["20"]
		ctx.fillStyle = "grey"
		ctx.textAlign = "right"
		ctx.fillText(this.logo, this.fillX, xyRatio * this.fillX)
		ctx.restore()
	}
	this.drawLift = function(ctx) {
		ctx.save()
		ctx.fillStyle = "red"
		ctx.textAlign = "center"
		ctx.font = base_font["22b"]
			//ctx.fillText("dist:" + Math.round(this.distance) + ";trip:" + this.trip + ";trap:" + this.trap, 0, 20)
		ctx.fillText("神经猫2：电梯跳绳" + this.jumpUpCount + "次", 0.5 * Game.width, 0.1 * Game.height)
		ctx.lineWidth = 2
		ctx.beginPath()
		ctx.moveTo(0, this.liftLeftHeight)
		ctx.lineTo(Game.width, this.liftLeftHeight + xyRatio * Game.width)
		ctx.strokeStyle = "grey"
		ctx.stroke()
		ctx.restore();
	}
	this.step = function(dt) {
		if (!this.inPause) {
			this.distance += speedX * dt / 1000;
			this.trip = Math.floor(this.distance / Game.width)
			this.trapGenerator()
			this.trapUnquip()
			this.checkJump()
			this.checkCoordinate(dt)
				//this.restoreEnergy(dt)
			this.checkFreeze(dt)
				//this.declineRange(dt)
			this.adjustVisible()
			this.checkAccident()
			if (this.guideOn) {
				this.guide(dt)
			}
		}
	}
	this.draw = function(dt, ctx) {
		this.drawLift(ctx)
		this.drawMallLogos(ctx)
		ctx.save()
		Tween.play.call(this.catTween)
		this.drawCat(ctx)
		ctx.restore()
		this.drawTrap(ctx)
		this.drawEnergyBar(ctx)
		this.drawRange(ctx)
	}
}