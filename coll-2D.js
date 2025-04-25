
let categoryVideos = {
    success: [],
    beauty: [],
    safety: [],
    love: [],
    family: [],
    friends: []
  };
  let totalVideos = 4;
  let success = 1, beauty = 1, safety = 1, love = 1, family = 1, friends = 1;
  let mappedDecay = 0.5;
  let revDecay = 0.001;
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
    success: { shiver: "sounds/friends.mp3", stronger: "sounds/friends.mp3" },
    beauty: { sun: "sounds/friends.mp3", sweet: "sounds/friends.mp3" },
    safety: { shiver: "sounds/friends.mp3", stronger: "sounds/friends.mp3" },
    love: { sun: "sounds/friends.mp3", sweet: "sounds/friends.mp3" },
    family: { shiver: "sounds/friends.mp3", stronger: "sounds/friends.mp3" },
    friends: { sun: "sounds/friends.mp3", sweet: "sounds/friends.mp3" },
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
          let scale = random(0.35, 0.65);
          //let scale = random(0.25, 0.5);
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

    displayVideoAtLayout(buffer) {
        if (!this.selectedVideo || !this.layout) return;
        const { x, y, w, h } = this.layout;
        buffer.image(this.selectedVideo, x - w / 2, y - h / 2, w, h);
      }
  }
  
  
  function isTooClose(x, y, w, h) {
    return usedLayouts.some(l => abs(x - l.x) < (w + l.w) / 2 && abs(y - l.y) < (h + l.h) / 2);
  }
  
  // Video Manager Instances
  const videoManagers = categories.map(c => new VideoManager(c));
  
  
  let wash = 10; 
  
  function preload() {
    for (let category of categories) {
      for (let i = 1; i <= totalVideos; i++) {
        const path = `images2/${category}/${i}.mp4`;
  
        let vid = createVideo(path)
        vid.hide();
        vid.elt.preload = "metadata";
        vid.elt.muted = true;
        vid.attribute("playsinline", true);
        vid.elt.autoplay = false;
        categoryVideos[category].push(vid);
      }
    }
    videosReady = true;
    console.log("Videos loaded");
  }


  let warpSrc = `
precision highp float;

uniform sampler2D tex0;
uniform float wash;
varying vec2 vTexCoord;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vTexCoord;
  float w = clamp((wash - 10.0) / 590.0, 0.0, 1.0); // normalized wash

  // Horizontal glitch stripes
  if (random(vec2(uv.y * 50.0, floor(w * 100.0))) < w * 0.4) {
    float glitchStrength = mix(0.01, 0.1, w);
    uv.x += (random(vec2(uv.y, w)) - 0.5) * glitchStrength;
  }

  // RGB shift flicker
  float flicker = step(0.95, fract(sin(wash * 0.123 + uv.y * 50.0) * 43758.5));
  if (flicker > 0.0) {
    float shift = mix(0.001, 0.01, w);
    float r = texture2D(tex0, uv + vec2(shift, 0.0)).r;
    float g = texture2D(tex0, uv).g;
    float b = texture2D(tex0, uv - vec2(shift, 0.0)).b;
    gl_FragColor = vec4(r, g, b, 1.0);
    return;
  }

  // Default sample
  gl_FragColor = texture2D(tex0, uv);
}

`;
  
let videoBuffer;

function setupAfterVideos() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  videoBuffer = createGraphics(windowWidth, windowHeight);
  warp = createFilterShader(warpSrc);
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

  // Clear the buffer for this frame
  videoBuffer.clear();
  videoBuffer.background(0);
  
  // Set blending mode on the buffer
  videoBuffer.blendMode(DIFFERENCE);

  const active = videoManagers.filter(vm => vm.selectedVideo);
  usedLayouts = [];

  // Draw all videos to the buffer
  for (let i = 0; i < active.length; i++) {
    const vm = active[i];
    if (i < 2) {
      let aspect = vm.selectedVideo.width / vm.selectedVideo.height || 1.78;
      let w = width > height ? width / 2 : height / 2 * aspect;
      let h = width > height ? w / aspect : height / 2;
      let x = width > height ? width * (0.25 + 0.5 * i) : width / 2;
      let y = width > height ? height / 2 : height * (0.25 + 0.5 * i);
      videoBuffer.image(vm.selectedVideo, x - w / 2, y - h / 2, w, h);
      usedLayouts.push({ x, y, w, h });
    } else {
      if (!vm.layout) vm.chooseRandomVideo();
      vm.displayVideoAtLayout(videoBuffer);
    }
  }
  
  // Reset the main canvas for shader rendering
  blendMode(BLEND);
  background(0);
  
  // Draw the buffer to the canvas with a texture
  plane(width, height)
 texture(videoBuffer);

  // Apply the shader effect
  warp.setUniform('wash', wash);
  filter(warp);
  
  checkStates();
}

  function checkStates() {
    categories.forEach(cat => {
      //console.log(cat, window[cat]);
      if (window[cat] === 0) playCategory(cat);
      else stopCategory(cat);
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
    if (cat) window[cat] = ['1', '3', '5', '7', '9', '-'].includes(key) ? 0 : 1;
    if (key === 'r' || key === 'R') hardReset();
    if (key === 'f' || key === 'F') {
      let fs = fullscreen();
      fullscreen(!fs);
      setTimeout(() => resizeCanvas(windowWidth, windowHeight), 100);
    }

    if (keyCode === UP_ARROW) {
        wash = constrain(wash + 10, 10, 600);
      } else if (keyCode === DOWN_ARROW) {
        wash = constrain(wash - 10, 10, 600);
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
      if (vals.length > 6) {
        [window.success, window.beauty, window.safety, window.love, window.family, window.friends] = vals.map(float);
        
         // CONTROL DELAY WITH TOF SENSOR
         if (float(vals[6]) === 0) {
            wash = 0;
          } else {
            // Map TOF values to wash amount (0-100)
            wash = constrain(map(float(vals[6]), 600, 10, 0, 100), 0, 100);
          }
        
        
        serial.write("x");
      }
    }
  }
  
  
  function portConnect() { serial.getPorts(); }
  function portDisconnect() { serial.close(); }
  function portError(err) { console.error("Serial port error:", err); }
  
  /// ALL AUDIO STUFF
  
  let rootNote;
  let octave = 2;
  let major = [0, 2, 4, 5, 7, 9, 11];
  let activeChords = {}; // Track active notes by key number
  let activeLoops = {}; // Track active loops by key number
  
  
  let reverb = new Tone.Reverb({
    decay: 0.001,
    preDelay: 0.1,
  }).toDestination();
  
  let feedbackDelay = new Tone.FeedbackDelay({
    delayTime : 0,
    maxDelay : 1
    }).toDestination();
  
    let sampler = new Tone.Sampler({
      C2: "samples/synth/C2fog.mp3"
    }, {
      volume: -30,
      }).toDestination();
    
    sampler.connect(reverb);
    sampler.connect(feedbackDelay);
  
  
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
  Tone.Transport.start();
  
  // Modify playCategory function to include chord triggering
  function playCategory(cat) {
    const vm = videoManagers[categories.indexOf(cat)];
    if (!vm.selectedVideo && window[cat] === 0) {
      // Original video and sound logic
     if (!soundKeys[cat]) soundKeys[cat] = random(Object.keys(soundFiles[cat]));
      const sound = players[cat].player(soundKeys[cat]);
      currentSounds[cat] = sound;
      vm.chooseRandomVideo();
  
      // random chord logic
      if (Object.keys(activeChords).length === 0) {
        rootNote = 36 + int(random(0, 12)); // C3–B3
      } else if (!rootNote) {
        rootNote = 36 + int(random(0, 12));
      }
      
      playChord(cat, categoryToScale[cat]);
  
      // sound continuation logic
      setTimeout(() => {
        if (window[cat] === 0) {
          sound.volume.value = -6;  // Restore original volume
          sound.start();
          sound.onstop = () => {
            if (window[cat] === 0) setTimeout(() => sound.start(), 50);
          };
        }
      }, 100);
  }}
  
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
  
    stopChord(cat);
    
    // Reset rootNote if no more active chords
    if (Object.keys(activeChords).length === 0) {
      rootNote = null;
    }
  }
  
  function playChord(key, scalePos) {
    let root = getNote(scalePos);
    let third = getNote(scalePos + 2);
    let fifth = getNote(scalePos + 4);
    let chord = [root,fifth];
  
    activeChords[key] = chord;
  
    let loop = new Tone.Loop(time => {
      chord.forEach(note => {
        sampler.triggerAttack(note, time);
      });
    }, "1n").start();
  
    activeLoops[key] = loop;
  }
  
  function stopChord(key) {
    if (activeChords[key]) {
      activeChords[key].forEach(note => {
        sampler.triggerRelease(note);
      });
      delete activeChords[key];
    }
  
    if (activeLoops[key]) {
      activeLoops[key].stop();
      activeLoops[key].cancel();
      Tone.Transport.clear(activeLoops[key]);
      delete activeLoops[key];
    }
  } 
    function getNote(scalePos) {
      let pos = scalePos % major.length;
      if (pos < 0) pos += major.length;
      
      let octaveOffset = Math.floor(scalePos / major.length);
      let midiNote = rootNote + major[pos] + (octaveOffset * 12);
      
      return Tone.Frequency(midiNote, "midi").toNote();
    }
