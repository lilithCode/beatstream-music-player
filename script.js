let currentFolder = "TaylorSwift";
let FoldersNames = ["TaylorSwift", "CokeStudio"];
let songs = [];
let currentAudio = null;
let isPlaying = false;

async function fetchSpotifyData() {
  try {
    const response = await fetch(
      `http://127.0.0.1:3000/Spotify/songs/${currentFolder}/`
    );
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.text();
    let div = document.createElement("div");
    div.innerHTML = data;

    let song = [];
    let aLinks = div.getElementsByTagName("a");

    for (let i = 0; i < aLinks.length; i++) {
      let href = aLinks[i].href;
      if (href.endsWith(".mp3")) {
        song.push(href);
      }
    }

    if (song.length === 0) {
      console.warn(`No songs found in ${currentFolder}`);
    }

    console.log("Fetched songs:", song);
    return song;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function convertTime(duration) {
  let seconds = Math.floor(duration % 60);
  let minutes = Math.floor((duration / 60) % 60);
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

function updateSongList() {
  let songList = document.getElementById("songList");
  songList.innerHTML = "";

  for (let i = 0; i < songs.length; i++) {
    let songName = document.createElement("div");
    songName.innerHTML = songs[i]
      .split(`/${currentFolder}/`)[1]
      .split("-")[0]
      .replaceAll("%20", " ")
      .replace(".mp3", "");
    let songArtist = document.createElement("div");
    songArtist.innerHTML = songs[i]
      .split("-")[1]
      .replace(".mp3", "")
      .replaceAll("%20", " ");
    songList.innerHTML += `<div class="song">
        <img src="svg and img/music.svg" alt="song" width="50" />
        <div class="song-info">
        <h3 style="margin: 5px; background-color: transparent">
       ${songName.innerHTML}
          </h3>
          <p
          style="color: grey; margin: 5px; background-color: transparent"
          >
          ${songArtist.innerHTML}
          </p>
        </div>
        <img class="playAtlib" src="svg and img/play.svg" alt="play" width="50" />
        </div>`;
  }

  console.log("Updated song list:", songList.innerHTML);
}

function updateProgress() {
  document.getElementById("songDuration").innerHTML = `${convertTime(
    currentAudio.currentTime
  )} / ${convertTime(currentAudio.duration)}`;
  document.querySelector(".circle").style.left = `${
    (currentAudio.currentTime / currentAudio.duration) * 100
  }%`;
}

function updateSongInfo(i) {
  document.getElementById("songInfo").innerHTML = songs[i]
    .split(`/${currentFolder}/`)[1]
    .split("-")[0]
    .replaceAll("%20", " ")
    .replace(".mp3", "");
  document.getElementById("songDuration").innerHTML = `${convertTime(
    currentAudio.currentTime
  )} / ${convertTime(currentAudio.duration)}`;
}

async function playMusic(pause = false) {
  let button = document.getElementById("startButton");
  if (pause || isPlaying) {
    if (currentAudio) {
      try {
        await currentAudio.pause();
        button.src = "svg and img/start.svg";
        isPlaying = false;
      } catch (error) {
        console.error("Pause error:", error);
      }
    }
  } else {
    if (currentAudio) {
      try {
        await currentAudio.play();
        button.src = "svg and img/pause.svg";
        isPlaying = true;
      } catch (error) {
        console.error("Playback error:", error);
      }
    }
  }
}

function initializeAudio() {
  if (songs.length === 0) {
    console.error("No valid songs found. Cannot play audio.");
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.removeEventListener("timeupdate", updateProgress);
    currentAudio.removeEventListener("loadedmetadata", () => updateSongInfo(0));
    currentAudio.removeEventListener("ended", handleSongEnd);
  }

  currentAudio = new Audio(songs[0]);
  let i = 0;

  currentAudio.addEventListener("timeupdate", updateProgress);
  currentAudio.addEventListener("loadedmetadata", () => updateSongInfo(i));
  currentAudio.addEventListener("ended", handleSongEnd);

  const startButton = document.getElementById("startButton");
  startButton.replaceWith(startButton.cloneNode(true));

  document
    .getElementById("startButton")
    .addEventListener("click", () => playMusic());
  document.getElementById("nextButton").addEventListener("click", async () => {
    if (i === songs.length - 1) {
      i = 0;
    } else {
      i++;
    }
    currentAudio.src = songs[i];
    currentAudio.load();
    currentAudio.addEventListener("loadedmetadata", async () => {
      updateSongInfo(i);
      document.querySelector(".circle").style.left = "0%";
      await currentAudio.play();
      document.getElementById("startButton").src = "svg and img/pause.svg";
      isPlaying = true;
    });
  });
  document.getElementById("prevButton").addEventListener("click", async () => {
    if (i === 0) {
      i = songs.length - 1;
    } else {
      i--;
    }
    currentAudio.src = songs[i];
    currentAudio.load();
    currentAudio.addEventListener("loadedmetadata", async () => {
      updateSongInfo(i);
      document.querySelector(".circle").style.left = "0%";
      await currentAudio.play();
      document.getElementById("startButton").src = "svg and img/pause.svg";
      isPlaying = true;
    });
  });

  Array.from(document.getElementsByClassName("playAtlib")).forEach(
    (element, index) => {
      element.addEventListener("click", async () => {
        if (currentAudio && isPlaying) {
          try {
            await currentAudio.pause();
            document.getElementById("startButton").src = "svg and img/start.svg";
            isPlaying = false;
          } catch (error) {
            console.error("Pause error:", error);
          }
        }
        currentAudio.src = songs[index];
        currentAudio.load();
        currentAudio.addEventListener("loadedmetadata", async () => {
          updateSongInfo(index);
          document.querySelector(".circle").style.left = "0%";
          await currentAudio.play();
          document.getElementById("startButton").src = "svg and img/pause.svg";
          isPlaying = true;
          i = index;
        });
      });
    }
  );

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let x = e.offsetX;
    let width = e.target.clientWidth;
    if (!isNaN(currentAudio.duration)) {
      currentAudio.currentTime = (x / width) * currentAudio.duration;
      document.querySelector(".circle").style.left = `${(x / width) * 100}%`;
    }
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".sidebar").style.left = "0";
    document.querySelector(".closeButton").src = "svg and img/close.svg";
  });
  document.querySelector(".closeButton").addEventListener("click", () => {
    document.querySelector(".sidebar").style.left = "-100%";
  });

  let checkVolume = true;

  function addVolumeEventListeners() {
    document.querySelector(".volume").addEventListener("click", () => {
      if (checkVolume == false) {
        document.querySelector(".volume").src = "svg and img/volume.svg";
        currentAudio.volume = 1;
        checkVolume = true;
        return;
      }
      document.querySelector(".volume").src = "svg and img/volumeMute.svg";
      currentAudio.volume = 0;
      checkVolume = false;
    });

    document.querySelector(".durationVolume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
      currentAudio.volume = e.target.value / 100;
    });
  }

  addVolumeEventListeners();
}

function handleSongEnd() {
  let i = songs.indexOf(currentAudio.src);
  if (i === songs.length - 1) {
    i = 0;
  } else {
    i++;
  }
  currentAudio.src = songs[i];
  currentAudio.load();
  currentAudio.addEventListener("loadedmetadata", async () => {
    await playMusic();
  });
}

async function main() {
  songs = await fetchSpotifyData();
  console.log("Songs loaded:", songs);
  updateSongList();
  initializeAudio();

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", async (event) => {
      const cardIndex = Array.from(document.querySelectorAll(".card")).indexOf(
        event.currentTarget
      );
      currentFolder = FoldersNames[cardIndex];

      if (currentAudio) {
        await currentAudio.pause();
        document.getElementById("startButton").src = "svg and img/start.svg";
        isPlaying = false;
        currentAudio.currentTime = 0;
        currentAudio.src = "";
      }

      songs = [];
      document.querySelector(".circle").style.left = "0%";

      songs = await fetchSpotifyData();
      console.log("Songs loaded after card click:", songs);
      updateSongList();
      initializeAudio();
    });
  });
}

main();
