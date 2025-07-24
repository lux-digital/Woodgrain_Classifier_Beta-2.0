let video;
// For displaying the label
let label = "LOADING...";
let confidence = 0; // Combined confidence for display
// The classifiers
let classifier1, classifier2, classifier3;
let modelURL1 = "https://teachablemachine.withgoogle.com/models/H7RFfQKsP/"; // Placeholder for model 1
let modelURL2 = "https://teachablemachine.withgoogle.com/models/n0NvgsfkL/"; // Replace with new model URL
let modelURL3 = "https://teachablemachine.withgoogle.com/models/x-qNb7RBf/"; // Replace with new model URL
// Variable to hold the logo
let logo;
// Variable for animation timing
let time = 0;
// Store results from each classifier
let results1, results2, results3;
// Classification control
let isClassifying = false; // Track if classification cycle is in progress
let classifyStep = 0; // Track which classifier to run (0 = none, 1 = classifier1, 2 = classifier2, 3 = classifier3)
let lastClassifyTime = 0;
let classifyDelay = 500; // 500ms delay between each classifier
let cyclePause = 1000; // 1s pause between full classification cycles

function preload() {
  // Load three classifiers
  classifier1 = ml5.imageClassifier(modelURL1 + "model.json");
  classifier2 = ml5.imageClassifier(modelURL2 + "model.json");
  classifier3 = ml5.imageClassifier(modelURL3 + "model.json");
  // Load the logo image
  logo = loadImage('Logo.png'); // Ensure Logo.png is in the same directory or provide full path/URL
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Create the video using the rear-facing camera
  video = createCapture({ video: { facingMode: 'environment' } });
  video.size(224, 224); // Set video resolution to match Teachable Machine input
  video.hide();
  // Start classifying
  classifyVideo();
  
}

// Classify the video sequentially
function classifyVideo() {
  if (isClassifying) return; // Skip if a classification cycle is in progress

  let currentTime = millis();
  if (currentTime - lastClassifyTime < cyclePause && classifyStep === 0) {
    // Wait for cycle pause before starting new cycle
    setTimeout(classifyVideo, cyclePause - (currentTime - lastClassifyTime));
    return;
  }

  isClassifying = true;
  classifyStep = 1; // Start with classifier1
  results1 = null;
  results2 = null;
  results3 = null;
  classifier1.classify(video, gotResults1); // Run first classifier
}

// Handle results from classifier 1
function gotResults1(error, results) {
  if (error) {
    console.error("Classifier 1 error:", error);
    isClassifying = false;
    classifyStep = 0;
    setTimeout(classifyVideo, classifyDelay);
    return;
  }
  results1 = results;
  console.log("Classifier 1 results:", results1);
  classifyStep = 2;
  setTimeout(() => classifier2.classify(video, gotResults2), classifyDelay); // Delay before classifier2
}

// Handle results from classifier 2
function gotResults2(error, results) {
  if (error) {
    console.error("Classifier 2 error:", error);
    isClassifying = false;
    classifyStep = 0;
    setTimeout(classifyVideo, classifyDelay);
    return;
  }
  results2 = results;
  console.log("Classifier 2 results:", results2);
  classifyStep = 3;
  setTimeout(() => classifier3.classify(video, gotResults3), classifyDelay); // Delay before classifier3
}

// Handle results from classifier 3
function gotResults3(error, results) {
  if (error) {
    console.error("Classifier 3 error:", error);
    isClassifying = false;
    classifyStep = 0;
    setTimeout(classifyVideo, classifyDelay);
    return;
  }
  results3 = results;
  console.log("Classifier 3 results:", results3);
  combineResults();
}

// Combine predictions from all three models
function combineResults() {
  // Ensure all classifiers have results
  if (!results1 || !results2 || !results3) {
    isClassifying = false;
    classifyStep = 0;
    setTimeout(classifyVideo, classifyDelay);
    return;
  }

  // Create a map to store total confidence for each label
  let confidenceMap = {};
  let maxConfidence = 0;
  let bestLabel = "Analyzing ...";

  // Aggregate confidences for each label across all models
  [results1, results2, results3].forEach((results, index) => {
    results.forEach(result => {
      let label = result.label;
      let conf = result.confidence;
      if (!confidenceMap[label]) {
        confidenceMap[label] = { total: 0, count: 0 };
      }
      confidenceMap[label].total += conf;
      confidenceMap[label].count += 1;
    });
  });

  // Calculate average confidence for each label and find the highest
  for (let label in confidenceMap) {
    let avgConfidence = confidenceMap[label].total / confidenceMap[label].count;
    if (avgConfidence > maxConfidence) {
      maxConfidence = avgConfidence;
      bestLabel = label;
    }
  }

  // Update global variables for display
  label = bestLabel;
  confidence = maxConfidence;

  // Reset for next cycle
  isClassifying = false;
  classifyStep = 0;
  lastClassifyTime = millis();
  setTimeout(classifyVideo, cyclePause); // Pause before next cycle
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
  fill(0, 0, 0, 20); // Gray background for bar
  rect(barX / 2, barY, barWidth, barHeight + 10, 20); // Rounded corners with 10px radius
  if (typeof confidence !== 'undefined') {
    if (label === "Analyzing ...") {
      console.log("Detected Analyzing...");
      time += 0.05; // Increment time for animation
      let bounceFactor = (sin(time) + 1) / 4 + 0.4; // Maps sin(-1 to 1) to 0.4 to 0.5
      let fillWidth = barWidth * bounceFactor;
      fill(255, 0, 0, 50); // Red with 70% opacity
      rect(barX - barWidth / 2, barY, fillWidth, barHeight + 10, 20); // Confidence-proportional width
      // Display confidence percentage inside the bar
      textSize(100);
      textAlign(CENTER, CENTER);
      fill(0, 0, 0, 50); // Black text for readability
      text(Math.round(bounceFactor * 100) + "%", barX, barY + barHeight / 2 + 100);
    } else {
      // Normal behavior for other labels
      fill(0, 255, 0, 70); // Green fill for confidence with 70% opacity
      let fillWidth = barWidth * confidence;
      rect(barX - barWidth / 2, barY, fillWidth, barHeight + 10, 20); // Confidence-proportional width
      // Display confidence percentage inside the bar
      textSize(120);
      textAlign(CENTER, CENTER);
      fill(0, 150, 0, 50); // Black text for readability
      text(Math.round(confidence * 100) + "%", barX, barY + barHeight / 2 + 100);
    }
  }
}