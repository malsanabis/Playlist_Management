const playlistController = require('../controllers/playlist.controller')


async function handlePlaylistRoutes(req, res) {

    
   if (req.method === 'POST' && req.url === '/overwrite-playlist') {
    return playlistController.handleSavePlaylist(req, res);
  } else if (req.url === '/api/playlist/duration' && req.method === 'GET') {
    return  playlistController.getPlaylistDuration(req, res);
  }else if (req.url === '/api/playlist/check' && req.method === 'GET') {
    return  playlistController.checkPlaylist(req, res);
  }else {
    res.writeHead(404);
    res.end('Not Found');
  }

}

module.exports = handlePlaylistRoutes;
