/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var entityManager = {

// "PRIVATE" DATA


_powers : [],
_jacks   : [],
_blocks  : [],

// "PRIVATE" METHODS
debug_Powerup_Key : keyCode('N'),

_generateBlocks : function() {
    var x = g_canvas.width/2;
    for(var i = 0; i<6; i++) {
      if(this._blocks.length > 0){
        x = this._blocks[this._blocks.length-1].cx;
      }
      if(x < g_canvas.width/2){
        this.generateBlock({cx: x + 100 + Math.random()*250,
                            cy: 500-120*i,
                            width: 100 + Math.random()*50,
                            height : 10});
      }
      else{
        this.generateBlock({cx: x - 100 - Math.random()*250,
                            cy: 500-120*i,
                            width: 100 + Math.random()*50,
                            height : 10});
      }

    }
},

_generateBlock : function() {
    var x = this._blocks[this._blocks.length-1].cx;
    if(x < g_canvas.width/2){
      this.generateBlock({cx: x + 100 + Math.random()*250,
                          cy: 500-120*6,
                          width: 100 + Math.random()*50,
                          height : 10});
    }
    else{
      this.generateBlock({cx: x - 100 - Math.random()*250,
                          cy: 500-120*6,
                          width: 100 + Math.random()*50,
                          height : 10});
    }
},

_getBottomViablePlatform : function() {
    for (var i in this._blocks){
        var blockPos = this._blocks[i].getPos();
        if (blockPos.posY < g_canvas.width * 0.9 && util.isBetween(blockPos.posX, 0, g_canvas.width))
        return this._blocks[i];
    }
},

_findNearestJack : function(posX, posY) {
    var closestJack = null,
        closestIndex = -1,
        closestSq = 1000 * 1000;

    for (var i = 0; i < this._jacks.length; ++i) {

        var thisJack = this._jacks[i];
        var jackPos = thisJack.getPos();
        var distSq = util.wrappedDistSq(
            jackPos.posX, jackPos.posY,
            posX, posY,
            g_canvas.width, g_canvas.height);

        if (distSq < closestSq) {
            closestJack = thisJack;
            closestIndex = i;
            closestSq = distSq;
        }
    }
    return {
        theJack : closestJack,
        theIndex: closestIndex
    };
},

_forEachOf: function(aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
        fn.call(aCategory[i]);
     }
},

// PUBLIC METHODS

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this._categories = [this._powers, this._jacks, this._blocks];
},

init: function() {

    //this._generateJack();
},

fireBullet: function(cx, cy, velX, velY, rotation) {
    this._powers.push(new Bullet({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,

        rotation : rotation
    }));
},

generateJack : function(descr) {
    this._jacks[0] = new Jack(descr);
},

generateBlock : function(descr) {
    this._blocks.push(new Block(descr));
},

_generatePower : function() {
    this._powers.push(new Powerup());
    //console.log("generated powerup");
    //console.log(this._powers);
},

killNearestJack : function(xPos, yPos) {
    var theJack = this._findNearestJack(xPos, yPos).theJack;
    if (theJack) {
        theJack.kill();
    }
},

yoinkNearestJack : function(xPos, yPos) {
    var theJack = this._findNearestJack(xPos, yPos).theJack;
    if (theJack) {
        theJack.setPos(xPos, yPos);
    }
},

resetJack: function() {
    this._forEachOf(this._jacks, Jack.prototype.reset);
},

haltJacks: function() {
    this._forEachOf(this._jacks, Jack.prototype.halt);
},

update: function(du) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {
            var status = aCategory[i].update(du);
            if (status === this.KILL_ME_NOW) {
                // remove the dead guy, and shuffle the others down to
                // prevent a confusing gap from appearing in the array
                aCategory.splice(i,1);
            }
            else {
                ++i;
            }
        }
    }
    if (this._blocks.length === 0) this._generateBlocks();
    else if(this._blocks.length === 6){
      this._generateBlock();
      if(Math.random() < 0.2) this._generatePower();
    }
    if (eatKey(this.debug_Powerup_Key)) this._generatePower();
    if (this._jacks.length === 0) endGame();


},

flush: function() {
  this._jacks.splice(0);
  this._powers.splice(0);
},

render: function(ctx) {

    var debugX = 10, debugY = 100;

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];



        for (var i = 0; i < aCategory.length; ++i) {

            aCategory[i].render(ctx);
            //debug.text(".", debugX + i * 10, debugY);

        }
        debugY += 10;
    }
}

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
