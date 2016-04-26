import struct from '@quarterto/struct';

export default class Point extends struct('x', 'y') {
	static points = {};

	constructor(...args) {
		super(...args);
		// hax for Point(1,1) === Point(1,1)
		// allows it to be used in sets etc
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
