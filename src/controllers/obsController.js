const obsService = require('../services/obsService');

exports.switchScene = async (req, res) => {
  let body = '';
 req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { scene } = JSON.parse(body);

      if (!scene) {
        res.writeHead(400);
        return res.end('Missing scene');
      }

      await obsService.connectOBS();
      await obsService.switchScene(scene);

      res.writeHead(200);
      res.end(`Switched to scene: ${scene}`);
    } catch (err) {
      console.error('Controller error:', err);
      res.writeHead(500);
      res.end('Failed to switch scene');
    }
  });
};


exports.startStream = async (req, res) => {
  try {
    await obsService.startStream();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Streaming started successfully' }));

  } catch (err) {
    console.error('Start stream error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ success: false, message: err.message }));

  }
};


exports.stopStream = async (req, res) => {
  try {
    await obsService.stopStream();
     res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Streaming stopped successfully' }));
  } catch (err) {
    console.error('Stop stream error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ success: false, message: err.message }));;
  }
};


exports.streamStatus = async (req, res) => {
  try {
    const status = await obsService.streamStatus(); // <-- get actual status data
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status)); // <-- return it to the frontend
  } catch (err) {
    console.error('Stream status error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: err.message }));
  }
};




