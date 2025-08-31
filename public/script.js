let playlistContent = []; // Stores loaded playlist lines
let draggedIndex = null;

   // Handle file upload
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    playlistContent = e.target.result.split("\n"); // Split lines
    displayPlaylist();
    document.getElementById("saveBtn").style.display = "inline-block";
    document.getElementById("toggleAddBtn").style.display = "inline-block";
  };
  reader.readAsText(file);
});

  // Handle dropdown limit change
document.getElementById("limitSelect").addEventListener("change", () => {
  displayPlaylist(document.getElementById("searchInput").value, document.getElementById("limitSelect").value);
});

  // Handle search input
document.getElementById("searchInput").addEventListener("input", (e) => {
  displayPlaylist(e.target.value);
});

  // Toggle Add Video form visibility
document.getElementById("toggleAddBtn").addEventListener("click", () => {
  const box = document.getElementById("addVideoBox");
  box.classList.toggle("hidden");
});

 // Normalize text for comparison (search case-insensitive)
function normalize(text) {
  return text.normalize('NFKC').toLowerCase();
}

  // Display playlist with filter and limit
function displayPlaylist(filter = "", limit = "all") {
  const container = document.getElementById("playlistContainer");
  container.innerHTML = "";

  let count = 0;

  for (let i = 0; i < playlistContent.length; i++) {
    const video = playlistContent[i];
    if (!normalize(video).includes(normalize(filter))) continue;

    if (limit !== "all" && count >= parseInt(limit)) break;
    count++;

    const item = document.createElement("div");
    item.className = "flex justify-between items-center bg-gray-100 rounded p-2";

    const textSpan = document.createElement("span");
    textSpan.textContent = video;

    const buttons = document.createElement("div");
    buttons.className = "flex gap-1";
    item.setAttribute("draggable", "true"); // ✅ This is required!


      // Track index for drag logic
item.dataset.index = i;

// 🎯 Drag and Drop Events
item.ondragstart = (e) => {
draggedIndex = parseInt(item.dataset.index);
item.classList.add("opacity-50"); // Optional visual feedback
};

item.ondragend = () => {
draggedIndex = null;
item.classList.remove("opacity-50");
};

item.ondragover = (e) => {
e.preventDefault(); // Required to allow dropping
item.classList.add("ring", "ring-blue-300"); // Optional highlight
};

item.ondragleave = () => {
item.classList.remove("ring", "ring-blue-300");
};

item.ondrop = () => {
const targetIndex = parseInt(item.dataset.index);
if (draggedIndex !== null && draggedIndex !== targetIndex) {
swapVideos(draggedIndex, targetIndex);
}
item.classList.remove("ring", "ring-blue-300");
};

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.title = "Edit";
    editBtn.textContent = "✏️";
    editBtn.className = "hover:text-blue-600";
    editBtn.onclick = () => {
      const newVal = prompt("Edit video path:", playlistContent[i]);
      if (newVal) {
        playlistContent[i] = newVal.trim();
        displayPlaylist(filter, limit);
      }
    };


  // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.title = "Delete";
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "hover:text-red-600";
    deleteBtn.onclick = () => {
      if (confirm("Are you sure you want to delete this item?")) {
        playlistContent.splice(i, 1);
        displayPlaylist(filter, limit);
      }
    };

       // Move Up/Down buttons
    const moveUpBtn = document.createElement("button");
    moveUpBtn.title = "Move Up";
    moveUpBtn.textContent = "↑";
    moveUpBtn.className = "hover:text-green-600";
    moveUpBtn.onclick = () => moveVideo(i, "up");

    const moveDownBtn = document.createElement("button");
    moveDownBtn.title = "Move Down";
    moveDownBtn.textContent = "↓";
    moveDownBtn.className = "hover:text-green-600";
    moveDownBtn.onclick = () => moveVideo(i, "down");

    [editBtn, deleteBtn, moveUpBtn, moveDownBtn].forEach(btn => {
      btn.classList.add("text-sm", "px-1");
      buttons.appendChild(btn);
    });

    item.appendChild(textSpan);
    item.appendChild(buttons);
    container.appendChild(item);
  }
}

 // Swap two playlist items
function swapVideos(index1, index2) {
  [playlistContent[index1], playlistContent[index2]] = [playlistContent[index2], playlistContent[index1]];
  displayPlaylist(document.getElementById("searchInput").value, document.getElementById("limitSelect").value);
}

 // Move video up or down
function moveVideo(index, direction) {
  if (direction === "up" && index > 0) {
    swapVideos(index, index - 1);
  } else if (direction === "down" && index < playlistContent.length - 1) {
    swapVideos(index, index + 1);
  }
}


// Add new video to playlist with validation
function addVideoToPlaylist() {
const input = document.getElementById("newVideoInput");
const videoName = input.value.trim();

// Check: not empty, ends with .mp4, and not just .mp4
// Check: not empty, ends with .mp4 or .jpg, and not just '.mp4' or '.jpg'
if (!videoName) {
  alert("Please enter a video name.");
} else if (
  !videoName.toLowerCase().endsWith(".mp4") &&
  !videoName.toLowerCase().endsWith(".jpg")
) {
  alert("The video name must end with '.mp4' or '.jpg'.");
} else if (
  videoName.trim().toLowerCase() === ".mp4" ||
  videoName.trim().toLowerCase() === ".jpg"
) {
  alert("Video name cannot be just '.mp4' or '.jpg'.");
} else {
  playlistContent.push(videoName);
  input.value = "";
  displayPlaylist(
    document.getElementById("searchInput").value,
    document.getElementById("limitSelect").value
  );
}

}


// Save playlist to server via POST
document.getElementById("saveBtn").addEventListener("click", () => {
  const modifiedContent = playlistContent.join("\n");
  fetch('/overwrite-playlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: document.getElementById("fileInput").files[0]?.name || 'playlist.m3u8',
      content: modifiedContent
    })
  })
  .then(res => res.text())
  .then(msg => alert('Playlist saved on server: ' + msg))
  .catch(err => alert('Error saving playlist: ' + err.message));
});


 document.getElementById("checkDuration").addEventListener("click", async () => {
  try {
    const res = await fetch('/api/playlist/duration');
    const data = await res.json();
    document.getElementById("resultBox").innerHTML =
      `🎬 Total Duration: <b>${data.totalDurationFormatted}</b> 
      (${data.totalDurationSeconds} seconds)<br>
       🖼️ Images: ${data.imageCount} | 📹 Videos: ${data.videoCount}`;
  } catch (err) {
    document.getElementById("resultBox").innerText = "Error calculating duration.";
  }
});

document.getElementById("checkMismatch").addEventListener("click", async () => {
  try {
    const res = await fetch('/api/playlist/check');
    const data = await res.json();
    document.getElementById("resultBox").innerHTML =
      `🧩 Files in folder but not in playlist: <b>${data.missingInM3u8.join(', ') || 'None'}</b><br>
       ❌ Files in playlist but missing on disk: <b>${data.missingOnDisk.join(', ') || 'None'}</b><br>
       📂 Total Files in folder: ${data.totalFolderFiles} | 🎞 Playlist Entries: ${data.totalM3u8Entries}`;
  } catch (err) {
    document.getElementById("resultDisplay").innerText = "Error checking playlist.";
  }
});



// Send scene switch request to server
function switchScene(scene) {
  fetch('/switch-scene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scene })
  })
  .then(res => res.text())
  .then(alert)
  .catch(err => alert("Error: " + err.message));
}



async function startStreaming() {
  const startBtn = document.getElementById('startStreamBtn');
  const stopBtn = document.getElementById('stopStreamBtn');

  startBtn.disabled = true;
  startBtn.innerText = "⏳ Starting...";
  stopBtn.disabled = true; // just in case

  try {
    const response = await fetch('/start-stream', { method: 'POST' });
    const result = await response.json();

    if (result.success) {
      startBtn.innerText = "⏸ Streaming";
      stopBtn.disabled = false;
      console.log("Streaming started");
    } else {
      alert("Failed to start stream: " + result.message);
      startBtn.disabled = false;
      startBtn.innerText = "▶️ Start Streaming";
    }
  } catch (err) {
    alert("Error starting stream: " + err.message);
    startBtn.disabled = false;
    startBtn.innerText = "▶️ Start Streaming";
  }
}


async function stopStreaming() {
  const stopBtn = document.getElementById('stopStreamBtn');
  const startBtn = document.getElementById('startStreamBtn');

  stopBtn.disabled = true;
  stopBtn.innerText = "⏳ Stopping...";
  startBtn.disabled = true;

  try {
    const response = await fetch('/stop-stream', { method: 'POST' });
    const result = await response.json();

    if (result.success) {
      stopBtn.innerText = "⏹ Stop Streaming";
      startBtn.innerText = "▶️ Start Streaming";
      startBtn.disabled = false;
      console.log("Streaming stopped");
    } else {
      alert("Failed to stop stream: " + result.message);
      stopBtn.disabled = false;
      stopBtn.innerText = "⏹ Stop Streaming";
    }
  } catch (err) {
    alert("Error stopping stream: " + err.message);
    stopBtn.disabled = false;
    stopBtn.innerText = "⏹ Stop Streaming";
  }
}




async function refreshStatus() {
  try {
    const response = await fetch('/api/stream/status');
    const data = await response.json();
     console.log(data); // Optional: Debug log
    // Update uptime
    document.getElementById('uptime').textContent = data.uptime || '00:00:00';

    // Update bitrate/FPS
    document.getElementById('bitrateInfo').textContent = data.bitrate || 'N/A';


  } catch (err) {
    console.error('Error fetching stream status:', err);
  }
}

//setInterval(refreshStatus, 3000); // every 3 seconds



function updateStreamingStatus(isStreaming) {
  const statusEl = document.getElementById('streamingStatus');
  statusEl.classList.remove('text-red-600', 'text-green-600');
  statusEl.classList.add(isStreaming ? 'text-green-600' : 'text-red-600');
  statusEl.innerHTML = `
    <div class="w-3 h-3 ${isStreaming ? 'bg-green-600' : 'bg-red-600'} rounded-full animate-pulse"></div>
    <span>${isStreaming ? 'Streaming Live' : 'Streaming Stopped'}</span>
  `;
}

function updateStreamConfiguration() {
  const url = document.getElementById('customStreamUrl').value;
  const key = document.getElementById('playlistStreamKey').value;

  if (!url || !key) {
    alert('Stream URL and Key are required!');
    return;
  }
  
}
