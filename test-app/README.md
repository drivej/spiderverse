# Leaves and Snow Test App

This is a test application for the `leaves-and-snow` package.

## Setup

```bash
cd test-app
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## What This Tests

- ✅ React component integration
- ✅ TypeScript compilation
- ✅ Asset bundling with Vite
- ✅ Responsive dimensions
- ✅ Proper cleanup on unmount

## Making Changes

Since this uses `"leaves-and-snow": "file:.."` in package.json, you need to:

1. Make changes to the parent package
2. Run `npm install` in test-app to pick up changes
3. Restart the dev server

Or use `npm link` for live updates (see parent README).

