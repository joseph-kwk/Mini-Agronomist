// Smart Notification System for Mini Agronomist Pro
class NotificationManager {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('miniAgronomist_notifications') || '[]');
    this.settings = JSON.parse(localStorage.getItem('miniAgronomist_notificationSettings') || '{}');
    this.defaultSettings = {
      weatherAlerts: true,
      plantingReminders: true,
      harvestAlerts: true,
      priceAlerts: true,
      sustainabilityTips: true
    };
    
    this.settings = { ...this.defaultSettings, ...this.settings };
    this.init();
  }

  init() {
    this.requestPermission();
    this.schedulePeriodicChecks();
    this.createNotificationCenter();
  }

  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  }

  // Weather-based alerts
  checkWeatherAlerts(weatherData, fields) {
    if (!this.settings.weatherAlerts) return;

    const alerts = [];
    
    // Drought warning
    if (weatherData.rainfall < 20) {
      alerts.push({
        type: 'weather',
        severity: 'high',
        title: '🌧️ Drought Warning',
        message: 'Low rainfall expected. Consider irrigation for sensitive crops.',
        action: 'review_irrigation',
        timestamp: Date.now()
      });
    }

    // Frost warning
    if (weatherData.minTemp < 2) {
      alerts.push({
        type: 'weather',
        severity: 'critical',
        title: '❄️ Frost Alert',
        message: 'Freezing temperatures expected. Protect vulnerable crops.',
        action: 'frost_protection',
        timestamp: Date.now()
      });
    }

    // Heavy rain alert
    if (weatherData.rainfall > 100) {
      alerts.push({
        type: 'weather',
        severity: 'medium',
        title: '🌊 Heavy Rain Alert',
        message: 'Excessive rainfall may cause waterlogging. Check drainage.',
        action: 'check_drainage',
        timestamp: Date.now()
      });
    }

    alerts.forEach(alert => this.addNotification(alert));
  }

  // Planting and harvest reminders
  checkSeasonalReminders(fields, currentDate) {
    if (!this.settings.plantingReminders && !this.settings.harvestAlerts) return;

    fields.forEach(field => {
      if (field.currentCrop && field.plantingDate) {
        const plantingDate = new Date(field.plantingDate);
        const daysSincePlanting = Math.floor((currentDate - plantingDate) / (1000 * 60 * 60 * 24));
        
        // Harvest reminder
        if (field.maturityDays && daysSincePlanting >= field.maturityDays - 7) {
          this.addNotification({
            type: 'harvest',
            severity: 'medium',
            title: '🌾 Harvest Time Approaching',
            message: `${field.name} (${field.currentCrop}) ready for harvest in ~7 days`,
            action: 'plan_harvest',
            fieldId: field.id,
            timestamp: Date.now()
          });
        }

        // Planting window reminders for next season
        const nextPlantingWindow = this.calculateNextPlantingWindow(field);
        if (nextPlantingWindow && nextPlantingWindow.daysUntil <= 14) {
          this.addNotification({
            type: 'planting',
            severity: 'low',
            title: '🌱 Optimal Planting Window',
            message: `Optimal planting for ${field.name} starts in ${nextPlantingWindow.daysUntil} days`,
            action: 'prepare_planting',
            fieldId: field.id,
            timestamp: Date.now()
          });
        }
      }
    });
  }

  // Market price alerts
  checkPriceAlerts(priceData, userCrops) {
    if (!this.settings.priceAlerts) return;

    userCrops.forEach(crop => {
      const price = priceData[crop];
      const historicalAvg = this.getHistoricalPrice(crop);
      
      if (price && historicalAvg) {
        const priceChange = ((price - historicalAvg) / historicalAvg) * 100;
        
        if (priceChange > 15) {
          this.addNotification({
            type: 'market',
            severity: 'medium',
            title: '📈 Price Surge Alert',
            message: `${crop} prices up ${priceChange.toFixed(1)}% - Consider selling`,
            action: 'review_selling',
            crop: crop,
            timestamp: Date.now()
          });
        } else if (priceChange < -15) {
          this.addNotification({
            type: 'market',
            severity: 'low',
            title: '📉 Price Drop Alert',
            message: `${crop} prices down ${Math.abs(priceChange).toFixed(1)}% - Hold if possible`,
            action: 'review_holding',
            crop: crop,
            timestamp: Date.now()
          });
        }
      }
    });
  }

  // Sustainability tips and insights
  generateSustainabilityTips(fields, practiceData) {
    if (!this.settings.sustainabilityTips) return;

    const tips = [
      {
        condition: () => this.hasConsecutiveSameCrop(fields),
        title: '🔄 Crop Rotation Tip',
        message: 'Consider rotating crops to improve soil health and reduce pest pressure',
        action: 'plan_rotation'
      },
      {
        condition: () => this.hasLowSoilHealth(fields),
        title: '🌱 Soil Health Alert',
        message: 'Add cover crops or organic matter to improve soil structure',
        action: 'improve_soil'
      },
      {
        condition: () => this.hasHighNitrogenUse(practiceData),
        title: '🧪 Fertilizer Optimization',
        message: 'Plant nitrogen-fixing legumes to reduce synthetic fertilizer needs',
        action: 'optimize_fertilizer'
      }
    ];

    tips.forEach(tip => {
      if (tip.condition()) {
        this.addNotification({
          type: 'sustainability',
          severity: 'low',
          title: tip.title,
          message: tip.message,
          action: tip.action,
          timestamp: Date.now()
        });
      }
    });
  }

  // Add notification to system
  addNotification(notification) {
    // Prevent duplicates
    const exists = this.notifications.some(n => 
      n.type === notification.type && 
      n.message === notification.message &&
      Date.now() - n.timestamp < 24 * 60 * 60 * 1000 // Within 24 hours
    );
    
    if (exists) return;

    notification.id = Date.now() + Math.random();
    notification.read = false;
    
    this.notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    this.saveNotifications();
    this.showBrowserNotification(notification);
    this.updateNotificationBadge();
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/logo.png',
        badge: '/assets/icons/favicon.png',
        tag: notification.type,
        requireInteraction: notification.severity === 'critical'
      });

      browserNotification.onclick = () => {
        window.focus();
        this.handleNotificationAction(notification);
        browserNotification.close();
      };

      // Auto-close after 8 seconds unless critical
      if (notification.severity !== 'critical') {
        setTimeout(() => browserNotification.close(), 8000);
      }
    }
  }

  // Create notification center UI
  createNotificationCenter() {
    const notificationButton = document.createElement('button');
    notificationButton.id = 'notificationButton';
    notificationButton.className = 'notification-button';
    notificationButton.innerHTML = `
      <span class="material-icons">notifications</span>
      <span class="notification-badge hidden">0</span>
    `;
    
    // Add to header
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      headerActions.appendChild(notificationButton);
    }

    notificationButton.addEventListener('click', () => this.showNotificationCenter());
    this.updateNotificationBadge();
  }

  // Show notification center modal
  showNotificationCenter() {
    const modal = this.createNotificationModal();
    document.body.appendChild(modal);
    
    // Mark notifications as read
    this.markAllAsRead();
  }

  createNotificationModal() {
    const modal = document.createElement('div');
    modal.className = 'pro-modal notification-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>🔔 Notifications</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="notification-settings">
            <button class="btn secondary" onclick="this.showNotificationSettings()">
              <span class="material-icons">settings</span>
              Settings
            </button>
            <button class="btn secondary" onclick="this.clearAllNotifications()">
              <span class="material-icons">clear_all</span>
              Clear All
            </button>
          </div>
          <div class="notification-list">
            ${this.generateNotificationList()}
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());

    return modal;
  }

  generateNotificationList() {
    if (this.notifications.length === 0) {
      return `
        <div class="empty-notifications">
          <span class="material-icons">notifications_none</span>
          <p>No notifications yet</p>
        </div>
      `;
    }

    return this.notifications.map(notification => `
      <div class="notification-item ${notification.read ? 'read' : 'unread'} severity-${notification.severity}">
        <div class="notification-icon">
          ${this.getNotificationIcon(notification.type)}
        </div>
        <div class="notification-content">
          <h4>${notification.title}</h4>
          <p>${notification.message}</p>
          <div class="notification-meta">
            <span class="timestamp">${this.formatTimestamp(notification.timestamp)}</span>
            ${notification.action ? `<button class="action-btn" onclick="this.handleNotificationAction('${notification.id}')">${this.getActionLabel(notification.action)}</button>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Update notification badge
  updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    const unreadCount = this.notifications.filter(n => !n.read).length;
    
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  // Helper methods
  getNotificationIcon(type) {
    const icons = {
      weather: '🌤️',
      planting: '🌱',
      harvest: '🌾',
      market: '📈',
      sustainability: '🌿'
    };
    return icons[type] || '📢';
  }

  getActionLabel(action) {
    const labels = {
      review_irrigation: 'Review Irrigation',
      frost_protection: 'Frost Protection',
      check_drainage: 'Check Drainage',
      plan_harvest: 'Plan Harvest',
      prepare_planting: 'Prepare Planting',
      review_selling: 'Review Selling',
      review_holding: 'Review Holding',
      plan_rotation: 'Plan Rotation',
      improve_soil: 'Improve Soil',
      optimize_fertilizer: 'Optimize Fertilizer'
    };
    return labels[action] || 'Learn More';
  }

  formatTimestamp(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  // Periodic checks
  schedulePeriodicChecks() {
    // Check every hour for new notifications
    setInterval(() => {
      this.performPeriodicChecks();
    }, 60 * 60 * 1000);

    // Initial check after 30 seconds
    setTimeout(() => {
      this.performPeriodicChecks();
    }, 30000);
  }

  async performPeriodicChecks() {
    try {
      // Get current data
      const weatherData = await this.fetchCurrentWeather();
      const priceData = await this.fetchCurrentPrices();
      const fields = this.getFieldsData();
      const userCrops = this.getUserCrops();

      // Run all checks
      this.checkWeatherAlerts(weatherData, fields);
      this.checkSeasonalReminders(fields, new Date());
      this.checkPriceAlerts(priceData, userCrops);
      this.generateSustainabilityTips(fields, {});
      
    } catch (error) {
      console.warn('Periodic notification check failed:', error);
    }
  }

  // Data management
  saveNotifications() {
    localStorage.setItem('miniAgronomist_notifications', JSON.stringify(this.notifications));
  }

  saveSettings() {
    localStorage.setItem('miniAgronomist_notificationSettings', JSON.stringify(this.settings));
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.updateNotificationBadge();
  }

  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
    this.updateNotificationBadge();
  }

  // Placeholder methods for data fetching
  async fetchCurrentWeather() {
    // Placeholder - would integrate with weather API
    return {
      rainfall: Math.random() * 100,
      minTemp: Math.random() * 30 - 5,
      maxTemp: Math.random() * 35 + 15
    };
  }

  async fetchCurrentPrices() {
    // Placeholder - would integrate with market API
    return {
      corn: 250 + Math.random() * 50,
      soybeans: 400 + Math.random() * 100,
      wheat: 200 + Math.random() * 40
    };
  }

  getFieldsData() {
    // Integration with field manager
    return JSON.parse(localStorage.getItem('miniAgronomist_fields') || '[]');
  }

  getUserCrops() {
    // Get crops from user's fields and recent predictions
    return ['corn', 'soybeans', 'wheat'];
  }

  getHistoricalPrice(crop) {
    // Placeholder for historical price data
    const basePrices = { corn: 230, soybeans: 380, wheat: 190 };
    return basePrices[crop] || 200;
  }

  // Helper condition checkers
  hasConsecutiveSameCrop(fields) {
    return fields.some(field => 
      field.history && 
      field.history.length >= 2 && 
      field.history[0].crop === field.history[1].crop
    );
  }

  hasLowSoilHealth(fields) {
    return fields.some(field => field.soilHealthScore && field.soilHealthScore < 0.6);
  }

  hasHighNitrogenUse(practiceData) {
    return practiceData.nitrogenUse && practiceData.nitrogenUse > 150; // kg/ha
  }

  calculateNextPlantingWindow(field) {
    // Placeholder for calculating optimal planting windows
    return {
      daysUntil: Math.floor(Math.random() * 30),
      crop: field.recommendedNextCrop || field.currentCrop
    };
  }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}
