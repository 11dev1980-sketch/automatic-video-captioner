/**
 * Google Drive Service
 * Handles file upload and management using Google Drive API
 * Uses service account for server-side operations
 * Enhanced for caption history storage and retrieval
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Initialize Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const DRIVE_FOLDER_NAME = 'Automatic Video Captioner';

let drive = null;

/**
 * Initialize Google Drive API with service account
 */
function initializeDrive() {
  try {
    let credentials;

    // Check if GOOGLE_SERVICE_ACCOUNT_KEY is set (Railway - JSON string)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        console.log('[GOOGLE_DRIVE] Using GOOGLE_SERVICE_ACCOUNT_KEY (Railway)');
      } catch (parseError) {
        console.error('[GOOGLE_DRIVE] Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', parseError);
        return null;
      }
    } 
    // Check if GOOGLE_SERVICE_ACCOUNT_KEY_PATH is set (Local - file path)
    else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
      const keyFile = path.resolve(process.cwd(), keyPath);
      
      if (!fs.existsSync(keyFile)) {
        console.error('[GOOGLE_DRIVE] Service account key file not found:', keyFile);
        return null;
      }

      const keyContent = fs.readFileSync(keyFile, 'utf8');
      credentials = JSON.parse(keyContent);
      console.log('[GOOGLE_DRIVE] Using GOOGLE_SERVICE_ACCOUNT_KEY_PATH (Local)');
    } 
    else {
      console.error('[GOOGLE_DRIVE] Neither GOOGLE_SERVICE_ACCOUNT_KEY nor GOOGLE_SERVICE_ACCOUNT_KEY_PATH is set');
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
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
 * Get the uploads folder ID from environment or create it
 */
async function getUploadsFolderId() {
  try {
    // Check if folder ID is provided in environment
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (folderId) {
      console.log('[GOOGLE_DRIVE] Using folder ID from environment:', folderId);
      return folderId;
    }

    // Fallback to searching for or creating folder
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
    console.error('[GOOGLE_DRIVE] Folder lookup failed:', error);
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

    // Get uploads folder ID
    const folderId = await getUploadsFolderId();

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
 * Save caption metadata to Google Drive
 * @param {Object} captionData - Caption data including text, timestamps, styles
 * @param {string} videoId - Video identifier
 * @param {string} videoName - Video name
 * @returns {Promise<Object>} - Saved metadata info
 */
async function saveCaptionMetadata(captionData, videoId, videoName) {
  try {
    if (!drive) {
      drive = initializeDrive();
      if (!drive) throw new Error('Drive not initialized');
    }

    const folderId = await getUploadsFolderId();
    
    // Create metadata file
    const metadata = {
      videoId,
      videoName,
      timestamp: Date.now(),
      captionData: {
        captions: captionData.captions || [],
        style: captionData.style || {},
        totalDuration: captionData.totalDuration || 0,
      },
    };

    const metadataFileName = `caption_${videoId}_${Date.now()}.json`;
    const metadataContent = JSON.stringify(metadata, null, 2);

    // Upload metadata as a JSON file
    const file = await drive.files.create({
      resource: {
        name: metadataFileName,
        parents: [folderId],
        mimeType: 'application/json',
      },
      media: {
        mimeType: 'application/json',
        body: metadataContent,
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    console.log('[GOOGLE_DRIVE] Caption metadata saved:', file.data.id);

    return {
      success: true,
      fileId: file.data.id,
      fileName: metadataFileName,
    };
  } catch (error) {
    console.error('[GOOGLE_DRIVE] Metadata save failed:', error);
    throw new Error(`Google Drive metadata save failed: ${error.message}`);
  }
}

/**
 * Retrieve caption history from Google Drive
 * @returns {Promise<Array>} - Array of caption history items
 */
async function getCaptionHistory() {
  try {
    if (!drive) {
      drive = initializeDrive();
      if (!drive) throw new Error('Drive not initialized');
    }

    const folderId = await getUploadsFolderId();

    // List all JSON files in the folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
      fields: 'files(id, name, createdTime, webContentLink)',
    });

    const historyItems = [];

    for (const file of response.data.files || []) {
      try {
        // Download and parse metadata
        const content = await drive.files.get({
          fileId: file.id,
          alt: 'media',
        });

        const metadata = JSON.parse(content.data);
        
        if (metadata.captionData) {
          historyItems.push({
            id: file.id,
            videoId: metadata.videoId,
            videoName: metadata.videoName,
            timestamp: metadata.timestamp,
            captionData: metadata.captionData,
            type: 'captioned_video',
          });
        }
      } catch (parseError) {
        console.error('[GOOGLE_DRIVE] Failed to parse metadata file:', file.name, parseError);
      }
    }

    // Sort by timestamp (newest first)
    historyItems.sort((a, b) => b.timestamp - a.timestamp);

    console.log('[GOOGLE_DRIVE] Retrieved caption history:', historyItems.length, 'items');
    return historyItems;
  } catch (error) {
    console.error('[GOOGLE_DRIVE] History retrieval failed:', error);
    throw new Error(`Google Drive history retrieval failed: ${error.message}`);
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
  saveCaptionMetadata,
  getCaptionHistory,
  deleteFile,
  getFileInfo,
};
