var Lift = function() {
	var speedX = 25
	var mallLogos = ["华润万家", "屈臣氏", "正佳广场", "中信大厦", "万达广场"]
	var xyRatio = 0.25
	var xyAngle=Math.atan(xyRatio)
	this.liftLeftHeight = 0.5 * Game.height
	this.distance = 0
	this.catX = 0.2 * Game.width
	this.catY = this.liftLeftHeight + xyRatio * this.catX
	var catMinHeight=20
	var catMaxHeight=100
	this.catH=catMinHeight
	this.catTouch={
		left:10,
		right:10,
		up:10,
		down:10
	}
	catColor="black"
	liftColor="grey"
	var pressColor="red"
	this.catColor=catColor
	this.liftColor=liftColor
	this.trap = [
		[-0.5 * Game.width, 20]
	]
	this.trip = 0
	this.lastTrip = -1
	this.catTween = {}
	//this.jcEnergy = 20
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
				confirm("点击神经猫，开始上下跳") ? this.cancelPause() : this.cancelPause()
		} 
//		else if (this.guideCount > 3000 & this.guideTimes == 1) {
//			this.inPause = true
//			this.guideTimes++
//				confirm("跳神可以积攒能量") ? this.cancelPause() : this.cancelPause()
//		} 
		else if (this.guideCount > 3000 && this.guideTimes == 1) {
			this.inPause = true
			this.guideTimes++
				confirm("点击神经猫两侧，开始左右跳") ? this.cancelPause() : this.cancelPause()
		}
	}
	this.checkAccident = function() {
		for (var i = 0, length = this.trap.length; i < length; i++) {
			var trapX = Game.width + this.trap[i][0] - this.distance
			if (this.catX >= trapX && this.catX <= trapX + this.trap[i][1] && !this.inJumpCross) {
				Tween.clear.call(this.catTween)
				Tween.create.call(this.catTween, "translate", 1, false, function() {}, "linear", 0, 0, 0, 0.5 * Game.height, 1)
				this.inPause = true
				PC?setTimeout("lift.continueGame()",1000):setTimeout("confirm('神经猫跳了'+lift.jumpUpCount+'次'+'，继续不') ? lift.continueGame() :''", 1000)
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
		if (this.catH < catMinHeight) {
			this.catH  += dt / 200
		}else{
			this.catH  -= dt / 200
		}
	}
//	this.drawEnergyBar = function(ctx) {
//		ctx.save()
//		ctx.fillStyle = "red"
//		ctx.textAlign = "left"
//		ctx.fillText("能量", 10, Game.height - 20)
//		ctx.strokeStyle = "red"
//		ctx.lineWidth = 5
//		ctx.beginPath()
//		ctx.moveTo(10, Game.height - 10)
//		ctx.lineTo(10 + 2 * this.jcEnergy, Game.height - 10)
//		ctx.stroke()
//		ctx.restore()
//	}
//	this.restoreEnergy = function(dt) {
//		if (this.jcEnergy <= 50) {
//			this.jcEnergy += dt / 200
//		}
//	}
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
			var height = this.catTween.nowFrame ? Math.floor(this.catH * this.catTween.plusAllFrame / this.catTween.nowFrame) : this.catH
			if (Game.touch.X >= this.catX - this.catTouch.left && Game.touch.X <= this.catX + this.catTouch.right) {
				this.catColor=pressColor
				setTimeout("lift.catColor=catColor",200)
				if (this.catTween.nowFrame >= 0.5 * this.catTween.plusAllFrame || !this.catTween.nowFrame) {
					if (this.inFreeze == 0) {
						Tween.clear.call(this.catTween)
						this.catJumpUp(1, height)
						this.jumpUpCount++
					}
				} else {
					Tween.clear.call(this.catTween)
					this.inFreeze = 1
				}
			} else {
				this.liftColor=pressColor
				setTimeout("lift.liftColor=liftColor",200)
				if (!this.inJumpCross) {
					Tween.clear.call(this.catTween)
					this.catJumpCross(1, Game.touch.X - this.catX, height)
				}
			}
			Game.touch.touched = false
			Game.touch.X = null
			Game.touch.Y = null
		}
	}
	this.catJumpUp = function(time, height) {
		Tween.create.call(this.catTween, "translate", 1, false, function() {}, "linear", 0, 0, 0, -height, time/2)
		Tween.create.call(this.catTween, "translate", 1, true, function() {}, "linear", 0, -height, 0, 0, time/2)
			//		if (this.detectRange < Game.width) {
			//			this.detectRange += 6
			//		}
		if (this.catH < catMaxHeight) this.catH += 5
	}
	this.catJumpCross = function(time, distance, height) {
		//有多少能量，就能跳多远，v=2*s/t,a=-v/t
		this.inJumpCross = distance < 0 ? -1 : 1
		var realDistance =this.inJumpCross*Math.min(this.catH, Math.abs(distance))
		var catEndingX=this.catX+realDistance
		var catEndingY=this.liftLeftHeight + xyRatio * catEndingX
//		this.catH-= realDistance
		this.jcSpeed = 2 * realDistance / time
		this.jcAcc = -this.jcSpeed / time
		this.catJumpUp(time,height)
		//Tween.create.call(this.catTween, "rotate", 1, false, function() {}, this.catX, this.catY, this.catX, this.catY, 0,Math.PI/2+ xyAngle,time/2)
		//Tween.create.call(this.catTween, "rotate", 1, true, function() {}, catEndingX, catEndingY, catEndingX, catEndingY, 0,Math.PI/2-xyAngle,time/2)
	}
	this.trapGenerator = function() {
		if (this.trip != this.lastTrip) {
			this.lastTrip = this.trip
			var part = rndc(2)
			for (var i = 0; i < part; i++) {
				this.trap.push([rndf(Game.width / part) + i * Math.floor(Game.width / part) + Game.width * this.trip, 10 * rndc(1 + Math.min(10, this.trip))])
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
		//ctx.fillStyle = "red"
		//ctx.textAlign = "left"
		ctx.lineWidth = 5
		ctx.strokeStyle = "red"
		for (var i = 0, length = this.trap.length; i < length; i++) {
			ctx.beginPath()
			var trapX = Game.width + this.trap[i][0] - this.distance
			if (trapX < this.visibleWidth) {
				var visibleTrapWidth = Math.min(this.trap[i][1], this.visibleWidth - trapX)
				ctx.moveTo(trapX, trapX * xyRatio + this.liftLeftHeight+5)
				ctx.lineTo(trapX + visibleTrapWidth, (trapX + visibleTrapWidth) * xyRatio + this.liftLeftHeight+5)
				ctx.stroke()
				//ctx.fillText("坑", trapX, trapX * xyRatio + this.liftLeftHeight - 10)
			}
		}
		ctx.restore()
	}
	this.drawCat = function(ctx) {
		ctx.save()
		ctx.fillStyle = this.catColor
		ctx.textAlign = "center"
		ctx.lineWidth = 5
		ctx.strokeStyle = this.catColor
		ctx.beginPath()
		ctx.moveTo(this.catX, this.catY)
		ctx.lineTo(this.catX, this.catY - this.catH)
		ctx.fillText("猫", this.catX, this.catY - this.catH*(1-this.inFreeze))
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
		ctx.fillText("神经猫2：电梯蹦蹦床" + this.jumpUpCount + "次", 0.5 * Game.width, 0.1 * Game.height)
		ctx.lineWidth = 5
		ctx.beginPath()
		ctx.moveTo(0, this.liftLeftHeight)
		ctx.lineTo(Game.width, this.liftLeftHeight + xyRatio * Game.width)
		ctx.strokeStyle = this.liftColor
		ctx.stroke()
		ctx.restore();
	}
	this.step = function(dt) {
		if (!this.inPause) {
			this.allTime+=dt/1000
			this.avgs=Math.floor(this.jumpUpCount/this.allTime)
			this.distance += speedX * dt / 1000;
			this.trip = Math.floor(this.distance / Game.width)
			this.trapGenerator()
			this.trapUnquip()
			this.checkJump()
			this.checkCoordinate(dt)
				//this.restoreEnergy(dt)
			this.checkFreeze(dt)
			this.declineRange(dt)
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
		//this.drawEnergyBar(ctx)
		this.drawRange(ctx)
	}
}