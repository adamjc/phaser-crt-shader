const Example = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Example () {
    Phaser.Scene.call(this, { key: 'example' })
  },
  preload: preload,
  create: create,
  applyPipeline: applyPipeline,
  update: update
})

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 320,
  scene: [ Example ]
}

const game = new Phaser.Game(config)

function preload () {
}

function create () {
  const graphics = this.add.graphics({ fillStyle: { color: 0xffffff }})
  graphics.fillStyle(0xee55dd)
  const rect = new Phaser.Geom.Rectangle(0, 0, 640, 320)
  graphics.fillRectShape(rect)
  for (var i = 0; i < this.game.config.width; i += 20) {
    for (var j = 0; j < this.game.config.height; j += 20) {
      const rect = new Phaser.Geom.Rectangle(i, j, 20, 20)
      if (i % 40) {
        graphics.fillStyle(0xffffff)
        graphics.fillRectShape(rect)
      }
    }
  }

  this.pipeline = this.game.renderer.addPipeline('Pipeline', new Pipeline(this.game))
  this.applyPipeline()
}

function update () {
}

function applyPipeline () {
  this.cameras.main.setRenderToTexture(this.pipeline)
}

const shader = `
  precision mediump float;

  uniform float time;
  uniform vec2 resolution;
  uniform sampler2D uMainSampler;

  varying vec2 outTexCoord;

  vec2 crt (vec2 coord) {
    // lower == more curved
    float straightness = 2.1;

    // put in symmetrical coords
    coord = coord - 0.5;

    // shrink
    coord *= 1.1;	

    // deform coords
    coord.x *= 1.0 + pow(coord.y / (straightness + 0.5), 2.0);
    coord.y *= 1.0 + pow(coord.x / straightness, 2.0);

    // transform back to 0.0 - 1.0 space
    coord  = coord + 0.5;

    return coord;
  }

  void main () {
    vec2 crtCoords = crt(outTexCoord);

    if (crtCoords.x < 0.0 || crtCoords.x > 1.0 || crtCoords.y < 0.0 || crtCoords.y > 1.0) {
      return;
    }

    gl_FragColor = texture2D(uMainSampler, crtCoords);
  }
`

const Pipeline = new Phaser.Class({
  Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
  initialize: function Pipeline (game) {
    Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
      game: game,
      renderer: game.renderer,
      fragShader: shader
    })
  }
})