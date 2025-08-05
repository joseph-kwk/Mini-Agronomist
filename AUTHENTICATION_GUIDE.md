# Authentication System Integration Guide

## Overview

The Mini Agronomist Pro now includes a comprehensive authentication system that provides secure user management and tier-based access control for Pro features.

## Features

### 🔐 Authentication System
- **Secure Login/Registration**: Email-based authentication with password hashing
- **Session Management**: Persistent sessions with automatic expiration
- **Demo Accounts**: Pre-configured accounts for testing different user tiers
- **Offline Support**: Local authentication for development and demo purposes

### 👥 User Tiers & Access Control
- **Guest**: Basic read-only access
- **Free**: Core yield prediction features
- **Pro**: Advanced analytics, field management, notifications
- **Enterprise**: All Pro features plus advanced integrations
- **Admin**: Full system access and user management

### 🛡️ Security Features
- **Password Hashing**: Client-side SHA-256 hashing with salting
- **Session Security**: Token-based authentication with expiration
- **Access Control**: Role-based permissions for feature access
- **Rate Limiting**: Built-in protection against abuse (ready for backend)

## Demo Accounts

For testing purposes, use these pre-configured accounts:

| Email | Password | Tier | Description |
|-------|----------|------|-------------|
| `demo@free.com` | `password123` | Free | Basic features only |
| `demo@pro.com` | `password123` | Pro | All Pro features |
| `demo@enterprise.com` | `password123` | Enterprise | Enterprise features |
| `admin@demo.com` | `admin123` | Admin | Full system access |

## Integration with Pro Features

### ProFeatureManager Integration
```javascript
// Authentication automatically updates Pro feature access
authManager.login(email, password).then(result => {
  if (result.success) {
    // Pro features are automatically enabled based on user tier
    miniAgronomist.proFeatureManager.userTier = authManager.getUserTier();
    miniAgronomist.proFeatureManager.updateUIVisibility();
  }
});
```

### Feature Access Control
```javascript
// Check access before showing Pro features
if (authManager.hasAccess('pro')) {
  // Show advanced analytics
  miniAgronomist.showAdvancedAnalytics();
} else {
  // Show upgrade prompt
  authManager.showUpgradePrompt('pro', 'Advanced Analytics');
}
```

## User Interface

### Authentication Button
- **Not Authenticated**: Shows "Sign In" button
- **Authenticated**: Shows user avatar, name, and tier badge
- **Click Behavior**: Sign in modal or user menu dropdown

### User Menu (Authenticated)
- Profile Settings
- Subscription Management
- Data Export
- Privacy Settings
- Help & Support
- Sign Out

## Technical Architecture

### Files Structure
```
js/
  auth-manager.js     # Main authentication system
app.js                # Enhanced with auth integration
style.css             # Authentication UI styles
index.html            # Updated with auth script
```

### Key Classes
- **AuthManager**: Main authentication controller
- **Integration**: Seamless connection with existing Pro features
- **UI Components**: Modal dialogs, user menu, tier indicators

## API Integration (Backend Ready)

The system is designed to work with a backend API:

```javascript
// Login endpoint
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "hashedPassword"
}

// Response
{
  "success": true,
  "user": { ... },
  "token": "jwt-token"
}
```

### Endpoints Required
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/profile` - User profile data
- `PUT /api/auth/profile` - Update profile

## Security Considerations

### Current Implementation (Demo/Development)
- Client-side password hashing (SHA-256 + salt)
- Local storage for demo accounts
- Session management with expiration

### Production Recommendations
- Use bcrypt for server-side password hashing
- Implement HTTPS everywhere
- Add rate limiting and CAPTCHA
- Enable multi-factor authentication (MFA)
- Use secure JWT tokens with refresh mechanism

## Usage Examples

### Basic Authentication
```javascript
// Login
await authManager.login('demo@pro.com', 'password123');

// Check authentication status
if (authManager.isAuthenticated()) {
  console.log('User is logged in:', authManager.currentUser.name);
}

// Logout
await authManager.logout();
```

### Access Control
```javascript
// Check specific tier access
if (authManager.hasAccess('pro')) {
  // User has Pro access or higher
}

// Require specific access level
if (authManager.requireAccess('enterprise', 'Advanced Reports')) {
  // Proceed with enterprise feature
} else {
  // Access denied, upgrade prompt shown
}
```

### Integration with Features
```javascript
// Pro feature with authentication check
showAdvancedAnalytics() {
  if (!miniAgronomist.requireProAccess('analytics', 'Advanced Analytics')) {
    return; // Access denied
  }
  
  // Proceed with Pro feature
  this.advancedAnalytics.showDashboard();
}
```

## Development Setup

1. **Include Authentication Script**:
   ```html
   <script src="js/auth-manager.js"></script>
   ```

2. **Initialize Integration**:
   ```javascript
   // AuthManager automatically integrates with miniAgronomist
   // when both are loaded
   ```

3. **Test with Demo Accounts**:
   - Use provided demo accounts for testing
   - Each tier demonstrates different feature access

## Customization

### Adding New User Tiers
```javascript
// In AuthManager constructor
this.accessLevels = {
  guest: 0,
  free: 1,
  pro: 2,
  enterprise: 3,
  premium: 4,  // New tier
  admin: 5
};
```

### Custom Access Control
```javascript
// Add custom permission checks
hasCustomPermission(permission) {
  return this.currentUser?.permissions?.includes(permission);
}
```

## Best Practices

1. **Always Check Authentication**:
   - Verify user access before showing Pro features
   - Provide clear upgrade paths for unauthorized features

2. **Secure Session Handling**:
   - Use appropriate session timeouts
   - Clear sensitive data on logout

3. **User Experience**:
   - Provide clear feedback during authentication
   - Maintain feature state across sessions

4. **Error Handling**:
   - Handle network failures gracefully
   - Provide meaningful error messages

## Troubleshooting

### Common Issues

**Authentication not working**:
- Check if auth-manager.js is loaded
- Verify demo account credentials
- Check browser console for errors

**Pro features not updating**:
- Ensure ProFeatureManager is initialized
- Verify authManager.updateProFeaturesForUser() is called
- Check user tier assignment

**Session not persisting**:
- Verify localStorage/sessionStorage is enabled
- Check session expiration settings
- Ensure proper session restoration on page load

## Future Enhancements

- [ ] Social login integration (Google, Facebook)
- [ ] Multi-factor authentication (MFA)
- [ ] Team/organization accounts
- [ ] Advanced user management dashboard
- [ ] OAuth 2.0 integration
- [ ] Single Sign-On (SSO) support

This authentication system provides a solid foundation for user management while maintaining the excellent user experience that Mini Agronomist is known for.
