const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const playlistsDir = path.join(__dirname, '../../playlists');
const m3u8FilePath = path.join(playlistsDir, 'playlist.m3u8'); //will need to be updated to nandel more than one file .m3u8

// Utility to read filenames from .m3u8 (ignores comments and metadata)
function getM3u8FileNames(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  return lines
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')); // Remove empty and metadata lines
}


function checkPlaylistMismatch() {
  const folderFiles = fs.readdirSync(playlistsDir)
    .filter(f => /\.(mp4|ts|mkv|avi|mov|jpg|jpeg|png)$/i.test(f)) // Only media files
    .map(f => f.trim());

  const m3u8Files = getM3u8FileNames(m3u8FilePath);

  const missingInM3u8 = folderFiles.filter(f => !m3u8Files.includes(f));
  const missingOnDisk = m3u8Files.filter(f => !folderFiles.includes(f));

  return {
    missingInM3u8, // These exist on disk but not listed in m3u8
    missingOnDisk, // These are listed in m3u8 but no file exists
    totalM3u8Entries: m3u8Files.length,
    totalFolderFiles: folderFiles.length
  };
}

function savePlaylist(filename, content) {
  const savePath = path.join(playlistsDir, filename);
  return new Promise((resolve, reject) => {
    fs.writeFile(savePath, content, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}


// file extinstion and time for image duration
const IMAGE_DURATION = 5; // Or 10
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const VIDEO_EXTENSIONS = ['.mp4', '.ts', '.mkv', '.avi', '.mov'];

//function that uses ffprobe (part of ffmpeg) to get the actual video length in seconds.
function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 0);
    });
  });
}

async function calculatePlaylistDuration() {
  //Reads all the file names
  const files = fs.readdirSync(playlistsDir);
  console.log('Files found:', files);

  let totalDuration = 0;
  let imageCount = 0;
  let videoCount = 0;

    //counts how many files were found
  for (const file of files) {
    //extracts file extension the and convert it to lowercase 
    const ext = path.extname(file).toLowerCase();
    console.log(`Checking file: ${file} ext: ${ext}`);
    //get absolute path 
    const fullPath = path.join(playlistsDir, file);

    //checks the if there is a image type extenstion 
    if (IMAGE_EXTENSIONS.includes(ext)) {
      totalDuration += IMAGE_DURATION;
      imageCount++;

       //checks the if there is a video type extenstion 
    } else if (VIDEO_EXTENSIONS.includes(ext)) {
      try {
        // Calls getVideoDuration(fullPath) an async function that uses ffprobe (part of ffmpeg) to get the actual video length in seconds.
        const duration = await getVideoDuration(fullPath);
        console.log(`Duration for video ${file}: ${duration}s`);
        totalDuration += duration;
        videoCount++;
      } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
      }
    }
  }

  function secondsToHMS (seconds) {
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds/3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

      return `${h}h ${m}m ${s}s`;
  }

    const formattedDuration = secondsToHMS(totalDuration);



  return {
  totalDurationSeconds: parseFloat(totalDuration.toFixed(2)),
  totalDurationFormatted: formattedDuration,
  imageCount,
  videoCount
};
}

module.exports = { savePlaylist, calculatePlaylistDuration , checkPlaylistMismatch };
