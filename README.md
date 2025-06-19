# 🌾 Mini Agronomist

**Mini Agronomist** is a lightweight, offline-first web app designed to assist small-scale farmers with yield predictions and planting advice. Users input parameters like soil type, rainfall estimates, crop type, and planting date—and receive local, transparent estimates powered by rules-based logic and agronomic heuristics.

---

## ✨ Features

- 📱 *Offline-capable* (PWA-compatible)
- 🌿 User-friendly interface with farm-inspired visuals
- 🌧️ Yield estimation based on rainfall and soil condition ranges
- 🎯 Visual risk bar and agronomy tips
- 🧠 Customizable dataset loaded from local JSON
- 🧩 No server or database required

---

## 🚀 Getting Started

1. Clone or download this repository
2. Run locally using a static file server (e.g. VS Code Live Server or `python -m http.server`)
3. Open `index.html` in a browser
4. Select inputs → view prediction

> 📦 All prediction logic and rules live in `/data/crop_rules.json`

---

## 📁 Folder Structure

mini-agronomist/ ├── index.html ├── style.css ├── app.js ├── data/ │ └── crop_rules.json ├── assets/ │ └── icons/ │ └── farm-bg.svg


---

## 🌱 Future Enhancements

- ✅ **Expanded Dataset**  
  Add more crops, soil subtypes, climate regions, and crop science sources.

- 🔍 **Prediction Explainability**  
  Let users view contributing factors and confidence ranges in more detail.

- 📂 **Local Uploads**  
  Enable uploading CSV data for personalized field profiles.

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