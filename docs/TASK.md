I need you to add Instagram Reel download functionality to it. Here is everything you need to know:

WHAT TO BUILD:
Add a self-contained Instagram Reel downloader section to my PWA. It should have:

A text input field where the user can paste an Instagram Reel URL
A "Download" button that triggers the fetch
A status message area that shows loading state, success, or error messages
A <video> element that appears after a successful fetch, showing the reel so the user can long-press it on iOS and tap "Save to Photos" to download it locally
A clear instructional message that appears with the video telling the user to long-press and save


THE API TO USE:
Use this exact RapidAPI endpoint:

Method: GET
URL pattern: https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert?url=ENCODED_INSTAGRAM_URL
Required headers:

x-rapidapi-host: instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com
x-rapidapi-key: 2b44d3702bmshe78b6807edff1c3p163827jsnf1a53866a263



The Instagram URL from the input field must be URL-encoded before being appended to the endpoint. Use encodeURIComponent() for this.

API RESPONSE HANDLING:
The API returns a JSON response. Parse it and extract the direct video URL from the response. The video URL may be nested inside the response object — common fields to check are url, video_url, media, result, or similar. Log the full response to the console so it can be inspected if the field path needs adjusting. Once the video URL is found, set it as the src of the <video> element and display it.

EXACT BEHAVIOR FLOW:

User pastes an Instagram Reel URL into the input field (example format: https://www.instagram.com/reel/ABC123/)
User clicks the Download button
Button becomes disabled and shows "Fetching..." to prevent double clicks
Status message updates to "Fetching reel, please wait..."
A GET request is made to the RapidAPI endpoint with the encoded URL and the required headers
On success: the <video> element appears with the returned video URL as its src, controls enabled, and a message appears saying "✅ Long-press the video and tap Save to Photos to save it to your device"
On failure: a clear error message is shown and the button is re-enabled
After success or failure, the button is re-enabled and its label resets to "Download"


TECHNICAL REQUIREMENTS:

Written in vanilla HTML, CSS, and JavaScript — no frameworks or libraries
No backend required — all API calls happen directly from the frontend JavaScript using fetch()
Must work correctly in iOS Safari and as an iOS PWA (home screen app)
The <video> element must have the controls, playsinline, and webkit-playsinline attributes so it plays correctly on iOS
Input field should have type="url" and a placeholder like "Paste Instagram Reel URL here..."
Handle edge cases: empty input (show "Please paste a URL first"), network errors, and API errors (non-200 responses or missing video URL in response)
The video element should be hidden by default and only shown after a successful response
Style everything cleanly and simply — it should look like a natural part of a mobile app UI, not a bolted-on widget. Use a dark or neutral color scheme that suits a mobile PWA. Rounded corners, adequate padding, full-width input and button on mobile.


IMPORTANT iOS NOTE:
iOS PWAs cannot programmatically trigger file downloads. The workaround being used here is displaying the video in a <video> tag so the user can long-press it natively to save it. Do not attempt to use <a download> links or URL.createObjectURL as these do not work reliably on iOS Safari for remote video URLs. Stick to the <video> src approach.

WHAT TO DELIVER:
The complete, ready-to-use functionality, implement it immediately in the pwa!