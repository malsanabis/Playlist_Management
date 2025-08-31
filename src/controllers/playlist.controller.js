const playlistService = require('../services/playlistService');

async function handleSavePlaylist(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { filename, content } = JSON.parse(body);
      if (!filename || !content) {
        res.writeHead(400);
        return res.end('Missing filename or content');
      }
      await playlistService.savePlaylist(filename, content);
      res.writeHead(200);
      res.end('Playlist saved successfully');
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end('Failed to save playlist');
    }
  });
}


async function getPlaylistDuration(req, res) {
  try {
    const result = await playlistService.calculatePlaylistDuration();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Error calculating playlist duration');
  }
}


async function checkPlaylist(req,res){

try{
const result = playlistService.checkPlaylistMismatch();
 res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Error calculating playlist duration');
  }
}



module.exports = { handleSavePlaylist,getPlaylistDuration,checkPlaylist};
