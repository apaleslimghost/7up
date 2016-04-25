import range from 'lodash.range';
import flatMap from '@quarterto/flatmap';
import flatMapUniq from '@quarterto/flat-map-uniq';
import AnimationLoop from '@quarterto/animation-loop';

const struct = (...fields) => class {
	constructor(...args) {
		console.assert(args.length === fields.length, 'wrong number of arguments');
		args.forEach((arg, i) => {
			this[fields[i]] = arg;
		})
	}
}

class Point extends struct('x', 'y') {
	static points = {};

	constructor(...args) {
		super(...args);
		// hax for Point(1,1) === Point(1,1)
		const [x, y] = args;
		if(Point.points[x]) {
			if(Point.points[x][y]) {
				return Point.points[x][y];
			}

			Point.points[x][y] = this;
		} else {
			Point.points[x] = {[y]: this};
		}
	}

	static from({x, y}) {
		return new Point(x, y);
	}

	add(point) {
		return new Point(
			this.x + point.x,
			this.y + point.y
		);
	}

	toString() {
		return `(${this.x}, ${this.y})`;
	}
}

class BoundingGroup extends struct('children') {
	pixels() {
		return flatMapUniq(this.children, child => child.pixels());
	}
}

class BoundingRect extends struct('origin', 'opposite') {
	pixels() {
		return flatMap(range(this.origin.x, this.opposite.x), x =>
			range(this.origin.y, this.opposite.y).map(y => Point.from({x,y}))
		);
	}

	toString() {
		return this.origin.toString() + '→' + this.opposite.toString();
	}
}

class NullBoundingBox {
	pixels() {
		return [];
	}
}

class Sprite extends struct('_origin', 'palette') {
	pixels = [];
	stale = true;
	lastBoundingBox = new NullBoundingBox();

	get boundingBox() {
		return new BoundingRect(
			this.origin,
			this.origin.add({
				x: this.width,
				y: this.height,
			})
		);
	}

	lastBoundingBox = null;

	get width() {
		return this.pixels[0].length;
	}

	get height() {
		return this.pixels.length;
	}

	changedPixels() {
		if(this.lastBoundingBox) {
			const group = new BoundingGroup([this.lastBoundingBox, this.boundingBox]);
			return group.pixels();
		}

		return this.boundingBox.pixels();
	}

	getPixel(x, y) {
		const rx = x - this.origin.x;
		const ry = y - this.origin.y;
		if(rx < 0 || ry < 0 || rx >= this.width || ry >= this.height) {
			return false;
		}
		return this.palette[this.pixels[rx][ry]];
	}

	get origin() {
		return this._origin;
	}

	set origin(origin) {
		this.stale = true;
		this.lastBoundingBox = this.boundingBox;
		this._origin = origin;
	}

	move(origin) {
		this.origin = origin;
	}
}

class TiledSprite extends Sprite {
	maxWidth = 500;
	maxHeight = 500;

	getPixel(x, y) {
		return super.getPixel(x % this.width, y % this.height);
	}

	get boundingBox() {
		return new BoundingRect(
			this.origin,
			this.origin.add({
				x: this.maxWidth,
				y: this.maxHeight,
			})
		);
	}
}

class AnimatedSprite extends Sprite {
	_frame = 0;
	frames = [];
	timings = [];

	get pixels() {
		return this.frames[this.frame];
	}

	set pixels(nah) {}

	get length() {
		return this.timings.reduce((a,t) => a + t, 0);
	}

	get frame() {
		return this._frame;
	}

	set frame(frame) {
		this._frame = frame;
		this.stale = true;
	}

	tick(t) {
		const tb = t % this.length;
		let acc = 0;
		for(const [i, timing] of this.timings.entries()) {
			acc += timing;
			if(tb < acc) {
				this.frame = i;
				return;
			}
		}
	}
}

class Circle extends Sprite {
	pixels = [
		[0,0,0,0,1,1,0,0,0,0],
		[0,0,1,1,1,1,1,1,0,0],
		[0,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,0],
		[1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1],
		[0,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,0],
		[0,0,1,1,1,1,1,1,0,0],
		[0,0,0,0,1,1,0,0,0,0],
	];
}

class What extends AnimatedSprite {
	frames = [[
		[0,0,0,0,1,1,0,0,0,0],
		[0,0,1,1,1,1,1,1,0,0],
		[0,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,0],
		[1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1],
		[0,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,0],
		[0,0,1,1,1,1,1,1,0,0],
		[0,0,0,0,1,1,0,0,0,0],
	], [
		[0,0,0,0,1,1,0,0,0,0],
		[0,0,1,1,1,1,1,1,0,0],
		[0,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,2,2,1,1,1,0],
		[1,1,1,2,2,2,2,1,1,1],
		[1,1,1,2,2,2,2,1,1,1],
		[0,1,1,1,2,2,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,0],
		[0,0,1,1,1,1,1,1,0,0],
		[0,0,0,0,1,1,0,0,0,0],
	]];

	timings = [500, 500];
}

class Layer extends struct('objects', 'blendMode') {
	get boundingBox() {
		return new BoundingGroup(this.objects.map(object => object.boundingBox));
	}

	changedPixels() {
		return flatMapUniq(this.objects.filter(object => object.stale), object => object.changedPixels());
	}

	getPixel(x, y) {
		for(const object of this.objects) {
			const pixel = object.getPixel(x, y);
			if(pixel) {
				object.stale = false;
				return pixel;
			}
		}

		return false;
	}

	drawPixel(ctx, {x, y}) {
		ctx.globalCompositeOperation = this.blendMode || 'source-over';
		ctx.fillStyle = this.getPixel(x, y) || 'transparent';
		ctx.fillRect(x, y, 1, 1);
	}
}

class Background extends struct('color') {
	get stale() {
		return false;
	}

	set stale(nah) {}

	changedPixels() {
		return [];
	}

	getPixel() {
		return this.color;
	}
}

class Canvas extends struct('layers') {
	get boundingBox() {
		return new BoundingGroup(this.layers.map(layer => layer.boundingBox));
	}

	changedPixels() {
		return flatMapUniq(this.layers, layer => layer.changedPixels());
	}

	draw(ctx) {
		this.changedPixels().forEach(pixel => {
			this.drawPixel(ctx, pixel);
		});
	}

	drawPixel(ctx, pixel) {
		this.layers.forEach(layer => {
			layer.drawPixel(ctx, pixel);
		})
	}
}

const circle1 = new What(new Point(95, 95), {
	0: 'transparent',
	1: '#FF0000',
	2: '#0000FF',
});

const circle2 = new Circle(new Point(100, 95), {
	0: 'transparent',
	1: '#00FF00',
});

const circle3 = new Circle(new Point(105, 95), {
	0: 'transparent',
	1: '#FFFF00',
});

const circle4 = new What(new Point(110, 95), {
	0: 'transparent',
	1: '#00FFFF',
	2: '#0000FF',
});

const layer = new Canvas([
	new Layer([new Background('#000')], false),
	new Layer([new (class extends TiledSprite {
		pixels = [
			[1,1,1,0,0,0],
			[1,1,1,0,0,0],
			[1,1,1,0,0,0],
			[0,0,0,1,1,1],
			[0,0,0,1,1,1],
			[0,0,0,1,1,1],
		]
	})(new Point(0, 0), {0:'#666', 1: '#888'})], false),
	new Layer([circle1, circle3], false),
	new Layer([circle2, circle4], 'lighter')
]);

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 500;
canvas.style.imageRendering = 'pixelated';
document.body.appendChild(canvas);
document.body.style.background = '#000';

const ctx = canvas.getContext('2d');
const loop = new AnimationLoop();

loop.on('tick', t => {
	circle2.move(new Point(
		Math.round(95 + 5 * Math.cos(t / 1000)),
		Math.round(95 + 5 * Math.sin(t / 1000))
	));
	circle4.move(new Point(
		Math.round(105 + 5 * Math.cos(t / 1000)),
		Math.round(95 + 5 * Math.sin(t / 1000))
	));
	circle3.move(new Point(
		105 + Math.round(4 * Math.random()),
		95 + Math.round(4 * Math.random())
	))
});
loop.on('tick', circle1.tick.bind(circle1));
loop.on('tick', circle4.tick.bind(circle4));
loop.on('tick', () => layer.draw(ctx));

loop.start();
