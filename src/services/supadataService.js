import { 
    TRANSCRIBE_ENDPOINT, 
    MAX_RETRIES, 
    RETRY_DELAY_BASE, 
    RETRY_DELAY_MULTIPLIER 
} from '../utils/constants';

// Helper function to wait for specified delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to extract any text from response as fallback
function extractAnyText(obj, depth = 0) {
    if (depth > 5) return ''; // Prevent infinite recursion
    
    if (typeof obj === 'string') {
        return obj.trim();
    }
    
    if (Array.isArray(obj)) {
        for (const item of obj) {
            const text = extractAnyText(item, depth + 1);
            if (text && text.length > 10) return text;
        }
    }
    
    if (typeof obj === 'object' && obj !== null) {
        // Try common text fields first
        const textFields = ['text', 'content', 'transcript', 'arabicTranscript', 'response', 'result', 'data'];
        for (const field of textFields) {
            if (obj[field] && typeof obj[field] === 'string') {
                const text = obj[field].trim();
                if (text.length > 10) return text;
            }
        }
        
        // Recursively search all values
        for (const key in obj) {
            const text = extractAnyText(obj[key], depth + 1);
            if (text && text.length > 10) return text;
        }
    }
    
    return '';
}

// Helper function to create text segments ONLY when no real segments are available
function createFallbackSegments(text) {
    console.log('[SUPADATA] WARNING: Using fallback segment creation - no real timestamps available');
    const words = text.split(' ');
    const segments = [];
    let currentSegment = '';
    let segmentStart = 0;
    const wordsPerSegment = 8; // Average words per caption
    const secondsPerWord = 0.4; // Average speaking rate
    
    for (let i = 0; i < words.length; i++) {
        currentSegment += (i > 0 ? ' ' : '') + words[i];
        
        // Create segment every N words or at the end
        if ((i + 1) % wordsPerSegment === 0 || i === words.length - 1) {
            const segmentEnd = segmentStart + (currentSegment.split(' ').length * secondsPerWord);
            segments.push({
                id: segments.length + 1,
                startTime: segmentStart,
                endTime: segmentEnd,
                text: currentSegment.trim()
            });
            segmentStart = segmentEnd;
            currentSegment = '';
        }
    }
    
    return segments;
}

// Local user API keys are no longer used by the client. The server provides SUPADATA_API_KEY via environment variables.

export async function transcribeReel(reelUrl, targetLanguage, sourceLanguage) {
    if (!reelUrl) {
        throw new Error('URL is vereist');
    }
    
    // Support multiple platforms: Instagram, YouTube, TikTok, Facebook
    const validPatterns = [
        /^https:\/\/(www\.)?instagram\.com\/reel\//,
        /^https:\/\/(www\.)?youtube\.com\/watch\?v=/,
        /^https:\/\/(www\.)?youtu\.be\//,
        /^https:\/\/(www\.)?tiktok\.com\/@.+\/video\//,
        /^https:\/\/(www\.)?facebook\.com\/.+/
    ];
    
    const isValidUrl = validPatterns.some(pattern => pattern.test(reelUrl));
    if (!isValidUrl) {
        throw new Error('Niet-ondersteunde URL. Ondersteune platforms: Instagram, YouTube, TikTok, Facebook');
    }
    
    const endpoint = TRANSCRIBE_ENDPOINT;
    console.log('[SUPADATA] Using endpoint:', endpoint);
    if (!endpoint) {
        console.error('[SUPADATA] No endpoint configured, TRANSCRIBE_ENDPOINT:', TRANSCRIBE_ENDPOINT);
        throw new Error('Service configuration error - no transcription endpoint configured');
    }
    
    // Using server-side SUPADATA_API_KEY only
    let lastError = null;
    
    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            console.log('[SUPADATA] Making request to:', endpoint);
            console.log('[SUPADATA] Request body:', { reelUrl });
            
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reelUrl, targetLanguage, sourceLanguage }),
            });
            
            console.log('[SUPADATA] Response status:', res.status, res.statusText);
            
            if (!res.ok) {
                const txt = await res.text();
                
                // Parse error message from response
                let errorMessage = 'Video verwerken mislukt';
                try {
                    const errorJson = JSON.parse(txt);
                    if (errorJson.error) {
                        errorMessage = errorJson.error;
                    }
                } catch {
                    // Use default message if parsing fails
                }
                
                // Check if this is a retryable error (502, 503, 504)
                const isRetryable = res.status === 502 || res.status === 503 || res.status === 504;
                
                if (isRetryable && attempt < MAX_RETRIES - 1) {
                    const delayMs = RETRY_DELAY_BASE * Math.pow(RETRY_DELAY_MULTIPLIER, attempt);
                    lastError = new Error(errorMessage);
                    await delay(delayMs);
                    continue; // Retry
                }
                
                // Non-retryable error or max retries reached
                throw new Error(errorMessage);
            }
            
            const json = await res.json().catch(() => ({}));
            
            // Log the response for debugging
            console.log('[SUPADATA] ============================================');
            console.log('[SUPADATA] API FULL RESPONSE STRUCTURE:');
            console.log('[SUPADATA] ============================================');
            console.log(JSON.stringify(json, null, 2));
            console.log('[SUPADATA] ============================================');
            console.log('[SUPADATA] Response keys:', Object.keys(json));
            
            // Handle multiple response structures - PRIORITIZE REAL SEGMENTS WITH TIMESTAMPS
            let text = '';
            let segments = [];
            
            // PRIORITY 1: Real segments with timestamps from Supadata
            if (Array.isArray(json.segments) && json.segments.length > 0) {
                console.log('[SUPADATA] Found real segments with timestamps - using these');
                console.log('[SUPADATA] Total segments from API:', json.segments.length);
                console.log('[SUPADATA] ============================================');
                console.log('[SUPADATA] DETAILED SEGMENT BREAKDOWN:');
                console.log('[SUPADATA] ============================================');
                
                segments = json.segments.map((segment, index) => {
                    // Extract real timing data from Supadata response
                    const startTime = segment.start || segment.startTime || segment.timestamp || 0;
                    const endTime = segment.end || segment.endTime || segment.duration || startTime + 3;
                    const segmentText = (segment.text || segment.content || segment.transcript || '').trim();
                    const duration = parseFloat(endTime) - parseFloat(startTime);
                    
                    console.log(`[SUPADATA] Segment #${index + 1}:`);
                    console.log(`[SUPADATA]   - Start Time: ${parseFloat(startTime).toFixed(2)}s`);
                    console.log(`[SUPADATA]   - End Time: ${parseFloat(endTime).toFixed(2)}s`);
                    console.log(`[SUPADATA]   - Duration: ${duration.toFixed(2)}s`);
                    console.log(`[SUPADATA]   - Text: "${segmentText.substring(0, 50)}${segmentText.length > 50 ? '...' : ''}"`);
                    console.log(`[SUPADATA]   - Raw segment data:`, JSON.stringify(segment));
                    
                    return {
                        id: index + 1,
                        startTime: parseFloat(startTime),
                        endTime: parseFloat(endTime),
                        text: segmentText
                    };
                }).filter(segment => segment.text.length > 0);
                
                // Sort segments by start time to ensure proper order
                segments.sort((a, b) => a.startTime - b.startTime);
                
                text = segments.map(s => s.text).join(' ');
                console.log('[SUPADATA] ============================================');
                console.log('[SUPADATA] SUMMARY: Using REAL segments format with', segments.length, 'segments');
                console.log('[SUPADATA] Total text length:', text.length, 'characters');
                console.log('[SUPADATA] Time range:', segments[0] ? `${segments[0].startTime.toFixed(2)}s` : 'N/A', 'to', segments[segments.length-1] ? `${segments[segments.length-1].endTime.toFixed(2)}s` : 'N/A');
                console.log('[SUPADATA] ============================================');
            }
            // PRIORITY 2: Check for nested segments in response structure
            else if (json.data && Array.isArray(json.data.segments) && json.data.segments.length > 0) {
                console.log('[SUPADATA] Found nested segments in data.segments');
                segments = json.data.segments.map((segment, index) => ({
                    id: index + 1,
                    startTime: parseFloat(segment.start || segment.startTime || 0),
                    endTime: parseFloat(segment.end || segment.endTime || (segment.start || 0) + 3),
                    text: (segment.text || segment.content || '').trim()
                })).filter(segment => segment.text.length > 0);
                
                segments.sort((a, b) => a.startTime - b.startTime);
                text = segments.map(s => s.text).join(' ');
                console.log('[SUPADATA] Using nested data.segments format');
            }
            // PRIORITY 3: Check for result segments
            else if (json.result && Array.isArray(json.result.segments) && json.result.segments.length > 0) {
                console.log('[SUPADATA] Found nested segments in result.segments');
                segments = json.result.segments.map((segment, index) => ({
                    id: index + 1,
                    startTime: parseFloat(segment.start || segment.startTime || 0),
                    endTime: parseFloat(segment.end || segment.endTime || (segment.start || 0) + 3),
                    text: (segment.text || segment.content || '').trim()
                })).filter(segment => segment.text.length > 0);
                
                segments.sort((a, b) => a.startTime - b.startTime);
                text = segments.map(s => s.text).join(' ');
                console.log('[SUPADATA] Using nested result.segments format');
            }
            // PRIORITY 4: Check for legacy content array format (might have timing)
            else if (Array.isArray(json.content) && json.content.length > 0) {
                console.log('[SUPADATA] Using legacy content array format');
                segments = json.content.map((item, index) => {
                    // Try to extract real timing from the item first
                    const realStartTime = parseFloat(item.start || item.startTime || item.timestamp || 0);
                    const realEndTime = parseFloat(item.end || item.endTime || item.duration || realStartTime + 3);
                    
                    return {
                        id: index + 1,
                        startTime: realStartTime,
                        endTime: realEndTime,
                        text: (item.text || item.content || '').trim()
                    };
                }).filter(segment => segment.text.length > 0);
                
                segments.sort((a, b) => a.startTime - b.startTime);
                text = segments.map(s => s.text).join(' ');
                console.log('[SUPADATA] Legacy format - using available timing, fallback to estimated');
            }
            // FALLBACK: No real segments available - create estimated timing
            else if (json.text && typeof json.text === 'object' && json.text.arabicTranscript) {
                text = json.text.arabicTranscript;
                segments = createFallbackSegments(text);
                console.log('[SUPADATA] FALLBACK: Using nested text.arabicTranscript with estimated timing');
            }
            else if (typeof json.arabicTranscript === 'string') {
                text = json.arabicTranscript;
                segments = createFallbackSegments(text);
                console.log('[SUPADATA] FALLBACK: Using arabicTranscript with estimated timing');
            } 
            else if (typeof json.text === 'string') {
                text = json.text;
                segments = createFallbackSegments(text);
                console.log('[SUPADATA] FALLBACK: Using legacy text with estimated timing');
            } else if (typeof json.transcript === 'string') {
                text = json.transcript;
                segments = createFallbackSegments(text);
                console.log('[SUPADATA] FALLBACK: Using legacy transcript with estimated timing');
            } else if (typeof json.content === 'string') {
                text = json.content;
                segments = createFallbackSegments(text);
                console.log('[SUPADATA] FALLBACK: Using legacy content with estimated timing');
            }
            
            text = text.trim();
            
            if (!text) {
                console.log('[SUPADATA] No text found in response, available keys:', Object.keys(json));
                console.log('[SUPADATA] Full response structure:', JSON.stringify(json, null, 2));
                
                // Try to extract any text from the response as fallback
                const fallbackText = extractAnyText(json);
                if (fallbackText) {
                    console.log('[SUPADATA] Using fallback text extraction');
                    text = fallbackText;
                    segments = createFallbackSegments(text);
                } else {
                    throw new Error('Geen transcript beschikbaar voor deze video. Mogelijke oorzaken: video heeft geen audio, taal niet ondersteund, of video is privé.');
                }
            }
            
            console.log('[SUPADATA] Successfully extracted text:', text.substring(0, 100) + '...');
            
            // Return the full response structure for AI processing
            return { 
                text, 
                segments,
                // Include the full response for AI processing
                fullResponse: json,
                // Include AI response if available
                aiResponse: json.text?.translationAndDuas || json.translationAndDuas || json.aiResponse
            };
        } catch (error) {
            // If this is the last attempt or a non-retryable error, throw
            if (attempt === MAX_RETRIES - 1 || 
                error.message.includes('Niet-ondersteunde URL') || 
                error.message.includes('Service configuration error') || 
                error.message.includes('Geen transcript beschikbaar')) {
                throw error;
            }
            
            // Network error or other transient error - retry with exponential backoff
            const delayMs = RETRY_DELAY_BASE * Math.pow(RETRY_DELAY_MULTIPLIER, attempt);
            lastError = error;
            await delay(delayMs);
        }
    }
    
    // If we exhausted all retries, throw the last error
    throw lastError || new Error('Video verwerken mislukt. Probeer het opnieuw.');
}
