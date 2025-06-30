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
  const soil = document.getElementById("soil").value;
  const crop = document.getElementById("crop").value;
  const rainfall = parseInt(document.getElementById("rainfall").value);
  const plantingDate = new Date(document.getElementById("plantingDate").value);

  const errorBox = document.getElementById("errorLog");
  const errors = [];

  // Enhanced form validation with specific messages
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
    processPrediction(soil, crop, rainfall, plantingDate);
  }, 300);
});

function processPrediction(soil, crop, rainfall, plantingDate) {
  // Run the prediction based on inputs
  const result = predictYield(soil, crop, rainfall);

  // Handle unknown combo
  if (!result) {
    document.getElementById("yieldResult").textContent = 
      "❌ Sorry, no prediction data available for this combination. Try different soil or crop types.";
    document.getElementById("tip").textContent = "";
    renderRiskBar(1); // Max risk
    hideLoadingState();
    document.getElementById("output").classList.remove("hidden");
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

  document.getElementById("cropIcon").textContent = iconName;
  document.getElementById("conditionsSummary").textContent =
    `Soil: ${soil.charAt(0).toUpperCase() + soil.slice(1)} | Rainfall: ${rainfall} mm/week`;
  document.getElementById("yieldResult").textContent =
    `📊 Estimated Yield: ${yieldEstimate} tons/ha`;
  document.getElementById("confidence").textContent =
    riskLevel <= 0.3 ? "✅ Conditions are near optimal for this crop."
    : riskLevel <= 0.6 ? "⚠️ Conditions are moderate - some adjustments recommended."
    : "❗ Conditions are challenging - follow tips carefully.";
  document.getElementById("tip").innerHTML =
    `<strong>💡 Recommendation:</strong> ${tip}<br><small><em>📚 Source: ${source}</em></small>`;
  
  hideLoadingState();
  document.getElementById("output").classList.remove("hidden");
  renderRiskBar(riskLevel);
  updateHistoryDisplay();
}

// Compute yield from the rule set
function predictYield(soil, crop, rainfall) {
  if (!cropData[crop] || !cropData[crop][soil]) return null;

  const rule = cropData[crop][soil];
  const [minYield, maxYield] = rule.yield_range;
  const [minRain, maxRain] = rule.rain_window;

  let yieldEstimate, riskLevel;

  if (rainfall >= minRain && rainfall <= maxRain) {
    yieldEstimate = ((minYield + maxYield) / 2).toFixed(1);
    riskLevel = 0.2;
  } else if (rainfall < minRain) {
    yieldEstimate = minYield.toFixed(1);
    riskLevel = 0.7;
  } else {
    yieldEstimate = (maxYield - 0.3).toFixed(1);
    riskLevel = 0.5;
  }

  return {
    yieldEstimate,
    tip: rule.tip,
    riskLevel,
    source: rule.source || "Agronomic reference"
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
  const requiredFields = ["yield_range", "rain_window", "tip", "source"];
  const warnings = [];

  Object.keys(data).forEach(crop => {
    Object.keys(data[crop]).forEach(soil => {
      const rule = data[crop][soil];
      requiredFields.forEach(field => {
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
  
  // Hide results
  document.getElementById("output").classList.add("hidden");
  
  // Hide any error messages
  const errorBox = document.getElementById("errorLog");
  errorBox.innerHTML = "";
  errorBox.classList.add("hidden");
  
  // Focus on first input
  document.getElementById("soil").focus();
}

function startNewPrediction() {
  // Hide current results to encourage new prediction
  document.getElementById("output").classList.add("hidden");
  
  // Optionally reset form
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
