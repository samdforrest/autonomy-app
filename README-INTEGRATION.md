# Google Docs Integration - Frontend Setup

## 🎯 What We've Built

Your React Native app now integrates with Google Docs to fetch dynamic content! Here's what's been added:

### 📁 New Files Created:

1. **`services/api.ts`** - API service for backend communication
2. **`hooks/useGoogleDocsContent.ts`** - React hooks for fetching content
3. **Updated `app/mistakes-day-1.tsx`** - Now uses Google Docs content

### 🔄 How It Works:

```
Google Docs → Node.js Backend → Parse to JSON → React Native Frontend → Display Content
```

## 🚀 Testing the Integration

### Step 1: Start Your Backend
```bash
cd backend
npm run dev
```
Backend should be running on `http://localhost:3001`

### Step 2: Start Your React Native App
```bash
cd .. # Back to main project
npm start
```

### Step 3: Navigate to Mistakes Day 1
1. Open your app
2. Go to the mistakes module
3. Open "Day 1" content
4. You should see:
   - Loading spinner initially
   - Content from your Google Doc (Rules + Instructions)
   - Refresh button to reload content

## 📱 What You'll See

### ✅ Success State:
- **Title**: From your Google Doc
- **Sections**: Dynamically rendered from doc headers
- **Bullet Points**: All items from your doc
- **Refresh Button**: Updates content on demand
- **Metadata**: Shows last updated info

### 🔄 Loading State:
- Loading spinner
- "Loading content from Google Docs..." message

### ❌ Error State:
- Error message if backend is down
- "Try Again" button to retry
- Fallback to placeholder content

## 🔧 Configuration

### Document IDs
Update `services/api.ts` with your actual document IDs:
```typescript
export const DOCUMENT_IDS = {
  MISTAKES_DAY_1: 'your-actual-doc-id-here',
  JOB_DAY_1: 'another-doc-id-here',
  // Add more as needed
};
```

### Backend URL
If your backend runs on a different port, update `services/api.ts`:
```typescript
constructor() {
  this.baseUrl = 'http://localhost:3001/api'; // Change port if needed
}
```

## 🎨 Content Structure

Your Google Doc should follow this format:
```
Rules
- Everyone puts $5
- Last person standing wins

Instructions  
- Follow the process carefully
- Ask questions if unclear
```

This becomes:
```json
{
  "sections": {
    "rules": {
      "title": "Rules",
      "items": ["Everyone puts $5", "Last person standing wins"]
    },
    "instructions": {
      "title": "Instructions",
      "items": ["Follow the process carefully", "Ask questions if unclear"]
    }
  }
}
```

## 🔄 Adding More Modules

To add Google Docs integration to other screens:

1. **Add document ID** to `DOCUMENT_IDS` in `services/api.ts`
2. **Import the hook** in your component:
   ```typescript
   import { useGoogleDocsContent } from '../hooks/useGoogleDocsContent';
   ```
3. **Use the hook**:
   ```typescript
   const { content, loading, error, refetch } = useGoogleDocsContent(
     DOCUMENT_IDS.YOUR_DOC_ID,
     'job' // or 'mistakes'
   );
   ```
4. **Render the content** similar to `mistakes-day-1.tsx`

## 🐛 Troubleshooting

### Backend Connection Issues:
- Make sure backend is running on port 3001
- Check console for network errors
- Verify Google service account is set up

### Content Not Loading:
- Check document is shared with service account
- Verify document ID is correct
- Check backend logs for API errors

### TypeScript Errors:
- Run `npx expo install` to ensure dependencies are installed
- Check import paths are correct

## 🎉 Next Steps

1. **Test the integration** - Navigate to Mistakes Day 1 and see your Google Doc content
2. **Add more documents** - Create Google Docs for other days/modules
3. **Customize styling** - Adjust the UI to match your design
4. **Add caching** - Store content locally for offline access

Your app now has dynamic content management through Google Docs! 🚀
