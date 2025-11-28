// Authentication Manager for Mini Agronomist Pro
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authToken = null;
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    this.isOnline = navigator.onLine;
    
    // Access levels hierarchy
    this.accessLevels = {
      guest: 0,
      free: 1,
      pro: 2,
      enterprise: 3,
      admin: 4
    };
    
    this.init();
  }

  init() {
    this.restoreSession();
    this.setupAuthUI();
    this.setupEventListeners();
    this.checkSessionValidity();
  }

  // ==========================================
  // AUTHENTICATION CORE
  // ==========================================

  async login(email, password, rememberMe = false) {
    try {
      // Show loading state
      this.showAuthLoading('Signing in...');

      // Client-side validation
      if (!this.validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Attempt online authentication first
      let authResult;
      if (this.isOnline) {
        authResult = await this.authenticateOnline(email, password);
      } else {
        // Offline authentication for demo/development
        authResult = await this.authenticateOffline(email, password);
      }

      if (authResult.success) {
        this.currentUser = authResult.user;
        this.authToken = authResult.token;
        
        // Store session
        this.storeSession(rememberMe);
        
        // Update UI
        this.updateAuthUI();
        
        // Initialize user-specific features
        await this.initializeUserFeatures();
        
        // Track login
        this.trackEvent('user_login', {
          tier: this.currentUser.tier,
          method: 'email_password'
        });

        this.hideAuthModal();
        this.showMessage(`Welcome back, ${this.currentUser.name}! 🎉`, 'success');
        
        return { success: true, user: this.currentUser };
      } else {
        throw new Error(authResult.message || 'Login failed');
      }

    } catch (error) {
      this.hideAuthLoading();
      this.showAuthError(error.message);
      return { success: false, error: error.message };
    }
  }

  async register(userData) {
    try {
      this.showAuthLoading('Creating account...');

      // Validate registration data
      const validation = this.validateRegistrationData(userData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Hash password client-side for security
      const hashedPassword = await this.hashPassword(userData.password);
      
      const registrationData = {
        ...userData,
        password: hashedPassword,
        tier: 'free', // Default tier
        createdAt: new Date().toISOString(),
        lastLogin: null,
        settings: this.getDefaultUserSettings()
      };

      let result;
      if (this.isOnline) {
        result = await this.registerOnline(registrationData);
      } else {
        result = await this.registerOffline(registrationData);
      }

      if (result.success) {
        // Auto-login after successful registration
        await this.login(userData.email, userData.password);
        return { success: true, user: result.user };
      } else {
        throw new Error(result.message || 'Registration failed');
      }

    } catch (error) {
      this.hideAuthLoading();
      this.showAuthError(error.message);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      // Track logout
      if (this.currentUser) {
        this.trackEvent('user_logout', {
          tier: this.currentUser.tier,
          session_duration: Date.now() - this.currentUser.loginTime
        });
      }

      // Clear online session if connected
      if (this.isOnline && this.authToken) {
        await this.logoutOnline();
      }

      // Clear local session
      this.clearSession();
      
      // Reset state
      this.currentUser = null;
      this.authToken = null;
      
      // Update UI
      this.updateAuthUI();
      
      // Redirect to free features
      this.resetToFreeMode();
      
      this.showMessage('Signed out successfully', 'info');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if online logout fails
      this.clearSession();
      this.updateAuthUI();
    }
  }

  // ==========================================
  // ACCESS CONTROL
  // ==========================================

  hasAccess(requiredLevel) {
    if (!this.currentUser) {
      return this.accessLevels.guest >= this.accessLevels[requiredLevel];
    }
    
    const userLevel = this.accessLevels[this.currentUser.tier];
    const required = this.accessLevels[requiredLevel];
    
    return userLevel >= required;
  }

  requireAccess(requiredLevel, featureName) {
    if (!this.hasAccess(requiredLevel)) {
      this.showUpgradePrompt(requiredLevel, featureName);
      return false;
    }
    return true;
  }

  getUserTier() {
    return this.currentUser?.tier || 'guest';
  }

  isAuthenticated() {
    return !!this.currentUser && !!this.authToken;
  }

  isAdmin() {
    return this.hasAccess('admin');
  }

  // ==========================================
  // ONLINE AUTHENTICATION
  // ==========================================

  async authenticateOnline(email, password) {
    // This would integrate with your backend API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Authentication failed');
    }

    return await response.json();
  }

  async registerOnline(userData) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return await response.json();
  }

  async logoutOnline() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==========================================
  // OFFLINE/DEMO AUTHENTICATION
  // ==========================================

  async authenticateOffline(email, password) {
    // Demo users for offline mode
    const demoUsers = {
      'demo@free.com': {
        id: '1',
        name: 'Demo Free User',
        email: 'demo@free.com',
        tier: 'free',
        password: await this.hashPassword('password123'),
        avatar: null,
        settings: this.getDefaultUserSettings()
      },
      'demo@pro.com': {
        id: '2',
        name: 'Demo Pro User',
        email: 'demo@pro.com',
        tier: 'pro',
        password: await this.hashPassword('password123'),
        avatar: null,
        settings: this.getDefaultUserSettings()
      },
      'demo@enterprise.com': {
        id: '3',
        name: 'Demo Enterprise User',
        email: 'demo@enterprise.com',
        tier: 'enterprise',
        password: await this.hashPassword('password123'),
        avatar: null,
        settings: this.getDefaultUserSettings()
      },
      'admin@demo.com': {
        id: '4',
        name: 'Demo Admin',
        email: 'admin@demo.com',
        tier: 'admin',
        password: await this.hashPassword('admin123'),
        avatar: null,
        settings: this.getDefaultUserSettings()
      }
    };

    // Get stored users (for development)
    const storedUsers = JSON.parse(localStorage.getItem('miniAgronomist_users') || '{}');
    const allUsers = { ...demoUsers, ...storedUsers };

    const user = allUsers[email.toLowerCase()];
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Generate demo token
    const token = this.generateDemoToken(user);
    
    return {
      success: true,
      user: {
        ...user,
        loginTime: Date.now()
      },
      token: token
    };
  }

  async registerOffline(userData) {
    const storedUsers = JSON.parse(localStorage.getItem('miniAgronomist_users') || '{}');
    
    if (storedUsers[userData.email.toLowerCase()]) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    storedUsers[userData.email.toLowerCase()] = newUser;
    localStorage.setItem('miniAgronomist_users', JSON.stringify(storedUsers));

    return {
      success: true,
      user: newUser
    };
  }

  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================

  storeSession(persistent = false) {
    const sessionData = {
      user: this.currentUser,
      token: this.authToken,
      loginTime: Date.now(),
      expiresAt: Date.now() + this.sessionTimeout
    };

    if (persistent) {
      localStorage.setItem('miniAgronomist_session', JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem('miniAgronomist_session', JSON.stringify(sessionData));
    }
  }

  restoreSession() {
    // Try persistent storage first, then session storage
    let sessionData = localStorage.getItem('miniAgronomist_session');
    if (!sessionData) {
      sessionData = sessionStorage.getItem('miniAgronomist_session');
    }

    if (sessionData) {
      try {
        const data = JSON.parse(sessionData);
        
        // Check if session is expired
        if (data.expiresAt && Date.now() > data.expiresAt) {
          this.clearSession();
          return;
        }

        this.currentUser = data.user;
        this.authToken = data.token;
        this.updateAuthUI();
        
      } catch (error) {
        console.error('Session restore error:', error);
        this.clearSession();
      }
    }
  }

  clearSession() {
    localStorage.removeItem('miniAgronomist_session');
    sessionStorage.removeItem('miniAgronomist_session');
  }

  checkSessionValidity() {
    setInterval(() => {
      if (this.currentUser && this.authToken) {
        // Check if session is expired
        const sessionData = localStorage.getItem('miniAgronomist_session') || 
                           sessionStorage.getItem('miniAgronomist_session');
        
        if (sessionData) {
          const data = JSON.parse(sessionData);
          if (data.expiresAt && Date.now() > data.expiresAt) {
            this.showMessage('Session expired. Please sign in again.', 'warning');
            this.logout();
          }
        }
      }
    }, 60000); // Check every minute
  }

  // ==========================================
  // UI MANAGEMENT
  // ==========================================

  setupAuthUI() {
    this.createAuthButton();
    this.updateAuthUI();
  }

  createAuthButton() {
    if (document.getElementById('authButton')) return;
    const authButton = document.createElement('button');
    authButton.id = 'authButton';
    authButton.className = 'auth-button';
    authButton.innerHTML = `
      <span class="material-icons">account_circle</span>
      <span class="auth-text">Sign In</span>
    `;

    // Prefer placing inside explicit header buttons container for layout stability
    const headerButtons = document.querySelector('.header-buttons');
    const headerActions = document.querySelector('.header-actions');
    if (headerButtons) {
      headerButtons.appendChild(authButton);
    } else if (headerActions) {
      headerActions.appendChild(authButton);
    } else {
      // Fallback: attach to body end if containers are not found
      document.body.appendChild(authButton);
    }

    authButton.addEventListener('click', () => {
      if (this.isAuthenticated()) {
        this.showUserMenu();
      } else {
        this.showAuthModal();
      }
    });
  }

  updateAuthUI() {
    const authButton = document.getElementById('authButton');
    if (!authButton) return;

    if (this.isAuthenticated()) {
      authButton.innerHTML = `
        <div class="user-avatar">
          ${this.currentUser.avatar ? 
            `<img src="${this.currentUser.avatar}" alt="User avatar">` : 
            `<span class="material-icons">account_circle</span>`
          }
        </div>
        <div class="user-info">
          <span class="user-name">${this.currentUser.name}</span>
          <span class="user-tier tier-${this.currentUser.tier}">${this.currentUser.tier.toUpperCase()}</span>
        </div>
      `;
      authButton.className = 'auth-button authenticated';
    } else {
      authButton.innerHTML = `
        <span class="material-icons">account_circle</span>
        <span class="auth-text">Sign In</span>
      `;
      authButton.className = 'auth-button';
    }

    // Update Pro features based on user tier
    this.updateProFeaturesForUser();
  }

  showAuthModal() {
    const modal = this.createAuthModal();
    document.body.appendChild(modal);
  }

  createAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'pro-modal auth-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>🌾 Mini Agronomist</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login">Sign In</button>
            <button class="auth-tab" data-tab="register">Sign Up</button>
          </div>
          
          <div class="auth-content">
            <div id="login-form" class="auth-form active">
              <h4>Welcome Back!</h4>
              <p>Sign in to access your Pro features</p>
              
              <div class="demo-accounts">
                <p><strong>Demo Accounts:</strong></p>
                <div class="demo-buttons">
                  <button class="demo-btn" onclick="authManager.quickLogin('demo@free.com', 'password123')">
                    Free User
                  </button>
                  <button class="demo-btn" onclick="authManager.quickLogin('demo@pro.com', 'password123')">
                    Pro User
                  </button>
                  <button class="demo-btn" onclick="authManager.quickLogin('demo@enterprise.com', 'password123')">
                    Enterprise
                  </button>
                  <button class="demo-btn" onclick="authManager.quickLogin('admin@demo.com', 'admin123')">
                    Admin
                  </button>
                </div>
              </div>
              
              <form id="loginForm">
                <div class="form-group">
                  <label for="loginEmail">Email</label>
                  <input type="email" id="loginEmail" name="email" required>
                </div>
                <div class="form-group">
                  <label for="loginPassword">Password</label>
                  <input type="password" id="loginPassword" name="password" required>
                </div>
                <div class="form-group checkbox-group">
                  <label>
                    <input type="checkbox" id="rememberMe" name="rememberMe">
                    Remember me
                  </label>
                </div>
                <button type="submit" class="btn primary full-width">Sign In</button>
              </form>
              
              <div class="auth-links">
                <a href="#" onclick="authManager.showForgotPassword()">Forgot password?</a>
              </div>
            </div>
            
            <div id="register-form" class="auth-form">
              <h4>Join Mini Agronomist</h4>
              <p>Create your account to unlock Pro features</p>
              
              <form id="registerForm">
                <div class="form-group">
                  <label for="registerName">Full Name</label>
                  <input type="text" id="registerName" name="name" required>
                </div>
                <div class="form-group">
                  <label for="registerEmail">Email</label>
                  <input type="email" id="registerEmail" name="email" required>
                </div>
                <div class="form-group">
                  <label for="registerPassword">Password</label>
                  <input type="password" id="registerPassword" name="password" required>
                  <div class="password-strength">
                    <div class="strength-bar"></div>
                    <span class="strength-text">Password strength</span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="confirmPassword">Confirm Password</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
                <div class="form-group checkbox-group">
                  <label>
                    <input type="checkbox" id="agreeTerms" name="agreeTerms" required>
                    I agree to the <a href="#" onclick="this.showTerms()">Terms of Service</a>
                  </label>
                </div>
                <button type="submit" class="btn primary full-width">Create Account</button>
              </form>
            </div>
          </div>
          
          <div class="auth-loading hidden">
            <div class="loading-spinner"></div>
            <p>Please wait...</p>
          </div>
          
          <div class="auth-error hidden">
            <span class="material-icons">error</span>
            <p class="error-message"></p>
          </div>
        </div>
      </div>
    `;

    // Setup event listeners
    this.setupAuthModalEvents(modal);
    
    return modal;
  }

  setupAuthModalEvents(modal) {
    // Tab switching
    const tabs = modal.querySelectorAll('.auth-tab');
    const forms = modal.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        
        tab.classList.add('active');
        const targetForm = modal.querySelector(`#${tab.dataset.tab}-form`);
        if (targetForm) {
          targetForm.classList.add('active');
        }
      });
    });
    
    // Form submissions
    const loginForm = modal.querySelector('#loginForm');
    const registerForm = modal.querySelector('#registerForm');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      await this.login(
        formData.get('email'),
        formData.get('password'),
        formData.get('rememberMe')
      );
    });
    
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      
      if (formData.get('password') !== formData.get('confirmPassword')) {
        this.showAuthError('Passwords do not match');
        return;
      }
      
      await this.register({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
      });
    });
    
    // Password strength indicator
    const passwordInput = modal.querySelector('#registerPassword');
    passwordInput.addEventListener('input', (e) => {
      this.updatePasswordStrength(e.target.value, modal);
    });
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  async quickLogin(email, password) {
    await this.login(email, password, false);
  }

  async hashPassword(password) {
    // Simple hash for demo - use proper bcrypt in production
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'mini_agronomist_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyPassword(password, hash) {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }

  generateDemoToken(user) {
    return btoa(JSON.stringify({
      userId: user.id,
      tier: user.tier,
      issued: Date.now(),
      expires: Date.now() + this.sessionTimeout
    }));
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateRegistrationData(userData) {
    if (!userData.name || userData.name.length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }
    
    if (!this.validateEmail(userData.email)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }
    
    if (!userData.password || userData.password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    
    return { valid: true };
  }

  getDefaultUserSettings() {
    return {
      theme: 'auto',
      notifications: true,
      language: 'en',
      units: 'metric',
      privacy: {
        shareUsage: false,
        shareLocation: false
      }
    };
  }

  updatePasswordStrength(password, modal) {
    const strengthBar = modal.querySelector('.strength-bar');
    const strengthText = modal.querySelector('.strength-text');
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ff4444', '#ff8800', '#ffaa00', '#88cc00', '#44aa00'];
    
    strengthBar.style.width = `${(strength / 5) * 100}%`;
    strengthBar.style.backgroundColor = colors[strength - 1] || '#ff4444';
    strengthText.textContent = strengthLevels[strength - 1] || 'Very Weak';
  }

  showAuthLoading(message) {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
      const loading = modal.querySelector('.auth-loading');
      const content = modal.querySelector('.auth-content');
      
      loading.querySelector('p').textContent = message;
      loading.classList.remove('hidden');
      content.classList.add('hidden');
    }
  }

  hideAuthLoading() {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
      const loading = modal.querySelector('.auth-loading');
      const content = modal.querySelector('.auth-content');
      
      loading.classList.add('hidden');
      content.classList.remove('hidden');
    }
  }

  showAuthError(message) {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
      const error = modal.querySelector('.auth-error');
      error.querySelector('.error-message').textContent = message;
      error.classList.remove('hidden');
      
      // Hide after 5 seconds
      setTimeout(() => {
        error.classList.add('hidden');
      }, 5000);
    }
  }

  hideAuthModal() {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
      modal.remove();
    }
  }

  showUserMenu() {
    const userMenu = this.createUserMenu();
    document.body.appendChild(userMenu);
  }

  createUserMenu() {
    const menu = document.createElement('div');
    menu.className = 'user-menu-modal';
    menu.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="user-menu-content">
        <div class="user-menu-header">
          <div class="user-avatar">
            ${this.currentUser.avatar ? 
              `<img src="${this.currentUser.avatar}" alt="User avatar">` : 
              `<span class="material-icons">account_circle</span>`
            }
          </div>
          <div class="user-details">
            <h3>${this.currentUser.name}</h3>
            <p>${this.currentUser.email}</p>
            <span class="user-tier tier-${this.currentUser.tier}">${this.currentUser.tier.toUpperCase()}</span>
          </div>
          <button class="menu-close">×</button>
        </div>
        <div class="user-menu-body">
          <div class="menu-section">
            <h4>Account</h4>
            <button class="menu-item" onclick="authManager.showProfile()">
              <span class="material-icons">person</span>
              Profile Settings
            </button>
            <button class="menu-item" onclick="authManager.showSubscription()">
              <span class="material-icons">star</span>
              Subscription (${this.currentUser.tier.toUpperCase()})
            </button>
          </div>
          
          <div class="menu-section">
            <h4>Data & Privacy</h4>
            <button class="menu-item" onclick="authManager.exportUserData()">
              <span class="material-icons">download</span>
              Export My Data
            </button>
            <button class="menu-item" onclick="authManager.showPrivacySettings()">
              <span class="material-icons">privacy_tip</span>
              Privacy Settings
            </button>
          </div>
          
          <div class="menu-section">
            <h4>Support</h4>
            <button class="menu-item" onclick="authManager.showHelp()">
              <span class="material-icons">help</span>
              Help & FAQ
            </button>
            <button class="menu-item" onclick="authManager.contactSupport()">
              <span class="material-icons">support_agent</span>
              Contact Support
            </button>
          </div>
          
          <div class="menu-section">
            <button class="menu-item logout" onclick="authManager.logout()">
              <span class="material-icons">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    `;

    // Setup event listeners
    menu.querySelector('.modal-overlay').addEventListener('click', () => menu.remove());
    menu.querySelector('.menu-close').addEventListener('click', () => menu.remove());
    
    return menu;
  }

  // User menu actions
  showProfile() {
    this.showMessage('Profile settings coming soon!', 'info');
  }

  showSubscription() {
    if (window.miniAgronomist?.proFeatureManager) {
      window.miniAgronomist.proFeatureManager.showProModal();
    }
  }

  exportUserData() {
    try {
      const userData = {
        profile: this.currentUser,
        predictions: JSON.parse(localStorage.getItem('miniAgronomist_predictions') || '[]'),
        fields: JSON.parse(localStorage.getItem('miniAgronomist_fields') || '[]'),
        settings: JSON.parse(localStorage.getItem('miniAgronomist_settings') || '{}')
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `mini-agronomist-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showMessage('Data exported successfully!', 'success');
    } catch (error) {
      this.showMessage('Failed to export data', 'error');
    }
  }

  showPrivacySettings() {
    this.showMessage('Privacy settings coming soon!', 'info');
  }

  showHelp() {
    if (window.miniAgronomist?.showTutorial) {
      window.miniAgronomist.showTutorial();
    }
  }

  contactSupport() {
    window.open('mailto:support@mini-agronomist.com?subject=Support Request', '_blank');
  }

  setupEventListeners() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Online - authentication services available');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Offline - using local authentication');
    });
  }

  // Integration with existing Pro features
  updateProFeaturesForUser() {
    if (window.miniAgronomist) {
      // Set auth manager reference
      window.miniAgronomist.setAuthManager(this);
      
      // Update Pro feature manager
      if (window.miniAgronomist.proFeatureManager) {
        window.miniAgronomist.proFeatureManager.userTier = this.getUserTier();
        window.miniAgronomist.proFeatureManager.isAuthenticated = this.isAuthenticated();
        window.miniAgronomist.proFeatureManager.currentUser = this.currentUser;
        
        // Reinitialize features based on new tier
        window.miniAgronomist.proFeatureManager.features = window.miniAgronomist.proFeatureManager.initializeFeatures();
        window.miniAgronomist.proFeatureManager.limits = window.miniAgronomist.proFeatureManager.getUserLimits();
        
        // Update UI visibility
        if (window.miniAgronomist.proFeatureManager.updateUIVisibility) {
          window.miniAgronomist.proFeatureManager.updateUIVisibility();
        }
      }
    }
  }

  linkProFeatureManager(proManager) {
    this.proFeatureManager = proManager;
  }

  async initializeUserFeatures() {
    // Load user-specific data
    await this.loadUserData();
    
    // Update Pro feature manager
    this.updateProFeaturesForUser();
    
    // Initialize user settings
    this.applyUserSettings();
  }

  async loadUserData() {
    // Load user's fields, predictions, etc.
    if (this.currentUser) {
      const userData = localStorage.getItem(`miniAgronomist_user_${this.currentUser.id}`);
      if (userData) {
        const data = JSON.parse(userData);
        // Merge user data into current session
        Object.assign(this.currentUser, data);
      }
    }
  }

  resetToFreeMode() {
    if (window.miniAgronomist) {
      if (window.miniAgronomist.proFeatureManager) {
        window.miniAgronomist.proFeatureManager.userTier = 'free';
        window.miniAgronomist.proFeatureManager.isAuthenticated = false;
        window.miniAgronomist.proFeatureManager.updateUIVisibility();
      }
    }
  }

  // Helper methods
  showMessage(message, type = 'info') {
    if (window.miniAgronomist && window.miniAgronomist.showMessage) {
      window.miniAgronomist.showMessage(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  trackEvent(event, data) {
    // Analytics tracking
    console.log('Event tracked:', event, data);
  }
}

// Initialize authentication manager
let authManager;
function __initAuthManager() {
  if (window.authManager) return;
  authManager = new AuthManager();
  window.authManager = authManager;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __initAuthManager);
} else {
  // DOM already parsed (Chrome can hit this path on fast loads)
  __initAuthManager();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
