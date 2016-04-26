import struct from '@quarterto/struct';
import {BoundingGroup} from './bounding';

export default class Canvas extends struct('layers') {
	get boundingBox() {
		return new BoundingGroup(this.layers.map(layer => layer.boundingBox));
	}

	changedPixels() {
		return flatMapUniq(this.layers, layer => layer.changedPixels());
	}

	draw(ctx) {
		this.changedPixels().forEach(pixel => {
			this.layers.forEach(layer => {
				layer.drawPixel(ctx, pixel);
			})
		});
	}
}
