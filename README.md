# Qemplate

A drag-and-drop quiz creator and delivery platform built with React and Firebase.

## Features

- **Visual quiz builder**: drag & drop questions, answers, components  
- **Configurable session settings**: toggles for leaderboards, hints, sequential mode  
- **Answer key review**: optionally display correct answers next to user’s responses after submission  
- **Prize system**: set message, image/QR prize, score threshold and awardee limits  
- **Authentication**: Google, Microsoft, etc. sign-on  
- **Secure by design**: no secrets committed, API keys kept in `.env`

## Getting Started

### Prerequisites

- Node.js ≥14  
- npm or yarn  
- A Firebase project

### Installation

1. Clone the repo  

2. Install dependencies
   
4. Create a `.env` in the project root with your Firebase config:

   ```bash
   REACT_APP_FIREBASE_API_KEY=AIzaSyC4Y-o_TcGwXgXVFEEI92GbO0jzOXyXwec
   REACT_APP_FIREBASE_AUTH_DOMAIN=oursystem3-14baf.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=oursystem3-14baf
   REACT_APP_FIREBASE_STORAGE_BUCKET=oursystem3-14baf.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=507049315874
   REACT_APP_FIREBASE_APP_ID=1:507049315874:web:61adb203371964fdec847b
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-GE8P9NWEJC
   ```

5. Start the development server

   ```bash
   npm start
   ```

---

## Requirements Overview

Below is a high-level outline of the core requirements. For full visual examples, see the [Requirements Document]

1. **Answer-Key Review**

   * Add a toggle in Session Settings that, when enabled, shows the correct answers in a side-by-side with the user’s answers.

2. **Prize System**

   * Enable a “Set a Prize” toggle.
   * When on, display inputs for:

     * Custom message
     * Uploadable image/QR code
     * Score threshold to qualify
     * Maximum number of awardees
   * Upon quiz completion, if a user meets the threshold and spots remain, automatically email the prize/message to the address they provided at start.
   * Prevent further prize emails once the awardee limit is reached.
   * Require users to sign in (Google, Microsoft, etc.) before awarding to avoid fraud.

3. **Additional Sign-On Options**

   * Beyond Firebase Auth’s Google provider, add Microsoft (and other common social) sign-on flows for login/registration. (Focus on Microsoft for now) 

4. **Security Best Practices**

   * Keep API keys and sensitive config in `.env`; never commit secrets to Git.
   * Use Firebase rules to lock down your database/storage.
   * Audit dependencies and rotate keys regularly.

---

