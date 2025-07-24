const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    console.log('Request:', req.method, req.url);
    
    if (req.url === '/') {
        // Redirect to main.html
        res.writeHead(302, { 'Location': '/main.html' });
        res.end();
        return;
    }
    
    if (req.url === '/main.html') {
        try {
            const filePath = path.join(__dirname, 'main.html');
            const content = fs.readFileSync(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        } catch (err) {
            res.writeHead(404);
            res.end('File not found');
        }
        return;
    }
    
    if (req.url === '/app-simple.js') {
        try {
            const filePath = path.join(__dirname, 'app-simple.js');
            const content = fs.readFileSync(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(content);
        } catch (err) {
            res.writeHead(404);
            res.end('File not found');
        }
        return;
    }
    
    res.writeHead(404);
    res.end('Not found');
});

const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});