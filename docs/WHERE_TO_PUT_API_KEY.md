# Where to Put Your Supadata API Key - Step by Step

## ⚠️ IMPORTANT: Do NOT put the API key in your code files!

The API key goes in **Vercel Dashboard**, not in any file in your project.

---

## Step-by-Step Instructions with Screenshots

### Step 1: Open Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. Log in if needed
3. You should see a list of your projects

### Step 2: Select Your Project

1. Find and click on: **arabic-video-translator**
2. You'll see the project overview page

### Step 3: Go to Settings

1. At the top of the page, click the **Settings** tab
2. You'll see a menu on the left side

### Step 4: Click Environment Variables

1. In the left menu, click **Environment Variables**
2. You'll see a list of environment variables (if any exist)

### Step 5: Find or Add SUPADATA_API_KEY

**If you see `SUPADATA_API_KEY` in the list:**
1. Click the three dots (...) on the right side of `SUPADATA_API_KEY`
2. Click **Edit**
3. You'll see a form with the current value

**If you DON'T see `SUPADATA_API_KEY`:**
1. Click the **Add New** button (top right)
2. You'll see a form to add a new variable

### Step 6: Enter the API Key

Fill in the form:

**Name (Key):**
```
SUPADATA_API_KEY
```
(Type exactly this, no spaces)

**Value:**
```
[Paste your Supadata API key here]
```
**IMPORTANT:**
- Paste ONLY the key
- No quotes: ❌ `"sk_123..."`
- No spaces: ❌ `sk_123... `
- No "Bearer": ❌ `Bearer sk_123...`
- Just the key: ✅ `sk_1234567890abcdef...`

**Environments:**
Check ALL THREE boxes:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 7: Save

1. Click the **Save** button
2. You should see `SUPADATA_API_KEY` in the list
3. The value will show as `•••••••` (hidden for security)
4. Under it, you should see: "Production, Preview, Development"

### Step 8: Redeploy

**CRITICAL:** Changes only apply to NEW deployments!

**Option A - Via Dashboard:**
1. Click **Deployments** tab (at the top)
2. Find the latest deployment
3. Click the three dots (...) on the right
4. Click **Redeploy**
5. Wait 2-3 minutes

**Option B - Via Command Line:**
```bash
vercel --prod --force
```

### Step 9: Verify

After deployment completes, run:
```bash
test-api.bat
```

Should show:
- ✅ `"apiKeyConfigured": true`
- ✅ No `AUTH_ERROR`

---

## Visual Guide

Here's what you're looking for at each step:

### Vercel Dashboard
```
┌─────────────────────────────────────────┐
│  Vercel Dashboard                       │
├─────────────────────────────────────────┤
│  Projects:                              │
│  ┌─────────────────────────────────┐   │
│  │ arabic-video-translator    ←────┼───┤ Click this
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Project Page
```
┌─────────────────────────────────────────┐
│  Overview  Deployments  Settings  ←─────┼─── Click Settings
├─────────────────────────────────────────┤
│  arabic-video-translator                │
└─────────────────────────────────────────┘
```

### Settings Page
```
┌──────────────────┬──────────────────────┐
│  General         │                      │
│  Domains         │  Environment         │
│  Environment     │  Variables           │
│  Variables   ←───┼──────────────────────┤ Click this
│  Git             │                      │
└──────────────────┴──────────────────────┘
```

### Environment Variables Page
```
┌─────────────────────────────────────────┐
│  Environment Variables      [Add New]   │ ← Click if no key exists
├─────────────────────────────────────────┤
│  SUPADATA_API_KEY                  ... │ ← Click ... to edit
│  •••••••••••••••••••••••••••••••••     │
│  Production, Preview, Development       │
└─────────────────────────────────────────┘
```

### Add/Edit Form
```
┌─────────────────────────────────────────┐
│  Name                                   │
│  ┌─────────────────────────────────┐   │
│  │ SUPADATA_API_KEY                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Value                                  │
│  ┌─────────────────────────────────┐   │
│  │ sk_1234567890abcdef...          │   │ ← Paste key here
│  └─────────────────────────────────┘   │
│                                         │
│  Environments                           │
│  ☑ Production                           │ ← Check all three
│  ☑ Preview                              │
│  ☑ Development                          │
│                                         │
│  [Cancel]  [Save]                       │ ← Click Save
└─────────────────────────────────────────┘
```

---

## Common Mistakes

### ❌ WRONG: Adding to .env file
```
# .env
SUPADATA_API_KEY=sk_123...  ← This does NOT work for production
```
This only works for local development, NOT for Vercel production.

### ❌ WRONG: Adding to code
```javascript
// api/transcribe.js
const apiKey = "sk_123...";  ← NEVER do this!
```
This exposes your key in Git and is a security risk.

### ❌ WRONG: Only checking Production
```
Environments:
☑ Production
☐ Preview      ← Need to check these too!
☐ Development
```

### ✅ CORRECT: Vercel Dashboard
```
Vercel Dashboard → Settings → Environment Variables
Name: SUPADATA_API_KEY
Value: sk_1234567890abcdef...
Environments: ☑ Production ☑ Preview ☑ Development
```

---

## Troubleshooting

### "I added it but still getting AUTH_ERROR"

**Did you redeploy?**
- Changes only apply to NEW deployments
- You MUST redeploy after adding/updating the key
- Run: `vercel --prod --force`

**Is the key correct?**
- Copy it fresh from Supadata dashboard
- Make sure no extra spaces or characters
- Should start with `sk_`

**Did you check all environments?**
- Must check Production, Preview, AND Development
- If you only checked Production, it won't work for all deployments

### "I can't find Environment Variables"

Make sure you're in the right place:
1. Vercel Dashboard (not GitHub, not your code editor)
2. Your project (arabic-video-translator)
3. Settings tab (at the top)
4. Environment Variables (in the left menu)

### "The value shows as dots"

That's correct! Vercel hides the value for security.
- Shows as: `•••••••`
- This is normal and expected

### "How do I know if it's set correctly?"

Run the test:
```bash
test-api.bat
```

Should show:
```json
{
  "config": {
    "apiKeyConfigured": true,
    "apiKeyLength": 35
  }
}
```

If `apiKeyConfigured` is `false`, it's not set.
If you get `AUTH_ERROR`, the key is invalid.

---

## Quick Checklist

- [ ] Opened Vercel Dashboard (https://vercel.com/dashboard)
- [ ] Selected arabic-video-translator project
- [ ] Clicked Settings tab
- [ ] Clicked Environment Variables in left menu
- [ ] Added/edited SUPADATA_API_KEY
- [ ] Pasted the key (no quotes, no spaces)
- [ ] Checked all three environments
- [ ] Clicked Save
- [ ] Redeployed (vercel --prod --force)
- [ ] Waited 2-3 minutes
- [ ] Ran test-api.bat
- [ ] Verified no AUTH_ERROR

---

## Still Need Help?

If you're still stuck, take a screenshot of:
1. Your Vercel Environment Variables page
2. The test-api.bat output

This will help identify exactly what's wrong.

---

**Remember:** The API key goes in Vercel Dashboard, NOT in your code!
