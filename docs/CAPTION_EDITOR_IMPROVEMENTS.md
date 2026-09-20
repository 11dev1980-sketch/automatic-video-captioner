# Caption Editor - User Flow & Improvement Plan

## 📊 Current User Flow

### Step 1: Video Input
```
User opens Caption Editor
    ↓
Sees empty video preview
    ↓
Enters video URL (Instagram/TikTok/YouTube/Direct)
    ↓
Clicks "Video Laden" (Load Video)
    ↓
System extracts video (with API key rotation)
    ↓
Video preview appears
```

### Step 2: Start Editing
```
Video loaded successfully
    ↓
User clicks "Ondertitels Bewerken" (Edit Captions)
    ↓
Navigates to CaptionEditorWorkspace
    ↓
[Current workspace functionality unknown - needs investigation]
```

### Current Limitations
- ❌ No language selection (source/target)
- ❌ No caption style customization
- ❌ No caption editing interface visible
- ❌ No words-per-caption control
- ❌ Only supports Arabic → Dutch
- ❌ No Turkish support
- ❌ No font/color/style options

---

## 🎯 Proposed Improvements

### 1. Language Selection System

#### A. Auto-Detection (Recommended)
**Supadata API can auto-detect source language** → Don't ask user

**User only selects TARGET language:**
```
┌─────────────────────────────────────┐
│  Target Language                    │
│  ┌───────────────────────────────┐  │
│  │ 🇳🇱 Dutch (Nederlands)        │  │ ← Default
│  │ 🇬🇧 English                   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Supported Source Languages (Auto-detected):**
- 🇸🇦 Arabic
- 🇹🇷 Turkish
- 🇬🇧 English
- [Any language Supadata supports]

#### B. Manual Selection (Fallback)
If auto-detection fails, show both:
```
┌─────────────────────────────────────┐
│  Source Language (Optional)         │
│  ┌───────────────────────────────┐  │
│  │ Auto-detect ✨                │  │ ← Default
│  │ 🇸🇦 Arabic                    │  │
│  │ 🇹🇷 Turkish                   │  │
│  │ 🇬🇧 English                   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Target Language                    │
│  ┌───────────────────────────────┐  │
│  │ 🇳🇱 Dutch (Nederlands)        │  │
│  │ 🇬🇧 English                   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

### 2. Caption Style Presets

#### Preset Styles
```
┌─────────────────────────────────────┐
│  Caption Style                      │
│                                     │
│  ○ Classic                          │
│     White text, black background    │
│                                     │
│  ● Modern (Selected)                │
│     Yellow text, transparent bg     │
│                                     │
│  ○ Minimal                          │
│     White text, no background       │
│                                     │
│  ○ Bold                             │
│     Large white text, black outline │
│                                     │
│  ○ Custom                           │
│     Customize all settings          │
└─────────────────────────────────────┘
```

#### Style Examples
**Classic:**
```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Dit is een ondertitel       │   │ ← White text
│  └─────────────────────────────┘   │ ← Black background
│                                     │
└─────────────────────────────────────┘
```

**Modern:**
```
┌─────────────────────────────────────┐
│                                     │
│  Dit is een ondertitel              │ ← Yellow text
│  (transparent background)           │
│                                     │
└─────────────────────────────────────┘
```

**Bold:**
```
┌─────────────────────────────────────┐
│                                     │
│  DIT IS EEN ONDERTITEL              │ ← Large white text
│  (with black outline)               │    with black stroke
│                                     │
└─────────────────────────────────────┘
```

---

### 3. Caption Settings Panel

```
┌─────────────────────────────────────────────────────────┐
│  ⚙️ Caption Settings                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Words Per Caption                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│   │
│  │ 1        3        5        7        10          │   │
│  └─────────────────────────────────────────────────┘   │
│  Current: 5 words                                       │
│                                                         │
│  Font Family                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Arial ▼                                         │   │
│  └─────────────────────────────────────────────────┘   │
│  Options: Arial, Helvetica, Roboto, Open Sans          │
│                                                         │
│  Font Size                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│   │
│  │ 12       18       24       30       36          │   │
│  └─────────────────────────────────────────────────┘   │
│  Current: 24px                                          │
│                                                         │
│  Text Color                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⬜ White   ⬛ Black   🟨 Yellow   🔵 Blue       │   │
│  │ 🟢 Green   🔴 Red     🟣 Purple   🎨 Custom     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Background Color                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⬛ Black   ⬜ White   🟨 Yellow   🔵 Blue       │   │
│  │ 🟢 Green   🔴 Red     🟣 Purple   ⚪ None       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Background Opacity                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│   │
│  │ 0%       25%      50%      75%      100%        │   │
│  └─────────────────────────────────────────────────┘   │
│  Current: 80%                                           │
│                                                         │
│  Text Style                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☐ Bold        ☐ Italic      ☐ Underline        │   │
│  │ ☐ Shadow      ☐ Outline     ☐ All Caps         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Position                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ○ Top         ● Bottom      ○ Center           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         💾 Save Settings                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Caption Editor Interface

```
┌─────────────────────────────────────────────────────────┐
│  📹 Video Player                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │                                                 │   │
│  │              [Video Playing]                    │   │
│  │                                                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │ Dit is een ondertitel                   │   │   │ ← Live caption preview
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                 │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │  0:00                                    3:45   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📝 Caption Timeline                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 00:00 - 00:03                                   │   │
│  │ ┌─────────────────────────────────────────────┐ │   │
│  │ │ Hallo, welkom bij deze video               │ │   │ ← Editable
│  │ └─────────────────────────────────────────────┘ │   │
│  │ [Edit] [Delete] [Split]                         │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 00:03 - 00:06                                   │   │
│  │ ┌─────────────────────────────────────────────┐ │   │
│  │ │ Vandaag gaan we leren over...              │ │   │
│  │ └─────────────────────────────────────────────┘ │   │
│  │ [Edit] [Delete] [Split]                         │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 00:06 - 00:09                                   │   │
│  │ ┌─────────────────────────────────────────────┐ │   │
│  │ │ ...de beste manier om te leren             │ │   │
│  │ └─────────────────────────────────────────────┘ │   │
│  │ [Edit] [Delete] [Split]                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ⚙️ Settings  |  💾 Export  |  🔄 Regenerate   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

### 5. Improved User Flow

```
Step 1: Video Input
┌─────────────────────────────────────┐
│  Enter Video URL                    │
│  ┌───────────────────────────────┐  │
│  │ https://instagram.com/...     │  │
│  └───────────────────────────────┘  │
│  [Load Video]                       │
└─────────────────────────────────────┘
         ↓
Step 2: Language Selection
┌─────────────────────────────────────┐
│  Target Language                    │
│  ┌───────────────────────────────┐  │
│  │ 🇳🇱 Dutch (Nederlands)        │  │ ← Selected
│  │ 🇬🇧 English                   │  │
│  └───────────────────────────────┘  │
│                                     │
│  Source: Auto-detected (Arabic) ✨  │
└─────────────────────────────────────┘
         ↓
Step 3: Caption Style
┌─────────────────────────────────────┐
│  Choose Caption Style               │
│  ● Modern (Yellow, transparent)     │
│  ○ Classic (White, black bg)        │
│  ○ Custom                           │
│                                     │
│  [Continue]                         │
└─────────────────────────────────────┘
         ↓
Step 4: Generate Captions
┌─────────────────────────────────────┐
│  Generating captions...             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  75% complete                       │
│                                     │
│  Transcribing audio...              │
│  Translating to Dutch...            │
│  Syncing with video...              │
└─────────────────────────────────────┘
         ↓
Step 5: Edit & Preview
┌─────────────────────────────────────┐
│  [Video with captions]              │
│                                     │
│  Caption Timeline:                  │
│  00:00 - 00:03: "Hallo welkom..."   │
│  00:03 - 00:06: "Vandaag gaan..."   │
│                                     │
│  [Edit] [Settings] [Export]         │
└─────────────────────────────────────┘
         ↓
Step 6: Export
┌─────────────────────────────────────┐
│  Export Options                     │
│  ○ Video with burned-in captions    │
│  ○ SRT file only                    │
│  ○ Both                             │
│                                     │
│  [Export]                           │
└─────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### 1. API Consolidation (Reduce Vercel Functions)

**Current Structure (Multiple Files):**
```
api/
├── captions.js          (1 function)
├── transcribe.js        (1 function)
├── video-extract.js     (1 function)
├── video-downloader.js  (1 function)
├── video-proxy.js       (1 function)
└── ... (15+ files)
```

**Proposed Structure (Consolidated):**
```
api/
├── video.js             (handles all video operations)
│   ├── GET /video?action=extract
│   ├── GET /video?action=download
│   ├── GET /video?action=proxy
│   └── POST /video?action=cleanup
│
├── caption.js           (handles all caption operations)
│   ├── POST /caption?action=transcribe
│   ├── POST /caption?action=translate
│   ├── GET /caption?action=get
│   └── PUT /caption?action=update
│
└── config.js            (handles configuration)
    ├── GET /config?action=health
    └── GET /config?action=test
```

**Benefits:**
- ✅ Reduces from 15+ functions to 3 functions
- ✅ Easier to maintain
- ✅ Better for Vercel free tier limits
- ✅ Consistent error handling

---

### 2. Language Support Implementation

#### Supadata API Integration
```javascript
// Check if Supadata supports auto-detection
const transcribeOptions = {
  sourceLanguage: 'auto', // Let Supadata detect
  targetLanguage: 'nl',   // Dutch
  // OR
  targetLanguage: 'en',   // English
};

// Supported combinations:
// Arabic → Dutch
// Arabic → English
// Turkish → Dutch
// Turkish → English
// English → Dutch
// [Any language Supadata supports] → Dutch/English
```

#### Language Selection Component
```javascript
const LanguageSelector = () => {
  const [targetLanguage, setTargetLanguage] = useState('nl');
  
  return (
    <View>
      <Text>Target Language</Text>
      <Picker
        selectedValue={targetLanguage}
        onValueChange={setTargetLanguage}
      >
        <Picker.Item label="🇳🇱 Dutch (Nederlands)" value="nl" />
        <Picker.Item label="🇬🇧 English" value="en" />
      </Picker>
      
      <Text>Source: Auto-detected ✨</Text>
    </View>
  );
};
```

---

### 3. Caption Settings State Management

```javascript
const [captionSettings, setCaptionSettings] = useState({
  // Text settings
  wordsPerCaption: 5,
  fontFamily: 'Arial',
  fontSize: 24,
  textColor: '#FFFFFF',
  bold: false,
  italic: false,
  underline: false,
  allCaps: false,
  
  // Background settings
  backgroundColor: '#000000',
  backgroundOpacity: 0.8,
  
  // Effects
  shadow: true,
  outline: false,
  outlineColor: '#000000',
  outlineWidth: 2,
  
  // Position
  position: 'bottom', // 'top', 'center', 'bottom'
  verticalOffset: 50, // pixels from edge
  
  // Animation
  fadeIn: true,
  fadeOut: true,
  animationDuration: 0.3,
});
```

---

### 4. Caption Editor Component Structure

```javascript
<CaptionEditorWorkspace>
  <VideoPlayer
    videoUrl={videoUrl}
    captions={captions}
    currentTime={currentTime}
    captionSettings={captionSettings}
  />
  
  <CaptionTimeline
    captions={captions}
    onEdit={handleEditCaption}
    onDelete={handleDeleteCaption}
    onSplit={handleSplitCaption}
    currentTime={currentTime}
  />
  
  <CaptionSettingsPanel
    settings={captionSettings}
    onChange={setCaptionSettings}
  />
  
  <ExportPanel
    onExport={handleExport}
    options={exportOptions}
  />
</CaptionEditorWorkspace>
```

---

## 📋 Implementation Checklist

### Phase 1: Language Support
- [ ] Check Supadata API documentation for auto-detection
- [ ] Implement language selector component
- [ ] Add Turkish → Dutch support
- [ ] Add Turkish → English support
- [ ] Test auto-detection with Arabic/Turkish videos

### Phase 2: Caption Styles
- [ ] Create caption style presets (Classic, Modern, Bold, Minimal)
- [ ] Implement custom style editor
- [ ] Add live preview of caption styles
- [ ] Save user's preferred style

### Phase 3: Caption Settings
- [ ] Implement words-per-caption slider
- [ ] Add font family selector
- [ ] Add font size slider
- [ ] Add color pickers (text & background)
- [ ] Add text style toggles (bold, italic, etc.)
- [ ] Add position selector
- [ ] Add opacity slider

### Phase 4: Caption Editor
- [ ] Build caption timeline component
- [ ] Implement caption editing (inline editing)
- [ ] Add caption splitting functionality
- [ ] Add caption deletion
- [ ] Add caption merging
- [ ] Sync captions with video playback

### Phase 5: API Consolidation
- [ ] Combine video APIs into single `api/video.js`
- [ ] Combine caption APIs into single `api/caption.js`
- [ ] Update client-side code to use new endpoints
- [ ] Test all functionality
- [ ] Deploy and verify Vercel function count

### Phase 6: Export
- [ ] Implement SRT file export
- [ ] Implement video with burned-in captions
- [ ] Add export progress indicator
- [ ] Add download functionality

---

## 🎨 UI/UX Mockups

### Language Selection Screen
```
┌─────────────────────────────────────────────────────────┐
│  ← Back                    Caption Editor               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📹 Video Loaded                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │         [Video Thumbnail]                       │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🌍 Select Target Language                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🇳🇱 Dutch (Nederlands)                          │   │ ← Selected
│  ├─────────────────────────────────────────────────┤   │
│  │ 🇬🇧 English                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ℹ️ Source language will be auto-detected              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Continue to Caption Styles            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Caption Style Selection
```
┌─────────────────────────────────────────────────────────┐
│  ← Back                    Caption Styles               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Choose a caption style:                                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ● Modern                                        │   │ ← Selected
│  │   Yellow text, transparent background           │   │
│  │   ┌───────────────────────────────────────┐     │   │
│  │   │ [Video Preview]                       │     │   │
│  │   │ Dit is een ondertitel                 │     │   │ ← Preview
│  │   └───────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ○ Classic                                       │   │
│  │   White text, black background                  │   │
│  │   ┌───────────────────────────────────────┐     │   │
│  │   │ [Video Preview]                       │     │   │
│  │   │ ┌─────────────────────────────────┐   │     │   │
│  │   │ │ Dit is een ondertitel           │   │     │   │
│  │   │ └─────────────────────────────────┘   │     │   │
│  │   └───────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ○ Custom                                        │   │
│  │   Customize all settings                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Generate Captions                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Investigate Supadata API** - Check if auto-detection is supported
2. **Create spec** for Caption Editor improvements
3. **Design UI mockups** in Figma (optional)
4. **Implement Phase 1** (Language Support)
5. **Test with Arabic and Turkish videos**
6. **Iterate based on user feedback**

---

## 📞 Questions to Answer

1. **Does Supadata support auto-detection?**
   - If yes: Only show target language selector
   - If no: Show both source and target selectors

2. **What caption formats does Supadata return?**
   - SRT? VTT? JSON? Custom format?
   - This affects how we parse and display captions

3. **Can we edit captions after generation?**
   - Need API endpoint to update captions
   - Or handle editing client-side only?

4. **Export options:**
   - Burn captions into video (requires video processing)
   - Export SRT file only (simple)
   - Both options?

5. **Performance:**
   - How long does transcription take?
   - Show progress indicator?
   - Cache results?

---

**Last Updated:** 2026-05-17  
**Version:** 1.0.0
