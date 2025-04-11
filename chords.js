let sampler;
let rootNote;
let octave = 2;
let major = [0, 2, 4, 5, 7, 9, 11];
let activeChords = {}; // Track active notes by key number
let activeLoops = {}; // Track active loops by key number

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER, CENTER);
  
  // Initialize Tone.js
  sampler = new Tone.Sampler({
    A1: "samples/synth/A1.mp3",
    B1: "samples/synth/B1.mp3"
  }, {
    volume: -6, // Lower overall volume to prevent clipping
    onload: () => console.log("Sampler loaded!")
  }).toDestination();
  
  // Create start button
  let startButton = createButton('Start Audio');
  startButton.position(width/2 - 50, height/2 + 50);
  startButton.mousePressed(() => {
    Tone.start();
    Tone.Transport.start();
    startButton.hide();
  });
}

function draw() {
  background(240);
  textAlign(CENTER, CENTER);
  text("Press keys 1-6 to toggle chords\nFirst key press picks a random root", width/2, height/2);
  
  // Show active chords
  let y = height/2 + 20;
  text("Active chords: " + Object.keys(activeChords).join(", "), width/2, y);
  
  // Show root note if set
  if (rootNote) {
    y += 20;
    text("Root: " + Tone.Frequency(rootNote, "midi").toNote(), width/2, y);
  }
}

function keyPressed() {
  if (key >= '1' && key <= '6') {
    let scalePos = int(key) - 1;
    
    if (activeChords[key]) {
      // If this chord is already active, turn it off
      stopChord(key);
      
      // If this was the last active chord, reset rootNote
      if (Object.keys(activeChords).length === 0) {
        rootNote = null;
      }
    } else {
      // If no chords are active, pick a new root
      if (Object.keys(activeChords).length === 0) {
        rootNote = 36 + int(random(0, 12)); // C3–B3
      }
      // If rootNote hasn't been set yet (shouldn't happen now), set it
      else if (!rootNote) {
        rootNote = 36 + int(random(0, 12));
      }
      
      // Play the chord
      playChord(key, scalePos);
    }
  }
}

function playChord(key, scalePos) {
  // Calculate chord notes
  let root = getNote(scalePos);
  let third = getNote(scalePos + 2);
  let fifth = getNote(scalePos + 4);
  let chord = [root, third, fifth];
  
  // Play chord immediately
  chord.forEach(note => {
    sampler.triggerAttack(note);
  });
  
  // Store active chord notes
  activeChords[key] = chord;
  
  // Create a loop that will release the current notes and trigger new ones
  // This ensures the chord restarts but still ends cleanly when turned off
  let loop = new Tone.Loop(time => {
    // First, release currently playing notes
    chord.forEach(note => {
      sampler.triggerRelease(note, time);
    });
    
    // Then trigger them again (slightly after to avoid overlapping)
    chord.forEach(note => {
      sampler.triggerAttack(note, time + 0.05);
    });
  }, "1n").start("+1n"); // Wait 2n before first loop execution
  
  // Store the loop
  activeLoops[key] = loop;
}

function stopChord(key) {
  // Immediately release all notes in the chord
  if (activeChords[key]) {
    activeChords[key].forEach(note => {
      sampler.triggerRelease(note);
    });
    delete activeChords[key];
  }
  
  // Stop the loop
  if (activeLoops[key]) {
    activeLoops[key].stop();
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
