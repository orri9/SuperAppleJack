// ============
// SPRITE STUFF
// ============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// Construct a "sprite" from the given `image`,
//
function Sprite(image, sx, sy, sw, sh) {
    this.image = image;
    this.sx = sx || 0;
    this.sy = sy || 0;
    this.sWidth = sw || image.width;
    this.sHeight = sh || image.height;

    // tweakable
    this.width = this.sWidth;
    this.height = this.sHeight;

    console.log("making sprite");
};

Sprite.prototype.setDimensions = function(dim) {
    this.width = dim.width;
    this.height = dim.height;
};

Sprite.prototype.drawAt = function (ctx, x, y) {
    ctx.drawImage(this.image,
                  x, y);
};

Sprite.prototype.drawCentredAt = function (ctx, cx, cy, rotation, scale, alpha) {
    if (rotation === undefined) rotation = 0;
    scale = scale || {x: 1, y: 1};
    alpha = alpha || 1.0;
    var w = this.width,
        h = this.height;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.scale(scale.x, scale.y);
    ctx.globalAlpha = alpha;
    // drawImage expects "top-left" coords, so we offset our destination
    // coords accordingly, to draw our sprite centred at the origin
    ctx.drawImage(this.image, this.sx, this.sy, this.sWidth, this.sHeight, -w/2, -h/2, w, h);

    ctx.restore();
};

Sprite.prototype.drawWrappedCentredAt = function (ctx, cx, cy, rotation) {

    // Get "screen width"
    var sw = g_canvas.width;

    // Draw primary instance
    this.drawWrappedVerticalCentredAt(ctx, cx, cy, rotation);

    // Left and Right wraps
    this.drawWrappedVerticalCentredAt(ctx, cx - sw, cy, rotation);
    this.drawWrappedVerticalCentredAt(ctx, cx + sw, cy, rotation);
};

Sprite.prototype.drawWrappedVerticalCentredAt = function (ctx, cx, cy, rotation) {

    // Get "screen height"
    var sh = g_canvas.height;

    // Draw primary instance
    this.drawCentredAt(ctx, cx, cy, rotation);

    // Top and Bottom wraps
    this.drawCentredAt(ctx, cx, cy - sh, rotation);
    this.drawCentredAt(ctx, cx, cy + sh, rotation);
};


function SpriteSheet(image, xSteps, ySteps) {
    xSteps = xSteps || 1;
    ySteps = ySteps || 1;
    this.sprites = [];
    var celWidth = image.width / xSteps;
    var celHeight = image.height / ySteps;
    this.width = celWidth;
    this.height = celHeight;
    this.scale = {x: 1, y: 1};

    for (var j = 0; j < ySteps; j++) {
      for (var i = 0; i < xSteps; i++) {
        this.sprites.push(new Sprite(image, i*celWidth, j*celHeight, celWidth, celHeight));
      }
    }
  };

  SpriteSheet.prototype.drawCentredAt = function(ctx, cx, cy, rotation, index, scale, alpha) {
      alpha = alpha || 1.0;
      scale = scale || this.scale;
      index = index || 0;
      this.sprites[index].drawCentredAt(ctx, cx, cy, rotation, scale, alpha);
  };

  SpriteSheet.prototype.setDimensions = function (dim) {
    for (var i in this.sprites) {
      this.sprites[i].width = dim.width;
      this.sprites[i].height = dim.height;
      this.height = dim.height;
      this.width = dim.width;
    }
  };

  SpriteSheet.prototype.setScale = function(scale) {
    this.scale = scale;
  }
