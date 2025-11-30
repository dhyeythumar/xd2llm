# Adobe XD Context Extractor Plugin

Adobe XD plugin that extracts design specifications from XD mockups.

## 🚀 Key Features

-   **📊 Real-time Design Extraction**: Extract comprehensive design specifications from XD elements
-   **🌐 WebSocket Communication**: Real-time bridge to MCP servers and AI assistants
-   **📋 Multiple Export Formats**: JSON (LLM-optimized) and SCSS output formats
-   **🖼️ Image Export**: Optimized Base64 PNG export with configurable scaling
-   **🎨 Design Token Generation**: Automatic extraction for design systems

### Supported Elements

-   **Text Elements**: Complete typography specifications (font, size, color, spacing, alignment)
-   **Shapes**: Rectangle, Ellipse with dimensions, borders, backgrounds
-   **Groups**: Hierarchical structure with nested elements

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

## 🛠️ Installation

### Development Mode

```bash
# Install dependencies
npm install

# Install plugin in XD
npm run plugin:install

# Restart Adobe XD

# Optional: Enable live reload
npm run plugin:watch
```

### Production Mode

```bash
# Validate and package
npm run plugin:validate
npm run plugin:package

# Install the generated .xdx file in Adobe XD
```

## 🔧 Usage

### Plugin Panels

The plugin provides two main panels accessible from the XD menu:

1. **Design Info Extractor (for LLMs)**

    - Shortcut: `Ctrl+Shift+D` (Mac)
    - JSON output optimized for AI/LLM consumption
    - Real-time WebSocket communication

2. **Design Specs in SCSS**
    - Shortcut: `Ctrl+Shift+S` (Mac)
    - SCSS output ready for implementation
    - Design token variables

### Workflow

1. **Select Elements**: Choose any XD element or group
2. **Extract Specifications**: Use either panel to extract design data
3. **Copy or Export**: Get formatted output for your workflow
4. **AI Integration**: Feed JSON data to LLMs for code generation

## 🌐 WebSocket Integration

Built-in WebSocket connector for real-time communication with MCP servers and AI assistants.

## 📋 Prerequisites

-   **Adobe XD** with plugin development enabled
-   **Node.js** 16.0.0 or higher
-   **Adobe XD CLI Tools** (`@adobe/xdpm`)

## 🛠️ Development

### Project Structure

```
xd-plugin/
├── main.js                    # Plugin entry point
├── manifest.json              # Plugin configuration
├── panels/
│   ├── design-extractor.js    # JSON extraction panel
│   └── scss.js               # SCSS extraction panel
├── extractors/
│   ├── text.js               # Text properties extractor
│   └── background.js         # Background properties extractor
├── services/
│   └── ws-connector.js       # WebSocket communication
├── utils/
│   ├── helper.js             # Utility functions
│   └── const.js              # Constants and configuration
└── images/                   # Plugin icons
```

### Available Scripts

```bash
# Development
npm run plugin:install    # Install in development mode
npm run plugin:watch      # Enable live reload
npm run plugin:validate   # Validate plugin structure
npm run plugin:package    # Package for distribution
```

### Adding New Extractors

1. Create extractor in `extractors/` directory
2. Export extraction function following the pattern
3. Import and use in relevant panel
4. Update output format documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Adobe XD
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🔗 Integration

This plugin is part of the [XD Ecosystem](../README.md) that includes:

-   **XD Server**: MCP server bridge between XD and AI assistants
-   **Real-time Communication**: EventEmitter-based WebSocket architecture
-   **AI-Powered Workflows**: Direct integration with LLMs for design-to-code

## 📚 References

-   [Adobe XD UXP Documentation](https://developer.adobe.com/xd/uxp/)
-   [Adobe XD SceneNode Reference](https://developer.adobe.com/xd/uxp/develop/reference/SceneNode/)
-   [XD Server Documentation](../xd-server/README.md)
-   [XD Server Setup Guide](../xd-server/SETUP.md)
