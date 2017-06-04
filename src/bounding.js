import struct from '@quarterto/struct';
import flatMapUniq from '@quarterto/flat-map-uniq';
import flatMap from '@quarterto/flatmap';
import range from 'lodash.range';
import Point from './point';

export class BoundingGroup extends struct('children') {
	pixels() {
		return flatMapUniq(this.children, child => child.pixels());
	}
}

export class BoundingRect extends struct('origin', 'opposite') {
	pixels() {
		return flatMap(range(this.origin.x, this.opposite.x), x =>
			range(this.origin.y, this.opposite.y).map(y => Point.from({x,y}))
		);
	}

	toString() {
		return this.origin.toString() + '→' + this.opposite.toString();
	}
}

export class NullBoundingBox {
	pixels() {
		return [];
	}
}
