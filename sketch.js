let video;
// For displaying the label
let label = "LOADING...";
// The classifier
let classifier;
let modelURL = "https://teachablemachine.withgoogle.com/models/zPFXk5dVn/";
// Variable to hold the logo
let logo;

function preload() {
  classifier = ml5.imageClassifier(modelURL + "model.json");
  // Load the logo image
  logo = loadImage('Logo.png'); // Ensure Logo.png is in the same directory or provide full path/URL
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Create the video using the rear-facing camera
  video = createCapture({ video: { facingMode: 'environment' } });
  video.hide();
  // Start classifying
  classifyVideo();
}

// Classify the video
function classifyVideo() {
  classifier.classify(video, gotResults);
}

function draw() {
  background(255);
  let videoAspect = video.width / video.height;
  let canvasAspect = windowWidth / windowHeight;
  let displayWidth, displayHeight;
  if (videoAspect > canvasAspect) {
    displayWidth = windowWidth;
    displayHeight = windowWidth / videoAspect;
  } else {
    displayHeight = windowHeight;
    displayWidth = windowHeight * videoAspect;
  }
  image(video, 0, 0, displayWidth, displayHeight);

  // Center the logo at the top with dynamic size
  let logoSize = min(200, displayWidth * 0.3); // Limit logo size to 200px or 30% of video width
  let logoHeight = logoSize * (logo.height / logo.width); // Maintain aspect ratio
  image(logo, (width - logoSize) / 2, 20, logoSize, logoHeight); // Centered at top with 20px padding

  // Label background and text
  noStroke();
  fill(0, 0, 0, 150); // Semi-transparent black background
  rectMode(CENTER);
  
  let labelHeight = 100;

  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label, displayWidth/ 2, displayHeight/ 2);
}

// Get the classification
function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  classifyVideo();
}