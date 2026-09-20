#!/bin/bash

# Generate All Files Script
# This script can be used to regenerate project structure or verify file existence

echo "Arabic Video Translator - File Generation Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Project root found"
echo ""

# Verify key files exist
echo "Checking key files..."

files=(
    "App.js"
    "app.json"
    "babel.config.js"
    "metro.config.js"
    "src/navigation/AppNavigator.js"
    "src/navigation/StackNavigator.js"
    "src/screens/SplashScreen.js"
    "src/screens/UploadScreen.js"
    "src/screens/ConfigureScreen.js"
    "src/screens/ProcessingScreen.js"
    "src/screens/ResultsScreen.js"
    "src/services/whisperService.js"
    "src/services/translationService.js"
    "src/services/duaService.js"
    "src/services/audioProcessor.js"
    "src/services/colabService.js"
    "src/services/fileHandler.js"
    "src/utils/constants.js"
    "src/utils/storage.js"
    "src/utils/textProcessor.js"
    "src/utils/validators.js"
)

missing_files=()

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (MISSING)"
        missing_files+=("$file")
    fi
done

echo ""

if [ ${#missing_files[@]} -eq 0 ]; then
    echo -e "${GREEN}All key files are present!${NC}"
else
    echo -e "${YELLOW}Warning: ${#missing_files[@]} file(s) are missing${NC}"
    echo "Missing files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
fi

echo ""
echo "Checking dependencies..."

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found. Run 'npm install'"
fi

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check if token is set
    if grep -q "EXPO_PUBLIC_HUGGING_FACE_TOKEN=" .env && ! grep -q "EXPO_PUBLIC_HUGGING_FACE_TOKEN=$" .env; then
        echo -e "${GREEN}✓${NC} HuggingFace token appears to be configured"
    else
        echo -e "${YELLOW}⚠${NC} HuggingFace token may not be configured in .env"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found. Create one from .env.example"
fi

echo ""
echo "Script completed!"
echo ""
echo "Next steps:"
echo "1. Ensure .env file is configured with your HuggingFace token"
echo "2. Run 'npm install' if dependencies are missing"
echo "3. Run 'npm start' to start the development server"

