#!/usr/bin/env python3
"""
Process custom icon image into all required PWA sizes
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow package not found. Please install it with: pip install Pillow")
    exit(1)

def process_icon(source_path, output_sizes):
    """Process the source icon into multiple sizes"""
    
    # Open the source image
    try:
        img = Image.open(source_path)
        print(f"✓ Loaded source image: {source_path}")
        print(f"  Original size: {img.size}")
    except Exception as e:
        print(f"✗ Error loading image: {e}")
        return False
    
    # Convert to RGBA if needed
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get project directories
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    assets_dir = project_dir / 'assets'
    public_dir = project_dir / 'public'
    
    # Create directories if they don't exist
    assets_dir.mkdir(exist_ok=True)
    public_dir.mkdir(exist_ok=True)
    
    print("\nGenerating PWA icons...")
    
    # Generate each size
    for size_info in output_sizes:
        size = size_info['size']
        filename = size_info['filename']
        output_dir = size_info['dir']
        
        # Resize with high-quality resampling
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Determine output path
        if output_dir == 'assets':
            output_path = assets_dir / filename
        else:
            output_path = public_dir / filename
        
        # Save as PNG
        resized.save(output_path, 'PNG', quality=95, optimize=True)
        print(f"✓ Generated {output_path.relative_to(project_dir)} ({size}×{size})")
    
    return True

def main():
    # Source image path
    source_image = r"C:\Users\Mohammed\Downloads\Designer (2).png"
    
    # Check if source exists
    if not os.path.exists(source_image):
        print(f"✗ Source image not found: {source_image}")
        print("\nPlease ensure the image exists at the specified path.")
        return
    
    # Define all required sizes
    output_sizes = [
        {'size': 1024, 'filename': 'icon.png', 'dir': 'assets'},
        {'size': 1024, 'filename': 'adaptive-icon.png', 'dir': 'assets'},
        {'size': 1024, 'filename': 'splash-icon.png', 'dir': 'assets'},
        {'size': 48, 'filename': 'favicon.png', 'dir': 'assets'},
        {'size': 512, 'filename': 'icon-512.png', 'dir': 'public'},
        {'size': 192, 'filename': 'icon-192.png', 'dir': 'public'},
    ]
    
    # Process the icon
    success = process_icon(source_image, output_sizes)
    
    if success:
        print("\n✅ All icons generated successfully!")
        print("\nGenerated files:")
        print("  Assets folder:")
        print("    - icon.png (1024×1024)")
        print("    - adaptive-icon.png (1024×1024)")
        print("    - splash-icon.png (1024×1024)")
        print("    - favicon.png (48×48)")
        print("  Public folder:")
        print("    - icon-512.png (512×512)")
        print("    - icon-192.png (192×192)")
        print("\nNext steps:")
        print("1. Review the generated icons in the assets/ and public/ folders")
        print("2. The app.json manifest is already configured to use these icons")
        print("3. Test the PWA installation on different devices")
    else:
        print("\n✗ Icon generation failed")

if __name__ == '__main__':
    main()
