let videosA = [];
let videosB = [];
let totalVideos = 12;
let success = 1; 
let beauty = 1;
let safety = 1; 
let love = 1;
let family = 1; 
let friends = 1;

// p5.webserial library instance and related variables
const serial = new p5.WebSerial(); // WebSerial library instance
let portButton; // Button for port selection
let inData = []; // Array for incoming serial data
let inString = []; // String for incoming serial data
let outByte = 0; // Byte for outgoing serial data

const successSounds = new Tone.Players({
  shiver: "sounds/synth1.mp3",
  stronger: "sounds/synth2.mp3",
}).toDestination();

const beautySounds = new Tone.Players({
  sun: "sounds/synth3.mp3",
  sweet: "sounds/synth4.mp3",
}).toDestination();

const safetySounds = new Tone.Players({
  shiver: "sounds/synth1.mp3",
  stronger: "sounds/synth2.mp3",
}).toDestination();

const loveSounds = new Tone.Players({
  sun: "sounds/synth3.mp3",
  sweet: "sounds/synth4.mp3",
}).toDestination();

const familySounds = new Tone.Players({
  shiver: "sounds/synth1.mp3",
  stronger: "sounds/synth2.mp3",
}).toDestination();

const friendsSounds = new Tone.Players({
  sun: "sounds/synth3.mp3",
  sweet: "sounds/synth4.mp3",
}).toDestination();

// VideoManager class to handle selection and playback
class VideoManager {
  constructor() {
    this.selectedVideo = null;
  }

  chooseVideo(index,attribute) {
    if (videosA.length > index && videosB.length > index && attribute === 0){
      this.selectedVideo = videosA[index];
    } else if (videosA.length > index && videosB.length > index && attribute === 1){
      this.selectedVideo = videosB[index];
    }
    if (this.selectedVideo) {
      this.selectedVideo.loop();
    }
  }

  stopVideo() {
    if (this.selectedVideo) {
      this.selectedVideo.stop();
      this.selectedVideo = null; // Reset for next selection
    }
  }

  displayVideo() {
    if (this.selectedVideo) {
      image(this.selectedVideo, 0, 0, width, height);
    }
  }
}

// Create video managers
let successVideos = new VideoManager();
let beautyVideos = new VideoManager();
let safetyVideos = new VideoManager();
let loveVideos = new VideoManager();
let familyVideos = new VideoManager();
let friendsVideos = new VideoManager();

let videoManagers = [successVideos, beautyVideos, safetyVideos, loveVideos, familyVideos, friendsVideos];

let currentSuccessSound = null;
let currentBeautySound = null;
let currentSafetySound = null;
let currentLoveSound = null;
let currentFamilySound = null;
let currentFriendsSound = null;
let successSoundKey = null;
let beautySoundKey = null;
let safetySoundKey = null;
let loveSoundKey = null;
let familySoundKey = null;
let friendsSoundKey = null;

function preload() {
  for (let i = 1; i <= totalVideos; i++) {
    let path = 'images/' + i + '.mov';
    let vid = createVideo(path);
    vid.hide();
    vid.speed(1);

    if (i % 2 === 0) {
      videosA.push(vid);
    } else {
      videosB.push(vid);
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupWebSerial();
}

// Function to play a **single chosen** success sound and loop it manually
function playSuccess() {
  if (success === 0 && !successVideos.selectedVideo) {
    if (!successSoundKey) {
      let soundKeys = ["shiver", "stronger"];
      successSoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentSuccessSound = successSounds.player(successSoundKey);
    currentSuccessSound.start();

    // Start video only when sound starts
    if (successSoundKey === "shiver") {
      successVideos.chooseVideo(0,0);
    }
    else {
    successVideos.chooseVideo(0,1);
    }

    // When sound ends, restart it if success is still 0
    currentSuccessSound.onstop = () => {
      if (success === 0) {
        currentSuccessSound.start(); // Restart same sound
      }
    };
  }
}

// Function to stop success sounds & videos
function stopSuccess() {
  if (currentSuccessSound) {
    currentSuccessSound.stop();
    currentSuccessSound = null;
  }
  successVideos.stopVideo();
  successSoundKey = null; // Reset so next time a new sound is picked
}

// Function to play a **single chosen** beauty sound and loop it manually
function playBeauty() {
  if (beauty === 0 && !beautyVideos.selectedVideo) {
    if (!beautySoundKey) {
      let soundKeys = ["sweet", "sun"];
      beautySoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentBeautySound = beautySounds.player(beautySoundKey);
    currentBeautySound.start();

    // Start video only when sound starts
    if (beautySoundKey === "sun") {
      beautyVideos.chooseVideo(1,0);
    } else  {
    beautyVideos.chooseVideo(1,1);
    }

    // When sound ends, restart it if beauty is still 0
    currentBeautySound.onstop = () => {
      if (beauty === 0) {
        currentBeautySound.start(); // Restart same sound
      }
    };
  }
}

// Function to stop beauty sounds & videos
function stopBeauty() {
  if (currentBeautySound) {
    currentBeautySound.stop();
    currentBeautySound = null;
  }
  beautyVideos.stopVideo();
  beautySoundKey = null; // Reset so next time a new sound is picked
}

// Function to check and trigger success state changes
function checkSuccess() {
  if (success === 0) {
    playSuccess();
  } else if (success === 1) {
    stopSuccess();
  }
}

// Function to check and trigger beauty state changes
function checkBeauty() {
  if (beauty === 0) {
    playBeauty();
  } else if (beauty === 1) {
    stopBeauty();
  }
}
// Function to play a **single chosen** safety sound and loop it manually
function playSafety() {
  if (safety === 0 && !safetyVideos.selectedVideo) {
    if (!safetySoundKey) {
      let soundKeys = ["shiver", "stronger"];
      safetySoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentSafetySound = safetySounds.player(safetySoundKey);
    currentSafetySound.start();

    // Start video only when sound starts
    if (safetySoundKey === "shiver") {
      safetyVideos.chooseVideo(2, 0);
    } else {
      safetyVideos.chooseVideo(2, 1);
    }

    // When sound ends, restart it if safety is still 0
    currentSafetySound.onstop = () => {
      if (safety === 0) {
        currentSafetySound.start(); // Restart same sound
      }
    };
  }
}

// Function to stop safety sounds & videos
function stopSafety() {
  if (currentSafetySound) {
    currentSafetySound.stop();
    currentSafetySound = null;
  }
  safetyVideos.stopVideo();
  safetySoundKey = null; // Reset so next time a new sound is picked
}

// Function to play a **single chosen** love sound and loop it manually
function playLove() {
  if (love === 0 && !loveVideos.selectedVideo) {
    if (!loveSoundKey) {
      let soundKeys = ["sun", "sweet"];
      loveSoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentLoveSound = loveSounds.player(loveSoundKey);
    currentLoveSound.start();

    // Start video only when sound starts
    if (loveSoundKey === "sun") {
      loveVideos.chooseVideo(3, 0);
    } else {
      loveVideos.chooseVideo(3, 1);
    }

    // When sound ends, restart it if love is still 0
    currentLoveSound.onstop = () => {
      if (love === 0) {
        currentLoveSound.start(); // Restart same sound
      }
    };
  }
}

// Function to stop love sounds & videos
function stopLove() {
  if (currentLoveSound) {
    currentLoveSound.stop();
    currentLoveSound = null;
  }
  loveVideos.stopVideo();
  loveSoundKey = null;
}

// Function to play a **single chosen** family sound and loop it manually
function playFamily() {
  if (family === 0 && !familyVideos.selectedVideo) {
    if (!familySoundKey) {
      let soundKeys = ["shiver", "stronger"];
      familySoundKey = random(soundKeys);
    }

    currentFamilySound = familySounds.player(familySoundKey);
    currentFamilySound.start();

    // Start video only when sound starts
    if (familySoundKey === "shiver") {
      familyVideos.chooseVideo(4, 0);
    } else {
      familyVideos.chooseVideo(4, 1);
    }

    currentFamilySound.onstop = () => {
      if (family === 0) {
        currentFamilySound.start();
      }
    };
  }
}

// Function to stop family sounds & videos
function stopFamily() {
  if (currentFamilySound) {
    currentFamilySound.stop();
    currentFamilySound = null;
  }
  familyVideos.stopVideo();
  familySoundKey = null;
}

// Function to play a **single chosen** friends sound and loop it manually
function playFriends() {
  if (friends === 0 && !friendsVideos.selectedVideo) {
    if (!friendsSoundKey) {
      let soundKeys = ["sun", "sweet"];
      friendsSoundKey = random(soundKeys);
    }

    currentFriendsSound = friendsSounds.player(friendsSoundKey);
    currentFriendsSound.start();

    // Start video only when sound starts
    if (friendsSoundKey === "sun") {
      friendsVideos.chooseVideo(5, 0);
    } else {
      friendsVideos.chooseVideo(5, 1);
    }

    currentFriendsSound.onstop = () => {
      if (friends === 0) {
        currentFriendsSound.start();
      }
    };
  }
}

// Function to stop friends sounds & videos
function stopFriends() {
  if (currentFriendsSound) {
    currentFriendsSound.stop();
    currentFriendsSound = null;
  }
  friendsVideos.stopVideo();
  friendsSoundKey = null;
}

// Function to check and trigger safety state changes
function checkSafety() {
  if (safety === 0) {
    playSafety();
  } else if (safety === 1) {
    stopSafety();
  }
}

// Function to check and trigger love state changes
function checkLove() {
  if (love === 0) {
    playLove();
  } else if (love === 1) {
    stopLove();
  }
}

// Function to check and trigger family state changes
function checkFamily() {
  if (family === 0) {
    playFamily();
  } else if (family === 1) {
    stopFamily();
  }
}

// Function to check and trigger friends state changes
function checkFriends() {
  if (friends === 0) {
    playFriends();
  } else if (friends === 1) {
    stopFriends();
  }
}

// Extend draw function to display all video categories
function draw() {
  blendMode(BLEND);
  background(0);
  videoManagers[0].displayVideo();
  blendMode(DIFFERENCE);
  videoManagers[1].displayVideo();
  videoManagers[2].displayVideo();
  videoManagers[3].displayVideo();
  videoManagers[4].displayVideo();
  videoManagers[5].displayVideo();
  checkSuccess();
  checkBeauty();
  checkSafety();
  checkLove();
  checkFamily();
  checkFriends();
}

// Extend keyPressed to toggle new categories
function keyPressed() {
  if (key === '1') {
    success = 0;
  } else if (key === '2') {
    success = 1;
  }

  if (key === '3') {
    beauty = 0;
  } else if (key === '4') {
    beauty = 1;
  }

  if (key === '5') {
    safety = 0;
  } else if (key === '6') {
    safety = 1;
  }

  if (key === '7') {
    love = 0;
  } else if (key === '8') {
    love = 1;
  }

  if (key === '9') {
    family = 0;
  } else if (key === '0') {
    family = 1;
  }

  if (key === '-') {
    friends = 0;
  } else if (key === '=') {
    friends = 1;
  }

  checkSuccess();
  checkBeauty();
  checkSafety();
  checkLove();
  checkFamily();
  checkFriends();
}


// Start Tone.js once loaded
Tone.loaded().then(() => {
  console.log("Sounds Loaded");
  Tone.Transport.start();
  checkSuccess();
  checkBeauty();
  checkSafety();
  checkLove();
  checkFamily();
  checkFriends();
});

// serial communication

// ------------------- WebSerial Setup -------------------

function setupWebSerial() {
  if (!navigator.serial) {
    alert("WebSerial is not supported in this browser. Try Chrome or MS Edge.");
  }

  navigator.serial.addEventListener("connect", portConnect);
  navigator.serial.addEventListener("disconnect", portDisconnect);

  serial.getPorts();
  serial.on("noport", makePortButton);
  serial.on("portavailable", openPort);
  serial.on("requesterror", portError);
  serial.on("data", serialEvent);
  serial.on("close", makePortButton);
}

// ------------------- Port Button Functions -------------------

function makePortButton() {
  portButton = createButton("choose port");
  portButton.position(10, 10);
  portButton.mousePressed(choosePort);
}

function choosePort() {
  if (portButton) portButton.show();
  serial.requestPort();
}

function openPort() {
  serial.open().then(() => {
    console.log("port open");
    if (portButton) portButton.hide();
  });
}

// ------------------- Serial Event Functions -------------------

function serialEvent() {
  let inString = serial.readStringUntil("\r\n");
  if (inString != null) {
    let list = split(trim(inString), ",");
    if (list.length > 5) {
      success = float(list[0]);
      beauty = float(list[1]);
      safety = float(list[2]);
      love = float(list[3]);
      family = float(list[4]);
      friends = float(list[5]);
      serial.write("x");
    }
  }
}

function portConnect() {
  console.log("port connected");
  serial.getPorts();
}

function portDisconnect() {
  serial.close();
  console.log("port disconnected");
}

function portError(err) {
  alert("Serial port error: " + err);
}
