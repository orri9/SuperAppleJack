// =========
// ASTEROIDS
// =========
/*

A sort-of-playable version of the classic arcade game.


HOMEWORK INSTRUCTIONS:

You have some "TODO"s to fill in again, particularly in:

spatialManager.js

But also, to a lesser extent, in:

Powerup.js
Bullet.js
Jack.js


...Basically, you need to implement the core of the spatialManager,
and modify the Powerup/Bullet/Jack to register (and unregister)
with it correctly, so that they can participate in collisions.

Be sure to test the diagnostic rendering for the spatialManager,
as toggled by the 'X' key. We rely on that for marking. My default
implementation will work for the "obvious" approach, but you might
need to tweak it if you do something "non-obvious" in yours.
*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ====================
// CREATE INITIAL SHIPS
// ====================

function createInitialPlatforms() {

    entityManager._generateBlocks();
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {

    processDiagnostics();

    entityManager.update(du);

}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useGravity = true;
var g_enableCollisions = true;
var g_useAveVel = true;
var g_renderSpatialDebug = false;

var KEY_MIXED   = keyCode('M');;
var KEY_GRAVITY = keyCode('G');
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');

var KEY_HALT  = keyCode('H');
var KEY_RESET = keyCode('R');

var KEY_0 = keyCode('0');

var KEY_K = keyCode('K');

function processDiagnostics() {

    if (eatKey(KEY_MIXED))
        g_allowMixedActions = !g_allowMixedActions;

    if (eatKey(KEY_GRAVITY)) g_useGravity = !g_useGravity;

    if (eatKey(KEY_AVE_VEL)) g_useAveVel = !g_useAveVel;

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    if (eatKey(KEY_HALT)) entityManager.haltJacks();

    if (eatKey(KEY_RESET)) entityManager.resetJack();
}

var music2 = new Audio("sounds/prufa.mp3");
function playMusic(){

        music2.play();
        var slowDown = g_settings.isTimeSlowed ? 0.5 : 1.0;
        music2.playbackRate= (0.5+g_settings.scrlSpdMult/2) * slowDown;
        music2.volume = g_settings.musicVolume;
};

// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {

    renderBackground(ctx);
    entityManager.render(ctx);

    if (g_renderSpatialDebug) spatialManager.render(ctx);
}

function renderBackground(ctx) {
  ctx.save();
  var grd = ctx.createLinearGradient(0, 0, 0, 600);
  grd.addColorStop(0, "DeepSkyBlue");
  grd.addColorStop(1, "LightSkyBlue");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 600, 600);
  ctx.restore();
}




// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        jack   : "./sprites/sprite2.png",
        power   : "https://www.scirra.com/images/articles/healthdecrease.png",
        pDoubleJump  : "./sprites/DoubleJump.png",
        pJetpack     : "./sprites/jetpack.png",
        pLowgrav     : "./sprites/lowgrav.png",
        pSlowmo      : "./sprites/slowmo.png",
        block  : "./sprites/block.jpg",
        start : "./sprites/start.jpg"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};

function endGame() {
  ui.resetScore();
  spatialManager.flush();
  entityManager.flush();
  g_settings.reset();
  ui.menu = true;
}




function preloadDone() {

    g_sprites.jack  = new SpriteSheet(g_images.jack, 3);
    g_sprites.power  = new SpriteSheet(g_images.power);
    g_sprites.powers = [
      new SpriteSheet(g_images.pDoubleJump),
      new SpriteSheet(g_images.pJetpack),
      new SpriteSheet(g_images.pLowgrav),
      new SpriteSheet(g_images.pSlowmo)
    ];

    console.log(g_sprites.power);

    g_sprites.bullet = new SpriteSheet(g_images.jack);
    g_sprites.block = new SpriteSheet(g_images.block);
    g_sprites.bullet.scale = {x:1, y:1};

    g_sprites.jack.scale = {x:1, y:1};
    g_sprites.power.scale = {x:0.25, y:0.25};

    entityManager.init();
    createInitialPlatforms();

    main.init();
}



// Kick it off
requestPreloads();
