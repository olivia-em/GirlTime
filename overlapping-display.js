let categoryVideos = {
  success: [],
  beauty: [],
  safety: [],
  love: [],
  family: [],
  friends: []
};
let totalVideos = 12;
let success = 1; 
let beauty = 1;
let safety = 1; 
let love = 1;
let family = 1; 
let friends = 1;
let videoPositions = new Map();
let layoutGenerated = false;
let fixedZoneAssignments = new Map(); // keeps each VM tied to a zone index


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
  constructor(category) {
    this.selectedVideo = null;
    this.category = category;
  }

  chooseRandomVideo() {
    if (categoryVideos[this.category].length > 0) {
      // Randomly select a video from the category's pool
      const randomIndex = Math.floor(random(categoryVideos[this.category].length));
      this.selectedVideo = categoryVideos[this.category][randomIndex];
      
      if (this.selectedVideo) {
        this.selectedVideo.loop();
      }
      // Force layout regeneration when a new video is chosen
      layoutGenerated = false;
    }
  }

  stopVideo() {
    if (this.selectedVideo) {
      this.selectedVideo.stop();
      // Make sure the video element is truly stopped
      if (this.selectedVideo.elt) {
        this.selectedVideo.elt.pause();
        this.selectedVideo.elt.currentTime = 0;
      }
      this.selectedVideo = null; // Reset for next selection
      // Force layout regeneration when a video is stopped
      layoutGenerated = false;
    }
  }

  disposeAllVideos() {
    Object.keys(categoryVideos).forEach(category => {
      categoryVideos[category].forEach(vid => {
        if (vid && vid.elt) {
          vid.stop();
          vid.elt.pause();
          vid.elt.currentTime = 0;
          vid.elt.src = ""; // Clear the source
        }
      });
    });
  }

  displayVideo() {
    if (this.selectedVideo && videoPositions.has(this)) {
      let pos = videoPositions.get(this);
      image(this.selectedVideo, pos.x, pos.y, pos.w, pos.h);
    }
  }
}


// CHANGING POSITIONS

// function generateLayout() {
//   videoPositions.clear();
//   fixedZoneAssignments.clear(); // Clear previous assignments to allow new random positions

//   let zones = [
//     { x: 20, y: 20, w: width / 3, h: height / 3 },                            // Top Left
//     { x: width - width / 3 - 20, y: 20, w: width / 3, h: height / 3 },        // Top Right
//     { x: 20, y: height - height / 3 - 20, w: width / 3, h: height / 3 },      // Bottom Left
//     { x: width - width / 3 - 20, y: height - height / 3 - 20, w: width / 3, h: height / 3 }, // Bottom Right
//     { x: width / 2 - width / 6, y: height / 2 - height / 6, w: width / 3, h: height / 3 },   // Center Small
//     { x: 0, y: 0, w: width, h: height }                                      // Full Cover
//   ];

//   let activeManagers = videoManagers.filter(vm => vm.selectedVideo);
  
//   // Only use first 5 zones unless we have all 6 videos active
//   let availableZones = activeManagers.length === 6 ? zones : zones.slice(0, 5);
  
//   // Create array of available zone indexes
//   let availableIndexes = Array.from(Array(availableZones.length).keys());
  
//   // Randomly assign zones to active managers
//   for (let vm of activeManagers) {
//     if (availableIndexes.length > 0) {
//       // Pick random index from available indexes
//       let randomPosition = Math.floor(random(availableIndexes.length));
//       let zoneIndex = availableIndexes[randomPosition];
      
//       // Remove used index from available ones
//       availableIndexes.splice(randomPosition, 1);
      
//       let zone = zones[zoneIndex];

//       // Aspect ratio logic
//       let vid = vm.selectedVideo;
//       let aspect = vid.width / vid.height;
//       if (!isFinite(aspect)) aspect = 16 / 9;

//       let targetW = zone.w;
//       let targetH = targetW / aspect;

//       if (targetH > zone.h) {
//         targetH = zone.h;
//         targetW = targetH * aspect;
//       }

//       let offsetX = zone.x + (zone.w - targetW) / 2;
//       let offsetY = zone.y + (zone.h - targetH) / 2;

//       videoPositions.set(vm, {
//         x: offsetX,
//         y: offsetY,
//         w: targetW,
//         h: targetH
//       });
//     }
//   }

//   return activeManagers.length > 0;
// }

// FIXED POSITION

function generateLayout() {
  videoPositions.clear();

  let zones = [
    { x: 20, y: 20, w: width / 3, h: height / 3 },                            // Top Left
    { x: width - width / 3 - 20, y: 20, w: width / 3, h: height / 3 },        // Top Right
    { x: 20, y: height - height / 3 - 20, w: width / 3, h: height / 3 },      // Bottom Left
    { x: width - width / 3 - 20, y: height - height / 3 - 20, w: width / 3, h: height / 3 }, // Bottom Right
    { x: width / 2 - width / 6, y: height / 2 - height / 6, w: width / 3, h: height / 3 },   // Center Small
    { x: 0, y: 0, w: width, h: height }                                      // Full Cover
  ];

  let activeManagers = videoManagers.filter(vm => vm.selectedVideo);

  // Only use full cover (last zone) if we have 6 active managers
  let availableZones = activeManagers.length === 6 ? zones : zones.slice(0, 5);

  for (let vm of activeManagers) {
    if (!fixedZoneAssignments.has(vm)) {
      // Get list of available indexes
      let usedIndexes = Array.from(fixedZoneAssignments.values());
      let availableIndexes = availableZones.map((_, i) => i).filter(i => !usedIndexes.includes(i));

      if (availableIndexes.length > 0) {
        let randomIndex = random(availableIndexes);
        fixedZoneAssignments.set(vm, randomIndex);
      }
    }

    let zoneIndex = fixedZoneAssignments.get(vm);
    if (zoneIndex === undefined || !zones[zoneIndex]) continue;

    let zone = zones[zoneIndex];

    // Aspect ratio logic
    let vid = vm.selectedVideo;
    let aspect = vid.width / vid.height;
    if (!isFinite(aspect)) aspect = 16 / 9;

    let targetW = zone.w;
    let targetH = targetW / aspect;

    if (targetH > zone.h) {
      targetH = zone.h;
      targetW = targetH * aspect;
    }

    let offsetX = zone.x + (zone.w - targetW) / 2;
    let offsetY = zone.y + (zone.h - targetH) / 2;

    videoPositions.set(vm, {
      x: offsetX,
      y: offsetY,
      w: targetW,
      h: targetH
    });
  }

  return activeManagers.length > 0;
}

// ORIGINAL

// function generateLayout() {
//   videoPositions.clear();

//   let zones = [
//     { x: 20, y: 20, w: width / 3, h: height / 3 },                            // Top Left
//     { x: width - width / 3 - 20, y: 20, w: width / 3, h: height / 3 },        // Top Right
//     { x: 20, y: height - height / 3 - 20, w: width / 3, h: height / 3 },      // Bottom Left
//     { x: width - width / 3 - 20, y: height - height / 3 - 20, w: width / 3, h: height / 3 }, // Bottom Right
//     { x: width / 2 - width / 6, y: height / 2 - height / 6, w: width / 3, h: height / 3 },   // Center Small
//     { x: 0, y: 0, w: width, h: height }                                      // Full Cover
//   ];

//   let activeManagers = videoManagers.filter(vm => vm.selectedVideo);

//   for (let vm of activeManagers) {
//     if (!fixedZoneAssignments.has(vm)) {
//       // Get list of available indexes
//       let usedIndexes = Array.from(fixedZoneAssignments.values());
//       let availableIndexes = zones.map((_, i) => i).filter(i => !usedIndexes.includes(i));

//       if (availableIndexes.length > 0) {
//         let randomIndex = random(availableIndexes);
//         fixedZoneAssignments.set(vm, randomIndex);
//       }
//     }

//     let zoneIndex = fixedZoneAssignments.get(vm);
//     if (zoneIndex === undefined || !zones[zoneIndex]) continue;

//     let zone = zones[zoneIndex];

//     // Aspect ratio logic
//     let vid = vm.selectedVideo;
//     let aspect = vid.width / vid.height;
//     if (!isFinite(aspect)) aspect = 16 / 9;

//     let targetW = zone.w;
//     let targetH = targetW / aspect;

//     if (targetH > zone.h) {
//       targetH = zone.h;
//       targetW = targetH * aspect;
//     }

//     let offsetX = zone.x + (zone.w - targetW) / 2;
//     let offsetY = zone.y + (zone.h - targetH) / 2;

//     videoPositions.set(vm, {
//       x: offsetX,
//       y: offsetY,
//       w: targetW,
//       h: targetH
//     });
//   }

//   return activeManagers.length > 0;
// }


// function generateLayout() {
//   videoPositions.clear();

//   let zones = [
//     { x: 20, y: 20, w: width / 3, h: height / 3 },                            // Top Left
//     { x: width - width / 3 - 20, y: 20, w: width / 3, h: height / 3 },        // Top Right
//     { x: 20, y: height - height / 3 - 20, w: width / 3, h: height / 3 },      // Bottom Left
//     { x: width - width / 3 - 20, y: height - height / 3 - 20, w: width / 3, h: height / 3 }, // Bottom Right
//     { x: width / 2 - width / 6, y: height / 2 - height / 6, w: width / 3, h: height / 3 },   // Center Small
//     { x: 0, y: 0, w: width, h: height }                                      // Full Cover
//   ];

//   let activeManagers = videoManagers.filter(vm => vm.selectedVideo);
//   for (let i = 0; i < activeManagers.length && i < zones.length; i++) {
//     videoPositions.set(activeManagers[i], zones[i]);
//   }

//   return activeManagers.length > 0;
// }

function disposeAllVideos() {
  videoManagers.forEach(vm => {
    vm.stopVideo();
  });
  videoPositions.clear();
  layoutGenerated = false;
}

function draw() {
  blendMode(BLEND);
  background(0);
  blendMode(DIFFERENCE);
  
  // Get currently active video managers
  let activeManagers = videoManagers.filter(vm => vm.selectedVideo);
  
  // Generate layout if needed
  if (!layoutGenerated && activeManagers.length > 0) {
    layoutGenerated = generateLayout();
  }
  
  // If layout is generated but videos have changed, regenerate
  if (layoutGenerated && videoPositions.size !== activeManagers.length) {
    layoutGenerated = generateLayout();
  }
  
  // Display all active videos
  for (let vm of videoManagers) {
    if (vm.selectedVideo) {
      vm.displayVideo();
    }
  }
  
  // Check all states
  checkSuccess();
  checkBeauty();
  checkSafety();
  checkLove();
  checkFamily();
  checkFriends();
}

// Modify hardReset to properly clear everything
function hardReset() {
  // Stop all sounds
  stopSuccess();
  stopBeauty();
  stopSafety();
  stopLove();
  stopFamily();
  stopFriends();
  
  // Reset all videos
  disposeAllVideos();
  
  // Reset all states
  success = 1;
  beauty = 1;
  safety = 1;
  love = 1;
  family = 1;
  friends = 1;
  
  // Clear positions and layout flag
  videoPositions.clear();
  layoutGenerated = false;
}

// Create video managers
let successVideos = new VideoManager('success');
let beautyVideos = new VideoManager('beauty');
let safetyVideos = new VideoManager('safety');
let loveVideos = new VideoManager('love');
let familyVideos = new VideoManager('family');
let friendsVideos = new VideoManager('friends');

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
  // Create separate video instances for each category
  for (let i = 1; i <= totalVideos; i++) {
    let path = 'images/' + i + '.mov';
    
    // Create separate video instances for each category
    categoryVideos.success.push(createVideo(path));
    categoryVideos.beauty.push(createVideo(path));
    categoryVideos.safety.push(createVideo(path));
    categoryVideos.love.push(createVideo(path));
    categoryVideos.family.push(createVideo(path));
    categoryVideos.friends.push(createVideo(path));
    
    // Hide all videos
    categoryVideos.success[i-1].hide();
    categoryVideos.beauty[i-1].hide();
    categoryVideos.safety[i-1].hide();
    categoryVideos.love[i-1].hide();
    categoryVideos.family[i-1].hide();
    categoryVideos.friends[i-1].hide();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupWebSerial();
}



// Function to play a **single chosen** success sound and loop it manually
// Update the play functions to use random video selection
function playSuccess() {
  if (success === 0 && !successVideos.selectedVideo) {
    if (!successSoundKey) {
      let soundKeys = ["shiver", "stronger"];
      successSoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentSuccessSound = successSounds.player(successSoundKey);
    currentSuccessSound.start();

    // Choose a random video from the success category
    successVideos.chooseRandomVideo();

    // When sound ends, restart it if success is still 0
    currentSuccessSound.onstop = () => {
      if (success === 0) {
        currentSuccessSound.start(); // Restart same sound
      }
    };
  }
}

// Similarly update the other play functions
function playBeauty() {
  if (beauty === 0 && !beautyVideos.selectedVideo) {
    if (!beautySoundKey) {
      let soundKeys = ["sweet", "sun"];
      beautySoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentBeautySound = beautySounds.player(beautySoundKey);
    currentBeautySound.start();

    // Choose a random video from the beauty category
    beautyVideos.chooseRandomVideo();

    // When sound ends, restart it if beauty is still 0
    currentBeautySound.onstop = () => {
      if (beauty === 0) {
        currentBeautySound.start(); // Restart same sound
      }
    };
  }
}

function playSafety() {
  if (safety === 0 && !safetyVideos.selectedVideo) {
    if (!safetySoundKey) {
      let soundKeys = ["shiver", "stronger"];
      safetySoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentSafetySound = safetySounds.player(safetySoundKey);
    currentSafetySound.start();

    // Choose a random video from the safety category
    safetyVideos.chooseRandomVideo();

    // When sound ends, restart it if safety is still 0
    currentSafetySound.onstop = () => {
      if (safety === 0) {
        currentSafetySound.start(); // Restart same sound
      }
    };
  }
}

function playLove() {
  if (love === 0 && !loveVideos.selectedVideo) {
    if (!loveSoundKey) {
      let soundKeys = ["sun", "sweet"];
      loveSoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentLoveSound = loveSounds.player(loveSoundKey);
    currentLoveSound.start();

    // Choose a random video from the love category
    loveVideos.chooseRandomVideo();

    // When sound ends, restart it if love is still 0
    currentLoveSound.onstop = () => {
      if (love === 0) {
        currentLoveSound.start(); // Restart same sound
      }
    };
  }
}

function playFamily() {
  if (family === 0 && !familyVideos.selectedVideo) {
    if (!familySoundKey) {
      let soundKeys = ["shiver", "stronger"];
      familySoundKey = random(soundKeys);
    }

    currentFamilySound = familySounds.player(familySoundKey);
    currentFamilySound.start();

    // Choose a random video from the family category
    familyVideos.chooseRandomVideo();

    currentFamilySound.onstop = () => {
      if (family === 0) {
        currentFamilySound.start();
      }
    };
  }
}

function playFriends() {
  if (friends === 0 && !friendsVideos.selectedVideo) {
    if (!friendsSoundKey) {
      let soundKeys = ["sun", "sweet"];
      friendsSoundKey = random(soundKeys);
    }

    currentFriendsSound = friendsSounds.player(friendsSoundKey);
    currentFriendsSound.start();

    // Choose a random video from the friends category
    friendsVideos.chooseRandomVideo();

    currentFriendsSound.onstop = () => {
      if (friends === 0) {
        currentFriendsSound.start();
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

// Function to stop love sounds & videos
function stopLove() {
  if (currentLoveSound) {
    currentLoveSound.stop();
    currentLoveSound = null;
  }
  loveVideos.stopVideo();
  loveSoundKey = null;
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
// function draw() {
//   blendMode(BLEND);
//   background(0);
//   videoManagers[0].displayVideo();
//   blendMode(DIFFERENCE);
//   videoManagers[1].displayVideo();
//   videoManagers[2].displayVideo();
//   videoManagers[3].displayVideo();
//   videoManagers[4].displayVideo();
//   videoManagers[5].displayVideo();
//   checkSuccess();
//   checkBeauty();
//   checkSafety();
//   checkLove();
//   checkFamily();
//   checkFriends();
// }

// Handle window resizing (including exiting full-screen mode)
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// function hardReset() {
//   // Stop all sounds
//   stopSuccess();
//   stopBeauty();
//   stopSafety();
//   stopLove();
//   stopFamily();
//   stopFriends();
  
//   // Reset all videos
//   disposeAllVideos();
  
//   // Re-initialize if needed
//   // You could reload the page or reinitialize key components
// }

// Extend keyPressed to toggle new categories
function keyPressed() {
  if (key === 'r' || key === 'R') {
    hardReset();
  }

  if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);

    // Use a short delay before resizing the canvas to allow fullscreen mode to apply
    setTimeout(() => {
      resizeCanvas(windowWidth, windowHeight);
    }, 100);
  }

  // Your existing key toggles
  if (key === '1') success = 0;
  else if (key === '2') success = 1;
  else if (key === '3') beauty = 0;
  else if (key === '4') beauty = 1;
  else if (key === '5') safety = 0;
  else if (key === '6') safety = 1;
  else if (key === '7') love = 0;
  else if (key === '8') love = 1;
  else if (key === '9') family = 0;
  else if (key === '0') family = 1;
  else if (key === '-') friends = 0;
  else if (key === '=') friends = 1;

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
