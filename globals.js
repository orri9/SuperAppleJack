// =======
// GLOBALS
// =======
/*

Evil, ugly (but "necessary") globals, which everyone can use.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

// The "nominal interval" is the one that all of our time-based units are
// calibrated to e.g. a velocity unit is "pixels per nominal interval"
//
var NOMINAL_UPDATE_INTERVAL = 16.666;

// Multiply by this to convert seconds into "nominals"
var SECS_TO_NOMINALS = 1000 / NOMINAL_UPDATE_INTERVAL;

var g_settings = {
  reset : function() {
    this.gravityMultiplier = 1;
    this.scrlSpdMult = 1;
    this.isTimeSlowed = false;
  },
  toggleTimeSlow : function() {
      this.isTimeSlowed = !this.isTimeSlowed;
      this.timeRecentlyChanged = true;
  },
  setGravity : function(val) {
    this.gravityMultiplier = val;
  },

  increaseSpeed : function(du) {
    this.scrlSpdMult += 0.0001*du;
  },

  jumpVolume : 1,
  musicVolume : 0.4,
  timesPlayed : 1,
  toggleMute : function() {
    if (this.jumpVolume === 1){
      this.jumpVolume = 0;
      this.musicVolume = 0;
    }
    else {
      this.jumpVolume = 1;
      this.musicVolume = 0.4;
    }
  }
};

g_settings.reset();
