# Google Drive API Setup Guide

## Overview
This guide explains how to set up Google Drive API for hosting video files for transcription. This allows the app to work for multiple users (not just localhost) without requiring credit cards or payment information.

## Prerequisites
- Google account (free)
- 15GB free storage on Google Drive

## Setup Steps

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Enter project name: `avt-video-hosting`
4. Click "Create"

### 2. Enable Google Drive API
1. In the left sidebar, click "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it, then click "Enable"

### 3. Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (for public users)
3. Fill in:
   - App name: `AVT Video Hosting`
   - User support email: your email
   - Developer contact email: your email
4. Click "Save and Continue" (skip other sections)

### 4. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Configure:
   - Name: `AVT Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:6744` (for development)
     - `https://your-production-domain.com` (add later)
   - Authorized redirect URIs:
     - `http://localhost:6744/auth/callback`
     - `https://your-production-domain.com/auth/callback`
5. Click "Create"
6. **IMPORTANT**: Copy and save:
   - Client ID
   - Client Secret

### 5. Create Service Account
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in:
   - Service account name: `avt-uploader`
   - Service account description: `Service account for video uploads`
4. Click "Create and Continue"
5. Skip the "Grant users access" step (click "Done")
6. Click on the created service account
7. Go to "Keys" tab
8. Click "Add Key" → "Create New Key"
9. Choose "JSON"
10. Click "Create"
11. **IMPORTANT**: Download and save the JSON file (contains private key)

### 6. Share Drive Folder with Service Account
1. Go to https://drive.google.com/
2. Create a new folder: `AVT Video Uploads`
3. Right-click the folder → "Share"
4. Add the service account email (from the service account details page)
5. Give it "Editor" permissions
6. Click "Share"

### 7. Configure Project
1. Place the downloaded service account JSON key file in the project root
2. Rename it to: `service-account-key.json`
3. Update `.env` file:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=service-account-key.json
   ```

### 8. Install Dependencies
Dependencies are already installed:
- `googleapis` (Google Drive API client)

### 9. Test the Setup
1. Restart the API server: `npm run api`
2. Upload a test video through the app
3. Check server logs for Google Drive upload success
4. Verify the file appears in your Google Drive folder

## Usage

### Server-Side Upload
The `api/transcribe/upload` endpoint now:
1. Receives video file upload
2. Uploads to Google Drive
3. Gets public URL from Google Drive
4. Sends URL to Supadata for transcription
5. Returns transcription results

### File Management
- Uploaded files are stored in the "AVT Video Uploads" folder
- Files are made publicly accessible for transcription
- Service account has Editor permissions to manage files

## Free Tier Limits
- **Storage**: 15GB (per Google account)
- **API Usage**: Free for basic Drive API operations
- **File Size**: No limit (up to 5TB per file)
- **Bandwidth**: Free for downloads

## Security Notes
- **NEVER commit** `service-account-key.json` to git
- **NEVER share** the service account key publicly
- The key is already in `.gitignore`
- Only the service account has access to upload files
- Files are made public only for transcription access

## Troubleshooting

### "File not found" error
- Verify `service-account-key.json` exists in project root
- Check `.env` has correct path: `GOOGLE_SERVICE_ACCOUNT_KEY_PATH=service-account-key.json`

### "Insufficient permissions" error
- Verify service account email has Editor permissions on the Drive folder
- Check the folder name matches: `AVT Video Uploads`

### API quota exceeded
- Google Drive API has generous free limits
- For 1-2 users, you won't hit limits
- If you do, wait a few minutes or upgrade to paid tier

## Next Steps
1. Complete the setup steps above
2. Test with a local video upload
3. Verify transcription works with Google Drive-hosted files
4. Deploy to production (update authorized origins in OAuth settings)
