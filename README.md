# node-unstable-stream

A stream detecting unstable behaviors.

```js
var UnstableStream = require('unstable-stream');

// Create a new stream
// If data passed into the stream doesn't matches constraints,
// the 'instability' event will be emitted
var stream = new UnstableStream({
	max: 50, // Maximum value
	min: -60, // Minimum value
	maxDelta: 5, // Maximum distance between two values
	maxPeakDelta: 10 // Maximum distance between two peaks
});

stream.on('instability', function () {
	console.log('Instability detected!');
});

// Write numbers to the stream
stream.write(0);
stream.write(1);
stream.write(2);
```
