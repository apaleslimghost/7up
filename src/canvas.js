import struct from '@quarterto/struct';
import flatMapUniq from '@quarterto/flat-map-uniq';
import {BoundingGroup} from './bounding';

export default class Canvas extends struct('layers') {
	get boundingBox() {
		return new BoundingGroup(this.layers.map(layer => layer.boundingBox));
	}

	changedPixels() {
		return flatMapUniq(this.layers, layer => layer.changedPixels());
	}

	draw(ctx) {
		this.layers.forEach(layer => {
			this.changedPixels().forEach(pixel => {
				layer.drawPixel(ctx, pixel);
			})
		});
	}

	tick(t) {
		this.layers.forEach(layer => {
			layer.tick(t);
		});
	}
}
