#!/usr/bin/env python3
"""
PWA Icon Generator for Arabic Video Translator
Generates professional app icons with video and translation elements
"""

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow package not found. Please install it with: pip install Pillow")
    exit(1)

def draw_icon(size=1024):
    """Draw a premium, professional monochrome icon"""
    
    # Create image with white background
    img = Image.new('RGB', (size, size), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    scale = size / 1024
    center = int(512 * scale)
    
    # Draw main black rounded square with subtle shadow effect
    # Outer shadow (very subtle)
    shadow_size = int(450 * scale)
    for i in range(5):
        alpha = int(10 - i * 2)
        offset = i * 2
        draw.rounded_rectangle(
            [center - shadow_size - offset, center - shadow_size - offset,
             center + shadow_size + offset, center + shadow_size + offset],
            radius=int(120 * scale),
            fill=(200, 200, 200)
        )
    
    # Main black rounded square
    main_size = int(440 * scale)
    draw.rounded_rectangle(
        [center - main_size, center - main_size,
         center + main_size, center + main_size],
        radius=int(110 * scale),
        fill=(0, 0, 0)
    )
    
    # Draw elegant play button with geometric precision
    # Triangle positioned perfectly in center
    play_size = int(160 * scale)
    play_offset_x = int(20 * scale)  # Slight offset to right for visual balance
    
    play_points = [
        (center - play_size + play_offset_x, center - play_size),
        (center - play_size + play_offset_x, center + play_size),
        (center + play_size + play_offset_x, center)
    ]
    draw.polygon(play_points, fill=(255, 255, 255))
    
    # Draw minimalist Arabic calligraphy element
    # Elegant curved line representing Arabic script
    line_width = int(16 * scale)
    
    # Top curve (representing Arabic flow)
    curve_y = center - int(200 * scale)
    curve_start_x = center - int(150 * scale)
    curve_end_x = center + int(150 * scale)
    
    # Draw smooth curve using multiple line segments
    points = []
    for i in range(30):
        t = i / 29
        x = curve_start_x + (curve_end_x - curve_start_x) * t
        # Bezier-like curve
        y = curve_y - int(40 * scale * (4 * t * (1 - t)))
        points.append((int(x), int(y)))
    
    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=(255, 255, 255), width=line_width)
    
    # Bottom curve (mirrored)
    curve_y_bottom = center + int(200 * scale)
    points_bottom = []
    for i in range(30):
        t = i / 29
        x = curve_start_x + (curve_end_x - curve_start_x) * t
        y = curve_y_bottom + int(40 * scale * (4 * t * (1 - t)))
        points_bottom.append((int(x), int(y)))
    
    for i in range(len(points_bottom) - 1):
        draw.line([points_bottom[i], points_bottom[i + 1]], fill=(255, 255, 255), width=line_width)
    
    # Add subtle corner accent marks (premium detail)
    accent_size = int(30 * scale)
    accent_width = int(6 * scale)
    accent_offset = int(340 * scale)
    
    # Top-left accent
    draw.line(
        [(center - accent_offset, center - accent_offset),
         (center - accent_offset + accent_size, center - accent_offset)],
        fill=(255, 255, 255), width=accent_width
    )
    draw.line(
        [(center - accent_offset, center - accent_offset),
         (center - accent_offset, center - accent_offset + accent_size)],
        fill=(255, 255, 255), width=accent_width
    )
    
    # Top-right accent
    draw.line(
        [(center + accent_offset, center - accent_offset),
         (center + accent_offset - accent_size, center - accent_offset)],
        fill=(255, 255, 255), width=accent_width
    )
    draw.line(
        [(center + accent_offset, center - accent_offset),
         (center + accent_offset, center - accent_offset + accent_size)],
        fill=(255, 255, 255), width=accent_width
    )
    
    # Bottom-left accent
    draw.line(
        [(center - accent_offset, center + accent_offset),
         (center - accent_offset + accent_size, center + accent_offset)],
        fill=(255, 255, 255), width=accent_width
    )
    draw.line(
        [(center - accent_offset, center + accent_offset),
         (center - accent_offset, center + accent_offset - accent_size)],
        fill=(255, 255, 255), width=accent_width
    )
    
    # Bottom-right accent
    draw.line(
        [(center + accent_offset, center + accent_offset),
         (center + accent_offset - accent_size, center + accent_offset)],
        fill=(255, 255, 255), width=accent_width
    )
    draw.line(
        [(center + accent_offset, center + accent_offset),
         (center + accent_offset, center + accent_offset - accent_size)],
        fill=(255, 255, 255), width=accent_width
    )
    
    return img

def main():
    """Generate all required icon sizes"""
    
    # Get project directories
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    assets_dir = project_dir / 'assets'
    public_dir = project_dir / 'public'
    
    # Create directories if they don't exist
    assets_dir.mkdir(exist_ok=True)
    public_dir.mkdir(exist_ok=True)
    
    print("Generating PWA icons...")
    
    # Generate main icon (1024x1024)
    icon_1024 = draw_icon(1024)
    icon_1024.save(assets_dir / 'icon.png', 'PNG', quality=95)
    print("✓ Generated icon.png (1024x1024)")
    
    # Generate adaptive icon (1024x1024)
    icon_1024.save(assets_dir / 'adaptive-icon.png', 'PNG', quality=95)
    print("✓ Generated adaptive-icon.png (1024x1024)")
    
    # Generate splash icon (1024x1024)
    icon_1024.save(assets_dir / 'splash-icon.png', 'PNG', quality=95)
    print("✓ Generated splash-icon.png (1024x1024)")
    
    # Generate favicon (48x48)
    icon_48 = draw_icon(48)
    icon_48.save(assets_dir / 'favicon.png', 'PNG', quality=95)
    print("✓ Generated favicon.png (48x48)")
    
    # Generate PWA icons for public folder
    icon_512 = draw_icon(512)
    icon_512.save(public_dir / 'icon-512.png', 'PNG', quality=95)
    print("✓ Generated public/icon-512.png (512x512)")
    
    icon_192 = draw_icon(192)
    icon_192.save(public_dir / 'icon-192.png', 'PNG', quality=95)
    print("✓ Generated public/icon-192.png (192x192)")
    
    print("\n✅ All icons generated successfully!")
    print("\nNext steps:")
    print("1. Review the generated icons in the assets/ and public/ folders")
    print("2. The app.json manifest is already configured to use these icons")
    print("3. Test the PWA installation on different devices")

if __name__ == '__main__':
    main()
