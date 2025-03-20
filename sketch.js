let videosA = [];
let videosB = [];
let totalVideos = 4;
let money = 1;  // Start at 1 so it doesn't play immediately
let makeup = 1;

// VideoManager class to handle selection and playback
class VideoManager {
  constructor() {
    this.selectedVideo = null;
  }

  chooseRandomVideo(index) {
    if (videosA.length > index && videosB.length > index) {
      this.selectedVideo = random([videosA[index], videosB[index]]);
    }
    if (this.selectedVideo) {
      this.selectedVideo.loop();
    }
  }

  stopVideo() {
    if (this.selectedVideo) {
      this.selectedVideo.stop();
      this.selectedVideo = null; // Reset so a new one is chosen next time
    }
  }

  displayVideo() {
    if (this.selectedVideo) {
      image(this.selectedVideo, 0, 0, width, height);
    }
  }
}

// Create two video managers
let videoManager1 = new VideoManager();
let videoManager2 = new VideoManager();

function preload() {
  for (let i = 1; i <= totalVideos; i++) {
    let path = 'images/' + i + '.mov'; // Adjust path as needed
    let vid = createVideo(path);
    vid.hide();
    vid.speed(1); // Set speed but don't loop initially

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

function draw() {
  blendMode(BLEND);
  background(0);
  blendMode(DIFFERENCE);

  if (money === 0 && !videoManager1.selectedVideo) {
    videoManager1.chooseRandomVideo(0);
  }
  if (money === 1) {
    videoManager1.stopVideo();
  }

  if (makeup === 0 && !videoManager2.selectedVideo) {
    videoManager2.chooseRandomVideo(1);
  }
  if (makeup === 1) {
    videoManager2.stopVideo();
  }
  videoManager1.displayVideo();
  blendMode(DODGE);
  videoManager2.displayVideo();
}

// Simulate changing money state for testing
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
}
