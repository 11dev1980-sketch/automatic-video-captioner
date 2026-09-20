# Icon Generation Scripts

This folder contains scripts to generate and process PWA icons for the Arabic Video Translator app.

## Using Your Custom Icon (Recommended)

To use your own custom icon design:

1. Edit `process_custom_icon.py` and update the source image path:
   ```python
   source_image = r"C:\path\to\your\icon.png"
   ```

2. Run the script:
   ```bash
   pip install Pillow
   python scripts/process_custom_icon.py
   ```

The script will automatically:
- Load your custom icon (supports PNG, JPG, etc.)
- Resize it to all required sizes with high-quality resampling
- Generate icons for both assets/ and public/ folders
- Optimize the output files

### Requirements for Custom Icons
- Source image should be square (1:1 aspect ratio)
- Recommended minimum size: 1024×1024 pixels
- Supports PNG, JPG, and other common formats
- Works best with transparent backgrounds (PNG)

## Alternative: Generate Icons Programmatically

### Option 1: Python Script

Generate a monochrome premium design:

```bash
pip install Pillow
python scripts/generate_icons.py
```

### Option 2: Node.js Script

```bash
npm install canvas
node scripts/generate-icons.js
```

### Option 3: Browser-based Generator

Open `scripts/generate-pwa-icon-premium.html` in a web browser and click the download buttons for each icon size.

## Generated Files

All scripts generate the following icons:

### Assets folder:
- `icon.png` (1024×1024) - Main app icon
- `adaptive-icon.png` (1024×1024) - Android adaptive icon
- `splash-icon.png` (1024×1024) - Splash screen icon
- `favicon.png` (48×48) - Browser favicon

### Public folder:
- `icon-512.png` (512×512) - PWA icon for high-resolution displays
- `icon-192.png` (192×192) - PWA icon for standard displays

## Icon Configuration

The icons are automatically configured in `app.json` under the `web.manifest.icons` section. No additional configuration needed after generation.

## Testing

After generating icons:
1. Review the generated icons in the assets/ and public/ folders
2. Build and deploy your app
3. Test PWA installation on different devices (Chrome, Edge, Safari)
4. Verify the icon appears correctly in the app drawer and home screen
