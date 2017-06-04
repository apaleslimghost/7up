import struct from '@quarterto/struct';
import Point from './point';
import {BoundingRect, NullBoundingBox, BoundingGroup} from './bounding';

export class Sprite extends struct('_origin', 'palette') {
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
		return this.palette[this.pixels[ry][rx]];
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

	tick() {}
}

export class TiledSprite extends Sprite {
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

	tick() {}
}

export class AnimatedSprite extends Sprite {
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
