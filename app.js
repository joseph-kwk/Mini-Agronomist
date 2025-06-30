let cropData = {};

// Load the crop rules JSON when the app starts
fetch("data/crop_rules.json")
  .then(res => res.json())
  .then(data => {
    cropData = data;
    validateCropData(cropData); // Run JSON structure checks
  })
  .catch(err => {
    console.error("Error loading crop data:", err);
    document.getElementById("errorLog").innerHTML = `<p>❌ Could not load crop rules. Check your JSON or folder path.</p>`;
    document.getElementById("errorLog").classList.remove("hidden");
  });

// Add real-time validation
document.getElementById("rainfall").addEventListener("input", validateRainfall);
document.getElementById("plantingDate").addEventListener("change", validatePlantingDate);

// Add reset form functionality
document.getElementById("resetForm").addEventListener("click", resetForm);

// Initialize history display and clear button
document.addEventListener('DOMContentLoaded', function() {
  updateHistoryDisplay();
  resetResultsToPlaceholder(); // Initialize with placeholder content
  
  const clearBtn = document.getElementById('clearHistory');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearPredictionHistory);
  }
  
  const newPredictionBtn = document.getElementById('newPrediction');
  if (newPredictionBtn) {
    newPredictionBtn.addEventListener('click', startNewPrediction);
  }
});

// Listen for form submission (when user clicks "Predict")
document.getElementById("inputForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the page from reloading

  // Show loading state
  showLoadingState();

  // Get values from the form
  const region = document.getElementById("region").value;
  const soil = document.getElementById("soil").value;
  const crop = document.getElementById("crop").value;
  const rainfall = parseInt(document.getElementById("rainfall").value);
  const plantingDate = new Date(document.getElementById("plantingDate").value);

  const errorBox = document.getElementById("errorLog");
  const errors = [];

  // Enhanced form validation with specific messages
  if (!region) {
    errors.push("❌ Please select your agricultural region for accurate predictions.");
  }
  
  if (!soil || !crop) {
    errors.push("❌ Please select both crop and soil type to continue.");
  }
  
  if (isNaN(rainfall)) {
    errors.push("❌ Rainfall amount is required.");
  } else if (rainfall < 0) {
    errors.push("❌ Rainfall cannot be negative.");
  } else if (rainfall > 500) {
    errors.push("⚠️ Rainfall above 500mm/week is extremely high. Please verify your input.");
  }
  
  if (!plantingDate || plantingDate.toString() === "Invalid Date") {
    errors.push("❌ Please select a valid planting date.");
  } else {
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    if (plantingDate < today) {
      errors.push("⚠️ Planting date is in the past. Consider updating to a future date.");
    } else if (plantingDate > oneYearFromNow) {
      errors.push("⚠️ Planting date is more than a year from now. Long-term predictions may be less accurate.");
    }
  }

  if (errors.length > 0) {
    // Show the error messages in the yellow box
    errorBox.innerHTML = errors.map(e => `<p>${e}</p>`).join("");
    errorBox.classList.remove("hidden");
    hideLoadingState();
    return;
  } else {
    // Hide errors if everything is good
    errorBox.innerHTML = "";
    errorBox.classList.add("hidden");
  }

  // Simulate processing time for better UX
  setTimeout(() => {
    processPrediction(soil, crop, rainfall, plantingDate, region);
  }, 300);
});

function processPrediction(soil, crop, rainfall, plantingDate, region) {
  // Run the prediction based on inputs
  const result = calculateYield(crop, soil, rainfall, plantingDate, region);

  // Handle unknown combo
  if (!result) {
    document.getElementById("yieldResult").textContent = 
      "❌ Sorry, no prediction data available for this combination. Try different soil or crop types.";
    document.getElementById("yieldResult").classList.remove("placeholder");
    document.getElementById("tip").textContent = "";
    document.getElementById("tip").classList.remove("placeholder");
    renderRiskBar(1); // Max risk
    hideLoadingState();
    showNewPredictionButton();
    return;
  }

  // Show prediction result
  const { yieldEstimate, tip, riskLevel, source } = result;

  // Save to history
  savePredictionToHistory({
    soil,
    crop,
    rainfall,
    plantingDate: plantingDate.toISOString().split('T')[0],
    yieldEstimate,
    riskLevel
  });

  const cropIcons = {
    maize: "agriculture",
    groundnuts: "spa", 
    sorghum: "grass"
  };
  const iconName = cropIcons[crop] || "eco";

  // Remove placeholder classes and update content
  document.getElementById("cropIcon").textContent = iconName;
  
  const conditionsSummary = document.getElementById("conditionsSummary");
  const regionName = region.charAt(0).toUpperCase() + region.slice(1);
  conditionsSummary.textContent = `Region: ${regionName} | Soil: ${soil.charAt(0).toUpperCase() + soil.slice(1)} | Rainfall: ${rainfall} mm/week`;
  conditionsSummary.classList.remove("placeholder");
  
  const yieldResult = document.getElementById("yieldResult");
  yieldResult.textContent = `📊 Estimated Yield: ${yieldEstimate} tons/ha`;
  yieldResult.classList.remove("placeholder");
  
  const confidence = document.getElementById("confidence");
  confidence.textContent = riskLevel <= 0.3 ? "✅ Conditions are near optimal for this crop."
    : riskLevel <= 0.6 ? "⚠️ Conditions are moderate - some adjustments recommended."
    : "❗ Conditions are challenging - follow tips carefully.";
  confidence.classList.remove("placeholder");
  
  const tipElement = document.getElementById("tip");
  tipElement.innerHTML = `<strong>💡 Recommendation:</strong> ${tip}<br><small><em>📚 Source: ${source}</em></small>`;
  tipElement.classList.remove("placeholder");
  
  hideLoadingState();
  renderRiskBar(riskLevel);
  updateHistoryDisplay();
  showNewPredictionButton();
}

// Compute yield from the rule set
function calculateYield(crop, soil, rainfall, plantingDate, region) {
  const cropRules = cropData[crop][soil];
  const regionModifier = cropData.regions[region]?.yield_modifier || 1.0;
  
  // Get base yield range
  const [minYield, maxYield] = cropRules.yield_range;
  
  // Apply regional modifier
  const adjustedMinYield = minYield * regionModifier;
  const adjustedMaxYield = maxYield * regionModifier;
  
  // Calculate rainfall impact (existing logic)
  const [minRain, maxRain] = cropRules.rain_window;
  const rainScore = calculateRainfallScore(rainfall, minRain, maxRain);
  
  // Calculate season timing impact (existing logic)
  const seasonScore = calculateSeasonScore(plantingDate, crop);
  
  // Combine all factors
  const finalScore = (rainScore + seasonScore) / 2;
  const predictedYield = adjustedMinYield + (adjustedMaxYield - adjustedMinYield) * finalScore;
  
  return {
    yield: predictedYield,
    confidence: finalScore,
    tips: [
      cropRules.tip,
      cropData.regions[region]?.tips || "No region-specific tips available."
    ]
  };
}

// Draw animated risk bar using inline SVG
function renderRiskBar(level) {
  const svg = document.getElementById("riskBar");
  svg.innerHTML = "";

  const width = svg.clientWidth;
  const filled = width * (1 - level);
  const color = level <= 0.3 ? "#4CAF50" : level <= 0.6 ? "#FFC107" : "#F44336";

  const bg = `<rect x="0" y="5" width="${width}" height="20" fill="#e0e0e0" rx="4" />`;
  const fg = `<rect id="riskFg" x="0" y="5" width="0" height="20" fill="${color}" rx="4" />`;

  svg.innerHTML = bg + fg;

  // Animate bar fill
  setTimeout(() => {
    document.getElementById("riskFg").setAttribute("width", filled);
  }, 100);
}

// Check crop_rules.json for missing fields or bad data
function validateCropData(data) {
  const warnings = [];

  // Skip validation for the regions object
  const crops = Object.keys(data).filter(key => key !== 'regions');
  
  // Validate crop data
  const cropRequiredFields = ["yield_range", "rain_window", "tip", "source"];
  crops.forEach(crop => {
    Object.keys(data[crop]).forEach(soil => {
      const rule = data[crop][soil];
      cropRequiredFields.forEach(field => {
        if (
          !(field in rule) ||
          rule[field] === null ||
          rule[field] === "" ||
          (Array.isArray(rule[field]) && rule[field].length !== 2)
        ) {
          warnings.push(`⚠️ ${crop.toUpperCase()} on ${soil} soil is missing or has invalid '${field}'.`);
        }
      });
    });
  });
  
  // Validate regions data
  if (data.regions) {
    const regionRequiredFields = ["yield_modifier", "description", "tips"];
    Object.keys(data.regions).forEach(region => {
      const regionData = data.regions[region];
      regionRequiredFields.forEach(field => {
        if (!(field in regionData) || regionData[field] === null || regionData[field] === "") {
          warnings.push(`⚠️ Region ${region.toUpperCase()} is missing or has invalid '${field}'.`);
        }
      });
    });
  }

  const errorBox = document.getElementById("errorLog");
  if (warnings.length > 0) {
    console.warn("🚧 Validation Warnings:");
    warnings.forEach(w => console.warn(w));
    errorBox.innerHTML += warnings.map(w => `<p>${w}</p>`).join("");
    errorBox.classList.remove("hidden");
  }
}

// Loading state management
function showLoadingState() {
  const button = document.querySelector('button[type="submit"]');
  button.disabled = true;
  button.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
  button.classList.add('loading');
}

function hideLoadingState() {
  const button = document.querySelector('button[type="submit"]');
  button.disabled = false;
  button.innerHTML = 'Predict';
  button.classList.remove('loading');
}

// Real-time validation functions
function validateRainfall() {
  const rainfallInput = document.getElementById("rainfall");
  const value = parseInt(rainfallInput.value);
  const feedbackElement = document.getElementById("rainfall-feedback");
  
  // Clear previous feedback
  if (feedbackElement) feedbackElement.remove();
  
  let message = "";
  let className = "";
  
  if (isNaN(value)) return;
  
  if (value < 0) {
    message = "❌ Rainfall cannot be negative";
    className = "error-feedback";
  } else if (value > 500) {
    message = "⚠️ Very high rainfall - please verify";
    className = "warning-feedback";
  } else if (value > 200) {
    message = "⚠️ High rainfall detected";
    className = "warning-feedback";
  } else if (value >= 30 && value <= 120) {
    message = "✅ Good rainfall range for most crops";
    className = "success-feedback";
  }
  
  if (message) {
    const feedback = document.createElement("small");
    feedback.id = "rainfall-feedback";
    feedback.className = className;
    feedback.textContent = message;
    rainfallInput.parentNode.appendChild(feedback);
  }
}

function validatePlantingDate() {
  const dateInput = document.getElementById("plantingDate");
  const value = new Date(dateInput.value);
  const feedbackElement = document.getElementById("date-feedback");
  
  // Clear previous feedback
  if (feedbackElement) feedbackElement.remove();
  
  if (!dateInput.value) return;
  
  let message = "";
  let className = "";
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
  if (value < today) {
    message = "⚠️ Date is in the past";
    className = "warning-feedback";
  } else if (value > oneYearFromNow) {
    message = "⚠️ Long-term prediction - less accurate";
    className = "warning-feedback";
  } else {
    const monthsFromNow = (value - today) / (1000 * 60 * 60 * 24 * 30);
    if (monthsFromNow <= 6) {
      message = "✅ Good timing for prediction";
      className = "success-feedback";
    }
  }
  
  if (message) {
    const feedback = document.createElement("small");
    feedback.id = "date-feedback";
    feedback.className = className;
    feedback.textContent = message;
    dateInput.parentNode.appendChild(feedback);
  }
}

// Prediction history management
function savePredictionToHistory(prediction) {
  try {
    const history = getPredictionHistory();
    const newPrediction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...prediction
    };
    
    history.unshift(newPrediction);
    
    // Keep only last 10 predictions
    if (history.length > 10) {
      history.splice(10);
    }
    
    localStorage.setItem('mini-agronomist-history', JSON.stringify(history));
  } catch (e) {
    console.warn('Could not save prediction to history:', e);
  }
}

function getPredictionHistory() {
  try {
    const history = localStorage.getItem('mini-agronomist-history');
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.warn('Could not load prediction history:', e);
    return [];
  }
}

function clearPredictionHistory() {
  if (confirm('Are you sure you want to clear all prediction history? This action cannot be undone.')) {
    localStorage.removeItem('mini-agronomist-history');
    updateHistoryDisplay();
    
    // Show confirmation message
    const errorBox = document.getElementById("errorLog");
    errorBox.innerHTML = "<p>🗑️ Prediction history cleared successfully.</p>";
    errorBox.classList.remove("hidden");
    
    // Auto-hide the message after 3 seconds
    setTimeout(() => {
      errorBox.classList.add("hidden");
    }, 3000);
  }
}

function updateHistoryDisplay() {
  const historyContainer = document.getElementById('historyContainer');
  if (!historyContainer) return;
  
  const history = getPredictionHistory();
  
  if (history.length === 0) {
    historyContainer.innerHTML = '<p class="no-history">No recent predictions</p>';
    return;
  }
  
  const historyHTML = history.map((pred, index) => `
    <div class="history-item ${index === 0 ? 'latest' : ''}">
      <div class="history-header-item">
        <strong>${pred.crop.charAt(0).toUpperCase() + pred.crop.slice(1)} on ${pred.soil} soil</strong>
        <small>${new Date(pred.timestamp).toLocaleDateString()}</small>
      </div>
      <div class="history-details">
        <span class="yield-highlight">${pred.yieldEstimate} tons/ha</span> | ${pred.rainfall}mm/week
      </div>
    </div>
  `).join('');
  
  historyContainer.innerHTML = historyHTML;
}

// Form reset functionality
function resetForm() {
  // Reset all form fields
  document.getElementById("inputForm").reset();
  
  // Clear validation feedback
  const feedbackElements = document.querySelectorAll('.error-feedback, .warning-feedback, .success-feedback');
  feedbackElements.forEach(el => el.remove());
  
  // Reset results to placeholder state
  resetResultsToPlaceholder();
  
  // Hide any error messages
  const errorBox = document.getElementById("errorLog");
  errorBox.innerHTML = "";
  errorBox.classList.add("hidden");
  
  // Focus on first input
  document.getElementById("soil").focus();
}

function resetResultsToPlaceholder() {
  // Reset crop icon
  document.getElementById("cropIcon").textContent = "eco";
  
  // Reset conditions summary
  const conditionsSummary = document.getElementById("conditionsSummary");
  conditionsSummary.textContent = "Fill out the form and click \"Predict Yield\" to see your crop yield prediction";
  conditionsSummary.classList.add("placeholder");
  
  // Reset yield result
  const yieldResult = document.getElementById("yieldResult");
  yieldResult.textContent = "🌱 Ready to predict";
  yieldResult.classList.add("placeholder");
  
  // Reset confidence indicator
  const confidence = document.getElementById("confidence");
  confidence.textContent = "Select your crop, soil type, rainfall, and planting date to get started";
  confidence.classList.add("placeholder");
  
  // Reset tip section
  const tipElement = document.getElementById("tip");
  tipElement.innerHTML = "<strong>💡 Tips will appear here:</strong> Get personalized recommendations based on your specific crop and soil conditions.";
  tipElement.classList.add("placeholder");
  
  // Reset risk bar to empty state
  const svg = document.getElementById("riskBar");
  svg.innerHTML = '<rect x="0" y="5" width="100%" height="20" fill="#e0e0e0" rx="4" />';
  
  // Hide new prediction button
  hideNewPredictionButton();
}

function showNewPredictionButton() {
  const newPredictionBtn = document.getElementById('newPrediction');
  if (newPredictionBtn) {
    newPredictionBtn.classList.remove('hidden');
  }
}

function hideNewPredictionButton() {
  const newPredictionBtn = document.getElementById('newPrediction');
  if (newPredictionBtn) {
    newPredictionBtn.classList.add('hidden');
  }
}

function startNewPrediction() {
  // Reset form and results to placeholder state
  resetForm();
  
  // Show a brief message
  const errorBox = document.getElementById("errorLog");
  errorBox.innerHTML = "<p>✨ Ready for a new prediction! Fill out the form above.</p>";
  errorBox.classList.remove("hidden");
  
  // Auto-hide the message after 3 seconds
  setTimeout(() => {
    errorBox.classList.add("hidden");
  }, 3000);
}
