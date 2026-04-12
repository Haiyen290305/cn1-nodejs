const http = require('http');
const fs = require('fs');
const url = require('url');

const appEmitter = require('./events/AppEmitter');
const TextTransform = require('./streams/TextTransform');
const EchoDuplex = require('./streams/EchoDuplex');

// ================= EVENT =================
appEmitter.on('rent', (data) => {
    const log = `[${new Date().toLocaleString()}] ${data}\n`;
    fs.appendFileSync('./data/log.txt', log);
});

// ================= SERVER =================
const server = http.createServer((req, res) => {

    // 🔥 LOG REQUEST (giống hệ thống thật)
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // ================= ROUTING =================

    // HOME
    if (path === '/') {
        return sendFile(res, './views/index.html', 'text/html');
    }

    // EVENTS PAGE
    else if (path === '/events') {
        return sendFile(res, './views/events.html', 'text/html');
    }

    // TRIGGER EVENT
    else if (path === '/event') {
        const name = parsedUrl.query.name || 'Khách';
        appEmitter.emit('rent', `Khách thuê: ${name}`);
        return sendText(res, 'Đã trigger event');
    }

    // REQUEST PAGE (UI đẹp)
    else if (path === '/request') {
    return sendFile(res, './views/request.html', 'text/html');
}

    // STREAM PAGE
    else if (path === '/streams') {
        return sendFile(res, './views/streams.html', 'text/html');
    }

    // READABLE
    else if (path === '/read') {
        const stream = fs.createReadStream('./data/story.txt');
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return stream.pipe(res);
    }

    // WRITABLE
    else if (path === '/write' && req.method === 'POST') {
        const writeStream = fs.createWriteStream('./data/story.txt', { flags: 'a' });
        req.pipe(writeStream);

        req.on('end', () => {
            sendText(res, 'Đã ghi file');
        });
    }

    // TRANSFORM
    else if (path === '/transform') {
        const read = fs.createReadStream('./data/story.txt');
        const transform = new TextTransform();

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return read.pipe(transform).pipe(res);
    }

    // DUPLEX
    else if (path === '/duplex' && req.method === 'POST') {
        const duplex = new EchoDuplex();
        return req.pipe(duplex).pipe(res);
    }

    // JSON API
    else if (path === '/json') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            message: "Hệ thống thuê nhà",
            status: "OK"
        }));
    }

    // IMAGE STREAM
  // IMAGE STREAM

    else if (path === '/image') {

        const img = fs.createReadStream('./public/images/nha1.jpg');

        res.writeHead(200, { 'Content-Type': 'image/jpeg' });

        return img.pipe(res);

    }

    // DOWNLOAD LOG
    else if (path === '/download-log') {
        const log = fs.createReadStream('./data/log.txt');
        res.writeHead(200, {
            'Content-Disposition': 'attachment; filename=log.txt'
        });
        return log.pipe(res);
    }

    // CSS
    else if (path === '/style.css') {
        return sendFile(res, './public/style.css', 'text/css');
    }

    // 404
    else {
        res.writeHead(404);
        res.end("404 - Not Found");
    }
});

// ================= HELPER FUNCTIONS =================

function sendFile(res, path, type) {
    const data = fs.readFileSync(path);
    res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` });
    res.end(data);
}

function sendText(res, text) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(text);
}

function sendHTML(res, html) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('Port 3000 bị chiếm → chuyển sang 3002');
        server.listen(3002);
    }
});
server.listen(3000, () => {
    console.log('Server chạy tại http://localhost:3000');
});