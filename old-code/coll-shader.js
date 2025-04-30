
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
  
// VideoManager Class with WEBGL coordinates
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
          let w = width * scale;
          let h = w / (this.selectedVideo.width / this.selectedVideo.height || 1.78);
          
          // For WEBGL coordinates: x and y are relative to center, not top-left
          // Width goes from -width/2 to width/2
          // Height goes from -height/2 to height/2
          let x = random(-width/2 + w/2, width/2 - w/2);
          let y = random(-height/2 + h/2, height/2 - h/2);
          
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
      
      // For WEBGL: image positioning is centered at x,y
      image(this.selectedVideo, x-w/2, y-h/2, w, h);
    }
  }
  
  // Update isTooClose function for WEBGL coordinates
  function isTooClose(x, y, w, h) {
    return usedLayouts.some(l => 
      abs(x - l.x) < (w + l.w) / 2 && 
      abs(y - l.y) < (h + l.h) / 2
    );
  }
  
  // Video Manager Instances
  const videoManagers = categories.map(c => new VideoManager(c));
  let wash = 100; 
  
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
  
  
  function setupAfterVideos() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    noStroke();
    warp = createFilterShader(warpSrc);
    setupWebSerial();
  }


  let warpSrc = `
precision highp float;

uniform sampler2D tex0;
uniform float wash; // Distortion amount (0-100)
varying vec2 vTexCoord;

void main() {
  // Calculate the normalized wash value (0.0-1.0)
  float normalizedWash = wash / 100.0;
  
  // Offset the input coordinate based on wash amount
  vec2 warpedCoord = vTexCoord;
  warpedCoord.x += normalizedWash * 0.05 * sin(vTexCoord.y * 10.0);
  warpedCoord.y += normalizedWash * 0.05 * sin(vTexCoord.x * 10.0);

  // Set the new color by looking up the warped coordinate
  gl_FragColor = texture2D(tex0, warpedCoord);
}
`;

  
function draw() {
    if (!videosReady) {
      background(0);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(20);
      text("Loading videos...", 0, 0); // Center of canvas in WEBGL
      return;
    }
  
    if (!window.hasSetupRun) {
      setupAfterVideos();
      window.hasSetupRun = true;
    }
    
    // Reset main canvas
    blendMode(BLEND);
    background(0);
    blendMode(LIGHTEST);
    
    usedLayouts = [];
  
    const active = videoManagers.filter(vm => vm.selectedVideo);
    for (let i = 0; i < active.length; i++) {
      const vm = active[i];
      if (i < 2) {
        let aspect = vm.selectedVideo.width / vm.selectedVideo.height || 1.78;
        let w = width > height ? width / 2 : height / 2 * aspect;
        let h = width > height ? w / aspect : height / 2;
        
        // Convert to WEBGL coordinates (center-based)
        let x = width > height ? (i === 0 ? -width/4 : width/4) : 0;
        let y = width > height ? 0 : (i === 0 ? -height/4 : height/4);
        
        image(vm.selectedVideo, x-w/2, y-h/2, w, h);
        usedLayouts.push({ x, y, w, h });
      } else {
        if (!vm.layout) vm.chooseRandomVideo();
        vm.displayVideoAtLayout(); // Use displayVideoAtLayout for properly positioned videos
      }
    }
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
    if (keyCode === UP_ARROW) {
        wash = constrain(wash + 10, 0, 100);
      } else if (keyCode === DOWN_ARROW) {
        wash = constrain(wash - 10, 0, 100);
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
    