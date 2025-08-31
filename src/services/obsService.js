const OBSWebSocket = require('obs-websocket-js').default;
const obs = new OBSWebSocket();


exports.connectOBS = async (password) => {
  if (!obs.isConnected) {
    
    const obsWeb = process.env.OBS_HOST;
    const password = process.env.OBS_PASSWORD;
    await obs.connect(obsWeb, password);
  }
};

exports.switchScene = async (scene) => {
  await obs.call('SetCurrentProgramScene', { sceneName: scene});
};

exports.disconnectOBS = async () => {
  if (obs.isConnected) {
    await obs.disconnect();
  };

}

exports.startStream = async () => {
 try {
    if (!obs.isConnected) {
      console.log('OBS not connected. Connecting now...');
       await exports.connectOBS();
    }

    const streamUrl = process.env.STREAM_URL;
    const streamKey = process.env.STREAM_KEY;

    await obs.call('SetStreamServiceSettings', {
    streamServiceType: 'rtmp_custom',
    streamServiceSettings: {
    server:streamUrl,  // your RTMP server URL
    key:streamKey, 
      },
    });

    // Start streaming after setting the stream service
  await obs.call('StartStream');
  console.log('Stream started successfully!');
} catch (err) {
  // Propagate error to controller
  console.error('Failed to start stream:', err);
  throw err;
}
};

exports.stopStream = async () => {
  try {
    if (!obs.isConnected) {
      console.log('OBS not connected. Connecting now...');
       await exports.connectOBS();
    }

  console.log('Stopping stream');
    await obs.call('StopStream');
  } catch (err) {
    console.error('Error stopping stream:', err);
    throw err; // re-throw to be handled by the caller
  }
};



exports.streamStatus = async (req, res) => {
  try {
    if (!obs.isConnected) {
      console.log('OBS not connected. Connecting now...');
      await exports.connectOBS();
    }

    const result = await obs.call('GetStreamStatus');
     console.log("OBS Stream Status:", result);

    // Prepare readable data for frontend
    const durationMs = result.outputDuration || 0;
    const uptime = new Date(durationMs).toISOString().substr(11, 8); // HH:MM:SS
    console.log(uptime);

  return {
    isStreaming: result.outputActive,
    uptime,
    bitrate: result.outputBytes ? `${Math.round(result.outputBytes / 1024)} KB` : 'N/A',
    congestion: result.outputCongestion || 0,
    skippedFrames: result.outputSkippedFrames || 0,
    totalFrames: result.outputTotalFrames || 0,
  }
  

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to get stream status' }));
};


}



