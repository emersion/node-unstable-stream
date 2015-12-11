var assert = require('assert');
var UnstableStream = require('..');

describe('UnstableStream', function() {
	var options = {
		max: 50,
		min: -60,
		maxDelta: 5
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
});
