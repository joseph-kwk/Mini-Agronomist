# 🌾 Mini Agronomist

**Mini Agronomist** is a sophisticated, offline-first web app designed to assist farmers worldwide with yield predictions and region-specific planting advice. Users select their region, crop type, soil type, and planting conditions—and receive locally-appropriate, scientifically-grounded estimates powered by a three-tier agricultural intelligence system.

---

## ✨ Features

- 🌍 **Global Regional Intelligence** - 14 major agricultural regions with climate-specific data
- 📱 *Offline-capable* (PWA-compatible)
- 🌿 Intuitive interface with farm-inspired visuals  
- 🧬 **Biological Crop Profiles** - Scientific crop data including maturity periods, growing degree days, and water requirements
- 🌧️ **Advanced Climate Modeling** - Regional rainfall patterns, temperature curves, and seasonal windows
- 🌱 **Region-Specific Varieties** - Local cultivar recommendations for each region
- 📊 **Enhanced Yield Estimation** - Multi-factor analysis considering rainfall, timing, soil pH, and water requirements
- 🎯 Real-time input validation and planting window alerts
- � Visual risk assessment with improved confidence indicators
- 🗓️ **Dynamic Harvest Date Prediction** - Calculated from planting date and crop maturity
- 📝 Prediction history tracking (last 10 predictions)
- 📱 Fully responsive design for mobile devices
- ♿ Enhanced accessibility features
- 🎨 Modern UI with loading states and animations
- 🧩 No server or database required

---

## 🌍 Supported Regions

- **Southern Africa** (South Africa, Mozambique, Zimbabwe)
- **East African Highlands** (Kenya, Ethiopia, Uganda)
- **Northern Sahel** (Niger, Mali, Sudan)
- **North America Midwest** (USA Corn Belt)
- **North America Pacific Coast** (California, Oregon, Washington)
- **South America Cerrado** (Brazilian Cerrado)
- **Western Europe** (UK, France, Germany)
- **South Asia** (India, Pakistan, Bangladesh)
- **Southeast Asia** (Thailand, Vietnam, Indonesia)
- **Australia Coastal** (Coastal Australia)
- **Central America** (Mexico, Guatemala, Honduras)
- **The Caribbean** (Cuba, Jamaica, Dominican Republic)
- **New Zealand**

---

## 🌱 Supported Crops

- **Maize/Corn** (Zea mays) - C4 photosynthesis, 90-150 days to maturity
- **Groundnuts/Peanuts** (Arachis hypogaea) - Nitrogen-fixing legume
- **Sorghum** (Sorghum bicolor) - Drought-tolerant cereal
- **Rice** (Oryza sativa) - Flooded crop systems
- **Soybeans** (Glycine max) - High-protein legume
- **Barley** (Hordeum vulgare) - Cool-season cereal
- **Common Beans** (Phaseolus vulgaris) - Nitrogen-fixing legume
- **Tomatoes** (Solanum lycopersicum) - Warm-season vegetable
- **Sweet Potato** (Ipomoea batatas) - Root vegetable

---

## 🚀 Getting Started

1. Clone or download this repository
2. Run locally using a static file server:
   ```bash
   python -m http.server 8000
   ```
   Or use VS Code Live Server extension
3. Open `index.html` at `http://localhost:8000`
4. Select your region → crop → soil type → planting conditions
5. Get region-specific yield predictions and agricultural advice!

> 📦 All prediction logic and agricultural data live in `/data/` folder with three core files:
> - `crop_profiles.json` - Biological crop characteristics
> - `regions.json` - Climate and regional data  
> - `crop_rules.json` - Region-crop-soil specific rules

---

## 📁 Enhanced Folder Structure

```
mini-agronomist/
├── index.html              # Main application interface
├── style.css               # Styling and responsive design
├── app.js                  # Three-tier agricultural intelligence engine
├── data/
│   ├── crop_profiles.json   # Biological crop data (NEW)
│   ├── regions.json         # Regional climate data (NEW)  
│   └── crop_rules.json      # Region-crop-soil rules (ENHANCED)
├── assets/
│   └── icons/
│       ├── farm-bg.png
│       ├── favicon.png
│       └── logo.png
└── .vscode/
    └── tasks.json           # VS Code development tasks
```

---

## 🧠 Three-Tier Intelligence System

### 1. **Crop Profiles** (`crop_profiles.json`)
Biological fundamentals for each crop including:
- Scientific classification and photosynthesis type
- Days to maturity and growing degree day requirements
- Optimal temperature ranges and water needs
- Soil pH preferences and root characteristics
- Planting depth and spacing recommendations

### 2. **Regional Data** (`regions.json`)
Climate and environmental context including:
- Köppen climate classifications
- Monthly rainfall and temperature patterns
- Regional soil profile characteristics
- Optimal planting windows by crop
- Common local varieties and pest/disease risks

### 3. **Crop Rules** (`crop_rules.json`)
Region-crop-soil specific combinations providing:
- Localized yield ranges and rainfall windows
- Evidence-based agricultural tips
- Scientific sources and references
- Variety-specific recommendations

---

## 🌱 Future Enhancements

- ✅ **Expanded Dataset**  
  Add more crops, regions, and climate data sources.

- 🔍 **Prediction Explainability**  
  Detailed factor breakdown and confidence analysis.

- 📂 **Field Profile Uploads**  
  Enable CSV uploads for personalized field data.

- 🌡️ **Weather API Integration**  
  Real-time weather data integration (optional online mode).

- 📱 **Mobile App Version**  
  Native mobile applications for iOS/Android.

---

## � Data Sources

Agricultural data compiled from:
- FAO (Food and Agriculture Organization)
- CGIAR Research Centers (CIMMYT, ICRISAT, IRRI)
- National Agricultural Research Institutes
- Regional Agricultural Extension Services
- Peer-reviewed agricultural research publications

---

## 🤝 Contributing

Contributions welcome! Areas of focus:
- Additional regional data and crop varieties
- Enhanced prediction algorithms
- User interface improvements
- Mobile responsiveness enhancements
- Accessibility features

---

## 📄 License

Open source agricultural tool for global food security initiatives.

- 💾 **Local Result History**  
  Use `localStorage` to keep recent predictions or allow exports to text.

- 📊 **Data Visualizations**  
  Seasonal planting calendars, rainfall overlays, and trend graphs.

- 🧠 **Algorithm Enhancements**  
  Introduce adaptive scoring or integrate a mini learning model via TensorFlow.js.

---

## 🧑‍🌾 Credits

Built with curiosity and care by [Joseph](https://yourwebsite.com)

Background visuals & iconography inspired by real farms and real farmers.

---

## 🔒 License

MIT — free to build, adapt, and grow 🌿