/**
 * Mini Agronomist - Internationalization Data
 * Contains translations for English, French, and Spanish
 */

const translations = {
  en: {
    // Navigation
    "nav.yield": "🌾 Yield Predictor",
    "nav.game": "🎮 Play Game",
    "nav.ml": "🤖 ML Analytics",
    "nav.help": "📚 Help & FAQ",
    
    // Header Buttons
    "btn.help": "Help & Tutorial",
    "btn.settings": "Settings",
    
    // Welcome Banner
    "welcome.title": "🌾 Welcome to Mini Agronomist!",
    "welcome.text": "Get AI-powered crop yield predictions in 4 simple steps. New here?",
    "welcome.tour": "📚 Take the Tour",
    "welcome.dismiss": "✓ I've got this",
    
    // Input Section
    "input.title": "Crop Information",
    "input.region": "Agricultural Region",
    "input.region.placeholder": "Select your agricultural region...",
    "input.region.help": "Choose your geographic region for climate-appropriate predictions",
    "input.crop": "Crop Type",
    "input.crop.placeholder": "Select your crop...",
    "input.crop.help": "Select the crop you plan to grow this season",
    "input.soil": "Soil Type",
    "input.soil.placeholder": "Select soil type...",
    "input.soil.help": "Choose the predominant soil type in your field",
    "input.rain": "Expected Rainfall (mm/week)",
    "input.rain.placeholder": "e.g., 75",
    "input.rain.help": "Enter your expected weekly rainfall (typical range: 30-150mm)",
    "input.date": "Planned Planting Date",
    "input.date.help": "When do you plan to plant this crop?",
    
    // Buttons
    "btn.predict": "Generate Prediction",
    "btn.reset": "Reset Form",
    "btn.new": "New Prediction",
    "btn.clear": "Clear",
    "btn.export": "Export Results",
    "btn.compare": "Compare Scenarios",
    "btn.print": "Print Report",
    
    // Results Section
    "results.title": "Yield Prediction Results",
    "results.summary.title": "Prediction Summary",
    "results.summary.text": "Fill out the form and click \"Generate Prediction\" to see your crop yield prediction",
    "results.ready": "🌱 Ready to predict",
    "results.instructions": "Select your crop, soil type, rainfall, and planting date to get started",
    "results.risk": "Risk Assessment",
    "results.risk.low": "🟩 Low Risk",
    "results.risk.medium": "🟨 Moderate Risk",
    "results.risk.high": "🟥 High Risk",
    
    // Analytics
    "analytics.title": "Detailed Analysis",
    "analytics.temp": "Temperature Match",
    "analytics.temp.desc": "Crop temperature compatibility",
    "analytics.water": "Water Requirements",
    "analytics.water.desc": "Rainfall adequacy",
    "analytics.soil": "Soil Compatibility",
    "analytics.soil.desc": "pH and soil type match",
    "analytics.timing": "Timing Score",
    "analytics.timing.desc": "Seasonal planting window",
    
    // Harvest Info
    "harvest.title": "Harvest Information",
    "harvest.date": "Expected Harvest Date:",
    "harvest.varieties": "Recommended Varieties:",
    "harvest.period": "Growing Period:",
    
    // History
    "history.title": "Prediction History",
    "history.empty": "No predictions yet. Make your first prediction to see history here.",
    
    // Tools
    "tools.title": "Tools & Export",
    
    // Footer
    "footer.tagline": "AI-powered agricultural intelligence for farmers worldwide 🌾",
    "footer.features": "Features",
    "footer.resources": "Resources",
    "footer.connect": "Connect",
    "footer.copyright": "© 2025 Mini Agronomist. Open source agricultural intelligence platform.",
    "footer.made": "Made with 🌱 for farmers worldwide",
    "footer.github": "View on GitHub",
    
    // Game Specific
    "game.title": "Farm Genius - Immersive Edition",
    "game.loading": "🌱 Loading Farm Genius...",
    "game.status": "Preparing your farm...",
    "game.start": "Start Farming!",
    "game.tutorial.title": "Welcome to Farm Genius!",
    "game.tutorial.text": "Experience the life of a modern farmer. Manage your fields, drive your tractor, and grow crops using real agricultural principles.",
    "game.controls.title": "Controls",
    "game.controls.drive": "Drive Tractor",
    "game.controls.plow": "Plow Soil",
    "game.controls.sow": "Sow Seeds",
    "game.controls.water": "Water Crops",
    "game.controls.harvest": "Harvest",
    "game.hud.money": "Money",
    "game.hud.day": "Day",
    "game.hud.rain": "Rain",
    "game.hud.temp": "Temp"
  },
  
  fr: {
    // Navigation
    "nav.yield": "🌾 Prédiction de Récolte",
    "nav.game": "🎮 Jouer au Jeu",
    "nav.ml": "🤖 Analytique IA",
    "nav.help": "📚 Aide & FAQ",
    
    // Header Buttons
    "btn.help": "Aide & Tutoriel",
    "btn.settings": "Paramètres",
    
    // Welcome Banner
    "welcome.title": "🌾 Bienvenue sur Mini Agronomist !",
    "welcome.text": "Obtenez des prédictions de récolte par IA en 4 étapes simples. Nouveau ici ?",
    "welcome.tour": "📚 Faire la Visite",
    "welcome.dismiss": "✓ J'ai compris",
    
    // Input Section
    "input.title": "Informations sur la Culture",
    "input.region": "Région Agricole",
    "input.region.placeholder": "Sélectionnez votre région...",
    "input.region.help": "Choisissez votre région géographique pour des prédictions climatiques adaptées",
    "input.crop": "Type de Culture",
    "input.crop.placeholder": "Sélectionnez votre culture...",
    "input.crop.help": "Sélectionnez la culture que vous prévoyez de planter",
    "input.soil": "Type de Sol",
    "input.soil.placeholder": "Sélectionnez le type de sol...",
    "input.soil.help": "Choisissez le type de sol prédominant dans votre champ",
    "input.rain": "Précipitations Prévues (mm/semaine)",
    "input.rain.placeholder": "ex: 75",
    "input.rain.help": "Entrez les précipitations hebdomadaires prévues (typique : 30-150mm)",
    "input.date": "Date de Plantation Prévue",
    "input.date.help": "Quand prévoyez-vous de planter cette culture ?",
    
    // Buttons
    "btn.predict": "Générer la Prédiction",
    "btn.reset": "Réinitialiser",
    "btn.new": "Nouvelle Prédiction",
    "btn.clear": "Effacer",
    "btn.export": "Exporter les Résultats",
    "btn.compare": "Comparer des Scénarios",
    "btn.print": "Imprimer le Rapport",
    
    // Results Section
    "results.title": "Résultats de la Prédiction",
    "results.summary.title": "Résumé de la Prédiction",
    "results.summary.text": "Remplissez le formulaire et cliquez sur \"Générer la Prédiction\" pour voir votre estimation",
    "results.ready": "🌱 Prêt à prédire",
    "results.instructions": "Sélectionnez votre culture, sol, précipitations et date pour commencer",
    "results.risk": "Évaluation des Risques",
    "results.risk.low": "🟩 Risque Faible",
    "results.risk.medium": "🟨 Risque Modéré",
    "results.risk.high": "🟥 Risque Élevé",
    
    // Analytics
    "analytics.title": "Analyse Détaillée",
    "analytics.temp": "Compatibilité Température",
    "analytics.temp.desc": "Adéquation thermique de la culture",
    "analytics.water": "Besoins en Eau",
    "analytics.water.desc": "Adéquation des précipitations",
    "analytics.soil": "Compatibilité du Sol",
    "analytics.soil.desc": "Correspondance pH et type de sol",
    "analytics.timing": "Score de Timing",
    "analytics.timing.desc": "Fenêtre de plantation saisonnière",
    
    // Harvest Info
    "harvest.title": "Informations de Récolte",
    "harvest.date": "Date de Récolte Prévue :",
    "harvest.varieties": "Variétés Recommandées :",
    "harvest.period": "Période de Croissance :",
    
    // History
    "history.title": "Historique des Prédictions",
    "history.empty": "Aucune prédiction. Faites votre première prédiction pour voir l'historique ici.",
    
    // Tools
    "tools.title": "Outils & Export",
    
    // Footer
    "footer.tagline": "Intelligence agricole par IA pour les agriculteurs du monde entier 🌾",
    "footer.features": "Fonctionnalités",
    "footer.resources": "Ressources",
    "footer.connect": "Connexion",
    "footer.copyright": "© 2025 Mini Agronomist. Plateforme d'intelligence agricole open source.",
    "footer.made": "Fait avec 🌱 pour les agriculteurs",
    "footer.github": "Voir sur GitHub",

    // Game Specific
    "game.title": "Génie Agricole - Édition Immersive",
    "game.loading": "🌱 Chargement de Génie Agricole...",
    "game.status": "Préparation de votre ferme...",
    "game.start": "Commencer à Cultiver !",
    "game.tutorial.title": "Bienvenue dans Génie Agricole !",
    "game.tutorial.text": "Vivez la vie d'un agriculteur moderne. Gérez vos champs, conduisez votre tracteur et cultivez en utilisant de vrais principes agricoles.",
    "game.controls.title": "Contrôles",
    "game.controls.drive": "Conduire Tracteur",
    "game.controls.plow": "Labourer Sol",
    "game.controls.sow": "Semer Graines",
    "game.controls.water": "Arroser Cultures",
    "game.controls.harvest": "Récolter",
    "game.hud.money": "Argent",
    "game.hud.day": "Jour",
    "game.hud.rain": "Pluie",
    "game.hud.temp": "Temp"
  },
  
  es: {
    // Navigation
    "nav.yield": "🌾 Predicción de Cosecha",
    "nav.game": "🎮 Jugar Juego",
    "nav.ml": "🤖 Analítica IA",
    "nav.help": "📚 Ayuda y FAQ",
    
    // Header Buttons
    "btn.help": "Ayuda y Tutorial",
    "btn.settings": "Configuración",
    
    // Welcome Banner
    "welcome.title": "🌾 ¡Bienvenido a Mini Agronomist!",
    "welcome.text": "Obtenga predicciones de cosecha con IA en 4 pasos simples. ¿Nuevo aquí?",
    "welcome.tour": "📚 Tomar el Tour",
    "welcome.dismiss": "✓ Entendido",
    
    // Input Section
    "input.title": "Información del Cultivo",
    "input.region": "Región Agrícola",
    "input.region.placeholder": "Seleccione su región...",
    "input.region.help": "Elija su región geográfica para predicciones climáticas adecuadas",
    "input.crop": "Tipo de Cultivo",
    "input.crop.placeholder": "Seleccione su cultivo...",
    "input.crop.help": "Seleccione el cultivo que planea sembrar",
    "input.soil": "Tipo de Suelo",
    "input.soil.placeholder": "Seleccione tipo de suelo...",
    "input.soil.help": "Elija el tipo de suelo predominante en su campo",
    "input.rain": "Lluvia Esperada (mm/semana)",
    "input.rain.placeholder": "ej: 75",
    "input.rain.help": "Ingrese la lluvia semanal esperada (típico: 30-150mm)",
    "input.date": "Fecha de Siembra Planeada",
    "input.date.help": "¿Cuándo planea sembrar este cultivo?",
    
    // Buttons
    "btn.predict": "Generar Predicción",
    "btn.reset": "Reiniciar",
    "btn.new": "Nueva Predicción",
    "btn.clear": "Borrar",
    "btn.export": "Exportar Resultados",
    "btn.compare": "Comparar Escenarios",
    "btn.print": "Imprimir Reporte",
    
    // Results Section
    "results.title": "Resultados de la Predicción",
    "results.summary.title": "Resumen de Predicción",
    "results.summary.text": "Complete el formulario y haga clic en \"Generar Predicción\" para ver su estimación",
    "results.ready": "🌱 Listo para predecir",
    "results.instructions": "Seleccione su cultivo, suelo, lluvia y fecha para comenzar",
    "results.risk": "Evaluación de Riesgos",
    "results.risk.low": "🟩 Riesgo Bajo",
    "results.risk.medium": "🟨 Riesgo Moderado",
    "results.risk.high": "🟥 Riesgo Alto",
    
    // Analytics
    "analytics.title": "Análisis Detallado",
    "analytics.temp": "Compatibilidad Térmica",
    "analytics.temp.desc": "Adecuación de temperatura del cultivo",
    "analytics.water": "Requisitos de Agua",
    "analytics.water.desc": "Suficiencia de lluvia",
    "analytics.soil": "Compatibilidad del Suelo",
    "analytics.soil.desc": "Coincidencia de pH y tipo de suelo",
    "analytics.timing": "Puntaje de Tiempo",
    "analytics.timing.desc": "Ventana de siembra estacional",
    
    // Harvest Info
    "harvest.title": "Información de Cosecha",
    "harvest.date": "Fecha de Cosecha Esperada:",
    "harvest.varieties": "Variedades Recomendadas:",
    "harvest.period": "Período de Crecimiento:",
    
    // History
    "history.title": "Historial de Predicciones",
    "history.empty": "Sin predicciones. Haga su primera predicción para ver el historial aquí.",
    
    // Tools
    "tools.title": "Herramientas y Exportación",
    
    // Footer
    "footer.tagline": "Inteligencia agrícola con IA para agricultores de todo el mundo 🌾",
    "footer.features": "Características",
    "footer.resources": "Recursos",
    "footer.connect": "Conectar",
    "footer.copyright": "© 2025 Mini Agronomist. Plataforma de inteligencia agrícola de código abierto.",
    "footer.made": "Hecho con 🌱 para agricultores",
    "footer.github": "Ver en GitHub",

    // Game Specific
    "game.title": "Genio Agrícola - Edición Inmersiva",
    "game.loading": "🌱 Cargando Genio Agrícola...",
    "game.status": "Preparando su granja...",
    "game.start": "¡Empezar a Cultivar!",
    "game.tutorial.title": "¡Bienvenido a Genio Agrícola!",
    "game.tutorial.text": "Experimente la vida de un agricultor moderno. Gestione sus campos, conduzca su tractor y cultive usando principios agrícolas reales.",
    "game.controls.title": "Controles",
    "game.controls.drive": "Conducir Tractor",
    "game.controls.plow": "Arar Suelo",
    "game.controls.sow": "Sembrar Semillas",
    "game.controls.water": "Regar Cultivos",
    "game.controls.harvest": "Cosechar",
    "game.hud.money": "Dinero",
    "game.hud.day": "Día",
    "game.hud.rain": "Lluvia",
    "game.hud.temp": "Temp"
  }
};
