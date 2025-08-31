// obsRoute.js
const obsController = require('../controllers/obsController');

module.exports = async function handleObsRoutes(req, res) {

    
  if (req.method === 'POST' && req.url === '/switch-scene') {
    return obsController.switchScene(req, res);
  }else if (req.method === 'POST' && req.url === '/start-stream') {
    return obsController.startStream(req, res);
  } else if (req.method === 'POST' && req.url === '/stop-stream') {
    return obsController.stopStream(req, res);
  }else if ((req.method === 'POST' || req.method === 'GET') && req.url === '/api/stream/status') {
  return obsController.streamStatus(req, res);
}
};

