let videosA = [];
let videosB = [];
let totalVideos = 4;
let money = 1; // Start at 1 so it doesn't play immediately
let makeup = 1;

const moneySounds = new Tone.Players({
  shiver: "sounds/shiver-short.mp3",
  stronger: "sounds/stronger.mp3",
}).toDestination();

const makeupSounds = new Tone.Players({
  sun: "sounds/sunshine.mp3",
  sweet: "sounds/sweet.mp3",
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
let moneyVideos = new VideoManager();
let makeupVideos = new VideoManager();
let videoManagers = [moneyVideos, makeupVideos];

let currentMoneySound = null;
let currentMakeupSound = null;
let moneySoundKey = null;
let makeupSoundKey = null;

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
}

// Function to play a **single chosen** money sound and loop it manually
function playMoney() {
  if (money === 0 && !moneyVideos.selectedVideo) {
    if (!moneySoundKey) {
      let soundKeys = ["shiver", "stronger"];
      moneySoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentMoneySound = moneySounds.player(moneySoundKey);
    currentMoneySound.start();

    // Start video only when sound starts
    if (moneySoundKey === "shiver") {
      moneyVideos.chooseVideo(0,0);
    }
    else {
    moneyVideos.chooseVideo(0,1);
    }

    // When sound ends, restart it if money is still 0
    currentMoneySound.onstop = () => {
      if (money === 0) {
        currentMoneySound.start(); // Restart same sound
      }
    };
  }
}

// Function to stop money sounds & videos
function stopMoney() {
  if (currentMoneySound) {
    currentMoneySound.stop();
    currentMoneySound = null;
  }
  moneyVideos.stopVideo();
  moneySoundKey = null; // Reset so next time a new sound is picked
}

// Function to play a **single chosen** makeup sound and loop it manually
function playMakeup() {
  if (makeup === 0 && !makeupVideos.selectedVideo) {
    if (!makeupSoundKey) {
      let soundKeys = ["sweet", "sun"];
      makeupSoundKey = random(soundKeys); // Pick one sound and keep it
    }

    currentMakeupSound = makeupSounds.player(makeupSoundKey);
    currentMakeupSound.start();

    // Start video only when sound starts
    if (makeupSoundKey === "sun") {
      makeupVideos.chooseVideo(1,0);
    } else  {
    makeupVideos.chooseVideo(1,1);
    }

    // When sound ends, restart it if makeup is still 0
    currentMakeupSound.onstop = () => {
      if (makeup === 0) {
        currentMakeupSound.start(); // Restart same sound
      }
    };
  }
}

// Function to stop makeup sounds & videos
function stopMakeup() {
  if (currentMakeupSound) {
    currentMakeupSound.stop();
    currentMakeupSound = null;
  }
  makeupVideos.stopVideo();
  makeupSoundKey = null; // Reset so next time a new sound is picked
}

// Function to check and trigger money state changes
function checkMoney() {
  if (money === 0) {
    playMoney();
  } else if (money === 1) {
    stopMoney();
  }
}

// Function to check and trigger makeup state changes
function checkMakeup() {
  if (makeup === 0) {
    playMakeup();
  } else if (makeup === 1) {
    stopMakeup();
  }
}

function draw() {
  blendMode(BLEND);
  background(0);
  blendMode(DIFFERENCE);

  videoManagers[0].displayVideo();
  blendMode(DODGE);
  videoManagers[1].displayVideo();
}

// Simulate changing money/makeup state for testing
function keyPressed() {
  if (key === '1') {
    money = 0;
  } else if (key === '2') {
    money = 1;
  }

  if (key === '3') {
    makeup = 0;
  } else if (key === '4') {
    makeup = 1;
  }

  checkMoney();
  checkMakeup();
}

// Start Tone.js once loaded
Tone.loaded().then(() => {
  console.log("Sounds Loaded");
  Tone.Transport.start();
  checkMoney();
  checkMakeup();
});


// let videosA = [];
// let videosB = [];
// let totalVideos = 4;
// let money = 1;  // Start at 1 so it doesn't play immediately
// let makeup = 1;

// const moneySounds = new Tone.Players({
//   shiver: "sounds/shiver-short.mp3",
//   stronger: "sounds/stronger.mp3",
// }).toDestination();

// const makeupSounds = new Tone.Players({
//   sun: "sounds/sunshine.mp3",
//   sweet: "sounds/sweet.mp3",
// }).toDestination();

// // VideoManager class to handle selection and playback
// class VideoManager {
//   constructor() {
//     this.selectedVideo = null;
//   }

//   chooseVideo(index) {
//     if (videosA.length > index && videosB.length > index) {
//       this.selectedVideo = random([videosA[index], videosB[index]]);
//     }
//     if (this.selectedVideo) {
//       this.selectedVideo.loop();
//     }
//   }

//   stopVideo() {
//     if (this.selectedVideo) {
//       this.selectedVideo.stop();
//       this.selectedVideo = null; // Reset so a new one is chosen next time
//     }
//   }

//   displayVideo() {
//     if (this.selectedVideo) {
//       image(this.selectedVideo, 0, 0, width, height);
//     }
//   }
// }

// // Create video managers
// let moneyVideos = new VideoManager();
// let makeupVideos = new VideoManager();
// let videoManagers = [moneyVideos, makeupVideos];

// let loopId = null; // Store loop ID to stop later

// function preload() {
//   for (let i = 1; i <= totalVideos; i++) {
//     let path = 'images/' + i + '.mov';
//     let vid = createVideo(path);
//     vid.hide();
//     vid.speed(1);

//     if (i % 2 === 0) {
//       videosA.push(vid);
//     } else {
//       videosB.push(vid);
//     }
//   }
// }

// function setup() {
//   createCanvas(windowWidth, windowHeight);
// }

// // Function to start looping sound & video when money === 0
// function playMoney() {
//   if (money === 0 && !moneyVideos.selectedVideo) {
//     // Choose random sound
//     let people = ["shiver", "stronger"];
//     const randomKey = random(people)
//     // Start sound & video
//     moneySounds.player(randomKey).start();
//     moneySounds.player(randomKey).loop = true;
//     moneyVideos.chooseVideo(0);  
//  }
// }

// // Function to stop all sounds & videos when money === 1
// function stopMoney() {
//   moneyVideos.stopVideo(); // Stop video
//   moneySounds.stopAll(); // Stop all players
// }


// // Function to start looping sound & video when money === 0
// function playMakeup() {
//   if (makeup === 0 && !makeupVideos.selectedVideo) {
//     // Choose random sound
//     let people = ["sweet", "sun"];
//     const randomKey = random(people)
//     // Start sound & video
//     makeupSounds.player(randomKey).start();
//     makeupSounds.player(randomKey).loop = true;
//     makeupSounds.chooseVideo(0);  
//  }
// }

// // Function to stop all sounds & videos when money === 1
// function stopMakeup() {
//   makeupVideos.stopVideo(); // Stop video
//   makeupSounds.stopAll(); // Stop all players
// }

// // Function to check money state and control playback
// function checkMakeup() {
//   if (makeup === 0) {
//     playMakeup()
//   } else if (makeup === 1) {
//     stopMakeup();
//   }
// }

// function checkMoney() {
//   if (money === 0) {
//     playMoney();
//   } else if (money === 1) {
//     stopMoney();
//   }
// }

// function draw() {
//   blendMode(BLEND);
//   background(0);
//   blendMode(DIFFERENCE);
  

//   videoManagers[0].displayVideo();
//   blendMode(DODGE);
//   videoManagers[1].displayVideo();
// }

// // Simulate changing money/makeup state for testing
// function keyPressed() {
//   if (key === '1') {
//     money = 0;
//   } else if (key === '2') {
//     money = 1;
//   }

//   if (key === '3') {
//     makeup = 0;
//   } else if (key === '4') {
//     makeup = 1;
//   }

//   checkMakeup()
//   checkMoney()
// }

// // Start Tone.js once loaded
// Tone.loaded().then(() => {
//   console.log("Sounds Loaded");
//   Tone.Transport.start();
//   checkMoney(); // Start checking money state on load
//   checkMakeup(); 
// });

// let videosA = [];
// let videosB = [];
// let totalVideos = 4;
// let money = 1;  // Start at 1 so it doesn't play immediately
// let makeup = 1;


// const moneySounds = new Tone.Players({
//   shiver: "sounds/shiver-short.mp3",
//   stronger: "sounds/stronger.mp3",
// }).toDestination();

// // const makeupSounds = new Tone.Players({
// //   sun: "sounds/sunshine.mp3",
// //   sweet: "sounds/sweet.mp3",
// // }).toDestination();

// // VideoManager class to handle selection and playback
// class VideoManager {
//   constructor() {
//     this.selectedVideo = null;
//   }

//   chooseVideo(index) {
//     if (videosA.length > index && videosB.length > index) {
//       // if (attribute === 0) {
//         this.selectedVideo = random([videosA[index], videosB[index]]);
//       // }
//       // if (attribute === 1) {
//         // this.selectedVideo = videosB[index];
//       // }
//     }
//     if (this.selectedVideo) {
//       this.selectedVideo.loop();
//     }
//   }

//   stopVideo() {
//     if (this.selectedVideo) {
//       this.selectedVideo.stop();
//       this.selectedVideo = null; // Reset so a new one is chosen next time
//     }
//   }

//   displayVideo() {
//     if (this.selectedVideo) {
//       image(this.selectedVideo, 0, 0, width, height);
//     }
//   }
// }

// // Create two video managers
// let moneyVideos = new VideoManager();
// let makeupVideos = new VideoManager();
// let videoManagers = [moneyVideos, makeupVideos];

// function preload() {
//   for (let i = 1; i <= totalVideos; i++) {
//     let path = 'images/' + i + '.mov'; // Adjust path as needed
//     let vid = createVideo(path);
//     vid.hide();
//     vid.speed(1); // Set speed but don't loop initially

//     if (i % 2 === 0) {
//       videosA.push(vid);
//     } else {
//       videosB.push(vid);
//     }
//   }
// }

// function setup() {
//   createCanvas(windowWidth, windowHeight);
// }

// function draw() {
//   blendMode(BLEND);
//   background(0);
//   blendMode(DIFFERENCE);

//   if (money === 0 && !moneyVideos.selectedVideo) {
//     // choose sound, based on sound attribute choose video
//     moneySounds.player("shiver").start();
//     moneyVideos.chooseVideo(0);
//   }
//   if (money === 1) {
//     moneyVideos.stopVideo();
//     moneySounds.stop();
//   }

//   if (makeup === 0 && !makeupVideos.selectedVideo) {
//     makeupVideos.chooseVideo(1);
//   }
//   if (makeup === 1) {
//     makeupVideos.stopVideo();
//   }

//   videoManagers[0].displayVideo();
//   blendMode(DODGE);
//   videoManagers[1].displayVideo();
// }

// // Simulate changing money state for testing
// function keyPressed() {
//   if (key === '1') {
//     money = 0;
//   } else if (key === '2') {
//     money = 1;
//   }

//   if (key === '3') {
//     makeup = 0;
//   } else if (key === '4') {
//     makeup = 1;
//   }
// }

// // Start Tone.js once loaded
// Tone.loaded().then(() => {
//   console.log("Sounds Loaded");
//   Tone.Transport.start();
//   checkMoneyState(); // Start checking money state on load
// });
