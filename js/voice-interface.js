// Voice Interface and Accessibility Enhancement
class VoiceInterface {
  constructor(app) {
    this.app = app;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.commands = this.initializeCommands();
    this.voiceEnabled = localStorage.getItem('miniAgronomist_voiceEnabled') === 'true';
    
    this.init();
  }

  init() {
    this.setupSpeechRecognition();
    this.addVoiceControls();
    this.setupKeyboardShortcuts();
  }

  setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        this.isListening = true;
        this.showVoiceIndicator();
        this.speak("I'm listening. What would you like to do?");
      };
      
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command:', transcript);
        this.processVoiceCommand(transcript);
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.hideVoiceIndicator();
        this.isListening = false;
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        this.hideVoiceIndicator();
      };
    }
  }

  initializeCommands() {
    return {
      // Navigation commands
      'show help': () => this.app.showHelpModal(),
      'open help': () => this.app.showHelpModal(),
      'show settings': () => this.app.showSettingsModal(),
      'open settings': () => this.app.showSettingsModal(),
      
      // Form commands
      'clear form': () => this.app.resetForm(),
      'reset form': () => this.app.resetForm(),
      'new prediction': () => this.app.startNewPrediction(),
      'start over': () => this.app.resetForm(),
      
      // Region selection
      'select region': () => this.focusField('region'),
      'choose region': () => this.focusField('region'),
      'region options': () => this.announceOptions('region'),
      
      // Crop selection
      'select crop': () => this.focusField('crop'),
      'choose crop': () => this.focusField('crop'),
      'crop options': () => this.announceOptions('crop'),
      
      // Soil selection
      'select soil': () => this.focusField('soil'),
      'choose soil': () => this.focusField('soil'),
      'soil options': () => this.announceOptions('soil'),
      
      // Input commands
      'enter rainfall': () => this.focusField('rainfall'),
      'set rainfall': () => this.focusField('rainfall'),
      'planting date': () => this.focusField('plantingDate'),
      'set date': () => this.focusField('plantingDate'),
      
      // Action commands
      'make prediction': () => this.submitForm(),
      'calculate yield': () => this.submitForm(),
      'predict yield': () => this.submitForm(),
      'get prediction': () => this.submitForm(),
      
      // Pro features
      'open field manager': () => this.app.handleProFeature('field-manager'),
      'show analytics': () => this.app.handleProFeature('advanced-analytics'),
      'field management': () => this.app.handleProFeature('field-manager'),
      'advanced analytics': () => this.app.handleProFeature('advanced-analytics'),
      
      // Utility commands
      'export results': () => this.app.exportResults(),
      'print report': () => this.app.printReport(),
      'show history': () => this.showPredictionHistory(),
      
      // Accessibility commands
      'read results': () => this.readCurrentResults(),
      'describe page': () => this.describePage(),
      'what can i say': () => this.listVoiceCommands(),
      'voice commands': () => this.listVoiceCommands(),
      'help me': () => this.provideContextualHelp(),
      
      // System commands
      'stop listening': () => this.stopListening(),
      'turn off voice': () => this.disableVoice(),
      'enable voice': () => this.enableVoice(),
      'speak slower': () => this.adjustSpeechRate(-0.2),
      'speak faster': () => this.adjustSpeechRate(0.2)
    };
  }

  processVoiceCommand(transcript) {
    // Find matching command
    const command = Object.keys(this.commands).find(cmd => 
      transcript.includes(cmd) || this.fuzzyMatch(transcript, cmd)
    );
    
    if (command) {
      this.speak(`Executing ${command}`);
      this.commands[command]();
    } else {
      // Try to extract specific values or partial matches
      if (this.handleSpecificInputs(transcript)) {
        return;
      }
      
      this.speak("I didn't understand that command. Say 'what can I say' for available commands.");
      this.showVoiceHelp();
    }
  }

  handleSpecificInputs(transcript) {
    // Handle rainfall input
    const rainfallMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(millimeter|mm|inches?)/i);
    if (rainfallMatch) {
      const value = parseFloat(rainfallMatch[1]);
      const rainfallField = document.getElementById('rainfall');
      if (rainfallField) {
        rainfallField.value = value;
        this.speak(`Rainfall set to ${value} millimeters`);
        return true;
      }
    }
    
    // Handle region selection by name
    const regionMatch = transcript.match(/select (.*?) region|region (.*?)$/i);
    if (regionMatch) {
      const regionName = regionMatch[1] || regionMatch[2];
      if (this.selectOptionByName('region', regionName)) {
        return true;
      }
    }
    
    // Handle crop selection by name
    const cropMatch = transcript.match(/select (.*?) crop|crop (.*?)$/i);
    if (cropMatch) {
      const cropName = cropMatch[1] || cropMatch[2];
      if (this.selectOptionByName('crop', cropName)) {
        return true;
      }
    }
    
    // Handle soil selection by name
    const soilMatch = transcript.match(/select (.*?) soil|soil (.*?)$/i);
    if (soilMatch) {
      const soilName = soilMatch[1] || soilMatch[2];
      if (this.selectOptionByName('soil', soilName)) {
        return true;
      }
    }
    
    return false;
  }

  selectOptionByName(fieldId, searchName) {
    const field = document.getElementById(fieldId);
    if (!field) return false;
    
    const options = Array.from(field.options);
    const match = options.find(option => 
      option.textContent.toLowerCase().includes(searchName.toLowerCase()) ||
      option.value.toLowerCase().includes(searchName.toLowerCase())
    );
    
    if (match) {
      field.value = match.value;
      field.dispatchEvent(new Event('change'));
      this.speak(`Selected ${match.textContent}`);
      return true;
    }
    
    this.speak(`Could not find ${searchName} in ${fieldId} options`);
    return false;
  }

  fuzzyMatch(input, command) {
    const similarity = this.calculateSimilarity(input, command);
    return similarity > 0.7; // 70% similarity threshold
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Voice interface methods
  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.speak("Voice recognition stopped");
    }
  }

  speak(text, priority = false) {
    if (!this.voiceEnabled && !priority) return;
    
    // Cancel previous speech if not priority
    if (!priority) {
      this.synthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(localStorage.getItem('miniAgronomist_speechRate') || '1.0');
    utterance.pitch = parseFloat(localStorage.getItem('miniAgronomist_speechPitch') || '1.0');
    utterance.volume = parseFloat(localStorage.getItem('miniAgronomist_speechVolume') || '1.0');
    
    // Use appropriate voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    this.synthesis.speak(utterance);
  }

  // UI interaction methods
  addVoiceControls() {
    const voiceButton = document.createElement('button');
    voiceButton.id = 'voiceButton';
    voiceButton.className = 'voice-button';
    voiceButton.setAttribute('aria-label', 'Voice commands');
    voiceButton.innerHTML = `
      <span class="material-icons">mic</span>
      <span class="voice-status">Click to speak</span>
    `;
    
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      headerActions.appendChild(voiceButton);
    }
    
    voiceButton.addEventListener('click', () => {
      if (this.isListening) {
        this.stopListening();
      } else {
        this.startListening();
      }
    });
    
    // Add voice toggle in settings
    this.addVoiceSettings();
  }

  addVoiceSettings() {
    const settingsObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const settingsModal = document.querySelector('#settingsModal');
          if (settingsModal && !settingsModal.querySelector('#voiceSettings')) {
            this.injectVoiceSettings(settingsModal);
          }
        }
      });
    });
    
    settingsObserver.observe(document.body, { childList: true, subtree: true });
  }

  injectVoiceSettings(settingsModal) {
    const voiceSection = document.createElement('div');
    voiceSection.className = 'settings-section';
    voiceSection.id = 'voiceSettings';
    voiceSection.innerHTML = `
      <h3>🎤 Voice & Accessibility</h3>
      <label>
        <input type="checkbox" id="enableVoice" ${this.voiceEnabled ? 'checked' : ''}>
        Enable voice commands and responses
      </label>
      <div class="voice-controls">
        <label>
          Speech Rate:
          <input type="range" id="speechRate" min="0.5" max="2" step="0.1" value="1">
        </label>
        <label>
          Speech Pitch:
          <input type="range" id="speechPitch" min="0.5" max="2" step="0.1" value="1">
        </label>
        <label>
          Speech Volume:
          <input type="range" id="speechVolume" min="0.1" max="1" step="0.1" value="1">
        </label>
      </div>
      <button type="button" class="tool-btn" onclick="voiceInterface.testVoice()">
        <span class="material-icons">volume_up</span>
        Test Voice
      </button>
    `;
    
    const lastSection = settingsModal.querySelector('.settings-section:last-child');
    if (lastSection) {
      lastSection.after(voiceSection);
    }
    
    // Add event listeners
    voiceSection.querySelector('#enableVoice').addEventListener('change', (e) => {
      this.voiceEnabled = e.target.checked;
      localStorage.setItem('miniAgronomist_voiceEnabled', this.voiceEnabled);
    });
    
    ['speechRate', 'speechPitch', 'speechVolume'].forEach(id => {
      const control = voiceSection.querySelector(`#${id}`);
      control.addEventListener('input', (e) => {
        localStorage.setItem(`miniAgronomist_${id}`, e.target.value);
      });
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+V to toggle voice
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        if (this.isListening) {
          this.stopListening();
        } else {
          this.startListening();
        }
      }
      
      // Ctrl+Shift+R to read current results
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        this.readCurrentResults();
      }
      
      // Ctrl+Shift+H for contextual help
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        this.provideContextualHelp();
      }
    });
  }

  // Accessibility helper methods
  focusField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.focus();
      this.speak(`Focused on ${field.labels[0]?.textContent || fieldId}`);
    }
  }

  announceOptions(fieldId) {
    const field = document.getElementById(fieldId);
    if (field && field.tagName === 'SELECT') {
      const options = Array.from(field.options)
        .filter(option => option.value)
        .map(option => option.textContent);
      
      this.speak(`Available options for ${fieldId}: ${options.join(', ')}`);
    }
  }

  submitForm() {
    const form = document.getElementById('inputForm');
    if (form) {
      form.dispatchEvent(new Event('submit'));
      this.speak("Generating prediction...");
    }
  }

  readCurrentResults() {
    const resultsSection = document.querySelector('.results');
    if (resultsSection && !resultsSection.classList.contains('hidden')) {
      const yieldValue = document.querySelector('.yield-value')?.textContent;
      const confidence = document.querySelector('.confidence-level')?.textContent;
      const recommendation = document.querySelector('.recommendation')?.textContent;
      
      let resultsText = '';
      if (yieldValue) resultsText += `Predicted yield: ${yieldValue}. `;
      if (confidence) resultsText += `Confidence level: ${confidence}. `;
      if (recommendation) resultsText += `Recommendation: ${recommendation}`;
      
      if (resultsText) {
        this.speak(resultsText, true);
      } else {
        this.speak("No results available. Please make a prediction first.");
      }
    } else {
      this.speak("No results to read. Please make a prediction first.");
    }
  }

  describePage() {
    this.speak(
      "This is Mini Agronomist, an agricultural prediction tool. " +
      "Select your region, crop type, soil type, enter rainfall amount and planting date, " +
      "then click predict to get yield estimates. " +
      "Use voice commands or keyboard shortcuts for hands-free operation.",
      true
    );
  }

  listVoiceCommands() {
    const commandCategories = {
      'Navigation': ['show help', 'open settings', 'new prediction'],
      'Form Input': ['select region', 'choose crop', 'enter rainfall', 'set date'],
      'Actions': ['make prediction', 'export results', 'read results'],
      'System': ['stop listening', 'what can I say', 'describe page']
    };
    
    let commandText = "Available voice commands: ";
    Object.entries(commandCategories).forEach(([category, commands]) => {
      commandText += `${category}: ${commands.join(', ')}. `;
    });
    
    this.speak(commandText, true);
  }

  provideContextualHelp() {
    const activeElement = document.activeElement;
    let helpText = '';
    
    if (activeElement.id === 'region') {
      helpText = "Select your agricultural region from the dropdown. This determines climate and soil data for predictions.";
    } else if (activeElement.id === 'crop') {
      helpText = "Choose the crop you want to predict yields for. Different crops have different requirements.";
    } else if (activeElement.id === 'soil') {
      helpText = "Select your soil type. This affects water retention and nutrient availability.";
    } else if (activeElement.id === 'rainfall') {
      helpText = "Enter expected rainfall in millimeters for the growing season.";
    } else if (activeElement.id === 'plantingDate') {
      helpText = "Choose your planting date. Timing affects crop development and yield potential.";
    } else {
      helpText = "Fill out the form with your location, crop, soil type, rainfall, and planting date, then predict yield.";
    }
    
    this.speak(helpText, true);
  }

  showVoiceIndicator() {
    const button = document.getElementById('voiceButton');
    if (button) {
      button.classList.add('listening');
      button.querySelector('.voice-status').textContent = 'Listening...';
    }
  }

  hideVoiceIndicator() {
    const button = document.getElementById('voiceButton');
    if (button) {
      button.classList.remove('listening');
      button.querySelector('.voice-status').textContent = 'Click to speak';
    }
  }

  showVoiceHelp() {
    const helpDialog = document.createElement('div');
    helpDialog.className = 'voice-help-dialog';
    helpDialog.innerHTML = `
      <div class="voice-help-content">
        <h4>🎤 Voice Commands Help</h4>
        <p>Try saying:</p>
        <ul>
          <li>"Show help" - Open help modal</li>
          <li>"Select region" - Focus region dropdown</li>
          <li>"Enter rainfall 75" - Set rainfall value</li>
          <li>"Make prediction" - Submit form</li>
          <li>"Read results" - Hear prediction results</li>
        </ul>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    
    document.body.appendChild(helpDialog);
    setTimeout(() => helpDialog.remove(), 10000);
  }

  // Utility methods
  testVoice() {
    this.speak("This is a test of the voice system. Voice commands are working correctly.", true);
  }

  adjustSpeechRate(change) {
    const currentRate = parseFloat(localStorage.getItem('miniAgronomist_speechRate') || '1.0');
    const newRate = Math.max(0.5, Math.min(2.0, currentRate + change));
    localStorage.setItem('miniAgronomist_speechRate', newRate);
    this.speak(`Speech rate adjusted to ${newRate.toFixed(1)}`, true);
  }

  enableVoice() {
    this.voiceEnabled = true;
    localStorage.setItem('miniAgronomist_voiceEnabled', 'true');
    this.speak("Voice interface enabled");
  }

  disableVoice() {
    this.voiceEnabled = false;
    localStorage.setItem('miniAgronomist_voiceEnabled', 'false');
    this.synthesis.cancel();
  }
}

// Initialize voice interface when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof miniAgronomist !== 'undefined') {
    window.voiceInterface = new VoiceInterface(miniAgronomist);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceInterface;
}
