// // Optimized Collage Sketch for p5.js + Tone.js + WebSerial
// // Improved for stability with rapid state changes

// let categoryVideos = {
//   success: [],
//   beauty: [],
//   safety: [],
//   love: [],
//   family: [],
//   friends: []
// };
// let videosPerCategory = 5;
// let success = 1, beauty = 1, safety = 1, love = 1, family = 1, friends = 1;
// let videosReady = false;
// let usedLayouts = [];
// let lastStates = {}; // Track previous states
// let debounceTimers = {}; // Debounce timers for state changes
// let debounceDelay = 200; // Reduced debounce for more responsive feel

// // Serial Setup
// const serial = new p5.WebSerial();
// let portButton;
// let inData = [], inString = [], outByte = 0;

// // Audio Setup with Tone.js
// Tone.Players.defaults = { 
//   fadeOut: 0.3, // Shortened fadeout time for faster response
//   fadeIn: 0.1,  // Shortened fadein for faster response
//   loop: true    // Enable looping by default
// };

// const categories = ["success", "beauty", "safety", "love", "family", "friends"];
// const soundFiles = {
//   success: { shiver: "sounds/synth1.mp3", stronger: "sounds/synth2.mp3" },
//   beauty: { sun: "sounds/synth3.mp3", sweet: "sounds/synth4.mp3" },
//   safety: { shiver: "sounds/synth1.mp3", stronger: "sounds/synth2.mp3" },
//   love: { sun: "sounds/synth3.mp3", sweet: "sounds/synth4.mp3" },
//   family: { shiver: "sounds/synth1.mp3", stronger: "sounds/synth2.mp3" },
//   friends: { sun: "sounds/synth3.mp3", sweet: "sounds/synth4.mp3" },
// };

// const players = {};
// const currentSounds = {};
// const soundKeys = {};

// // Initialize categories with default states
// categories.forEach(cat => {
//   lastStates[cat] = 1; // Start inactive
//   players[cat] = new Tone.Players(soundFiles[cat]).toDestination();
//   players[cat].volume.value = -6;
//   currentSounds[cat] = null;
//   soundKeys[cat] = null;
//   debounceTimers[cat] = null;
// });

// // VideoManager Class - Improved for stability and error handling
// class VideoManager {
//   constructor(category) {
//     this.category = category;
//     this.selectedVideo = null;
//     this.layout = null;
//     this.isActive = false;
//     this.transitionState = "idle"; // idle, starting, stopping
//     this.transitionTimer = 0;
//     this.retryCount = 0;
//     this.maxRetries = 3;
//   }

//   chooseRandomVideo() {
//     const vids = categoryVideos[this.category];
//     if (!vids.length) {
//       console.log(`No videos available for ${this.category}`);
//       return;
//     }

//     // If we already have a video playing, keep it
//     if (this.selectedVideo && this.isActive) return;
    
//     // Choose a random video
//     const index = Math.floor(random(vids.length));
//     this.selectedVideo = vids[index];
    
//     // Setup video
//     this.selectedVideo.elt.muted = true;
//     this.selectedVideo.volume(0);
    
//     // Preload the video without showing it yet
//     this.selectedVideo.elt.currentTime = 0;
    
//     // Play with error handling and retry logic
//     const playPromise = this.selectedVideo.elt.play();
    
//     if (playPromise !== undefined) {
//       playPromise.catch(e => {
//         console.log(`Play prevented for ${this.category}:`, e);
//         if (this.retryCount < this.maxRetries) {
//           this.retryCount++;
//           setTimeout(() => this.chooseRandomVideo(), 500);
//         } else {
//           console.error(`Failed to play video for ${this.category} after ${this.maxRetries} attempts`);
//           this.retryCount = 0;
//         }
//       });
//     }
    
//     this.transitionState = "starting";
//     this.transitionTimer = millis();
    
//     // Calculate layout
//     this.assignLayout();
//   }
  
//   assignLayout() {
//     // More robust layout calculation
//     let tries = 15, bestScore = -Infinity, best = null;
    
//     for (let i = 0; i < tries; i++) {
//       let scale = random(0.25, 0.5);
//       let w = width * scale;
//       let h = w / (this.selectedVideo?.width / this.selectedVideo?.height || 1.78);
//       let x = random(w / 2, width - w / 2);
//       let y = random(h / 2, height - h / 2);
      
//       // Calculate a score based on distance from other videos
//       let minDist = Infinity;
//       for (let layout of usedLayouts) {
//         let dist = Math.sqrt(Math.pow(x - layout.x, 2) + Math.pow(y - layout.y, 2));
//         minDist = Math.min(minDist, dist);
//       }
      
//       // Also consider distance from screen edges
//       let edgeDist = Math.min(x, y, width - x, height - y);
//       let score = minDist + edgeDist * 0.5;
      
//       if (score > bestScore) {
//         bestScore = score;
//         best = { x, y, w, h, scale };
//       }
//     }
    
//     this.layout = best;
//   }

// // Modified update method for VideoManager class
// update() {
//   // Handle transitions
//   if (this.transitionState === "starting") {
//     if (millis() - this.transitionTimer > 300) { // Shortened transition time
//       if (this.selectedVideo) {
//         this.selectedVideo.loop();
//         this.isActive = true;
//       }
//       this.transitionState = "idle";
//       this.retryCount = 0;
//     }
//   } else if (this.transitionState === "stopping") {
//     if (millis() - this.transitionTimer > 200) { // Shortened transition time
//       if (this.selectedVideo) {
//         try {
//           this.selectedVideo.stop();
//           this.selectedVideo = null;
//         } catch (e) {
//           console.error(`Error stopping video for ${this.category}:`, e);
//         }
//       }
//       this.isActive = false;
//       this.transitionState = "idle";
//       // Clear layout when stopping video
//       this.layout = null;
//     }
//   }
// }

// // Modified stopVideo method to clear layout when stopping
// stopVideo() {
//   if (!this.selectedVideo) return;
  
//   // Don't immediately stop - prepare for stopping
//   this.transitionState = "stopping";
//   this.transitionTimer = millis();
//   this.isActive = false;
//   // We'll clear the layout once the video is fully stopped in the update method
// }

//   displayVideoAtLayout() {
//     if (!this.selectedVideo || !this.isActive || !this.layout) return;
    
//     const { x, y, w, h } = this.layout;
    
//     // Add error handling for video display
//     try {
//       image(this.selectedVideo, x - w / 2, y - h / 2, w, h);
//     } catch (e) {
//       console.log(`Error displaying video for ${this.category}:`, e);
//       this.stopVideo(); // Stop problematic video
//     }
//   }
// }

// // Video Manager Instances
// const videoManagers = categories.map(c => new VideoManager(c));

// // Preload with better error handling and logging
// function preload() {
//   let loadPromises = [];
//   let loadedCount = 0;
//   let totalVideos = categories.length * videosPerCategory;

//   console.log(`Starting to load ${totalVideos} videos...`);
  
//   // Pre-initialize Tone.js
//   Tone.start().catch(e => console.error("Tone.js start error:", e));
  
//   categories.forEach(category => {
//     for (let i = 1; i <= videosPerCategory; i++) {
//       const path = `images2/${category}/${i}.mov`;
//       try {
//         console.log(`Loading video: ${path}`);
//         const vid = createVideo(path);
//         vid.hide();
//         vid.elt.preload = "auto";
//         vid.elt.muted = true;
//         vid.attribute("playsinline", true);
//         vid.elt.autoplay = false;
        
//         // Set quality options for better performance
//         if (vid.elt.canPlayType) {
//           vid.elt.controlsList = "nodownload nofullscreen noremoteplayback";
//         }
        
//         categoryVideos[category].push(vid);
        
//         loadPromises.push(new Promise(res => {
//           vid.elt.onloadeddata = () => {
//             loadedCount++;
//             console.log(`Loaded ${loadedCount}/${totalVideos} videos`);
//             res();
//           };
//           // Add timeout fallback
//           setTimeout(res, 5000);
//         }));
//       } catch (e) {
//         console.error(`Error loading video: ${path}`, e);
//       }
//     }
//   });

//   // Display progress and continue after timeout if needed
//   Promise.race([
//     Promise.all(loadPromises),
//     new Promise(res => setTimeout(res, 12000))
//   ]).then(() => {
//     videosReady = true;
//     console.log(`Videos loaded: ${loadedCount}/${totalVideos}`);
    
//     // Check if we have at least one video per category
//     let missingCategories = [];
//     categories.forEach(cat => {
//       if (categoryVideos[cat].length === 0) {
//         missingCategories.push(cat);
//       }
//     });
    
//     if (missingCategories.length > 0) {
//       console.warn(`Warning: Missing videos for categories: ${missingCategories.join(', ')}`);
//     }
//   });
// }

// // Setup Delayed
// function setupAfterVideos() {
//   createCanvas(windowWidth, windowHeight);
//   frameRate(30);
//   setupWebSerial();
  
//   // Initialize Tone.js
//   Tone.context.resume().catch(e => console.error("Tone.js resume error:", e));
  
//   // Setup initial states
//   categories.forEach(cat => {
//     window[cat] = 1; // Start all inactive
//     lastStates[cat] = 1;
//   });
  
//   console.log("Setup complete");
// }

// function draw() {
//   if (!videosReady) {
//     background(0);
//     fill(255);
//     textAlign(CENTER, CENTER);
//     textSize(20);
//     text("Loading videos...", width / 2, height / 2);
//     return;
//   }

//   if (!window.hasSetupRun) {
//     setupAfterVideos();
//     window.hasSetupRun = true;
//   }

//   blendMode(BLEND);
//   background(0);
//   blendMode(DIFFERENCE);

//   // Update all video managers
//   videoManagers.forEach(vm => vm.update());
  
//   // Reset layouts for dynamic positioning
//   usedLayouts = [];
  
//   // Dynamic layout based on active videos
//   layoutVideos();
  
//   // Check state changes with debouncing
//   checkStatesWithDebounce();
// }

// function layoutVideos() {
//   const active = videoManagers.filter(vm => vm.isActive);
  
//   if (active.length <= 0) return;
  
//   // Clear used layouts before assigning new ones
//   usedLayouts = [];
  
//   // Determine orientation
//   const isLandscape = width > height;
  
//   // For first two videos (main focus) - give them equal sizing and position
//   if (active.length >= 1) {
//     const vm1 = active[0];
    
//     // Only assign layout if not already assigned (to prevent continuous updates)
//     if (!vm1.layout) {
//       if (isLandscape) {
//         // Landscape: side by side (left)
//         let w = width * 0.45; // 45% of screen width
//         let aspect = vm1.selectedVideo?.width / vm1.selectedVideo?.height || 1.78;
//         let h = w / aspect;
//         vm1.layout = { x: width * 0.25, y: height / 2, w, h };
//       } else {
//         // Portrait: stacked (top)
//         let w = width * 0.8; // 80% of screen width
//         let aspect = vm1.selectedVideo?.width / vm1.selectedVideo?.height || 1.78;
//         let h = w / aspect;
//         vm1.layout = { x: width / 2, y: height * 0.25, w, h };
//       }
//       usedLayouts.push(vm1.layout);
//     }
//     vm1.displayVideoAtLayout();
//   }
  
//   if (active.length >= 2) {
//     const vm2 = active[1];
    
//     // Only assign layout if not already assigned
//     if (!vm2.layout) {
//       // Match the first video's dimensions for consistency
//       const vm1 = active[0];
//       const aspect = vm2.selectedVideo?.width / vm2.selectedVideo?.height || 1.78;
      
//       if (isLandscape) {
//         // Landscape: side by side (right)
//         let w = vm1.layout.w; // Same width as first video
//         let h = w / aspect;
//         vm2.layout = { x: width * 0.75, y: height / 2, w, h };
//       } else {
//         // Portrait: stacked (bottom)
//         let w = vm1.layout.w; // Same width as first video
//         let h = w / aspect;
//         vm2.layout = { x: width / 2, y: height * 0.75, w, h };
//       }
//       usedLayouts.push(vm2.layout);
//     }
//     vm2.displayVideoAtLayout();
//   }
  
//   // For remaining videos (smaller, scattered)
//   for (let i = 2; i < active.length; i++) {
//     const vm = active[i];
    
//     // Only assign layout if not already assigned
//     if (!vm.layout) {
//       vm.assignLayout();
//       usedLayouts.push(vm.layout);
//     }
    
//     vm.displayVideoAtLayout();
//   }
// }

// function checkStatesWithDebounce() {
//   categories.forEach(cat => {
//     const currentState = window[cat];
    
//     // Only process if state changed
//     if (currentState !== lastStates[cat]) {
//       console.log(`State change for ${cat}: ${lastStates[cat]} -> ${currentState}`);
      
//       // Clear existing timer if there is one
//       if (debounceTimers[cat]) {
//         clearTimeout(debounceTimers[cat]);
//       }
      
//       // Set new timer
//       debounceTimers[cat] = setTimeout(() => {
//         if (currentState === 0) {
//           playCategory(cat);
//         } else {
//           stopCategory(cat);
//         }
//         lastStates[cat] = currentState;
//         debounceTimers[cat] = null;
//       }, debounceDelay);
//     }
//   });
// }

// // Playback Handling
// function playCategory(cat) {
//   const vm = videoManagers[categories.indexOf(cat)];
  
//   // Start video if not already active
//   if (!vm.isActive) {
//     console.log(`Starting video for ${cat}`);
//     vm.chooseRandomVideo();
//   }
  
//   // Handle sound with more robust approach
//   if (!currentSounds[cat]) {
//     if (!soundKeys[cat]) {
//       const sounds = Object.keys(soundFiles[cat]);
//       soundKeys[cat] = sounds[Math.floor(Math.random() * sounds.length)];
//     }
    
//     try {
//       const sound = players[cat].player(soundKeys[cat]);
//       sound.fadeIn = 0.1; // Faster fade in
//       sound.fadeOut = 0.3; // Keep modest fade out
//       sound.loop = true;
//       currentSounds[cat] = sound;
      
//       // Start sound with fade in
//       sound.start();
//     } catch (e) {
//       console.error(`Error playing sound for ${cat}:`, e);
//     }
//   }
// }

// function stopCategory(cat) {
//   const sound = currentSounds[cat];
//   const vm = videoManagers[categories.indexOf(cat)];
  
//   // Stop sound with proper fade out
//   if (sound) {
//     try {
//       const now = Tone.now();
//       sound.stop(now + 0.3); // Schedule stop after fade
//       currentSounds[cat] = null;
//       soundKeys[cat] = null;
//     } catch (e) {
//       console.log(`Error stopping sound for ${cat}:`, e);
//       currentSounds[cat] = null; // Clear reference even if error
//     }
//   }
  
//   // Stop video with proper handling
//   if (vm.isActive) {
//     vm.stopVideo();
//   }
// }

// // Input Handling with simplified key mapping
// function keyPressed() {
//   const toggleMap = {
//     '1': 'success', '2': 'beauty', '3': 'safety',
//     '4': 'love', '5': 'family', '6': 'friends'
//   };

//   const cat = toggleMap[key];
//   if (cat) {
//     // Toggle the state
//     window[cat] = window[cat] === 0 ? 1 : 0;
//     console.log(`Toggled ${cat} to ${window[cat]}`);
//   }

//   if (key === 'r' || key === 'R') {
//     console.log("Hard reset triggered");
//     hardReset();
//   }
  
//   if (key === 'f' || key === 'F') {
//     let fs = fullscreen();
//     fullscreen(!fs);
//     setTimeout(() => resizeCanvas(windowWidth, windowHeight), 100);
//     console.log("Fullscreen toggled");
//   }
// }

// function hardReset() {
//   // Properly clean up all resources
//   categories.forEach(cat => {
//     if (currentSounds[cat]) {
//       try {
//         currentSounds[cat].stop();
//       } catch (e) {
//         console.error(`Error stopping sound in reset for ${cat}:`, e);
//       }
//       currentSounds[cat] = null;
//     }
//     soundKeys[cat] = null;
//     window[cat] = 1;
//     lastStates[cat] = 1;
    
//     if (debounceTimers[cat]) {
//       clearTimeout(debounceTimers[cat]);
//       debounceTimers[cat] = null;
//     }
//   });
  
//   // Clear all videos
//   videoManagers.forEach(vm => {
//     vm.stopVideo();
//     vm.isActive = false;
//     vm.layout = null;
//     vm.transitionState = "idle";
//   });
  
//   usedLayouts = [];
  
//   console.log("Hard reset complete");
// }

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   console.log("Window resized, canvas resized");
  
//   // Force layout recalculation for all active videos on resize
//   videoManagers.forEach(vm => {
//     if (vm.isActive) {
//       vm.layout = null; // Clear existing layout to force recalculation
//     }
//   });
  
//   // Clear used layouts to prevent conflicts with new layouts
//   usedLayouts = [];
// }

// // Serial Setup with improved error handling
// function setupWebSerial() {
//   if (!navigator.serial) {
//     console.log("WebSerial not supported in this browser");
//     return;
//   }
  
//   navigator.serial.addEventListener("connect", portConnect);
//   navigator.serial.addEventListener("disconnect", portDisconnect);

//   serial.getPorts();
//   serial.on("noport", makePortButton);
//   serial.on("portavailable", openPort);
//   serial.on("requesterror", portError);
//   serial.on("data", serialEvent);
//   serial.on("close", makePortButton);
  
//   console.log("WebSerial setup complete");
// }

// function makePortButton() {
//   if (portButton) portButton.remove(); // Remove any existing button
  
//   portButton = createButton("choose port");
//   portButton.position(10, 10);
//   portButton.mousePressed(choosePort);
//   console.log("Port selection button created");
// }

// function choosePort() { 
//   if (portButton) portButton.show(); 
//   serial.requestPort(); 
// }

// function openPort() { 
//   serial.open().then(() => {
//     if (portButton) portButton.hide();
//     console.log("Serial port opened successfully");
//   }).catch(err => {
//     console.error("Failed to open serial port:", err);
//     makePortButton();
//   });
// }

// function serialEvent() {
//   try {
//     const s = serial.readStringUntil("\r\n");
//     if (s != null) {
//       let vals = split(trim(s), ",");
//       if (vals.length >= 6) {
//         // Parse the values and update states
//         [success, beauty, safety, love, family, friends] = vals.map(float);
        
//         // Send acknowledgment
//         serial.write("x");
//       }
//     }
//   } catch (e) {
//     console.error("Serial read error:", e);
//   }
// }

// function portConnect() { 
//   console.log("Port connected");
//   serial.getPorts(); 
// }

// function portDisconnect() { 
//   console.log("Port disconnected");
//   serial.close(); 
// }

// function portError(err) { 
//   console.error("Serial port error:", err); 
//   makePortButton();
// }


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

// p5.webserial library instance and related variables
const serial = new p5.WebSerial(); // WebSerial library instance
let portButton; // Button for port selection
let inData = []; // Array for incoming serial data
let inString = []; // String for incoming serial data
let outByte = 0; // Byte for outgoing serial data

// Audio players with optimized settings
const successSounds = new Tone.Players({
  shiver: "sounds/synth1.mp3",
  stronger: "sounds/synth2.mp3",
}).toDestination();
// Set volume lower
successSounds.volume.value = -6;

const beautySounds = new Tone.Players({
  sun: "sounds/synth3.mp3",
  sweet: "sounds/synth4.mp3",
}).toDestination();
beautySounds.volume.value = -6;

const safetySounds = new Tone.Players({
  shiver: "sounds/synth1.mp3",
  stronger: "sounds/synth2.mp3",
}).toDestination();
safetySounds.volume.value = -6;

const loveSounds = new Tone.Players({
  sun: "sounds/synth3.mp3",
  sweet: "sounds/synth4.mp3",
}).toDestination();
loveSounds.volume.value = -6;

const familySounds = new Tone.Players({
  shiver: "sounds/synth1.mp3",
  stronger: "sounds/synth2.mp3",
}).toDestination();
familySounds.volume.value = -6;

const friendsSounds = new Tone.Players({
  sun: "sounds/synth3.mp3",
  sweet: "sounds/synth4.mp3",
}).toDestination();
friendsSounds.volume.value = -6;

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

// Improved VideoManager class
class VideoManager {
  constructor(category) {
    this.selectedVideo = null;
    this.category = category;
    this.isLoading = false;
    this.layout = null;

  }

  chooseRandomVideo() {
    if (categoryVideos[this.category].length > 0) {
      const randomIndex = Math.floor(random(categoryVideos[this.category].length));
      this.selectedVideo = categoryVideos[this.category][randomIndex];
      
      if (this.selectedVideo) {
        this.selectedVideo.loop();
  
        // Generate layout only once
        // if (!this.layout) {
        //   let scale = random(0.25, 0.5); // random size factor
        //   let x = random(width * 0.1, width * 0.9);
        //   let y = random(height * 0.1, height * 0.9);
        //   this.layout = { x, y, scale };
        // }

        if (!this.layout) {
          let maxTries = 10;
          let bestLayout = null;
        
          for (let i = 0; i < maxTries; i++) {
            let scale = random(0.25, 0.5);
            let w = width * scale;
            let h = w / (this.selectedVideo.width / this.selectedVideo.height || 1.78);
            let x = random(w / 2, width - w / 2);
            let y = random(h / 2, height - h / 2);
        
            if (!isTooClose(x, y, w, h)) {
              this.layout = { x, y, scale, w, h };
              usedLayouts.push(this.layout);
              break;
            } else if (!bestLayout) {
              bestLayout = { x, y, scale, w, h }; // fallback
            }
          }
        
          if (!this.layout && bestLayout) {
            this.layout = bestLayout;
            usedLayouts.push(bestLayout);
          }
        }
        
      }
  
      // layoutGenerated = false;
    }
  }
  
  

  stopVideo() {
    if (this.selectedVideo) {
      // Remove event listener
      if (this.selectedVideo.elt) {
        this.selectedVideo.elt.oncanplay = null;
      }
      
      // Stop video
      this.selectedVideo.stop();
      this.layout = null;

      
      // Make sure the video element is truly stopped
      if (this.selectedVideo.elt) {
        this.selectedVideo.elt.pause();
        this.selectedVideo.elt.currentTime = 0;
      }
      this.selectedVideo = null; // Reset for next selection
      this.isLoading = false;
    }
  }
  
  displayVideoAtLayout() {
    if (this.selectedVideo && this.layout) {
      let videoAspect = this.selectedVideo.width / this.selectedVideo.height;
      if (!isFinite(videoAspect)) videoAspect = 16 / 9;
  
      let finalWidth = width * this.layout.scale;
      let finalHeight = finalWidth / videoAspect;
      image(this.selectedVideo, this.layout.x - finalWidth / 2, this.layout.y - finalHeight / 2, finalWidth, finalHeight);
    }
  }
  
}

let usedLayouts = [];

function isTooClose(x, y, w, h) {
  for (let layout of usedLayouts) {
    let dx = abs(x - layout.x);
    let dy = abs(y - layout.y);
    let minDistX = (w + layout.w) / 2;
    let minDistY = (h + layout.h) / 2;
    if (dx < minDistX && dy < minDistY) {
      return true; // overlaps too much
    }
  }
  return false;
}


// Create video managers
let successVideos = new VideoManager('success');
let beautyVideos = new VideoManager('beauty');
let safetyVideos = new VideoManager('safety');
let loveVideos = new VideoManager('love');
let familyVideos = new VideoManager('family');
let friendsVideos = new VideoManager('friends');

let videoManagers = [successVideos, beautyVideos, safetyVideos, loveVideos, familyVideos, friendsVideos];

// Debounce mechanism for key presses
let lastKeyTime = 0;
const KEY_DELAY = 250; // ms between key actions

function debounceAction(callback) {
  const now = Date.now();
  if (now - lastKeyTime > KEY_DELAY) {
    lastKeyTime = now;
    callback();
  }
}

function preload() {
  // Create videos with optimized loading
  for (let i = 1; i <= totalVideos; i++) {
    let path = 'images/' + i + '.mov';
    
    // Stagger video creation across categories
    for (let category in categoryVideos) {
      const video = createVideo(path);
      video.hide();
      video.elt.preload = "metadata"; // Only load metadata initially
      video.elt.muted = true; // Mute for faster loading
      categoryVideos[category].push(video);
    }
  }
  
  // Pre-load Tone.js
  Tone.context.latencyHint = 'balanced';
}

function disposeAllVideos() {
  videoManagers.forEach(vm => {
    vm.stopVideo();
    usedLayouts = [];
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30); // Lower framerate for better performance
  setupWebSerial();
}

function getLinearCenteredLayout(num, w, h) {
  let positions = [];
  let isLandscape = w > h;

  let spacing = isLandscape ? w / (num + 1) : h / (num + 1);
  for (let i = 0; i < num; i++) {
    let x = isLandscape ? spacing * (i + 1) : w / 2;
    let y = isLandscape ? h / 2 : spacing * (i + 1);
    positions.push({x, y});
  }
  return positions;
}

// Updated play functions with improved audio handling
function playSuccess() {
  if (success === 0 && !successVideos.selectedVideo) {
    if (!successSoundKey) {
      let soundKeys = ["shiver", "stronger"];
      successSoundKey = random(soundKeys); // Pick one sound and keep it
    }

    // Create the sound player
    currentSuccessSound = successSounds.player(successSoundKey);
    
    // Start video loading first (it takes longer)
    successVideos.chooseRandomVideo();
    
    // Start audio with a small delay to allow for video loading start
    setTimeout(() => {
      if (success === 0) {
        currentSuccessSound.start();
        
        // When sound ends, restart it if success is still 0
        currentSuccessSound.onstop = () => {
          if (success === 0) {
            // Add a small gap to prevent clicking
            setTimeout(() => {
              if (success === 0) {
                currentSuccessSound.start();
              }
            }, 50);
          }
        };
      }
    }, 100);
  }
}

function playBeauty() {
  if (beauty === 0 && !beautyVideos.selectedVideo) {
    if (!beautySoundKey) {
      let soundKeys = ["sweet", "sun"];
      beautySoundKey = random(soundKeys);
    }

    currentBeautySound = beautySounds.player(beautySoundKey);
    
    // Start video loading
    beautyVideos.chooseRandomVideo();
    
    // Start audio with small delay
    setTimeout(() => {
      if (beauty === 0) {
        currentBeautySound.start();
        
        currentBeautySound.onstop = () => {
          if (beauty === 0) {
            // Add small gap
            setTimeout(() => {
              if (beauty === 0) {
                currentBeautySound.start();
              }
            }, 50);
          }
        };
      }
    }, 100);
  }
}

function playSafety() {
  if (safety === 0 && !safetyVideos.selectedVideo) {
    if (!safetySoundKey) {
      let soundKeys = ["shiver", "stronger"];
      safetySoundKey = random(soundKeys);
    }

    currentSafetySound = safetySounds.player(safetySoundKey);
    
    // Start video loading
    safetyVideos.chooseRandomVideo();
    
    // Start audio with small delay
    setTimeout(() => {
      if (safety === 0) {
        currentSafetySound.start();
        
        currentSafetySound.onstop = () => {
          if (safety === 0) {
            setTimeout(() => {
              if (safety === 0) {
                currentSafetySound.start();
              }
            }, 50);
          }
        };
      }
    }, 100);
  }
}

function playLove() {
  if (love === 0 && !loveVideos.selectedVideo) {
    if (!loveSoundKey) {
      let soundKeys = ["sun", "sweet"];
      loveSoundKey = random(soundKeys);
    }

    currentLoveSound = loveSounds.player(loveSoundKey);
    
    // Start video loading
    loveVideos.chooseRandomVideo();
    
    // Start audio with small delay
    setTimeout(() => {
      if (love === 0) {
        currentLoveSound.start();
        
        currentLoveSound.onstop = () => {
          if (love === 0) {
            setTimeout(() => {
              if (love === 0) {
                currentLoveSound.start();
              }
            }, 50);
          }
        };
      }
    }, 100);
  }
}

function playFamily() {
  if (family === 0 && !familyVideos.selectedVideo) {
    if (!familySoundKey) {
      let soundKeys = ["shiver", "stronger"];
      familySoundKey = random(soundKeys);
    }

    currentFamilySound = familySounds.player(familySoundKey);
    
    // Start video loading
    familyVideos.chooseRandomVideo();
    
    // Start audio with small delay
    setTimeout(() => {
      if (family === 0) {
        currentFamilySound.start();
        
        currentFamilySound.onstop = () => {
          if (family === 0) {
            setTimeout(() => {
              if (family === 0) {
                currentFamilySound.start();
              }
            }, 50);
          }
        };
      }
    }, 100);
  }
}

function playFriends() {
  if (friends === 0 && !friendsVideos.selectedVideo) {
    if (!friendsSoundKey) {
      let soundKeys = ["sun", "sweet"];
      friendsSoundKey = random(soundKeys);
    }

    currentFriendsSound = friendsSounds.player(friendsSoundKey);
    
    // Start video loading
    friendsVideos.chooseRandomVideo();
    
    // Start audio with small delay
    setTimeout(() => {
      if (friends === 0) {
        currentFriendsSound.start();
        
        currentFriendsSound.onstop = () => {
          if (friends === 0) {
            setTimeout(() => {
              if (friends === 0) {
                currentFriendsSound.start();
              }
            }, 50);
          }
        };
      }
    }, 100);
  }
}

// Improved stop functions with fade-out
function stopSuccess() {
  if (currentSuccessSound) {
    // Fade out before stopping
    const now = Tone.now();
    currentSuccessSound.volume.rampTo(-40, 0.1);
    
    // Stop after fade
    setTimeout(() => {
      if (currentSuccessSound) {
        currentSuccessSound.stop();
        currentSuccessSound = null;
      }
    }, 150);
  }
  successVideos.stopVideo();
  successSoundKey = null; // Reset for next time
}

function stopBeauty() {
  if (currentBeautySound) {
    // Fade out before stopping
    const now = Tone.now();
    currentBeautySound.volume.rampTo(-40, 0.1);
    
    // Stop after fade
    setTimeout(() => {
      if (currentBeautySound) {
        currentBeautySound.stop();
        currentBeautySound = null;
      }
    }, 150);
  }
  beautyVideos.stopVideo();
  beautySoundKey = null;
}

function stopSafety() {
  if (currentSafetySound) {
    // Fade out before stopping
    const now = Tone.now();
    currentSafetySound.volume.rampTo(-40, 0.1);
    
    // Stop after fade
    setTimeout(() => {
      if (currentSafetySound) {
        currentSafetySound.stop();
        currentSafetySound = null;
      }
    }, 150);
  }
  safetyVideos.stopVideo();
  safetySoundKey = null;
}

function stopLove() {
  if (currentLoveSound) {
    // Fade out before stopping
    const now = Tone.now();
    currentLoveSound.volume.rampTo(-40, 0.1);
    
    // Stop after fade
    setTimeout(() => {
      if (currentLoveSound) {
        currentLoveSound.stop();
        currentLoveSound = null;
      }
    }, 150);
  }
  loveVideos.stopVideo();
  loveSoundKey = null;
}

function stopFamily() {
  if (currentFamilySound) {
    // Fade out before stopping
    const now = Tone.now();
    currentFamilySound.volume.rampTo(-40, 0.1);
    
    // Stop after fade
    setTimeout(() => {
      if (currentFamilySound) {
        currentFamilySound.stop();
        currentFamilySound = null;
      }
    }, 150);
  }
  familyVideos.stopVideo();
  familySoundKey = null;
}

function stopFriends() {
  if (currentFriendsSound) {
    // Fade out before stopping
    const now = Tone.now();
    currentFriendsSound.volume.rampTo(-40, 0.1);
    
    // Stop after fade
    setTimeout(() => {
      if (currentFriendsSound) {
        currentFriendsSound.stop();
        currentFriendsSound = null;
      }
    }, 150);
  }
  friendsVideos.stopVideo();
  friendsSoundKey = null;
}

// Check functions remain similar
function checkSuccess() {
  if (success === 0) {
    playSuccess();
  } else if (success === 1) {
    stopSuccess();
  }
}

function checkBeauty() {
  if (beauty === 0) {
    playBeauty();
  } else if (beauty === 1) {
    stopBeauty();
  }
}

function checkSafety() {
  if (safety === 0) {
    playSafety();
  } else if (safety === 1) {
    stopSafety();
  }
}

function checkLove() {
  if (love === 0) {
    playLove();
  } else if (love === 1) {
    stopLove();
  }
}

function checkFamily() {
  if (family === 0) {
    playFamily();
  } else if (family === 1) {
    stopFamily();
  }
}

function checkFriends() {
  if (friends === 0) {
    playFriends();
  } else if (friends === 1) {
    stopFriends();
  }
}

function draw() {
  blendMode(BLEND);
  background(0);
  blendMode(DIFFERENCE);
  
  // Filter only managers with active videos
  let activeVMs = videoManagers.filter(vm => vm.selectedVideo);
let usedLayouts = [];

for (let i = 0; i < activeVMs.length; i++) {
  let vm = activeVMs[i];
  
  if (i < 2) {
    // First two: fill half canvas each
    let videoAspect = vm.selectedVideo.width / vm.selectedVideo.height || 16/9;

    let w, h, x, y;
    if (width > height) {
      // Landscape: side-by-side
      w = width / 2;
      h = w / videoAspect;
      x = i === 0 ? width / 4 : (3 * width) / 4;
      y = height / 2;
    } else {
      // Portrait: top and bottom
      h = height / 2;
      w = h * videoAspect;
      x = width / 2;
      y = i === 0 ? height / 4 : (3 * height) / 4;
    }

    image(vm.selectedVideo, x - w / 2, y - h / 2, w, h);
    usedLayouts.push({ x, y, w, h });
  } else {
    if (!vm.layout) {
      let maxTries = 10;
      let bestLayout = null;

      for (let j = 0; j < maxTries; j++) {
        let scale = random(0.25, 0.4);
        let w = width * scale;
        let h = w / (vm.selectedVideo.width / vm.selectedVideo.height || 1.78);
        let x = random(w / 2, width - w / 2);
        let y = random(h / 2, height - h / 2);

        if (!isTooClose(x, y, w, h)) {
          vm.layout = { x, y, w, h };
          usedLayouts.push(vm.layout);
          break;
        } else if (!bestLayout) {
          bestLayout = { x, y, w, h };
        }
      }

      if (!vm.layout && bestLayout) {
        vm.layout = bestLayout;
        usedLayouts.push(bestLayout);
      }
    }

    if (vm.layout) {
      image(vm.selectedVideo, vm.layout.x - vm.layout.w / 2, vm.layout.y - vm.layout.h / 2, vm.layout.w, vm.layout.h);
    }
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

function hardReset() {
  // Stop all sounds with clean fade-outs
  stopSuccess();
  stopBeauty();
  stopSafety();
  stopLove();
  stopFamily();
  stopFriends();
  
  // Reset all videos
  disposeAllVideos();
}

// Extend keyPressed with debouncing
function keyPressed() {
  debounceAction(() => {
    if (key === 'r' || key === 'R') {
      hardReset();
    } else if (key === 'f' || key === 'F') {
      let fs = fullscreen();
      fullscreen(!fs);
      
      // Use a short delay before resizing the canvas
      setTimeout(() => {
        resizeCanvas(windowWidth, windowHeight);
      }, 100);
    } else {
      // Handle category keys directly
      switch (key) {
        case '1': success = 0; break;
        case '2': success = 1; break;
        case '3': beauty = 0; break;
        case '4': beauty = 1; break;
        case '5': safety = 0; break;
        case '6': safety = 1; break;
        case '7': love = 0; break;
        case '8': love = 1; break;
        case '9': family = 0; break;
        case '0': family = 1; break;
        case '-': friends = 0; break;
        case '=': friends = 1; break;
      }
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Initialize Tone.js once loaded
Tone.loaded().then(() => {
  console.log("Sounds Loaded");
  Tone.Transport.start();
});

// Serial communication functions (unchanged)
function setupWebSerial() {
  if (!navigator.serial) {
    console.warn("WebSerial is not supported in this browser. Try Chrome or MS Edge.");
    return;
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

// Debounced serial handling
let lastSerialTime = 0;
const SERIAL_DEBOUNCE = 100; // ms

function serialEvent() {
  const now = Date.now();
  if (now - lastSerialTime < SERIAL_DEBOUNCE) return;
  lastSerialTime = now;
  
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
  console.error("Serial port error:", err);
}