/**
 * @module  plot-grid/gl2d
 *
 * Webgl grid renderer by copying canvas2d
 */
'use strict';


const Grid = require('./src/core');
const inherits = require('inherits');
const Canvas2DGrid = require('./2d');

module.exports = GLGrid;


inherits(GLGrid, Grid);


/** @constructor */
function GLGrid (opts) {
	if (!(this instanceof GLGrid)) return new GLGrid(opts);


	opts = opts || {};
	opts.autostart = false;
	let vp = opts.viewport;
	opts.viewport = null;
	opts.fit = true;

	Grid.call(this, opts);

	//canvas 2d is used as a texture, that’s it
	opts.container = null;
	opts.viewport = vp;
	opts.fit = false;
	this.grid = new Canvas2DGrid(opts);
	this.grid.canvas.width = this.canvas.width;
	this.grid.canvas.height = this.canvas.height;
	this.grid.resize();

	this.on('resize', (ctx, vp) => {
		this.grid.canvas.width = this.canvas.width;
		this.grid.canvas.height = this.canvas.height;
		this.grid.resize();
		this.render();
	});
	this.on('update', (opts) => {
		//FIXME: this dude automatically draws 2d grid, do something about that
		this.grid.update(opts);
		this.render();
	});
	this.on('draw', (ctx, vp) => {
		this.grid.clear();
		this.grid._draw();
		this.setTexture('grid', this.grid.canvas);
	});
}


GLGrid.prototype.context = {
	type: 'webgl',
	antialias: false
};


GLGrid.prototype.frag = `
	precision highp float;

	uniform vec4 viewport;
	uniform sampler2D grid;

	void main () {
		vec2 coord = (gl_FragCoord.xy - viewport.xy) / viewport.zw;
		vec4 color = texture2D(grid, vec2(coord.x, 1. - coord.y));

		gl_FragColor = color;
	}
`;

