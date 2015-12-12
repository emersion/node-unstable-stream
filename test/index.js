var assert = require('assert');
var UnstableStream = require('..');

describe('UnstableStream', function() {
	var options = {
		max: 50,
		min: -60,
		maxDelta: 5,
		maxPeakDelta: 10
	};

	var stream = new UnstableStream(options);

	var stable = true;
	stream.on('instability', function () {
		stable = false;
	});

	function reset() {
		stream.reset();
		stable = true;
	}

	[42, 0, -6].forEach(function (cst) {
		it('should not detect an instability with a constant '+cst+' input', function () {
			reset();

			for (var i = 0; i < 10; i++) {
				stream.write(cst);
			}

			assert.equal(true, stable);
		});
	});

	it('should not detect an instability with a constantly increasing input below max', function () {
		reset();

		for (var i = 0; i < options.max; i++) {
			stream.write(i);
		}

		assert.equal(true, stable);
	});
	it('should detect an instability with a constantly increasing input reaching max', function () {
		reset();

		for (var i = 0; i <= options.max; i++) {
			stream.write(i);
		}

		assert.equal(false, stable);
	});

	it('should not detect an instability with a constantly decreasing input above min', function () {
		reset();

		for (var i = 0; i > options.min; i--) {
			stream.write(i);
		}

		assert.equal(true, stable);
	});
	it('should detect an instability with a constantly decreasing input reaching min', function () {
		reset();

		for (var i = 0; i >= options.min; i--) {
			stream.write(i);
		}

		assert.equal(false, stable);
	});

	it('should not detect an instability with a delta below limit', function () {
		reset();

		var i = 0;
		for (var d = 0; d < options.maxDelta; d++) {
			i += d;
			stream.write(i);
		}

		assert.equal(true, stable);
	});
	it('should detect an instability with a delta reaching limit', function () {
		reset();

		var i = 0;
		for (var d = 0; d <= options.maxDelta; d++) {
			i += d;
			stream.write(i);
		}

		assert.equal(false, stable);
	});

	it('should not detect an instability with a sine input', function () {
		reset();

		function f(t) {
			return Math.sin(t) * 5;
		}

		for (var t = 0; t < 100; t++) {
			stream.write(f(t));
		}

		assert.equal(true, stable);
	});
	it('should detect an instability with an exponential sine input', function () {
		reset();

		function f(t) {
			return Math.sin(t) * Math.exp(t);
		}

		for (var t = 0; t < 100; t++) {
			stream.write(f(t));
		}

		assert.equal(false, stable);
	});

	it('should detect an instability with distance between peaks greater than the limit', function () {
		reset();

		var data = [0, 1, 2, 1, 0, -4, -8, -12, -8, -4, 0, 4, 8, 12, 16, 20, 24, 23];

		for (var i = 0; i < data.length; i++) {
			stream.write(data[i]);
		}

		assert.equal(false, stable);
	});
});
