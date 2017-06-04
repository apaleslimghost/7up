import struct from '@quarterto/struct';
import flatMapUniq from '@quarterto/flat-map-uniq';
import {BoundingGroup} from './bounding';

export default class Layer extends struct('objects', 'blendMode') {
	stale = true;

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

	tick(t) {
		this.objects.forEach(object => {
			object.tick(t);
		});
	}
}
