// Post-export adjustments for PWA on web
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const distDir = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const indexPath = path.join(distDir, 'index.html');
const manifestPath = path.join(distDir, 'manifest.json');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyPWAIcons() {
  const icons = [
    { src: 'icon.png', dest: 'icon.png' },
    { src: 'icon-192.png', dest: 'icon-192.png' },
    { src: 'icon-512.png', dest: 'icon-512.png' },
    { src: 'icon.png', dest: 'apple-touch-icon.png' }
  ];

  icons.forEach(icon => {
    try {
      const srcPath = path.join(publicDir, icon.src);
      const destPath = path.join(distDir, icon.dest);
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${icon.src} to ${icon.dest}`);
      } else {
        console.warn(`${icon.src} not found in public directory; skipping copy`);
      }
    } catch (e) {
      console.error(`Failed to copy ${icon.src}:`, e);
    }
  });
}

function writeManifest() {
  const manifest = {
    name: "AVT - Arabic Video Translator",
    short_name: "AVT",
    description: "Transcribe and translate Arabic videos with duas detection",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#151A22",
    background_color: "#151A22",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ],
    categories: ["productivity", "utilities"],
    lang: "en-US",
    dir: "ltr"
  };
  try {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('Wrote manifest.json with all PWA icons');
  } catch (e) {
    console.error('Failed to write manifest.json:', e);
  }
}

function patchIndexHtml() {
  try {
    let html = fs.readFileSync(indexPath, 'utf8');
    html = html.replace(
      /<meta name="viewport"[^>]+>/i,
      '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />'
    );
    if (!html.includes('apple-mobile-web-app-capable')) {
      html = html.replace(
        '</head>',
        [
          '  <meta name="apple-mobile-web-app-capable" content="yes" />',
          '  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
          '  <meta name="theme-color" content="#0b0f14" />',
          '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
          '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
          '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />',
          '  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
          '  <link rel="manifest" href="/manifest.json" />',
          '  <style>',
          '    html, body { background: #0b0f14; }',
          '    input, textarea, select { font-size: 16px; }',
          '    html, body { scrollbar-width: none; -ms-overflow-style: none; }',
          '    ::-webkit-scrollbar { width: 0; height: 0; display: none; }',
          '    body { font-family: Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Helvetica Neue\", sans-serif; }',
          '  </style>',
          '</head>',
        ].join('\n')
      );
      console.log('Patched index.html with PWA meta tags, anti-zoom CSS, scrollbar hidden, and Inter font');
    }
    fs.writeFileSync(indexPath, html, 'utf8');
  } catch (e) {
    console.error('Failed to patch index.html:', e);
  }
}

ensureDir(distDir);
copyPWAIcons();
writeManifest();
patchIndexHtml();
