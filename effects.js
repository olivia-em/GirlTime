// experiment with different effects from tone
// change from key press to variables

let serial = new p5.WebSerial();
let portButton;
let inData = []; // stores serial values

let rootNote;
let octave = 2;
let major = [0, 2, 4, 5, 7, 9, 11];
let activeChords = {}; // Track active notes by key number
let activeLoops = {}; // Track active loops by key number

// REVERB
// let reverb = new Tone.Reverb({
//   decay: 2,
//   preDelay: 0.01,
// }).toDestination();

// DELAY
let feedbackDelay = new Tone.FeedbackDelay({
  delayTime : 0.25 ,
  maxDelay : 1
  }).toDestination();

let sampler = new Tone.Sampler({
  A1: "samples/synth/A1.mp3",
  B1: "samples/synth/B1.mp3"
}, {
  volume: -6, // Lower overall volume to prevent clipping
}).toDestination();
// sampler.connect(reverb);
sampler.connect(feedbackDelay);

// ATTEMPTED FREQUENCY ENVELOPE
// let freqEnv = new Tone.FrequencyEnvelope({
//  	"attack" : 0.2,
//  	"baseFrequency" : "C2",
//  	"octaves" : 4
//  });
//  freqEnv.connect(osc.frequency);

function setup() {
  createCanvas(400, 400);
  textAlign(CENTER);
  allSerialStuff();

    // Create start button
  let startButton = createButton('Start Audio');
  startButton.position(width/2 - 50, height/2 + 50);
  startButton.mousePressed(() => {
    Tone.start();
    Tone.Transport.start();
    // startButton.hide();
  });
  // let stopButton = createButton('Stop Audio');
  // stopButton.position(width/2 - 50, height/2 + 100);
  // stopButton.mousePressed(() => {
  //   // Tone.stop();
  //   Tone.Transport.stop();
  //   // staButton.hide();
  // });
}

// function draw() {
//   // let mappedDecay = map(inData[6], 600, 0, 3.0, 0.5);
//   // reverb.decay = mappedDecay;
//   background(240);
//   textAlign(CENTER, CENTER);
//   text("Press keys 1-6 to toggle chords\nFirst key press picks a random root", width/2, height/2);
  
//   // Show active chords
//   let y = height/2 + 20;
//   text("Active chords: " + Object.keys(activeChords).join(", "), width/2, y);
  
//   // Show root note if set
//   if (rootNote) {
//     y += 20;
//     text("Root: " + Tone.Frequency(rootNote, "midi").toNote(), width/2, y);
//   }
// }

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

function serialEvent() {
  // called when data is received
  let stringFromSerial = serial.readLine(); // read until newline character
  if (stringFromSerial) {
    // console.log(stringFromSerial);
    let trimmedString = trim(stringFromSerial); // remove whitespace
    let myArray = split(trimmedString, ","); // split string into array

    // if exactly 7 values received
    if (myArray.length === 7) {
      inData = myArray.map(Number); // convert all to numbers and store in inData

      // // CONTROL REVERB WITH TOF SENSOR
      // if (inData[6] == 0) {
      //   reverb.decay = 0.001;
      // } else {
      //   let mappedDecay = constrain(map(inData[6], 600, 10, 0.001, 2.5), 0.001, 2.5);
      //   reverb.decay = mappedDecay;
      //   // console.log(inData[6]);
      // }
      // console.log(reverb.decay);

      // CONTROL DELAY WITH TOF SENSOR
      if (inData[6] == 0) {
        feedbackDelay.delayTime = 0.001;
      } else {
        let mappedDecay = constrain(map(inData[6], 600, 10, 0.001, 2.5), 0.001, 2.5);
        feedbackDelay.delayTime = mappedDelay;
        // console.log(inData[6]);
      }
      console.log(feedbackDelay.delayTime);

    } else {
      print("Warning: Expected 7 values, received " + myArray.length);
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
      sampler.triggerRelease(note,time );
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


// function allSerialStuff() {
//   if (!navigator.serial) {
//     alert("WebSerial is not supported in this browser. Try Chrome or MS Edge.");
//   }
//   // check for any ports that are available:
//   serial.getPorts();
//   // if there's no port chosen, choose one:
//   serial.on("noport", makePortButton);
//   // open whatever port is available:
//   serial.on("portavailable", openPort);
//   // handle serial errors:
//   serial.on("requesterror", portError);
//   // handle any incoming serial data:
//   serial.on("data", serialEvent);
//   serial.on("close", makePortButton);
//   // add serial connect/disconnect listeners:
//   navigator.serial.addEventListener("connect", portConnect);
//   navigator.serial.addEventListener("disconnect", portDisconnect);
// }
// // if there's no port selected,
// // make a port select button appear:
// function makePortButton() {
//   // create and position a port chooser button:
//   portButton = createButton("choose port");
//   portButton.position(10, 10);
//   // give the port button a mousepressed handler:
//   portButton.mousePressed(choosePort);
// }

// // make the port selector window appear:
// function choosePort() {
//   if (portButton) portButton.show();
//   serial.requestPort();
// }

// // open the selected port, and make the port
// // button invisible:
// // open the selected port, and make the port
// // button invisible:
// function openPort() {
//   // wait for the serial.open promise to return,
//   // then call the initiateSerial function
//   serial.open().then(initiateSerial);

//   // once the port opens, let the user know:
//   function initiateSerial() {
//     console.log("port open");
//   }
//   // hide the port button once a port is chosen:
//   if (portButton) portButton.hide();
// }

// // pop up an alert if there's a port error:
// function portError(err) {
//   alert("Serial port error: " + err);
// }
// // read any incoming data as a string
// // (assumes a newline at the end of it):

// // try to connect if a new serial port
// // gets added (i.e. plugged in via USB):
// function portConnect() {
//   console.log("port connected");
//   serial.getPorts();
// }

// // if a port is disconnected:
// function portDisconnect() {
//   serial.close();
//   console.log("port disconnected");
// }

// function closePort() {
//   serial.close();
// }
