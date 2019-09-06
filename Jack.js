// ==========
// JACK STUFF
// ==========
"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Jack(descr) {

  // Common inherited setup logic from Entity
  this.setup(descr);
  this.score = 0;

  // Default sprite, if not otherwise specified
  this.sprite = this.sprite || g_sprites.jack;
  this.sprite.setDimensions({
    width: 77,
    height: 77
  });
  this.height = this.sprite.height;
  this.width = this.sprite.width * 0.6;
  this.moveToViablePosition();
  this.isFalling = true;
  this._isDeadNow = false;



  // Set normal drawing scale, and warp state off
  this._scale = 1;
  this.life = 2;
  this.isDeathImmune = true;
  this.blinkDuration = 2 * SECS_TO_NOMINALS;

  this.spriteState = 0;

  this.powerups = [0, 0, 0, 0];
};

Jack.prototype = new Entity();

Jack.prototype.KEY_THRUST = 'W'.charCodeAt(0);
Jack.prototype.KEY_FIRE = ' '.charCodeAt(0);



Jack.prototype.KEY_LEFT = 'A'.charCodeAt(0);
Jack.prototype.KEY_RIGHT = 'D'.charCodeAt(0);
Jack.prototype.KEY_JUMP = keyCode('W');

// Initial, inheritable, default values
Jack.prototype.rotation = 0;
Jack.prototype.cx = 200;
Jack.prototype.cy = 200;
Jack.prototype.velX = 0;
Jack.prototype.velY = 0;
Jack.prototype.launchVel = 2;
Jack.prototype.numSubSteps = 1;
Jack.prototype.jumpStrength = 1;

Jack.prototype.toggleTimeDilation = function() {
  g_settings.toggleTimeSlow();
}

// HACKED-IN AUDIO (no preloading)
Jack.prototype.jumpSound = new Audio("sounds/jump.mp3");
Jack.prototype.jumpSound.volume = g_settings.jumpVolume;

Jack.prototype.update = function(du) {
  this.powerups[1] += 0.1 *  du;
  if (g_settings.isTimeSlowed && this.powerups[3] < 0 || !g_settings.isTimeSlowed && this.powerups[
      3] > 0) g_settings.toggleTimeSlow();
  if (g_settings.isTimeSlowed) this.powerups[3] -= du;
  if ( this.powerups[2] > 0)
  { g_settings.setGravity(0.5);
    this.powerups[2] -= du;
  }
    else  g_settings.setGravity(1);


  spatialManager.unregister(this);
  if (this._isDeadNow) return entityManager.KILL_ME_NOW;

  // Perform movement substeps
  var steps = this.numSubSteps;
  var dStep = du / steps;
  for (var i = 0; i < steps; ++i) {
    this.computeSubStep(dStep);
  }

  spatialManager.register(this);
  this.adjustSpriteIndex();
  ui.incrementScore(du);
  g_settings.increaseSpeed(du);
};

Jack.prototype.slowDownTime = function() {
  //somehow...slow down time! Shrink the DU!
};


Jack.prototype.computeSubStep = function(du) {

  var thrust = this.computeThrustMag();

  // Apply thrust directionally, based on our rotation
  var accelX = 0;
  var accelY = 0;

  accelY += this.computeGravity();
  accelY += this.computeBoost(du);
  accelX += this.run();
  this.jump();
  this.applyAccel(accelX, accelY, du);
  this.limitToCanvas();
  this.blinkDuration -= du;


  this.shift(du);
  //this.wrapPosition();
};



Jack.prototype.adjustSpriteIndex = function() {
  var velY = this.velY;
  var velX = this.velX;
  if (this.spriteState == this.sprite.sprites.length) this.spriteState =
    0;

  if (velY != 0) this.spriteState = 0;

  if (velX < 0) {
    this.sprite.setScale({
      x: -1,
      y: 1
    });
  } else if (velX > 0) {
    this.sprite.setScale({
      x: 1,
      y: 1
    });
  }
  if (Math.abs(velY) < 0.1 && Math.abs(velX) < 0.1 && !this.isFalling) {
    this.spriteState = 1;
  }

};

var NOMINAL_GRAVITY = 0.6;
var gravityMultiplier = 1.0;

Jack.prototype.computeGravity = function() {
  var grav = g_useGravity ? NOMINAL_GRAVITY : 0;
  return grav * g_settings.gravityMultiplier;


};

var NOMINAL_THRUST = +0.2;
var NOMINAL_RETRO = -0.1;

Jack.prototype.computeThrustMag = function() {

  var thrust = 0;

  if (keys[this.KEY_THRUST]) {
    thrust += NOMINAL_THRUST;
  }
  if (keys[this.KEY_RETRO]) {
    thrust += NOMINAL_RETRO;
  }

  return 0;
};

var NOMINAL_JUMP = 12;

Jack.prototype.jump = function() {
  if (eatKey(this.KEY_JUMP) && (!this.isFalling || this.powerups[0])) {
    this.velY -= NOMINAL_JUMP * this.jumpStrength * 1.1;
    this.jumpSound.volume = g_settings.jumpVolume;
    this.jumpSound.play();
    if (this.isFalling) this.powerups[0] -= 1;
    this.isFalling = true;
  }
};

Jack.prototype.computeBoost = function(du) {
  if (keys[this.KEY_FIRE] && this.powerups[1] > 0) {
    this.powerups[1] -= du;
    return NOMINAL_GRAVITY * -1.3;
  } else
    return 0;
};

Jack.prototype.applyAccel = function(accelX, accelY, du) {
  if (this.velY === 0) this.isFalling = false;
  else this.isFalling = true;

  // u = original velocity
  var oldVelX = this.velX;
  var oldVelY = this.velY;

  // v = u + at
  this.velX += accelX * du;
  this.velY += accelY * du;

  // v_ave = (u + v) / 2
  var aveVelX = (oldVelX + this.velX) / 2;
  var aveVelY = (oldVelY + this.velY) / 2;

  // Decide whether to use the average or not (average is best!)
  var intervalVelX = g_useAveVel ? aveVelX : this.velX;
  var intervalVelY = g_useAveVel ? aveVelY : this.velY;

  // s = s + v_ave * t
  var nextX = this.cx + intervalVelX * du;
  var nextY = this.cy + intervalVelY * du;

  // collide
  if (g_enableCollisions) {
    var rects = this.findHitRectEntity(nextX, nextY);
    if (rects) {
      for (var i in rects) {
        var hitEntity = rects[i];
        if (hitEntity.isSolid) {
          var pos = hitEntity.getPos(),
            dim = hitEntity.getDimensions(),
            intersectionX = Math.abs(pos.posX - nextX),
            intersectionY = Math.abs(pos.posY - nextY),
            heights = this.height / 2 + dim.height / 2,
            widths = this.width / 2 + dim.width / 2,
            overlapX = widths - intersectionX,
            overlapY = heights - intersectionY;
          if (overlapY > overlapX && !this.isDeathImmune) {
            if (this.cx < pos.posX) {
              this.cx = nextX - overlapX;
              if (this.velX > 0) {
                this.velX = 0;
                intervalVelX = 0;
              }
              //console.log("hit left");
              //collided with
            } else {
              this.cx = nextX + overlapX;
              if (this.velX < 0) {
                this.velX = 0;
                intervalVelX = 0;
              }
              //console.log("hit right");
            }
          } else {
            if (this.cy < pos.posY) {
              this.cy = nextY - overlapY;
              // if(this.isFalling) console.log("landing");
              this.isFalling = false;
              this.isDeathImmune = false;
              if (intervalVelY > 0) {
                this.velY = 0;
                intervalVelY = 0;
              }
              //console.log("hit top");
              //this.shift(du, true);
            } else if (!this.isDeathImmune) {
              this.cy = nextY + overlapY;

              if(intervalVelY < 0) {
                  this.velY *= -0.3;
                  intervalVelY = 0;
              }
              //this.shift(du, true);
            }

            this.shift(du, true);
          }
        } else {
          hitEntity.invokeEffect(this);
        }

      }
    }
  }

  this.cx += du * intervalVelX;
  this.cy += du * intervalVelY;
  if (Math.abs(this.velY) > 0.1) {
    //if (!this.isFalling) console.log("no longer landed");
    this.isFalling = true;
  }
};

Jack.prototype.limitToCanvas = function() {
  if (this.blinkDuration > 0 && this.cy > g_canvas.height - this.height/2) {
    this.cy = g_canvas.height - this.height/2;
    this.velY = 0;
    this.isFalling = false;
  } else if (this.cy < 0 - this.height) {
    this.cy = 0 - this.height;
    this.velY = 0;
  }
  if (this.cx < this.width / 2) {
    this.cx = this.width / 2;
    this.velX = 0;
  } else if (this.cx > g_canvas.width - this.width / 2) {
    this.cx = g_canvas.width - this.width / 2;
    this.velX = 0;
  }
};


Jack.prototype.kill = function() {
  if (this.life >= 0 && this.blinkDuration <= 0) {
    this.blinkDuration = 2 * SECS_TO_NOMINALS;
    this.life--;
    this.moveToViablePosition();
    this.halt();
    this.isFalling = true;
    this.isDeathImmune = true;
    this.alphaIncreasing = false;
  } else {
      this._isDeadNow = true;
      ui.hiScore();
   }
};

Jack.prototype.moveToViablePosition = function() {
  var newPos = entityManager._getBottomViablePlatform().getPos();
  this.cx = newPos.posX;
  this.cy = newPos.posY - this.height;
}


Jack.prototype.getRadius = function() {
  return (this.sprite.width / 2) * 0.9;
};

Jack.prototype.takeBulletHit = function() {
  this.warp();
};

Jack.prototype.reset = function() {

  this.halt();
};

Jack.prototype.halt = function() {
  this.velX = 0;
  this.velY = 0;
};

var NOMINAL_MAX_VELX = 12;
var HACC_STEPS = SECS_TO_NOMINALS * 0.2;
var HDEC_STEPS = SECS_TO_NOMINALS * 0.1;

Jack.prototype.run = function() {
  var accelerationAuth = 1;
  var brakingAuth = 1;
  if (this.isFalling) {
    accelerationAuth /= 3;
    brakingAuth /= 5;
  }
  var xAcc = 0;
  if (keys[this.KEY_LEFT] && this.velX > -NOMINAL_MAX_VELX) {
    xAcc = accelerationAuth * NOMINAL_MAX_VELX / -HACC_STEPS
    this.spriteState++;
  } else if (keys[this.KEY_RIGHT] && this.velX < NOMINAL_MAX_VELX) {
    xAcc = accelerationAuth * NOMINAL_MAX_VELX / HACC_STEPS;
    this.spriteState++;
  } else {
    xAcc = -this.velX * brakingAuth / HDEC_STEPS;
    this.spriteState = 1;
  }
  return xAcc;
};

Jack.prototype.lastAlpha = 1.0;
Jack.prototype.alphaIncreasing = true;
Jack.prototype.render = function(ctx) {
  //var origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  //  this.sprite.scale = this._scale;
  var alpha = this.lastAlpha;

  if (this.blinkDuration < 0) alpha = 1.0;
  else {
    var diff = this.alphaIncreasing ? 0.2 : -0.2;
    if (this.alphaIncreasing && alpha < 0.9 || !this.alphaIncreasing && alpha > 0.1) alpha = alpha + diff;
    else this.alphaIncreasing = !this.alphaIncreasing
  }
  ui.updateStatusBars(this.powerups);
  this.sprite.drawCentredAt(
    ctx, this.cx, this.cy, this.rotation, this.spriteState, false, alpha);
  this.lastAlpha = alpha;
  //this.sprite.scale = origScale;
};


// stigagjöf fer eftir hraða upp og stigum (hæð^2 / tími + pickup)
//
