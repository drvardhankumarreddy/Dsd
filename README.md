<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/162hYdJkWENEB5s3bSKrmtp2wKhZdgzwx

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Convert Gemini shared links to PDF

This repository now includes a CLI helper that opens Gemini public shared links in a headless browser and exports the full conversation to PDF.

1. Install dependencies:
   `npm install`
2. Install Chromium for Playwright (first run only):
   `npx playwright install chromium`
3. Export one or more links:
   `npm run gemini:pdf -- https://g.co/gemini/share/<share-id> [more-links...] --out-dir ./exports`

### Example

```bash
npm run gemini:pdf -- https://g.co/gemini/share/abc123 https://g.co/gemini/share/def456 --out-dir ./exports
```

Generated PDFs are saved in the selected output directory (defaults to `./exports`).
