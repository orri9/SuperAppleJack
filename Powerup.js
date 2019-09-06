// ====
// ROCK
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Powerup(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.randomisePosition();

    // Default sprite and scale, if not otherwise specified
    this.sprite = this.sprite || g_sprites.power;
    this.scale  = this.scale  || this.sprite.scale;
    this.height = this.height || this.sprite.height*this.scale.x/3;
    this.width = this.width || this.sprite.width*this.scale.y/3;
    this.hasPower = true;
    this.velX = Math.random()*2 - 1;
    this.velY = 0;

    this.type = Math.floor(Math.random()*4);
    console.log(this.type);
    this.style = this.styles[this.type] || "GRAY";
    this.duration = this.durations[this.type];

    spatialManager.register(this);

/*
    // Diagnostics to check inheritance stuff
    this._powerProperty = true;
    console.dir(this);
*/

};

Powerup.prototype = new Entity();

//Just for reference:
Powerup.prototype.types = ["double jump", "boost", "low gravity", "slow motion"];
//corresponding:
Powerup.prototype.styles = ["RED", "YELLOW", "BLUE", "PURPLE"];
Powerup.prototype.sprites =

Powerup.prototype.durations = [
    1,
    1 * SECS_TO_NOMINALS,
    10 * SECS_TO_NOMINALS,
    8 * SECS_TO_NOMINALS / 2
]

Powerup.prototype.randomisePosition = function () {
    // Powerup randomisation defaults (if nothing otherwise specified)
    this.cx = Math.random() * g_canvas.width;
    this.cy = (Math.random()-1) * g_canvas.height;
    this.rotation = this.rotation || 0;
};

Powerup.prototype.randomiseVelocity = function () {
    return 0;
};

Powerup.prototype.update = function (du) {

    spatialManager.unregister(this);
    if (this._isDeadNow) return entityManager.KILL_ME_NOW;

    this.shift(du);
    var accelY = this.computeGravity();
    this.applyAccel(0, accelY, du);

    //this.cy += 2* du;

    spatialManager.register(this);
    //this.wrapPosition();

    // TODO: YOUR STUFF HERE! --- (Re-)Register

};

Powerup.prototype.computeGravity = function() {
  var grav = g_useGravity ? NOMINAL_GRAVITY : 0;
  return grav * gravityMultiplier;
};
Powerup.prototype.applyAccel = function(accelX, accelY, du) {
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
            //hitEntity.kill();
            var pos = hitEntity.getPos(),
              dim = hitEntity.getDimensions(),
              intersectionX = Math.abs(pos.posX - nextX),
              intersectionY = Math.abs(pos.posY - nextY),
              heights = this.height / 2 + dim.height / 2,
              widths = this.width / 2 + dim.width / 2,
              overlapX = widths - intersectionX,
              overlapY = heights - intersectionY;
            if (overlapY > overlapX) {

                  this.velX *= -0.7;
                  intervalVelX = 0;
                  this.velY *= 0.7;
                  intervalVelY *= 0.7;
            } else {
                this.velY *= - 0.7;
                intervalVelY = 0;
                this.velX *= 0.7;
                intervalVelX *= 0.7;
              }
              }
            }
          }
        }


  this.cx += du * intervalVelX;
  this.cy += du * intervalVelY;
};

Powerup.prototype.limitToCanvas = function() {
  if (this.cx < this.width / 2) {
    this.cx = this.width / 2;
    this.velX *= -0.7;
  } else if (this.cx > g_canvas.width - this.width / 2) {
    this.cx = g_canvas.width - this.width / 2;
    this.velX *= 0.7;
  }
};

// HACKED-IN AUDIO (no preloading)
Powerup.prototype.splitSound = new Audio(
  "sounds/rockSplit.ogg");
Powerup.prototype.evaporateSound = new Audio(
  "sounds/rockEvaporate.ogg");

Powerup.prototype.takeBulletHit = function () {
    this.kill();

    if (this.scale > 0.25) {
        this._spawnFragment();
        this._spawnFragment();

        this.splitSound.play();
    } else {
        this.evaporateSound.play();
    }
};

Powerup.prototype.invokeEffect = function(receiver) {
   if(this.hasPower){
     var oldVal = receiver.powerups[this.type] || 0;
     receiver.powerups[this.type] = this.duration + oldVal;
     this.hasPower = false;
     this.kill();
   }

};

Powerup.prototype.render = function (ctx) {
    //var origScale = this.sprite.scale;
    //this.sprite.scale = this.scale;
    util.fillBoxCentered(ctx, this.cx, this.cy, this.width, this.height, this.style);
    g_sprites.powers[this.type].drawCentredAt(ctx, this.cx, this.cy);
    // TIL AD TEIKNA SPRITE
    //this.sprite.drawCentredAt(
    //    ctx, this.cx, this.cy, this.rotation, 0, {x:0.25, y:0.25}
    //);
};
