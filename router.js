const path = require('path');
const fs = require('fs');
const obsRoutes = require('./src/routes/obsRoutes');
const playlistsRoutes = require('./src/routes/playlistsRoutes');

const router = function (req, res) {

   const filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

  // Serve static files (.html, .css, .js)
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
  };

  console.log(filePath)
  if (mimeTypes[ext]) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('404 Not Found');
      }
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] });
      res.end(data);
    });
    return;
  }

  // API routes
  if(req.method === 'GET' && req.url.endsWith('.m3u8')){
    return playlistsRoutes (req,res);

  } else if (req.method === 'POST' && req.url === '/api/obs-password') {
    return obsRoutes(req,res);

  } else if (req.method === 'POST' && req.url.startsWith('/switch-scene')) {
    return obsRoutes(req, res);

   } else if (req.url.endsWith('.m3u8') || req.url.startsWith('/overwrite-playlist')) {
    return playlistsRoutes(req, res);

  } else if(req.url.startsWith('/api/playlist')) {
    return playlistsRoutes(req, res);
  }else if (req.url.startsWith('/api/playlist/duration')){
    return playlistsRoutes(req,res);
  }else if  (req.url.startsWith('/api/playlist/check')){
    return playlistsRoutes(req,res);
  }else if  (req.url.startsWith('/start-stream')){
    return obsRoutes(req,res);
  } else if (req.method === 'POST' && req.url === '/start-stream') {
    return obsRoutes(req, res);
  } else if (req.method === 'POST' && req.url === '/stop-stream') {
    return obsRoutes(req, res);
  } else if ((req.method === 'POST' || req.method === 'GET') && req.url === '/api/stream/status') {
  return obsRoutes(req, res);
  }else {
    res.writeHead(404);
    res.end('Not Found');
  }
}

module.exports = router;



/*
onst fs = require('fs');
const path = require('path');
const OBSWebSocket = require('obs-websocket-js').default;
const obs = new OBSWebSocket();

const playlistsDir = path.join(__dirname, 'playlists');

let obsPassword = '';  // Store OBS password after connection (you might want a better approach)

async function connectOBS(password) {
  if (!obs.isConnected) {
    await obs.connect('ws://localhost:4455', password);
  }
}

async function disconnectOBS() {
  if (obs.isConnected) {
    await obs.disconnect();
  }
}

function router(req, res) {
  if (req.method === 'GET' && req.url.endsWith('.m3u8')) {
    // Serve playlist files
    const filename = path.basename(req.url);
    const filePath = path.join(playlistsDir, filename);

    fs.access(filePath, fs.constants.R_OK, (err) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Playlist not found');
      }

      res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);

      stream.on('error', (streamErr) => {
        console.error('Stream error:', streamErr);
        res.writeHead(500);
        res.end('Server error');
      });
    });
  }





 if (req.method === 'GET' && req.url.endsWith('.m3u8')) {
    // Serve playlist files
    const filename = path.basename(req.url);
    const filePath = path.join(playlistsDir, filename);

    fs.access(filePath, fs.constants.R_OK, (err) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Playlist not found');
      }

      res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);

      stream.on('error', (streamErr) => {
        console.error('Stream error:', streamErr);
        res.writeHead(500);
        res.end('Server error');
      });
    });
  }else if (req.method === 'POST' && req.url === '/switch-scene') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { scene, password } = JSON.parse(body);
        if (!scene || !password) {
          res.writeHead(400);
          return res.end('Missing scene or password');
        }

        await connectOBS(password);
        await obs.call('SetCurrentProgramScene', { sceneName: scene });
        // Optionally disconnect after
        // await disconnectOBS();

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Switched to scene: ${scene}`);
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to switch scene');
      }
    });
  }

  else if (req.method === 'POST' && req.url === '/overwrite-playlist') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { filename, content } = JSON.parse(body);
        if (!filename || !content) {
          res.writeHead(400);
          return res.end('Missing filename or content');
        }
        const savePath = path.join(playlistsDir, filename);

        fs.writeFile(savePath, content, err => {
          if (err) {
            console.error('Failed to save playlist:', err);
            res.writeHead(500);
            return res.end('Failed to save');
          }

          res.writeHead(200);
          res.end('Playlist saved successfully');
        });
      } catch (err) {
        console.error(err);
        res.writeHead(400);
        res.end('Invalid request');
      }
    });
  }

*/
