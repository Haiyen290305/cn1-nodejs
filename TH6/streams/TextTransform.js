const { Transform } = require('stream');

class TextTransform extends Transform {
    _transform(chunk, encoding, callback) {
        this.push(chunk.toString().toUpperCase());
        callback();
    }
}

module.exports = TextTransform;