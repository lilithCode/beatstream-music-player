let currentFolder = "Taylor Swift";
let FoldersNames = ["Taylor Swift", "Coke Studio"];
let songs = [];
let currentAudio = null;
let isPlaying = false;
let currentIndex = 0;

async function fetchSpotifyData() {
  try {
    const response = await fetch('/public/songs/songs.json');
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    const songList = data.songs[currentFolder].map(song => song.url);

    if (songList.length === 0) {
      console.warn(`No songs found in ${currentFolder}`);
    }

    console.log("Fetched songs:", songList);
    return songList;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function convertTime(duration) {
  let seconds = Math.floor(duration % 60);
  let minutes = Math.floor((duration / 60) % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function updateSongList() {
  let songList = document.getElementById("songList");
  songList.innerHTML = "";

  songs.forEach((songUrl, index) => {
    let songName = decodeURIComponent(
      songUrl.split("/").pop().replace(".mp3", "")
    );
    let songDiv = document.createElement("div");
    songDiv.classList.add("song");
    songDiv.innerHTML = `
      <img src="svg and img/music.svg" alt="song" width="50" />
      <div class="song-info">
        <h3 style="margin: 5px; background-color: transparent">${songName}</h3>
      </div>
      <img class="playAtlib" src="svg and img/play.svg" alt="play" width="50" />
    `;

    songDiv
      .querySelector(".playAtlib")
      .addEventListener("click", () => playSelectedSong(index));
    songList.appendChild(songDiv);
  });

  console.log("Updated song list:", songList.innerHTML);
}

function updateProgress() {
  if (currentAudio && !isNaN(currentAudio.duration)) {
    document.getElementById("songDuration").innerHTML = `${convertTime(
      currentAudio.currentTime
    )} / ${convertTime(currentAudio.duration)}`;
    document.querySelector(".circle").style.left = `${
      (currentAudio.currentTime / currentAudio.duration) * 100
    }%`;
  }
}

function updateSongInfo() {
  document.getElementById("songInfo").innerHTML = decodeURIComponent(
    songs[currentIndex].split("/").pop().replace(".mp3", "")
  );
}

async function playMusic(pause = false) {
  let button = document.getElementById("startButton");

  if (!currentAudio) {
    console.error("No audio initialized.");
    return;
  }

  if (pause || isPlaying) {
    currentAudio.pause();
    button.src = "svg and img/start.svg";
    isPlaying = false;
  } else {
    await currentAudio.play();
    button.src = "svg and img/pause.svg";
    isPlaying = true;
  }
}

function playSelectedSong(index) {
  currentIndex = index;
  initializeAudio();
}

function initializeAudio() {
  if (!songs.length) {
    console.error("No valid songs found. Cannot play audio.");
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.removeEventListener("timeupdate", updateProgress);
    currentAudio.removeEventListener("ended", handleSongEnd);
  }

  currentAudio = new Audio(songs[currentIndex]);

  currentAudio.addEventListener("timeupdate", updateProgress);
  currentAudio.addEventListener("ended", handleSongEnd);

  updateSongInfo();
  playMusic();
}

function handleSongEnd() {
  currentIndex = (currentIndex + 1) % songs.length;
  initializeAudio();
}

async function main() {
  songs = await fetchSpotifyData();
  updateSongList();

  document
    .getElementById("startButton")
    .addEventListener("click", () => playMusic());
  document.getElementById("nextButton").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % songs.length;
    initializeAudio();
  });

  document.getElementById("prevButton").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    initializeAudio();
  });

  document.querySelectorAll(".card").forEach((card, index) => {
    card.addEventListener("click", async () => {
      currentFolder = FoldersNames[index];
      songs = await fetchSpotifyData();
      updateSongList();
      document.querySelector("playlistName").innerHTML = currentFolder;
      document.querySelector(".sidebar").style.left = "0%";
      document.querySelector(".closeButton").src = "svg and img/close.svg";
      currentIndex = 0;
      initializeAudio();
    });
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let x = e.offsetX;
    let width = e.target.clientWidth;
    if (!isNaN(currentAudio.duration)) {
      currentAudio.currentTime = (x / width) * currentAudio.duration;
      document.querySelector(".circle").style.left = `${(x / width) * 100}%`;
    }
  });

  let volumeControl = document.querySelector(".durationVolume input");
  volumeControl.addEventListener("change", (e) => {
    currentAudio.volume = e.target.value / 100;
  });

  let volumeIcon = document.querySelector(".volume");
  volumeIcon.addEventListener("click", () => {
    if (currentAudio.volume > 0) {
      currentAudio.volume = 0;
      volumeIcon.src = "svg and img/volumeMute.svg";
    } else {
      currentAudio.volume = 1;
      volumeIcon.src = "svg and img/volume.svg";
    }
  });
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".sidebar").style.left = "0";
    document.querySelector(".closeButton").src = "svg and img/close.svg";
  });

  document.querySelector(".closeButton").addEventListener("click", () => {
    document.querySelector(".sidebar").style.left = "-100%";
  });

  initializeAudio();
}

main();
