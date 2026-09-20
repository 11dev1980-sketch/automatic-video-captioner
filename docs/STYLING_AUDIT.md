# Styling Consistency Audit

## Design System Rules

### Button Styles
1. **Primary Buttons** (Call-to-action):
   - Background: `colors.primary` (#ff3366 - pink)
   - Text: `colors.white` (#ffffff)
   - Use for: Main actions, submit buttons, start processing

2. **Secondary Buttons** (Less emphasis):
   - Background: `colors.surface` or `colors.glassLight`
   - Border: `colors.border` or `colors.glassBorder`
   - Text: `colors.primary` (pink) or `colors.text` (white)
   - Use for: Cancel, secondary actions, import/add

3. **Text Colors**:
   - Primary text: `colors.text` (#ffffff - white)
   - Secondary text: `colors.textSecondary` (#d1d5db - light gray)
   - Tertiary text: `colors.textTertiary` (#9ca3af - medium gray)

## Current Inconsistencies Found

### ✅ Consistent (No changes needed):
1. **HomeScreen** - quickStartButton: Pink background, white text ✓
2. **DownloadPage** - downloadButton: Pink background, white text ✓
3. **Button Component** - Primary variant: Uses colors.text (white) ✓

### ⚠️ Needs Review (Secondary buttons - intentional design):
1. **VideoLibraryScreen**:
   - importButton: Surface background, pink text (secondary style)
   - emptyButton: Surface background, pink text (secondary style)
   - **Decision**: These are intentionally secondary buttons, which is correct for "Import" actions

### Typography Consistency:
- All screens should use typography system from `src/styles/typography.js`
- Button text should use `typography.button`
- Headings should use `typography.h1`, `typography.h2`, etc.

## Recommendations

### Keep Current Design:
The app actually has good consistency:
- **Primary actions** (Start Processing, Download) = Pink button with white text
- **Secondary actions** (Import, Add) = Surface button with pink text
- This creates a clear visual hierarchy

### Areas to Standardize:

1. **Border Radius**:
   - Use `layout.radius.md` (12px) for buttons consistently
   - Use `layout.radius.lg` for cards

2. **Spacing**:
   - Use `layout.spacing.*` constants instead of hardcoded values
   - Ensure consistent padding in cards and containers

3. **Font Sizes**:
   - Use typography system instead of hardcoded fontSize values
   - Ensures consistency across all text elements

## Action Items

1. ✅ Verify all primary buttons use white text
2. ✅ Verify all secondary buttons use pink text
3. ⚠️ Replace hardcoded font sizes with typography system
4. ⚠️ Replace hardcoded spacing with layout constants
5. ⚠️ Ensure consistent border radius usage
