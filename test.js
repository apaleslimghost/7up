import AnimationLoop from '@quarterto/animation-loop';
import {Canvas, Layer, Background, Sprite, TiledSprite, AnimatedSprite, Point} from './lib';

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

loop.on('tick', layer.tick.bind(layer));
loop.on('tick', () => layer.draw(ctx));


loop.on('tick', t => {
	circle2.move(new Point(
		Math.round(95 + 5 * Math.cos(t / 1000)),
		Math.round(95 + 5 * Math.sin(t / 1000))
	));
	circle4.move(new Point(
		Math.round(105 + 5 * Math.cos(t / 1000)),
		Math.round(95 + 5 * Math.sin(t / 1000))
	));
});
loop.start();
