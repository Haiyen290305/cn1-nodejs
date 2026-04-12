const { Duplex } = require('stream');

class EchoDuplex extends Duplex {
    constructor() {
        super();
        this.data = '';
    }

    _write(chunk, encoding, callback) {
        this.data += chunk.toString();
        callback();
    }

    _read() {
        this.push(this.data);
        this.push(null);
    }
}

module.exports = EchoDuplex;