let video;
// For displaying the label
let label = "LOADING...";
// The classifier
let classifier;
let modelURL = "https://teachablemachine.withgoogle.com/models/zPFXk5dVn/";
// Variable to hold the logo
let logo;
// Variable for animation timing
let time = 0;

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
  // Fill the canvas with the video, maintaining aspect ratio
  let videoAspect = video.width / video.height;
  let canvasAspect = width / height;
  let displayWidth, displayHeight, xOffset, yOffset;
  if (videoAspect > canvasAspect) {
    displayWidth = width;
    displayHeight = width / videoAspect;
    yOffset = (height - displayHeight) / 2;
    xOffset = 0;
  } else {
    displayHeight = height;
    displayWidth = height * videoAspect;
    xOffset = (width - displayWidth) / 2;
    yOffset = 0;
  }
  image(video, xOffset, yOffset, displayWidth, displayHeight);

  // Center the logo at the top with dynamic size
  let logoSize = min(450, width * 0.3); // Limit logo size to 200px or 30% of canvas width
  let logoHeight = logoSize * (logo.height / logo.width); // Maintain aspect ratio
  image(logo, (width - logoSize) / 2, 20, logoSize, logoHeight); // Centered at top with 20px padding

  // Center the label text
  textSize(80);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label, width / 2, height / 2.05);

  // Draw confidence bar below the label with rounded corners
  let barHeight = 20;
  let barY = height / 2 + 40; // 40px below the label
  let barWidth = width * 0.5; // Half the screen width
  let barX = width / 2; // Centered horizontally
  noStroke();
  fill(0,0,0,20); // Gray background for bar
  rect(barX/2, barY, barWidth, barHeight+10, 20); // Rounded corners with 10px radius
  if (typeof confidence !== 'undefined') {
    if (label === "Analyzing ...") {
      console.log("Detected Analyzing...");
      time += 0.05; // Increment time for animation
      let bounceFactor = (sin(time) + 1) / 4 + 0.4; // Maps sin(-1 to 1) to 0.4 to 0.5
      let fillWidth = barWidth * bounceFactor;
      fill(255, 0, 0, 50); // Red with 70% opacity (255 * 0.7 = 179)
      rect(barX - barWidth / 2, barY, fillWidth, barHeight+10, 20); // Confidence-proportional width with rounded corners
      // Display confidence percentage inside the bar
      textSize(100);
      textAlign(CENTER, CENTER);
      fill(0,0,0,50); // Black text for readability
      text(Math.round(bounceFactor * 100) + "%", barX, barY + barHeight / 2+100);
    } else {
      // Normal behavior for other labels
      fill(0, 255, 0, 70); // Green fill for confidence with 70% opacity
      let fillWidth = barWidth * confidence;
      rect(barX - barWidth / 2, barY, fillWidth, barHeight+10, 20); // Confidence-proportional width with rounded corners
      // Display confidence percentage inside the bar
      textSize(120);
      textAlign(CENTER, CENTER);
      fill(0,150,0,50); // Black text for readability
      text(Math.round(confidence * 100) + "%", barX, barY + barHeight / 2+100);
    }
  }
}

// Get the classification
function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  confidence = results[0].confidence; // Store confidence value
  classifyVideo();
}