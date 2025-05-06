let categoryVideos = {
  success: [],
  beauty: [],
  safety: [],
  love: [],
  family: [],
  friends: []
};
let totalVideos = 5;
let mappedDecay = 0.5;
let revDecay = 0.001;
let videosReady = false;
let usedLayouts = [];
let wash = 0;

// Better variable scoping - use let instead of implicit globals
let success = 0, beauty = 0, safety = 0, love = 0, family = 0, friends = 0;

// Serial Setup
const serial = new p5.WebSerial();
let portButton;
let inData = [], inString = [], outByte = 0;

// Audio Setup with Tone.js
Tone.Players.defaults = { fadeOut: 0.1 };
const categories = ["success", "beauty", "safety", "love", "family", "friends"];

const soundFiles = {
  success: {
    bonnie: "sounds/bonnie.success.mp3",
    cathy: "sounds/cathy.success.mp3",
    prisha: "sounds/prisha.success.mp3",
    olivia: "sounds/olivia.success.mp3",
    priyanka: "sounds/priyanka.success.mp3",
    sarah: "sounds/sarah.success.mp3"
  },
  beauty: {
    bonnie: "sounds/bonnie.beauty.mp3",
    cathy: "sounds/cathy.beauty.mp3",
    prisha: "sounds/prisha.beauty.mp3",
    olivia: "sounds/olivia.beauty.mp3",
    priyanka: "sounds/priyanka.beauty.mp3",
    sarah: "sounds/sarah.beauty.mp3"
  },
  safety: {
    bonnie: "sounds/bonnie.safety.mp3",
    cathy: "sounds/cathy.safety.mp3",
    prisha: "sounds/prisha.safety.mp3",
    olivia: "sounds/olivia.safety.mp3",
    priyanka: "sounds/priyanka.safety.mp3",
    sarah: "sounds/sarah.safety.mp3"
  },
  love: {
    bonnie: "sounds/bonnie.love.mp3",
    cathy: "sounds/cathy.love.mp3",
    prisha: "sounds/prisha.love.mp3",
    olivia: "sounds/olivia.love.mp3",
    priyanka: "sounds/priyanka.love.mp3",
    sarah: "sounds/sarah.love.mp3"
  },
  family: {
    bonnie: "sounds/bonnie.family.mp3",
    cathy: "sounds/cathy.family.mp3",
    prisha: "sounds/prisha.family.mp3",
    olivia: "sounds/olivia.family.mp3",
    priyanka: "sounds/priyanka.family.mp3",
    sarah: "sounds/sarah.family.mp3"
  },
  friends: {
    bonnie: "sounds/bonnie.friends.mp3",
    cathy: "sounds/cathy.friends.mp3",
    prisha: "sounds/prisha.friends.mp3",
    olivia: "sounds/olivia.friends.mp3",
    priyanka: "sounds/priyanka.friends.mp3",
    sarah: "sounds/sarah.friends.mp3"
  }};

  
const players = {};
const currentSounds = {};
const soundKeys = {};

// Initialize audio players more efficiently
for (let cat of categories) {
  players[cat] = new Tone.Players(soundFiles[cat]).toDestination();
  players[cat].volume.value = -6;
  currentSounds[cat] = null;
  soundKeys[cat] = null;
}

// VideoManager Class with memory management improvements
class VideoManager {
  constructor(category) {
    this.category = category;
    this.selectedVideo = null;
    this.layout = null;
    this.playing = false;
  }

  chooseRandomVideo() {
    const vids = categoryVideos[this.category];
    if (!vids.length) return;
  
    // Only do this if we don't already have a video playing
    if (!this.selectedVideo || !this.playing) {
      const index = Math.floor(random(vids.length));
      this.selectedVideo = vids[index];
      
      // Only set up the video when we need to play it
      if (!this.playing) {
        this.selectedVideo.loop();
        this.playing = true;
      }
    }
  
    if (!this.layout) {
      let validPositionFound = false;
      // Limit tries to avoid excessive loops
      let tries = 20;
      
      for (let i = 0; i < tries && !validPositionFound; i++) {
        let scale = random(0.35, 0.65);
        let w = width * scale;
        let h = w / (this.selectedVideo.width / this.selectedVideo.height || 1.78);
        let x = random(w / 2, width - w / 2);
        let y = random(h / 2, height - h / 2);
  
        if (!isTooClose(x, y, w, h)) {
          this.layout = { x, y, w, h, scale };
          usedLayouts.push(this.layout);
          validPositionFound = true;
        }
      }
      
      // If no good spot found, still place somewhere
      if (!validPositionFound) {
        let scale = random(0.5, 0.65);
        let w = width * scale;
        let h = w / (this.selectedVideo.width / this.selectedVideo.height || 1.78);
        let x = random(w / 2, width - w / 2);
        let y = random(h / 2, height - h / 2);
        this.layout = { x, y, w, h, scale };
        usedLayouts.push(this.layout);
      }
    }
  }

  stopVideo() {
    if (this.selectedVideo && this.playing) {
      this.selectedVideo.stop();
      this.playing = false;
      // Clear layout but keep selected video reference to avoid reloading it
      this.layout = null;
    }
  }

  displayVideoAtLayout(buffer) {
    if (!this.selectedVideo || !this.layout || !this.playing) return;
    const { x, y, w, h } = this.layout;
    buffer.image(this.selectedVideo, x - w / 2, y - h / 2, w, h);
  }
}

// Optimize collision detection function
function isTooClose(x, y, w, h) {
  const baseDistance = 100;
  const sizeInfluence = (w + h) / 6;
  const minDistance = baseDistance + sizeInfluence;

  // Early exit for empty array
  if (usedLayouts.length === 0) return false;
  
  // Use for loop instead of some() for better performance
  for (let i = 0; i < usedLayouts.length; i++) {
    const l = usedLayouts[i];
    let dx = x - l.x;
    let dy = y - l.y;
    // Faster than sqrt for comparison
    let distanceSquared = dx * dx + dy * dy;
    if (distanceSquared < minDistance * minDistance) {
      return true;
    }
  }
  return false;
}

// Video Manager Instances
const videoManagers = categories.map(c => new VideoManager(c));

// Lazy load videos
function preload() {
  for (let category of categories) {
    for (let i = 1; i <= totalVideos; i++) {
      const path = `videos/${category}/${i}.mp4`;

      let vid = createVideo(path)
      vid.hide();
      vid.elt.preload = "metadata"; // Don't load entire video initially
      vid.elt.muted = true;
      vid.attribute("playsinline", true);
      vid.elt.autoplay = false;
      
      // Add event listeners for better video loading management
      vid.elt.addEventListener('error', (e) => {
        console.error(`Error loading video: ${path}`, e);
      });
      
      categoryVideos[category].push(vid);
    }
  }
  videosReady = true;
  console.log("Videos loaded");
}

let warpSrc = `
precision highp float;

uniform sampler2D tex0;
uniform float time;
uniform float wash; // Range: 10 - 600
varying vec2 vTexCoord;

void main() {
    vec2 uv = vTexCoord;

    float strength = clamp(wash / 600.0, 0.0, 1.0); // Normalize wash to 0-1

    float waveX = sin((uv.y + time * 0.5) * 20.0) * 0.02;
    float waveY = cos((uv.x + time * 0.5) * 30.0) * 0.02;

    uv += vec2(waveX, waveY) * strength;

    gl_FragColor = texture2D(tex0, uv);
}
`;

let videoBuffer;
let warp;
let lastFrameTime = 0;
const TARGET_FRAMERATE = 30; // Cap framerate to reduce resource usage

function setupAfterVideos() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  videoBuffer = createGraphics(windowWidth, windowHeight);
  warp = createFilterShader(warpSrc);
  setupWebSerial();
}

function draw() {
  // Simple frame limiting to reduce CPU usage
  const currentTime = millis();
  if (currentTime - lastFrameTime < 1000 / TARGET_FRAMERATE) {
    return;
  }
  lastFrameTime = currentTime;

  if (!videosReady) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Loading videos...", width / 2, height / 2);
    return;
  }

  if (!window.hasSetupRun) {
    setupAfterVideos();
    window.hasSetupRun = true;
  }

  // Clear the buffer for this frame
  videoBuffer.clear();
  videoBuffer.background(0);
  
  // Set blending mode on the buffer
  videoBuffer.blendMode(DIFFERENCE);

  // Only get active video managers to reduce processing
  const active = videoManagers.filter(vm => vm.selectedVideo && vm.playing);
  
  // Reset layouts only when needed
  if (frameCount % 60 === 0) { // Only update layouts once per second
    usedLayouts = active.map(vm => vm.layout).filter(Boolean);
  }

  // Draw all videos to the buffer - optimize for 2 or fewer videos
  for (let i = 0; i < active.length; i++) {
    const vm = active[i];
    if (i < 2) { // Special layout for first two videos
      let aspect = vm.selectedVideo.width / vm.selectedVideo.height || 1.78;
      let w = width > height ? width / 2 : height / 2 * aspect;
      let h = width > height ? w / aspect : height / 2;
      let x = width > height ? width * (0.25 + 0.5 * i) : width / 2;
      let y = width > height ? height / 2 : height * (0.25 + 0.5 * i);
      videoBuffer.image(vm.selectedVideo, x - w / 2, y - h / 2, w, h);
      if (vm.layout) vm.layout = { x, y, w, h }; // Update layout for tracking
    } else {
      if (!vm.layout) vm.chooseRandomVideo();
      vm.displayVideoAtLayout(videoBuffer);
    }
  }
  
  // Reset the main canvas for shader rendering
  blendMode(BLEND);
  background(0);
  
  // Draw the buffer to the canvas with a texture
  plane(width, height);
  texture(videoBuffer);

  // Apply the shader effect
  warp.setUniform('wash', wash);
  warp.setUniform('time', millis() / 1000);
  filter(warp);
  
  // Use throttled state checks to reduce updates
  if (frameCount % 10 === 0) { // Check state only every 10 frames
    checkStates();
  }
}

// States manager
function checkStates() {
  categories.forEach(cat => {
    const currentState = window[cat] === 1;
    const vm = videoManagers[categories.indexOf(cat)];
    
    // Only update when state changes to reduce unnecessary operations
    if (currentState && (!vm.selectedVideo || !vm.playing)) {
      playCategory(cat);
    } else if (!currentState && vm.playing) {
      stopCategory(cat);
    }
  });
}

let audioStarted = false;

// Input Handling
function keyPressed() {
  if (!audioStarted) {
    Tone.start().then(() => {
      console.log("Audio started via keypress");
      audioStarted = true;
    });
  }

  const map = { '1': 'success', '2': 'success', '3': 'beauty', '4': 'beauty',
                '5': 'safety', '6': 'safety', '7': 'love', '8': 'love',
                '9': 'family', '0': 'family', '-': 'friends', '=': 'friends' };
  const cat = map[key];
  if (cat) window[cat] = ['1', '3', '5', '7', '9', '-'].includes(key) ? 1 : 0;
  if (key === 'r' || key === 'R') hardReset();
  if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
    requestAnimationFrame(() => {
      resizeCanvas(windowWidth, windowHeight);
      videoBuffer = createGraphics(windowWidth, windowHeight);
    });
  }

  if (keyCode === UP_ARROW) {
    wash = constrain(wash + 10, 10, 600);
  } else if (keyCode === DOWN_ARROW) {
    wash = constrain(wash - 10, 10, 600);
  }
}

// Better cleanup for videos and audio
function hardReset() {
  categories.forEach(cat => {
    stopCategory(cat);
    const vm = videoManagers[categories.indexOf(cat)];
    vm.stopVideo();
    if (vm.selectedVideo) {
      // Force cleanup
      try {
        vm.selectedVideo.remove();
      } catch (e) {
        console.warn("Error removing video:", e);
      }
      vm.selectedVideo = null;
    }
  });
  usedLayouts = [];
  
  // Reset audio system
  Tone.Transport.cancel();
  Object.values(activeLoops).forEach(loop => {
    if (loop) loop.dispose();
  });
  Object.keys(activeLoops).forEach(key => {
    delete activeLoops[key];
  });
  Object.keys(activeChords).forEach(key => {
    delete activeChords[key];
  });
  rootNote = null;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  videoBuffer = createGraphics(windowWidth, windowHeight);
  // Reset layouts on resize to prevent misalignment
  videoManagers.forEach(vm => {
    if (vm.layout) vm.layout = null;
  });
  usedLayouts = [];
}

// Serial Setup
function setupWebSerial() {
  if (!navigator.serial) return;
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
function choosePort() { if (portButton) portButton.show(); serial.requestPort(); }
function openPort() { serial.open().then(() => portButton?.hide()); }

// Optimize serial data processing
let lastSerialUpdate = 0;
const SERIAL_UPDATE_INTERVAL = 100; // ms between updates

function serialEvent() {
  const currentTime = millis();
  if (currentTime - lastSerialUpdate < SERIAL_UPDATE_INTERVAL) {
    return; // Throttle updates
  }
  lastSerialUpdate = currentTime;
  
  const s = serial.readStringUntil("\r\n");
  if (s != null) {
    let vals = split(trim(s), ",");
    if (vals.length > 5) {
      // Use destructuring assignment for clarity
      [window.success, window.beauty, window.safety, window.love, window.family, window.friends] = vals.map(float);
      
        
        //  // CONTROL DELAY WITH TOF SENSOR
        //  if (float(vals[6]) === 0) {
        //     wash = 0;
        //   } else {
        //     // Map TOF values to wash amount (0-100)
        //     wash = constrain(map(float(vals[6]), 600, 10, 0, 100), 0, 100);
        //   }

      // Send acknowledgment back to serial device
      console.log("Serial data:", vals);
      serial.write("x");
    }
  }
}

function portConnect() { serial.getPorts(); }
function portDisconnect() { serial.close(); }
function portError(err) { console.error("Serial port error:", err); }

/// AUDIO STUFF - Optimized

let rootNote;
let octave = 2;
let major = [0, 2, 4, 5, 7, 9, 11];
let activeChords = {}; // Track active notes by key number
let activeLoops = {}; // Track active loops by key number

// Set up audio effects chain more efficiently
let reverb = new Tone.Reverb({
  decay: 0.001,
  preDelay: 0.1,
  wet: 0.3 // Reduce reverb amount
}).toDestination();

let feedbackDelay = new Tone.FeedbackDelay({
  delayTime: 0,
  maxDelay: 1,
  feedback: 0.2, // Reduce feedback to prevent audio build-up
  wet: 0.2 // Reduce effect amount
}).toDestination();

// Better sampler initialization
let sampler = new Tone.Sampler({
  C2: "samples/synth/C2fog.mp3"
}, {
  volume: -40,
  release: 1,
  onload: () => console.log("Sampler loaded")
}).connect(reverb).connect(feedbackDelay);

// Add category to scale position mapping
const categoryToScale = {
  'success': 0,
  'beauty': 1,
  'safety': 2,
  'love': 3,
  'family': 4,
  'friends': 5
};

Tone.Transport.bpm.value = 120;

// Audio memory management
const audioBuffers = {};

// More efficient category playback
function playCategory(cat) {
  const vm = videoManagers[categories.indexOf(cat)];
  
  // Check if already playing this category
  if (vm.playing && vm.selectedVideo) return;
  
  // Video play logic
  vm.chooseRandomVideo();
  
  // Audio play logic - only start if not already playing
  if (!currentSounds[cat]) {
    if (!soundKeys[cat]) soundKeys[cat] = random(Object.keys(soundFiles[cat]));
    const sound = players[cat].player(soundKeys[cat]);
    currentSounds[cat] = sound;
    
    // Chord logic - only set root note if needed
    if (Object.keys(activeChords).length === 0) {
      rootNote = 36 + int(random(0, 12)); // C3–B3
    } else if (!rootNote) {
      rootNote = 36 + int(random(0, 12));
    }
    
    playChord(cat, categoryToScale[cat]);
    
    // Start audio with safety checks
    try {
      sound.volume.rampTo(-6, 0.1);
      sound.start();
      
      // Set up restart only once when sound stops
      sound.onstop = () => {
        if (window[cat] === 1 && currentSounds[cat] === sound) {
          // Use a short timeout to prevent immediate restart
          setTimeout(() => {
            if (window[cat] === 1 && currentSounds[cat] === sound) {
              sound.start();
            }
          }, 50);
        }
      };
    } catch (e) {
      console.warn(`Error starting sound for ${cat}:`, e);
    }
  }
}

// More efficient stopping logic
function stopCategory(cat) {
  const sound = currentSounds[cat];
  const vm = videoManagers[categories.indexOf(cat)];
  
  // Clean up audio
  if (sound) {
    // Use volume ramp for smooth fadeout
    sound.volume.rampTo(-40, 0.1);
    setTimeout(() => {
      try {
        sound.stop();
      } catch (e) {
        console.warn(`Error stopping sound for ${cat}:`, e);
      }
      currentSounds[cat] = null;
      soundKeys[cat] = null;
    }, 150);
  }
  
  // Stop video playback
  vm.stopVideo();
  
  // Clean up chords
  stopChord(cat);
  
  // Check if we should reset rootNote
  if (Object.keys(activeChords).length === 0) {
    rootNote = null;
  }
}

// Optimized chord playback
function playChord(key, scalePos) {
  // Skip if chord already active
  if (activeChords[key]) return;
  
  let root = getNote(scalePos);
  let fifth = getNote(scalePos + 4);
  let chord = [root, fifth]; // Simpler chord to reduce CPU usage
  
  activeChords[key] = chord;
  
  // More efficient loop with longer interval
  let loop = new Tone.Loop(time => {
    chord.forEach(note => {
      try {
        sampler.triggerAttack(note, time);
      } catch (e) {
        console.warn(`Error playing note ${note}:`, e);
      }
    });
  }, "2n").start(); // Use half notes instead of quarter notes
  
  activeLoops[key] = loop;
}

function stopChord(key) {
  if (activeChords[key]) {
    activeChords[key].forEach(note => {
      try {
        sampler.triggerRelease(note);
      } catch (e) {
        console.warn(`Error releasing note ${note}:`, e);
      }
    });
    delete activeChords[key];
  }
  
  if (activeLoops[key]) {
    try {
      activeLoops[key].stop();
      activeLoops[key].dispose(); // Properly dispose the loop
      delete activeLoops[key];
    } catch (e) {
      console.warn(`Error stopping loop for ${key}:`, e);
    }
  }
}

function getNote(scalePos) {
  let pos = scalePos % major.length;
  if (pos < 0) pos += major.length;
  
  let octaveOffset = Math.floor(scalePos / major.length);
  let midiNote = rootNote + major[pos] + (octaveOffset * 12);
  
  return Tone.Frequency(midiNote, "midi").toNote();
}

// Add periodic garbage collection helper
function cleanupResources() {
  // Force JS garbage collection for better memory management
  if (window.gc) window.gc();
}

// Run cleanup every minute
setInterval(cleanupResources, 60000);

Tone.start().then(() => {
  console.log("Audio started via keypress");
  Tone.Transport.start(); // ✅ REQUIRED to run loops
  audioStarted = true;
});