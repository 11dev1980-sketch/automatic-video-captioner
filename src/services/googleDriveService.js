/**
 * Google Drive Service
 * Handles file upload and management using Google Drive API
 * Uses service account for server-side operations
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Initialize Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const DRIVE_FOLDER_NAME = 'AVT Video Uploads';

let drive = null;

/**
 * Initialize Google Drive API with service account
 */
function initializeDrive() {
  try {
    // Load service account credentials
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    
    if (!keyPath) {
      console.error('[GOOGLE_DRIVE] GOOGLE_SERVICE_ACCOUNT_KEY_PATH not set in environment');
      return null;
    }

    const keyFile = path.resolve(__dirname, '../../', keyPath);
    
    if (!fs.existsSync(keyFile)) {
      console.error('[GOOGLE_DRIVE] Service account key file not found:', keyFile);
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFile,
      scopes: SCOPES,
    });

    drive = google.drive({ version: 'v3', auth });
    console.log('[GOOGLE_DRIVE] Google Drive API initialized successfully');
    return drive;
  } catch (error) {
    console.error('[GOOGLE_DRIVE] Initialization failed:', error);
    return null;
  }
}

/**
 * Get or create the uploads folder
 */
async function getOrCreateUploadsFolder() {
  try {
    if (!drive) {
      drive = initializeDrive();
      if (!drive) throw new Error('Drive not initialized');
    }

    // Search for existing folder
    const response = await drive.files.list({
      q: `name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (response.data.files && response.data.files.length > 0) {
      console.log('[GOOGLE_DRIVE] Found existing folder:', response.data.files[0].id);
      return response.data.files[0].id;
    }

    // Create new folder
    const folder = await drive.files.create({
      resource: {
        name: DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    console.log('[GOOGLE_DRIVE] Created new folder:', folder.data.id);
    return folder.data.id;
  } catch (error) {
    console.error('[GOOGLE_DRIVE] Folder creation failed:', error);
    throw error;
  }
}

/**
 * Upload a file to Google Drive
 * @param {Buffer} fileBuffer - File data as buffer
 * @param {string} fileName - Original filename
 * @param {string} mimeType - MIME type
 * @returns {Promise<Object>} - File info with public URL
 */
async function uploadFile(fileBuffer, fileName, mimeType = 'video/mp4') {
  try {
    if (!drive) {
      drive = initializeDrive();
      if (!drive) throw new Error('Drive not initialized');
    }

    console.log('[GOOGLE_DRIVE] Uploading file:', fileName, 'Size:', fileBuffer.length);

    // Get or create uploads folder
    const folderId = await getOrCreateUploadsFolder();

    // Generate unique filename
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload file
    const file = await drive.files.create({
      resource: {
        name: uniqueFileName,
        parents: [folderId],
      },
      media: {
        mimeType: mimeType,
        body: fileBuffer,
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    console.log('[GOOGLE_DRIVE] File uploaded successfully:', file.data.id);

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: file.data.id,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log('[GOOGLE_DRIVE] File made public');

    return {
      success: true,
      fileId: file.data.id,
      fileName: uniqueFileName,
      publicUrl: file.data.webContentLink,
      webViewLink: file.data.webViewLink,
    };
  } catch (error) {
    console.error('[GOOGLE_DRIVE] Upload failed:', error);
    throw new Error(`Google Drive upload failed: ${error.message}`);
  }
}

/**
 * Delete a file from Google Drive
 * @param {string} fileId - Google Drive file ID
 */
async function deleteFile(fileId) {
  try {
    if (!drive) {
      drive = initializeDrive();
      if (!drive) throw new Error('Drive not initialized');
    }

    await drive.files.delete({
      fileId: fileId,
    });

    console.log('[GOOGLE_DRIVE] File deleted successfully:', fileId);
    return { success: true };
  } catch (error) {
    console.error('[GOOGLE_DRIVE] Delete failed:', error);
    throw new Error(`Google Drive delete failed: ${error.message}`);
  }
}

/**
 * Get file info from Google Drive
 * @param {string} fileId - Google Drive file ID
 */
async function getFileInfo(fileId) {
  try {
    if (!drive) {
      drive = initializeDrive();
      if (!drive) throw new Error('Drive not initialized');
    }

    const file = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, webViewLink, webContentLink, size',
    });

    return file.data;
  } catch (error) {
    console.error('[GOOGLE_DRIVE] Get file info failed:', error);
    throw new Error(`Google Drive get file failed: ${error.message}`);
  }
}

module.exports = {
  initializeDrive,
  uploadFile,
  deleteFile,
  getFileInfo,
};
