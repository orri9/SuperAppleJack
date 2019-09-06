/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var spatialManager = {

// "PRIVATE" DATA

_nextSpatialID : 1, // make all valid IDs non-falsey (i.e. don't start at 0)

_entities : [],

// "PRIVATE" METHODS
//
// <none yet>


// PUBLIC METHODS

getNewSpatialID : function() {
    return this._nextSpatialID++;
},

register: function(entity) {
    var pos = entity.getPos();
    var spatialID = entity.getSpatialID();

    this._entities[spatialID] = {entity: entity, posX: pos.posX, posY: pos.posY, dim: entity.getDimensions()};

},

unregister: function(entity) {
    var spatialID = entity.getSpatialID();
    delete this._entities[spatialID];
},

flush : function() {
  this._entities.splice(-this._entities.length);
},

findEntityInRange: function(posX, posY, radius) {

    for(var ID in this._entities) {
        var e = this._entities[ID];
        if (this._entities[ID] != undefined) {
            if (util.square(posX - e.posX) + util.square(posY - e.posY) < util.square(radius+e.radius)) {
                return e.entity;
            }
        }
    }
    return false;

},

findRectInRange: function(posX, posY, dimensions) {
    var halfHeight = dimensions.height / 2;
    var halfWidth = dimensions.width / 2;
    var a1 = {x: posX-halfWidth, y: posY-halfHeight};
    var a2 = {x: posX + halfWidth, y: posY + halfHeight};
    var entities = [];
    for (var ID in this._entities) {
        var e = this._entities[ID];
        if (this._entities[ID] != undefined) {
            var pos = e.pos;
            var dim = e.dim;
            var b1 = { x: e.posX - dim.width/2, y: e.posY - dim.height/2};
            var b2 = { x: e.posX + dim.width/2, y: e.posY + dim.height/2};
            if (a1.x < b2.x && a2.x > b1.x && a1.y < b2.y && a2.y > b1.y) {
                entities.push(e.entity);
            }
        }
    }
    if (entities.length === 0) return false;
    return entities;
},

render: function(ctx) {
    for (var ID in this._entities) {
        var e = this._entities[ID];
        util.strokeBoxCentered(ctx, e.posX, e.posY, e.dim.width, e.dim.height, "red");
    }
}

}
