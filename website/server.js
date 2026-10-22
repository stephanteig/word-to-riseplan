const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.riseplan': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  } catch {
    response.writeHead(400).end('Ugyldig forespørsel.');
    return;
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const absolutePath = path.resolve(root, `.${requestedPath}`);
  if (!absolutePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Ingen tilgang.');
    return;
  }

  fs.readFile(absolutePath, (error, contents) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error.code === 'ENOENT' ? 'Filen ble ikke funnet.' : 'Kunne ikke lese filen.');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(absolutePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    });
    response.end(contents);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Rise-kursforhåndsvisning kjører på http://localhost:${port}`);
});
