var ui = {

  score : 0,
  highScore : 0,
  menu : true,
  EXIT_MENU : 'S'.charCodeAt(0),
  bars : [],

  update : function(du) {
    return;
  },

  render : function(ctx) {
    if (this.menu) this.renderMenu(ctx);
    else this.renderUI(ctx);
  },

  resetScore : function() {
    this.score = 0;
  },

  getScore : function(){
      return Math.floor(this.score);
  },

  hiScore : function() {
    if (this.score > this.highScore) this.highScore = this.score;
  },

  incrementScore : function(du){
      this.score += 5 / SECS_TO_NOMINALS * du;
  },


  renderMenu : function(ctx){
      entityManager.resetJack();
      //reseta hraða
      ctx.save();
      ctx.fillStyle = "#00FFFF";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#228B22";
      ctx.fillRect(0, 400, ctx.canvas.width, 200);
      ctx.drawImage(g_images.start, 46, 150);
      ctx.drawImage(g_images.jack, 0, 0, 154, g_images.jack.height, 100, 360, 154/1.3, g_images.jack.height/1.3);
      ctx.fillStyle = "BLACK";
      var oldAlign = ctx.textAlign;
      ctx.textAlign = "center";
      ctx.font = "26px monospace";
      ctx.fillText("Press \"S\" to start", g_canvas.width / 2, 120);

      if(this.highScore > 0) {
        ctx.fillText("Highscore: " + Math.floor(this.highScore), g_canvas.width / 2, 80);
      }
      ctx.font = "20px monospace";
      ctx.textAlign = oldAlign;
      ctx.fillText("\"P\" to pause", 350, 440);
      ctx.fillText("\"W\" to jump", 350, 470);
      ctx.fillText("\"A\" to go left", 350, 500);
      ctx.fillText("\"D\" to go right", 350, 530);
      ctx.fillText("SPACE to boost", 350, 560);
      ctx.restore();

  },

  renderUI : function(ctx) {
    this.renderStatusBars(ctx);
    this.renderScore(ctx);
  },

  renderScore : function(ctx) {
    ctx.save();
    ctx.fillStyle = "WHITE";
    ctx.font = "26px monospace";
    ctx.fillText("score:" + this.getScore(), 20, 20);
    ctx.restore();
  },

  statusColors : Powerup.prototype.styles,

  renderStatusBars : function(ctx) {
    for(var i in this.bars) {
      if (this.bars[i] && this.bars[i] > 0){
        var value = this.bars[i];
        var w = g_canvas.width;
        var h = g_canvas.height;
        var barW = 7;
        var barH = 50;
        var hspacing = 3;
        var vspacing = 4;
        var style = this.statusColors[i];
        ctx.save();
        ctx.globalAlpha = 0.6;
        if (i == 0) {
          hspacing = 3 + 3*i + barW*i
          for (var j=1; j <= value; j++) {
            var thisPos = w // x y w h
            util.fillBox(ctx, hspacing, h - barH * j, barW,  barH - vspacing, style);
          }
        }
        else if (i == 1){
          hspacing = 3 + 3*i + barW*i
          util.fillBox(ctx, hspacing, h - vspacing - barH * value / SECS_TO_NOMINALS, barW,  barH * value / SECS_TO_NOMINALS, style)

      }
      else if (i > 1){
        hspacing = w - (3 + 3*(i-2) + barW*(i-2)) - barW;
        util.fillBox(ctx, hspacing, h - vspacing - barH * value / SECS_TO_NOMINALS, barW,  barH * value / SECS_TO_NOMINALS, style)
      }
      ctx.restore();
      }
    }
  },

  updateStatusBars : function(bars) {
    this.bars = bars;
  }
};
