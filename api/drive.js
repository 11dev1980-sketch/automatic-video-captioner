/**
 * Google Drive API Endpoints
 * Handles caption history storage and retrieval from Google Drive
 */

const express = require('express');
const { initializeDrive, saveCaptionMetadata, getCaptionHistory, deleteFile } = require('../src/services/googleDriveService');

const router = express.Router();

/**
 * GET /api/drive/history
 * Retrieve caption history from Google Drive
 */
router.get('/history', async (req, res) => {
  try {
    console.log('[DRIVE-API] Fetching caption history from Google Drive');
    
    const history = await getCaptionHistory();
    
    res.json({
      success: true,
      history: history,
      count: history.length,
    });
  } catch (error) {
    console.error('[DRIVE-API] History fetch failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/drive/save
 * Save caption metadata to Google Drive
 */
router.post('/save', async (req, res) => {
  try {
    const { captionData, videoId, videoName } = req.body;
    
    if (!captionData || !videoId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: captionData, videoId',
      });
    }

    console.log('[DRIVE-API] Saving caption metadata for video:', videoId);
    
    const result = await saveCaptionMetadata(captionData, videoId, videoName);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[DRIVE-API] Metadata save failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/drive/delete/:fileId
 * Delete a file from Google Drive
 */
router.delete('/delete/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    console.log('[DRIVE-API] Deleting file from Google Drive:', fileId);
    
    const result = await deleteFile(fileId);
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[DRIVE-API] File delete failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
