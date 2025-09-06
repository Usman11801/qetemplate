# User Profile and Settings Implementation

## Overview
This implementation adds two new pages to the Qemplate application:
1. **User Profile Page** (`/profile`)
2. **Settings Page** (`/settings`)

## Features Implemented

### User Profile Page (`/profile`)
- **User Information Display**: Shows user's name, email, member since date, subscription status, account type, last login, and authentication provider
- **Account Deletion**: Includes a danger zone section with account deletion functionality
- **Responsive Design**: Consistent with the application's design language using gradients and modern UI components
- **Loading States**: Proper loading indicators and error handling

### Settings Page (`/settings`)
- **Subscription Management**: 
  - Current plan status display
  - Upgrade to premium button (links to existing payment page)
  - Manage subscription button for premium users
  - Feature comparison between free and premium plans
- **General Settings**:
  - Email notifications toggle
  - Theme selection (Light/Dark/Auto)
  - Language selection (English, Spanish, French, German)
  - Privacy level control (Public/Private/Friends Only)
- **Settings Persistence**: All settings are saved to Firestore and persist across sessions

## Technical Implementation

### New Files Created
- `src/pages/userProfile.js` - User profile page component
- `src/pages/userSettings.js` - User settings page component

### Files Modified
- `src/App.js` - Added new routes for profile and settings pages
- `src/components/Home/Header.js` - Updated navigation links to point to new pages
- `src/services/userService.js` - Added `deleteUserAccount` function for account deletion

### Routing
- `/profile` - Protected route for user profile
- `/settings` - Protected route for user settings

### Database Integration
- User settings are stored in Firestore under `users/{userId}/settings`
- Settings include: notifications, theme, language, privacy, and timestamps
- Account deletion removes user data from Firestore

### Design Consistency
- Uses the same gradient backgrounds and color schemes as the main application
- Consistent component styling with rounded corners, shadows, and hover effects
- Responsive design that works on all screen sizes
- Uses Lucide React icons for consistency with the existing codebase

## Future Enhancements

### Stripe Integration
The settings page is designed with future Stripe integration in mind:
- Subscription status display
- Upgrade buttons that link to the existing payment system
- Placeholder for subscription management portal integration

### Additional Settings
- Form templates and preferences
- Export/import settings
- Advanced privacy controls
- Notification preferences (email, push, SMS)

### Account Management
- Profile picture upload
- Password change functionality
- Two-factor authentication
- Account recovery options

## Usage

### Accessing the Pages
1. Navigate to `/home` (the main dashboard)
2. Click on your email/username in the top-right navigation
3. Select "Your Profile" or "Settings" from the dropdown menu

### Navigation
- Both pages include a "Back to Home" button
- The Header component automatically closes the profile menu when navigating

### Security
- Both pages are protected routes requiring authentication
- Account deletion requires confirmation and recent authentication
- All user data operations are properly secured through Firebase Auth

## Dependencies
- React Router for navigation
- Firebase for authentication and database
- Lucide React for icons
- Tailwind CSS for styling
- Existing Toast component for notifications

## Testing
The implementation has been tested with:
- Build compilation (no errors)
- Route protection
- Component rendering
- State management
- Database operations

## Notes
- The account deletion feature is simplified and may need enhancement for production use
- Some settings (like theme) are stored but not yet applied throughout the application
- The Stripe integration is prepared but not fully implemented
- All existing functionality remains unchanged
