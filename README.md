# XD Ecosystem

A comprehensive ecosystem for bridging Adobe XD with AI assistants and Large Language Models (LLMs), enabling real-time design data extraction and AI-powered design workflows.

## 🏗️ Components

### 🔌 [XD Plugin](./xd-plugin/)
Adobe XD plugin that extracts design specifications and communicates with external services.

**Features:**
- Real-time design data extraction
- WebSocket communication
- JSON and SCSS export formats
- Design token generation
- Optimized image export (Base64 PNG with configurable scale)

**[📖 Read Plugin Documentation →](./xd-plugin/README.md)**

### 🌐 [XD MCP Server](./xd-server/)
Model Context Protocol (MCP) server that bridges XD plugins with LLMs using EventEmitter-based real-time communication.

**Features:**
- MCP-compatible tool interface
- Real-time WebSocket bridge
- Single connection architecture
- Structured logging for stdio

**[📖 Read Server Documentation →](./xd-server/README.md)**

## 🔄 How It Works

```
LLM Client ←→ MCP Server ←→ WebSocket ←→ Adobe XD Plugin
    ↑              ↑             ↑             ↑
AI Tools    Real-time Bridge  EventEmitter   Design Data
```

1. **AI Assistant** calls MCP tools (e.g., "get selected XD node")
2. **MCP Server** processes request via EventEmitter pattern
3. **WebSocket Bridge** sends real-time request to XD
4. **XD Plugin** extracts design data and responds
5. **Response flows back** through the chain to the AI

## 🚀 Quick Start

1. **Install XD Plugin**:
   ```bash
   cd xd-plugin
   npm install
   npm plugin:install
   # Load plugin in Adobe XD
   ```

2. **Start MCP Server**:
   ```bash
   cd xd-server
   npm install
   npm start
   ```

3. **Configure LLM Client** with MCP server endpoint

## 📋 Prerequisites

- **Adobe XD** with plugin development enabled
- **Node.js** 22.0.0 or higher
- **MCP-compatible LLM client** (Claude Desktop, Cursor, etc.)

## 🛠️ Development

Each component has its own development setup:

- **XD Plugin**: See [xd-plugin development guide](./xd-plugin/README.md#development)
- **MCP Server**: See [xd-server development guide](./xd-server/README.md#development)

## 📄 Documentation

| Component | Quick Start | Detailed Setup | Troubleshooting |
|-----------|-------------|----------------|-----------------|
| **XD Plugin** | [README](./xd-plugin/README.md) | - | - |
| **MCP Server** | [README](./xd-server/README.md) | [SETUP](./xd-server/SETUP.md) | [SETUP](./xd-server/SETUP.md#troubleshooting) |

## 💡 Use Cases

- **Design System Documentation**: Extract design tokens automatically
- **Code Generation**: Generate CSS/SCSS from XD designs
- **AI Design Review**: Automated design specification analysis
- **Design-to-Code Workflows**: Bridge design and development processes
- **Accessibility Audits**: Extract properties for accessibility analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both components
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**🔗 Component Links:**
- [XD Plugin Documentation](./xd-plugin/README.md)
- [MCP Server Documentation](./xd-server/README.md)
- [MCP Server Setup Guide](./xd-server/SETUP.md)
