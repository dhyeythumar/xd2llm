# Adobe XD Context Extractor Plugin

Adobe XD plugin that extracts design specifications from XD mockups.

## 🚀 Key Features

-   **📊 Real-time Design Extraction**: Comprehensive specifications from XD elements via WebSocket
-   **📋 Multiple Export Formats**: JSON (LLM-optimized) and SCSS with design token support
-   **🖼️ Image Export**: Optimized Base64 PNG export with configurable scaling

**Supported Elements**: Text, Shapes (Rectangle, Ellipse, Path, Line), Groups, Symbol Instances, and Scrollable Groups with complete hierarchical structure.

## 📋 Output Formats

### JSON Format (LLM-Optimized)

Perfect for feeding design data to AI assistants for code generation:

```json
{
    "nodeType": "TEXT",
    "nodeValue": "Hello World",
    "properties": {
        "fontFamily": "Stevie Sans",
        "fontWeight": "bold",
        "fontSize": 16,
        "color": "#000000",
        "lineHeight": 1.5,
        "letterSpacing": 1,
        "textAlign": "left",
        "textDecoration": "none",
        "textTransform": "none"
    },
    "children": null
}
```

### SCSS Format

Ready-to-use CSS/SCSS for direct implementation:

```scss
// Typography
font-family: $font-primary;
font-weight: $font-weight-bold;
font-size: 16px;
color: $color-text-primary;
line-height: 1.5;
letter-spacing: 1px;
text-decoration: none;
text-transform: none;

// Layout & Styling
width: 96px;
height: 96px;
border: 1px solid $border-color;
border-radius: $border-radius-md;
background-color: $background-primary;
```

**Note: Variables will be returned if a style value to variable map is provided in the settings panel inside the Adobe XD plugin.**

## 🛠️ Installation & Development

### Quick Start

```bash
# Install dependencies
npm install

# Install plugin in XD (development mode)
npm run plugin:install

# Restart Adobe XD

# Optional: Enable live reload during development
npm run plugin:watch
```

### Production Build

```bash
# Validate and package for distribution
npm run plugin:validate
npm run plugin:package

# Install the generated .xdx file in Adobe XD
```

## 🔧 Usage

### Plugin Panels

| Panel | Shortcut | Output |
|-------|----------|--------|
| **Design Info Extractor (for LLMs)** | `Ctrl+Shift+D` | JSON format optimized for AI/LLM consumption |
| **Design Specs in SCSS** | `Ctrl+Shift+S` | SCSS format with design token variables |
| **Settings** | `Ctrl+Shift+Z` | Configure WebSocket connection and variable mappings |

### Workflow

1. Select any XD element or group
2. Open desired panel (`Ctrl+Shift+D` for JSON or `Ctrl+Shift+S` for SCSS)
3. Copy formatted output or use WebSocket for real-time AI integration

## 🛠️ Development

### Project Structure

```
xd-context-extractor/
├── main.js                    # Plugin entry point
├── manifest.json              # Plugin configuration
├── src/
│   ├── ui-panels/            # Panel implementations
│   ├── extractors/           # Design property extractors
│   ├── services/             # WebSocket communication
│   └── utils/                # Helper functions & constants
└── images/                   # Plugin icons
```

### Adding New Extractors

1. Create an extractor in the `src/extractors/` directory
2. Export the extraction function following existing patterns
3. Import and integrate in the relevant panel
4. Update output format documentation

> Note: This plugin is part of the [XD2LLM](../README.md) project.

## 📚 References

-   [Adobe XD UXP Documentation](https://developer.adobe.com/xd/uxp/)
-   [Adobe XD SceneNode Reference](https://developer.adobe.com/xd/uxp/develop/reference/SceneNode/)
