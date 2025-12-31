# XD2LLM

A comprehensive ecosystem for bridging Adobe XD with AI assistants and Large Language Models (LLMs), enabling real-time design data extraction and AI-powered design to code workflows.

## 🏗️ Architecture Overview

XD2LLM consists of two core components that work together to enable AI-powered design to code workflows:

### 🔌 [XD Context Extractor](./xd-context-extractor/)

Adobe XD plugin that extracts design specifications and shares them with external services.

**[📖 Read Plugin Documentation →](./xd-context-extractor/README.md)**

### 🌐 [XD LLM Connector](./xd-llm-connector/)

MCP (Model Context Protocol) server that bridges XD plugins with LLMs using real-time WebSocket communication.

**[📖 Read Server Documentation →](./xd-llm-connector/README.md)**

## 🔄 How It Works

### **Flow Diagram**

<p align="center">
    <img src="./images/flow-diagram.png" class="image" alt="Flow Diagram" height="400">
</p>

0. User selects any UI group/component inside the Adobe XD app.
1. Upon prompt, AI Assistant calls MCP tools (e.g., "get selected XD node").
2. XD Server accepts the request & forwards it to the XD plugin via WebSocket bridge.
3. XD Plugin extracts design data and responds back to the XD server.
4. Response flows back through the chain to the AI.

### Sequence Diagram

<p align="center">
    <img src="./images/sequence-diagram.png" class="image" alt="Sequence Diagram" height="400">
</p>

## 🚀 Quick Start

1. **XD Context Extractor & XD LLM Connector Setup**:

    ```bash
    # Note: Keep your Adobe XD app closed while setting up the plugin.
    # This command will set up the XD Context Extractor plugin and XD LLM Connector.

    npm run setup
    ```

2. **Start MCP Server**:

    ```bash
    xd2llm-server
    ```

3. **Configure LLM Client**:
   
   Configure your MCP-compatible LLM client (Claude Desktop, Cursor, etc.) with:

-   **Endpoint**: `http://localhost:4000/mcp`
-   **Detailed setup**: See [XD LLM Connector Setup Guide](./xd-llm-connector/SETUP.md)

## 📋 Prerequisites

-   **Adobe XD**
-   **Node.js** 22.0.0 or higher
-   **MCP-compatible LLM client** (Claude Desktop, Cursor, etc.)

## 💡 What You Can Do

-   **🤖 AI-Powered Design Analysis**: Get intelligent insights about your XD designs.
-   **📝 Design System Documentation**: Automatically extract design tokens and specifications.
-   **⚡ Code Generation**: Generate React components with CSS/SCSS directly from XD designs.
-   **🔄 Design-to-Code Workflows**: Seamlessly bridge design and development processes.

## 📊 Performance Results

XD2LLM delivers exceptional improvements over traditional AI-generated UI code:

-   **+50% Average Accuracy Improvement** across all complexity levels.
-   **60-90% Structure Accuracy** achieved with XD2LLM.
-   **Consistent Performance** from easy to hard complexity components.

**[📈 View Detailed Results & Comparisons →](./RESULTS.md)**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both XD Context Extractor and XD LLM Connector
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

<style>
.image {
    max-width: 100%;
    width: auto;
    height: 400px;
    object-fit: cover;
    border-radius: 4px;
    align: center;
}
</style>
