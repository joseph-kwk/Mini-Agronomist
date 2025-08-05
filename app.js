let cropData = {};
let cropProfiles = {};
let regionData = {};

// Load all data files when the app starts
Promise.all([
  fetch("data/crop_rules.json").then(res => res.json()),
  fetch("data/crop_profiles.json").then(res => res.json()),
  fetch("data/regions.json").then(res => res.json())
])
.then(([rules, profiles, regions]) => {
  cropData = rules;
  cropProfiles = profiles;
  regionData = regions;
  
  console.log("Data loaded successfully:", {
    regions: Object.keys(regionData).length,
    crops: Object.keys(cropProfiles).length,
    rules: Object.keys(cropData).length
  });
  
  validateCropData(cropData); // Run JSON structure checks
  populateRegionDropdown(); // Populate region dropdown with real data
  populateCropDropdown(); // Populate crop dropdown with real data
})
.catch(err => {
  console.error("Error loading crop data:", err);
  document.getElementById("errorLog").innerHTML = `<p>❌ Could not load agricultural data. Check your JSON files or folder path.</p>`;
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
  
  // Add region change listener to update soil options
  const regionSelect = document.getElementById("region");
  if (regionSelect) {
    regionSelect.addEventListener("change", function() {
      updateSoilOptions(this.value);
    });
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
  const regionDisplayName = regionData[region]?.display_name || region;
  conditionsSummary.textContent = `Region: ${regionDisplayName} | Soil: ${soil.charAt(0).toUpperCase() + soil.slice(1)} | Rainfall: ${rainfall} mm/week`;
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
  
  // Enhanced tip display with harvest date and varieties
  let tipHTML = `<strong>💡 Recommendation:</strong> ${tip}`;
  
  if (result.harvestDate) {
    const harvestDisplay = result.harvestDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
    tipHTML += `<br><strong>�️ Expected Harvest:</strong> ${harvestDisplay}`;
  }
  
  if (result.varieties && result.varieties.length > 0) {
    tipHTML += `<br><strong>🌱 Recommended Varieties:</strong> ${result.varieties.join(", ")}`;
  }
  
  tipHTML += `<br><small><em>📚 Source: ${source}</em></small>`;
  
  tipElement.innerHTML = tipHTML;
  tipElement.classList.remove("placeholder");
  
  hideLoadingState();
  renderRiskBar(riskLevel);
  updateHistoryDisplay();
  showNewPredictionButton();
}

// Enhanced yield calculation using the three-tier data structure
function calculateYield(crop, soil, rainfall, plantingDate, region) {
  // Check if we have data for this combination
  if (!cropData[region] || !cropData[region][crop] || !cropData[region][crop][soil]) {
    return null;
  }
  
  const cropRules = cropData[region][crop][soil];
  const cropProfile = cropProfiles[crop];
  const regionInfo = regionData[region];
  
  if (!cropProfile || !regionInfo) {
    return null;
  }
  
  // Get base yield range from region-specific rules
  const [minYield, maxYield] = cropRules.yield_range;
  
  // Calculate rainfall impact
  const [minRain, maxRain] = cropRules.rain_window;
  const rainScore = calculateRainfallScore(rainfall, minRain, maxRain);
  
  // Calculate planting timing impact
  const timingValidation = validatePlantingTiming(region, crop, plantingDate);
  const seasonScore = timingValidation.valid ? 0.9 : 0.6; // Reduced score for poor timing
  
  // Calculate water requirement match
  const annualRainfall = regionInfo.annual_rainfall_mm;
  const waterRequirement = (cropProfile.water_requirement_mm[0] + cropProfile.water_requirement_mm[1]) / 2;
  const waterMatchScore = Math.min(1.0, annualRainfall / waterRequirement);
  
  // Calculate soil pH compatibility
  const soilProfile = regionInfo.soil_profiles.find(s => s.type === soil);
  const cropPHRange = cropProfile.soil_ph_range;
  let pHScore = 1.0;
  
  if (soilProfile) {
    const soilPHMid = (soilProfile.ph_range[0] + soilProfile.ph_range[1]) / 2;
    const cropPHMid = (cropPHRange[0] + cropPHRange[1]) / 2;
    const pHDiff = Math.abs(soilPHMid - cropPHMid);
    pHScore = Math.max(0.3, 1.0 - (pHDiff / 2.0)); // Penalize pH mismatch
  }
  
  // Combine all factors with weights
  const finalScore = (
    rainScore * 0.35 +           // Rainfall is most important
    seasonScore * 0.25 +         // Timing is crucial
    waterMatchScore * 0.25 +     // Water requirement match
    pHScore * 0.15               // Soil pH compatibility
  );
  
  // Calculate final yield estimate
  const predictedYield = minYield + (maxYield - minYield) * finalScore;
  
  // Calculate risk level (inverse of confidence)
  const riskLevel = 1 - finalScore;
  
  // Calculate harvest date
  const harvestDate = calculateHarvestDate(plantingDate, crop);
  
  // Get region-specific variety recommendations
  const recommendedVarieties = regionInfo.common_varieties[crop] || cropProfile.common_varieties.slice(0, 2);
  
  // Build comprehensive tip
  let enhancedTip = cropRules.tip;
  
  if (!timingValidation.valid) {
    enhancedTip += ` ${timingValidation.message}`;
  }
  
  if (recommendedVarieties.length > 0) {
    enhancedTip += ` Recommended varieties for this region: ${recommendedVarieties.join(", ")}.`;
  }
  
  if (harvestDate) {
    const harvestMonth = harvestDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    enhancedTip += ` Expected harvest: ${harvestMonth}.`;
  }
  
  // Add region-specific tips
  if (regionInfo.region_tips && regionInfo.region_tips.length > 0) {
    enhancedTip += ` Regional advice: ${regionInfo.region_tips[0]}`;
  }
  
  return {
    yieldEstimate: predictedYield.toFixed(1),
    tip: enhancedTip,
    riskLevel: riskLevel,
    source: cropRules.source,
    harvestDate: harvestDate,
    varieties: recommendedVarieties,
    timingMessage: timingValidation.message
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

  // Validate the new three-tier structure: region -> crop -> soil
  Object.keys(data).forEach(region => {
    if (typeof data[region] !== 'object') return;
    
    Object.keys(data[region]).forEach(crop => {
      if (typeof data[region][crop] !== 'object') return;
      
      Object.keys(data[region][crop]).forEach(soil => {
        const rule = data[region][crop][soil];
        const requiredFields = ["yield_range", "rain_window", "tip", "source"];
        
        requiredFields.forEach(field => {
          if (
            !(field in rule) ||
            rule[field] === null ||
            rule[field] === "" ||
            (Array.isArray(rule[field]) && rule[field].length !== 2)
          ) {
            warnings.push(`⚠️ ${region}/${crop}/${soil} is missing or has invalid '${field}'.`);
          }
        });
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
    errorBox.innerHTML = "<p class='centered-notification'>🗑️ History cleared</p>";
    errorBox.classList.remove("hidden");
    
    // Auto-hide the message after 2 seconds
    setTimeout(() => {
      errorBox.classList.add("hidden");
    }, 2000);
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
  
  // Show notification AFTER reset to prevent it from being cleared
  setTimeout(() => {
    const errorBox = document.getElementById("errorLog");
    errorBox.innerHTML = "<p class='centered-notification'>✨ New prediction started</p>";
    errorBox.classList.remove("hidden");
    
    // Auto-hide the message after 2 seconds
    setTimeout(() => {
      errorBox.classList.add("hidden");
      errorBox.innerHTML = ""; // Clear the content too
    }, 2000);
  }, 50); // Small delay to ensure reset is complete
}

// Helper functions for the new three-tier data structure

function populateRegionDropdown() {
  const regionSelect = document.getElementById("region");
  if (!regionSelect) return;
  
  // Clear existing options except the first placeholder
  while (regionSelect.children.length > 1) {
    regionSelect.removeChild(regionSelect.lastChild);
  }
  
  // Add regions from data
  Object.entries(regionData).forEach(([key, region]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = region.display_name;
    regionSelect.appendChild(option);
  });
}

function populateCropDropdown() {
  const cropSelect = document.getElementById("crop");
  if (!cropSelect) return;
  
  // Clear existing options except the first placeholder
  while (cropSelect.children.length > 1) {
    cropSelect.removeChild(cropSelect.lastChild);
  }
  
  // Add crops from profiles
  Object.entries(cropProfiles).forEach(([key, profile]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)} (${profile.scientific_name})`;
    cropSelect.appendChild(option);
  });
}

function updateSoilOptions(selectedRegion) {
  const soilSelect = document.getElementById("soil");
  if (!soilSelect || !selectedRegion || !regionData[selectedRegion]) return;
  
  // Clear existing options except the first placeholder
  while (soilSelect.children.length > 1) {
    soilSelect.removeChild(soilSelect.lastChild);
  }
  
  // Add soil types available in the selected region
  const availableSoils = regionData[selectedRegion].soil_profiles;
  availableSoils.forEach(soilProfile => {
    const option = document.createElement("option");
    option.value = soilProfile.type;
    option.textContent = `${soilProfile.type.charAt(0).toUpperCase() + soilProfile.type.slice(1)} (pH: ${soilProfile.ph_range[0]}-${soilProfile.ph_range[1]})`;
    soilSelect.appendChild(option);
  });
}

function calculateHarvestDate(plantingDate, crop) {
  if (!cropProfiles[crop]) return null;
  
  const daysToMaturity = cropProfiles[crop].days_to_maturity;
  const avgDays = (daysToMaturity[0] + daysToMaturity[1]) / 2;
  
  const harvestDate = new Date(plantingDate);
  harvestDate.setDate(harvestDate.getDate() + avgDays);
  
  return harvestDate;
}

function validatePlantingTiming(region, crop, plantingDate) {
  if (!regionData[region] || !regionData[region].planting_windows[crop]) {
    return { valid: true, message: "No specific timing data available for this combination." };
  }
  
  const window = regionData[region].planting_windows[crop];
  const plantingMonth = plantingDate.getMonth(); // 0-11
  
  // Convert month names to numbers
  const monthNames = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];
  
  const startMonth = monthNames.indexOf(window.start);
  const endMonth = monthNames.indexOf(window.end);
  
  let isInWindow = false;
  if (startMonth <= endMonth) {
    // Normal case: April to June
    isInWindow = plantingMonth >= startMonth && plantingMonth <= endMonth;
  } else {
    // Wrapping case: November to January
    isInWindow = plantingMonth >= startMonth || plantingMonth <= endMonth;
  }
  
  if (!isInWindow) {
    return {
      valid: false,
      message: `⚠️ Optimal planting window for ${crop} in this region is ${window.start}-${window.end}.`
    };
  }
  
  return { valid: true, message: "✅ Planting timing is within the optimal window." };
}

// Missing calculation functions
function calculateRainfallScore(actualRainfall, minRain, maxRain) {
  if (actualRainfall < minRain) {
    // Below minimum - penalty for drought stress
    return Math.max(0, 1 - (minRain - actualRainfall) / minRain);
  } else if (actualRainfall > maxRain) {
    // Above maximum - penalty for excess water/flooding
    return Math.max(0, 1 - (actualRainfall - maxRain) / maxRain);
  } else {
    // Within optimal range
    const range = maxRain - minRain;
    const position = (actualRainfall - minRain) / range;
    // Peak at 60% of the range, then slight decline
    return position <= 0.6 ? 0.7 + position * 0.5 : 1.0 - (position - 0.6) * 0.2;
  }
}

function calculateSeasonScore(plantingDate, crop) {
  // Basic seasonal scoring - this is simplified
  // In a real implementation, this would use crop-specific growing seasons
  const month = plantingDate.getMonth(); // 0-11
  
  // Simple heuristic: penalize very early or very late planting
  if (month < 2 || month > 10) {
    return 0.6; // Winter planting penalty
  } else if (month >= 3 && month <= 8) {
    return 0.9; // Good growing season
  } else {
    return 0.8; // Moderate season
  }
}
