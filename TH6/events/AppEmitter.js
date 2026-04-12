const EventEmitter = require('events');

class AppEmitter extends EventEmitter {
    constructor() {
        super();
        console.log(">>> Hệ thống AppEmitter đã sẵn sàng.");
    }
}

module.exports = new AppEmitter();