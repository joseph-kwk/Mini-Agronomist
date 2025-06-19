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

// Listen for form submission (when user clicks "Predict")
document.getElementById("inputForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the page from reloading

  // Get values from the form
  const soil = document.getElementById("soil").value;
  const crop = document.getElementById("crop").value;
  const rainfall = parseInt(document.getElementById("rainfall").value);
  const plantingDate = new Date(document.getElementById("plantingDate").value);

  const errorBox = document.getElementById("errorLog");
  const errors = [];

  // Manual form validation
  if (!soil || !crop) errors.push("Please select both crop and soil type.");
  if (isNaN(rainfall)) errors.push("Rainfall must be provided.");
  if (!plantingDate || plantingDate.toString() === "Invalid Date")
    errors.push("Please select a valid planting date.");

  if (errors.length > 0) {
    // Show the error messages in the yellow box
    errorBox.innerHTML = errors.map(e => `<p>${e}</p>`).join("");
    errorBox.classList.remove("hidden");
    return;
  } else {
    // Hide errors if everything is good
    errorBox.innerHTML = "";
    errorBox.classList.add("hidden");
  }

  // Run the prediction based on inputs
  const result = predictYield(soil, crop, rainfall);

  // Handle unknown combo
  if (!result) {
    document.getElementById("yieldResult").textContent = "Sorry, no data for that combination.";
    document.getElementById("tip").textContent = "";
    renderRiskBar(1); // Max risk
    return;
  }

  // Show prediction result
  const { yieldEstimate, tip, riskLevel, source } = result;

  const cropIcons = {
    maize: "corn",
    groundnuts: "spa",
    sorghum: "grass"
  };
  const emoji = cropIcons[crop] || "eco";

  document.getElementById("cropIcon").textContent = emoji;
  document.getElementById("conditionsSummary").textContent =
    `Soil: ${soil} | Rainfall: ${rainfall} mm/week`;
  document.getElementById("yieldResult").textContent =
    `📊 Estimated Yield: ${yieldEstimate} tons/ha`;
  document.getElementById("confidence").textContent =
    riskLevel <= 0.3 ? "✅ Conditions are near optimal."
    : riskLevel <= 0.6 ? "⚠️ Conditions are moderate."
    : "❗ Rainfall is outside ideal range.";
  document.getElementById("tip").innerHTML =
    `<strong>Tip:</strong> ${tip}<br><small><em>Source: ${source}</em></small>`;
  document.getElementById("output").classList.remove("hidden");

  renderRiskBar(riskLevel);
});

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
