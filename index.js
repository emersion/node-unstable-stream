'use strict';

var Writable = require('stream').Writable;
var util = require('util');

function UnstableStream(options) {
	Writable.call(this, { objectMode: true });

	options = options || {};
	this.options = options;

	this.reset();
}
util.inherits(UnstableStream, Writable);

UnstableStream.prototype._write = function (value, enc, next) {
	if (typeof value !== 'number') {
		throw new Error('Only numbers can be written to this stream');
	}

	if (typeof this.options.max === 'number' && value >= this.options.max) {
		this._emitInstability();
	}
	if (typeof this.options.min === 'number' && value <= this.options.min) {
		this._emitInstability();
	}

	if (this._last !== null) {
		var delta = value - this._last;

		if (typeof this.options.maxDelta === 'number' && Math.abs(delta) >= this.options.maxDelta) {
			this._emitInstability();
		}

		if (typeof this.options.maxPeakDelta === 'number' && this._lastDelta !== null) {
			if (this._lastDelta <= 0 && delta >= 0) { // Min
				if (this._lastMin !== null) {
					var minDelta = value - this._lastMin;
					if (Math.abs(minDelta) >= this.options.maxPeakDelta) {
						this._emitInstability();
					}
				}
				this._lastMin = value;
			}
			if (this._lastDelta >= 0 && delta <= 0) { // Max
				if (this._lastMax !== null) {
					var maxDelta = value - this._lastMax;
					if (Math.abs(maxDelta) >= this.options.maxPeakDelta) {
						this._emitInstability();
					}
				}
				this._lastMax = value;
			}
		}

		this._lastDelta = delta;
	}

	this._last = value;

	next();
};

UnstableStream.prototype._emitInstability = function () {
	this.emit('instability');
};

UnstableStream.prototype.reset = function () {
	this._last = null;
	this._lastDelta = null;

	this._lastMin = null;
	this._lastMax = null;
};

module.exports = UnstableStream;
