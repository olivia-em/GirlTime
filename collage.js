
let categoryVideos = {
  success: [],
  beauty: [],
  safety: [],
  love: [],
  family: [],
  friends: []
};
let totalVideos = 12;
let success = 1, beauty = 1, safety = 1, love = 1, family = 1, friends = 1;
let videosReady = false;
let usedLayouts = [];

// Serial Setup
const serial = new p5.WebSerial();
let portButton;
let inData = [], inString = [], outByte = 0;

// Audio Setup with Tone.js
Tone.Players.defaults = { fadeOut: 0.1 };
const categories = ["success", "beauty", "safety", "love", "family", "friends"];
const soundFiles = {
  success: { shiver: "sounds/synth1.mp3", stronger: "sounds/synth2.mp3" },
  beauty: { sun: "sounds/synth3.mp3", sweet: "sounds/synth4.mp3" },
  safety: { shiver: "sounds/synth1.mp3", stronger: "sounds/synth2.mp3" },
  love: { sun: "sounds/synth3.mp3", sweet: "sounds/synth4.mp3" },
  family: { shiver: "sounds/synth1.mp3", stronger: "sounds/synth2.mp3" },
  friends: { sun: "sounds/synth3.mp3", sweet: "sounds/synth4.mp3" },
};
const players = {};
const currentSounds = {};
const soundKeys = {};

for (let cat of categories) {
  players[cat] = new Tone.Players(soundFiles[cat]).toDestination();
  players[cat].volume.value = -6;
  currentSounds[cat] = null;
  soundKeys[cat] = null;
}

// VideoManager Class
class VideoManager {
  constructor(category) {
    this.category = category;
    this.selectedVideo = null;
    this.layout = null;
  }

  chooseRandomVideo() {
    const vids = categoryVideos[this.category];
    if (!vids.length) return;

    const index = Math.floor(random(vids.length));
    this.selectedVideo = vids[index];
    this.selectedVideo.loop();

    if (!this.layout) {
      let tries = 10, best = null;
      for (let i = 0; i < tries; i++) {
        let scale = random(0.25, 0.5);
        let w = width * scale;
        let h = w / (this.selectedVideo.width / this.selectedVideo.height || 1.78);
        let x = random(w / 2, width - w / 2);
        let y = random(h / 2, height - h / 2);
        if (!isTooClose(x, y, w, h)) {
          this.layout = { x, y, w, h, scale };
          usedLayouts.push(this.layout);
          return;
        } else if (!best) best = { x, y, w, h, scale };
      }
      this.layout = best;
      usedLayouts.push(best);
    }
  }

  stopVideo() {
    if (this.selectedVideo) {
      this.selectedVideo.stop();
      this.selectedVideo.elt.pause();
      this.selectedVideo.elt.currentTime = 0;
      this.layout = null;
      this.selectedVideo = null;
    }
  }

  displayVideoAtLayout() {
    if (!this.selectedVideo || !this.layout) return;
    const { x, y, w, h } = this.layout;
    image(this.selectedVideo, x - w / 2, y - h / 2, w, h);
  }
}

// Helpers
function isTooClose(x, y, w, h) {
  return usedLayouts.some(l => abs(x - l.x) < (w + l.w) / 2 && abs(y - l.y) < (h + l.h) / 2);
}

// Video Manager Instances
const videoManagers = categories.map(c => new VideoManager(c));

// Preload
function preload() {
  let loadPromises = [];
  for (let i = 1; i <= totalVideos; i++) {
    const path = 'images/' + i + '.mov';
    for (let category in categoryVideos) {
      const vid = createVideo(path);
      vid.hide();
      vid.elt.preload = "metadata";
      vid.elt.muted = true;
      vid.attribute("playsinline", true);
      vid.elt.autoplay = false;
      categoryVideos[category].push(vid);

      loadPromises.push(new Promise(res => vid.elt.onloadedmetadata = res));
    }
  }

  Promise.all(loadPromises).then(() => videosReady = true);
}

// Setup Delayed
function setupAfterVideos() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  setupWebSerial();
}

function draw() {
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
blendMode(BLEND);
  background(0);
  blendMode(DIFFERENCE);

  const active = videoManagers.filter(vm => vm.selectedVideo);
  usedLayouts = [];

  for (let i = 0; i < active.length; i++) {
    const vm = active[i];
    if (i < 2) {
      let aspect = vm.selectedVideo.width / vm.selectedVideo.height || 1.78;
      let w = width > height ? width / 2 : height / 2 * aspect;
      let h = width > height ? w / aspect : height / 2;
      let x = width > height ? width * (0.25 + 0.5 * i) : width / 2;
      let y = width > height ? height / 2 : height * (0.25 + 0.5 * i);
      image(vm.selectedVideo, x - w / 2, y - h / 2, w, h);
      usedLayouts.push({ x, y, w, h });
    } else {
      if (!vm.layout) vm.chooseRandomVideo();
      vm.displayVideoAtLayout();
    }
  }

  checkStates();
}

function checkStates() {
  categories.forEach(cat => {
    if (window[cat] === 0) playCategory(cat);
    else stopCategory(cat);
  });
}

// Playback Handling
function playCategory(cat) {
  const vm = videoManagers[categories.indexOf(cat)];
  if (!vm.selectedVideo && window[cat] === 0) {
    if (!soundKeys[cat]) soundKeys[cat] = random(Object.keys(soundFiles[cat]));
    const sound = players[cat].player(soundKeys[cat]);
    currentSounds[cat] = sound;

    vm.chooseRandomVideo();

    setTimeout(() => {
      if (window[cat] === 0) {
        sound.start();
        sound.onstop = () => {
          if (window[cat] === 0) setTimeout(() => sound.start(), 50);
        };
      }
    }, 100);
  }
}

function stopCategory(cat) {
  const sound = currentSounds[cat];
  const vm = videoManagers[categories.indexOf(cat)];
  if (sound) {
    sound.volume.rampTo(-40, 0.1);
    setTimeout(() => sound.stop(), 150);
    currentSounds[cat] = null;
    soundKeys[cat] = null;
  }
  vm.stopVideo();
}

// Input Handling
function keyPressed() {
  const map = { '1': 'success', '2': 'success', '3': 'beauty', '4': 'beauty',
                '5': 'safety', '6': 'safety', '7': 'love', '8': 'love',
                '9': 'family', '0': 'family', '-': 'friends', '=': 'friends' };
  const cat = map[key];
  if (cat) window[cat] = ['1', '3', '5', '7', '9', '-'].includes(key) ? 0 : 1;
  if (key === 'r' || key === 'R') hardReset();
  if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
    setTimeout(() => resizeCanvas(windowWidth, windowHeight), 100);
  }
}

function hardReset() {
  categories.forEach(cat => stopCategory(cat));
  videoManagers.forEach(vm => vm.stopVideo());
  usedLayouts = [];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Serial Setup (unchanged from original)
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

function serialEvent() {
  const s = serial.readStringUntil("\r\n");
  if (s != null) {
    let vals = split(trim(s), ",");
    if (vals.length > 5) {
      [success, beauty, safety, love, family, friends] = vals.map(float);
      serial.write("x");
    }
  }
}
function portConnect() { serial.getPorts(); }
function portDisconnect() { serial.close(); }
function portError(err) { console.error("Serial port error:", err); }
