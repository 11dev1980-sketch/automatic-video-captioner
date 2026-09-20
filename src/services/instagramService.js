/**
 * Instagram API Service
 * Handles video upload and posting to Instagram Reels
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTAGRAM_CONFIG_KEY = '@instagram_config';
const GRAPH_API_BASE = 'https://graph.instagram.com';

/**
 * Load Instagram configuration from storage
 */
async function loadConfig() {
  try {
    const config = await AsyncStorage.getItem(INSTAGRAM_CONFIG_KEY);
    if (config) {
      return JSON.parse(config);
    }
    return null;
  } catch (error) {
    console.error('Error loading Instagram config:', error);
    return null;
  }
}

/**
 * Upload video to Instagram using resumable upload
 * @param {string} videoUrl - URL of the video to upload
 * @param {string} caption - Caption for the post
 * @param {string} accessToken - Instagram access token
 * @param {string} igUserId - Instagram user ID
 * @returns {Promise<string>} - Media container ID
 */
async function uploadVideo(videoUrl, caption, accessToken, igUserId) {
  try {
    // Step 1: Create media container
    const containerResponse = await fetch(
      `${GRAPH_API_BASE}/${igUserId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          caption: caption,
          media_type: 'REELS',
          access_token: accessToken,
        }),
      }
    );

    const containerData = await containerResponse.json();

    if (!containerResponse.ok) {
      throw new Error(`Failed to create media container: ${JSON.stringify(containerData)}`);
    }

    const containerId = containerData.id;
    console.log('Media container created:', containerId);

    // Step 2: Wait for container to be processed (polling)
    let isProcessed = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait

    while (!isProcessed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await fetch(
        `${GRAPH_API_BASE}/${containerId}?fields=status_code`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const statusData = await statusResponse.json();

      if (statusData.status_code === 'FINISHED') {
        isProcessed = true;
        console.log('Media container processed');
      } else if (statusData.status_code === 'ERROR') {
        throw new Error('Media container processing failed');
      }

      attempts++;
    }

    if (!isProcessed) {
      throw new Error('Media container processing timeout');
    }

    // Step 3: Publish the media
    const publishResponse = await fetch(
      `${GRAPH_API_BASE}/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      throw new Error(`Failed to publish media: ${JSON.stringify(publishData)}`);
    }

    console.log('Media published successfully:', publishData);
    return publishData.id;
  } catch (error) {
    console.error('Instagram upload error:', error);
    throw error;
  }
}

/**
 * Post video to Instagram Reels
 * @param {string} videoUrl - URL of the video to upload
 * @param {Object} postConfig - Post configuration (title, description, hashtags)
 * @returns {Promise<Object>} - Result with success status and post ID
 */
export async function postToInstagram(videoUrl, postConfig) {
  const config = await loadConfig();

  if (!config || !config.accessToken || !config.igUserId) {
    throw new Error('Instagram not configured. Please set up your credentials in settings.');
  }

  const { title, description, hashtags } = postConfig;

  // Format caption
  const caption = formatCaption(title, description, hashtags);

  try {
    const postId = await uploadVideo(videoUrl, caption, config.accessToken, config.igUserId);
    return {
      success: true,
      postId: postId,
      message: 'Successfully posted to Instagram',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Format caption for Instagram post
 * @param {string} title - Post title
 * @param {string} description - Post description
 * @param {string} hashtags - Hashtags (comma-separated)
 * @returns {string} - Formatted caption
 */
function formatCaption(title, description, hashtags) {
  let caption = '';

  if (title) {
    caption += `${title}\n\n`;
  }

  if (description) {
    caption += `${description}\n\n`;
  }

  if (hashtags) {
    // Parse hashtags and format them
    const tagArray = hashtags.split(',').map(tag => tag.trim());
    const formattedTags = tagArray
      .map(tag => (tag.startsWith('#') ? tag : `#${tag}`))
      .join(' ');
    caption += formattedTags;
  }

  return caption.trim();
}

/**
 * Check if Instagram is configured
 * @returns {Promise<boolean>}
 */
export async function isInstagramConfigured() {
  const config = await loadConfig();
  return !!(config && config.accessToken && config.igUserId);
}

/**
 * Clear Instagram configuration
 * @returns {Promise<void>}
 */
export async function clearInstagramConfig() {
  try {
    await AsyncStorage.removeItem(INSTAGRAM_CONFIG_KEY);
  } catch (error) {
    console.error('Error clearing Instagram config:', error);
  }
}
