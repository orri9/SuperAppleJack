// ====
// BLOCK
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// A generic contructor which accepts an arbitrary descriptor object
function Block(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    //this.randomisePosition();
    //this.randomiseVelocity();


    // Default sprite and scale, if not otherwise specified
    this.sprite = g_sprites.block;
    this.scale  = this.scale  || 1;
    this.height = this.height || this.sprite.height;
    this.width = this.width || this.sprite.width;
    this.isSolid = true;

    spatialManager.register(this);

/*
    // Diagnostics to check inheritance stuff
    this._BlockProperty = true;
    console.dir(this);
*/

};

Block.prototype = new Entity();

Block.prototype.randomisePosition = function () {
    // Block randomisation defaults (if nothing otherwise specified)
    this.cx = this.cx || Math.random() * g_canvas.width;
    this.cy = this.cy || Math.random() * g_canvas.height;
    this.rotation = this.rotation || 0;
};

Block.prototype.getRadius = function () {
    return this.scale * (this.sprite.width / 2) * 0.9;
};

Block.prototype.update = function (du) {
    spatialManager.unregister(this);
    if (this._isDeadNow) return entityManager.KILL_ME_NOW;
    this.shift(du);
    spatialManager.register(this);
};

Block.prototype.render = function (ctx) {
    //var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    //this.sprite.scale = this.scale;
    //this.sprite.drawWrappedCentredAt(
    //    ctx, this.cx, this.cy, 0
    //);
    util.fillBoxCentered(ctx, this.cx, this.cy, this.width, this.height, "GREEN");
    this.sprite.drawCentredAt(ctx, this.cx-this.width/2+this.sprite.width/2, this.cy, 0, 0);
    this.partialPlatform(this.width-this.sprite.width, this.cx - this.width/2 + this.sprite.width, this.cy - this.sprite.height/2);


};

Block.prototype.partialPlatform = function(sWidth, posX,posY){
    ctx.drawImage(g_images.block, 0, 0, sWidth, g_images.block.height,
    posX, posY, sWidth, g_images.block.height);
};
