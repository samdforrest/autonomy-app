# Firebase Setup Guide 🔥

## Quick Setup for Family URL System

### Step 1: Enable Firestore in Your Existing Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project: `autonomy-app-4baf6`
3. Click **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (for now)
6. Select your preferred location (same as your Functions)

### Step 2: Get Your Web App Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** → **Web** (</> icon)
4. Register your app with nickname: "Autonomy Web App"
5. Copy the `firebaseConfig` object

### Step 3: Update Your Configuration

Replace the placeholder values in `services/firebase-config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "autonomy-app-4baf6.firebaseapp.com", 
  projectId: "autonomy-app-4baf6",
  storageBucket: "autonomy-app-4baf6.firebasestorage.app",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### Step 4: Set Up Firestore Security Rules

In Firebase Console → Firestore → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to family documents
    match /families/{familyCode} {
      allow read, write: if true; // For testing - will secure later
    }
  }
}
```

### Step 5: Test Your Setup

1. Run your web app: `expo start --web`
2. Navigate to `/create-family`
3. Create a test family
4. Check Firestore Console to see the data

## Environment Variables (Optional)

For better security, add to your `.env` file:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id  
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## What You Get

✅ **Family URL System**: `yourapp.web.app/family/BEAR-2024`  
✅ **Real-time Data Sync**: Instant updates across devices  
✅ **Child Management**: Add/remove children per family  
✅ **Assessment Storage**: Per-child assessment results  
✅ **Progress Tracking**: Module completion tracking  

## Next Steps

1. **Test with families**: Send them family URLs
2. **Collect feedback**: Iterate on user experience  
3. **Add authentication**: Implement profile login system
4. **Scale security**: Update Firestore rules for production

## Troubleshooting

**"Firebase not initialized" error:**
- Check your `firebaseConfig` values
- Ensure Firestore is enabled in Firebase Console

**"Permission denied" error:**
- Check Firestore security rules
- Ensure test mode is enabled

**Family code not working:**
- Check Firestore Console for data
- Verify family document structure

Need help? Check the Firebase Console logs or contact support.
