# Leaves and Snow Animation 🍂❄️

A beautiful falling leaves and snow particle animation built with PixiJS, featuring atmospheric depth effects and interactive wind physics.

## ✨ Features

- 🎨 Beautiful particle animations with leaves and snowflakes
- 🌫️ Atmospheric perspective depth effects
- 🖱️ Interactive mouse/pointer-based wind physics
- ⚡ High performance WebGL rendering (60fps with 200+ particles)
- ⚛️ React component with TypeScript support
- 📦 Zero configuration - works out of the box
- 🎯 Fully responsive and customizable

---

## 📦 Installation

Install directly from GitHub:

```bash
npm install github:drivej/my-component
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "@drivej/my-component": "github:drivej/my-component"
  }
}
```

---

## 🚀 Quick Start

### Default Import (Recommended)

```tsx
import MyComponent from '@drivej/my-component';

function App() {
  return (
    <MyComponent />
  );
}
```

### Named Import

```tsx
import { MyComponent } from '@drivej/my-component';

function App() {
  return <MyComponent />;
}
```

### Fixed Size Container

```tsx
import LeavesAndSnowReact from '@drivej/my-component';

function App() {
  return (
    <div style={{ width: '800px', height: '600px', position: 'relative' }}>
      <MyComponent />
    </div>
  );
}

---

## 📋 API Reference

### React Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `width` | `number` | ✅ Yes | Canvas width in pixels |
| `height` | `number` | ✅ Yes | Canvas height in pixels |
| `className` | `string` | ❌ No | CSS class for container |
| `style` | `React.CSSProperties` | ❌ No | Inline styles for container |

### Vanilla JS Constructor Options

```typescript
interface LeavesAndSnowOptions {
  width?: number;          // Canvas width (default: window.innerWidth)
  height?: number;         // Canvas height (default: window.innerHeight)
  container?: HTMLElement; // Container element (default: document.body)
}
```

### TypeScript Support

Full TypeScript support with type definitions:

```tsx
import LeavesAndSnowReact, { LeavesAndSnowReactProps } from '@drivej/my-component';

const props: LeavesAndSnowReactProps = {
  width: 800,
  height: 600,
  className: 'my-animation',
  style: { position: 'absolute' }
};

<LeavesAndSnowReact {...props} />
```

---

## 🏗️ Development

### Project Structure

```
@drivej/my-component/
├── src/                         # Source files
│   ├── index.ts                # Main entry point
│   ├── LeavesAndSnowReact.tsx  # React component
│   ├── LeavesAndSnow.js        # Vanilla JS class
│   ├── Leaf.js                 # Leaf particle
│   ├── Snowflake.js            # Snowflake particle
│   ├── Pointer.js              # Mouse tracking
│   ├── utils.js                # Utilities
│   └── assets/                 # Image assets
│       ├── autumn_sky.png
│       ├── fall_woman.png
│       └── leaf.png
├── dist/                        # Built files (committed!)
│   ├── index.js                # Bundled code
│   ├── index.d.ts              # TypeScript definitions
│   └── *.js.map                # Source maps
├── package.json                # Package config
├── tsconfig.json               # TypeScript config
└── vite.config.build.ts        # Build config
```

### Building from Source

```bash
# Install dependencies
npm install

# Build the package
npm run build
```

This will:
1. Bundle all source files with Vite
2. Generate TypeScript declarations
3. Output to `dist/` folder

### Making Updates

When you make changes:

```bash
# 1. Make your code changes in src/
# 2. Rebuild
npm run build

# 3. Commit including dist/
git add .
git commit -m "Update build"
git push origin main
```

Users can then update:
```bash
npm install github:drivej/my-component
```

---

## 🧪 Local Testing

### Quick Test (Easiest)

From the root directory:

```bash
# Install test-app dependencies (first time only)
npm run test:install

# Run the test app
npm test
```

Open http://localhost:5173

### Manual Test

```bash
cd test-app
npm install
npm run dev
```

### Using npm link

```bash
# In leaves directory
npm link

# In your test project
npm link @drivej/my-component
```

---

## ⚡ Performance

- **WebGL Rendering** - Hardware-accelerated graphics
- **Optimized Particles** - 200+ particles at smooth 60fps
- **Efficient Rendering** - Depth-based tinting (no expensive filters)
- **Memory Management** - Proper cleanup on unmount
- **Asset Optimization** - Images bundled as base64 for faster loading

---

## 🌐 Browser Support

Works in all modern browsers that support:
- WebGL
- ES6 Modules
- PixiJS v8

Tested on:
- Chrome/Edge 87+
- Firefox 78+
- Safari 14+

---

## 📝 License

MIT

---

## 🙏 Credits

Built with [PixiJS](https://pixijs.com/) - The HTML5 Creation Engine

---

## 🔗 Links

- **Repository**: https://github.com/drivej/my-component
- **Issues**: https://github.com/drivej/my-component/issues

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the examples in this README
2. Review the TypeScript definitions
3. Open an issue on GitHub

---

**Enjoy your beautiful falling leaves animation!** 🍂❄️

