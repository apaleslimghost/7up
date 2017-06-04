import struct from '@quarterto/struct';

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

	tick() {}
}

export default Background;
