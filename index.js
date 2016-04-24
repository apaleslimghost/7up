import range from 'lodash.range';
import flatMap from '@quarterto/flatmap';

const struct = (...fields) => class {
	constructor(...args) {
		console.assert(args.length === fields.length, 'wrong number of arguments');
		args.forEach((arg, i) => {
			this[fields[i]] = arg;
		})
	}
}

class Point extends struct('x', 'y') {
	static from({x, y}) {
		return new Point(x, y);
	}

	add(point) {
		return new Point(
			this.x + point.x,
			this.y + point.y
		);
	}
}

class Sprite extends struct('origin', 'palette') {
	pixels = [];

	get boundingBox() {
		return [
			this.origin,
			this.origin.add({
				x: this.pixels[0].length,
				y: this.pixels.length,
			})
		]
	}

	draw(ctx) {
		this.pixels.forEach((rowPixels, row) => {
			rowPixels.forEach((pixel, column) => {
				ctx.fillStyle = this.palette[pixel];
				ctx.fillRect(this.origin.x + column, this.origin.y + row, 1, 1);
			})
		})
	}
}

class BoundingBox extends struct('origin', 'other') {
	get pixels() {
		return flatMap(range(this.origin.x, this.other.x), x =>
			range(this.origin.y, this.other.y).map(y => Point.from({x, y}))
		);
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

class Layer extends struct('objects', 'blendMode') {
	draw(ctx) {
		const oldBlendMode = ctx.globalCompositeOperation;
		if(this.blendMode) ctx.globalCompositeOperation = this.blendMode;
		this.objects.forEach(object => object.draw(ctx));
		ctx.globalCompositeOperation = oldBlendMode;
	}
}

const circle1 = new Circle(new Point(95, 95), {
	0: '#000000',
	1: '#FF0000',
});

const circle2 = new Circle(new Point(100, 95), {
	0: '#000000',
	1: '#00FF00',
});

const layer = new Layer([
	new Layer([circle1], false),
	new Layer([circle2], 'lighter')
], false);

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 500;
canvas.style.imageRendering = 'pixelated';
document.body.appendChild(canvas);
document.body.style.background = '#000';

const ctx = canvas.getContext('2d');

function clear(ctx) {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

clear(ctx);
layer.draw(ctx);
