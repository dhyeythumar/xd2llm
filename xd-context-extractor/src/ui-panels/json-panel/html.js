module.exports = `<div class="container">
    <div id="connection-status" class="connection-status disconnected">
        <div class="connection-dot disconnected"></div>
        <span id="connection-text">Disconnected</span>
        <button id="retry-button" class="retry-button" type="button">Retry</button>
    </div>

    <div id="content" class="hide">
        <div class="header">
            <h3 class="title">JSON Extractor</h3>
            <p class="subtitle">Extract comprehensive design context for LLM-powered UI component generation.</p>
        </div>
        
        <div class="section">
            <div class="section-header">
                <span>Component Hierarchy</span>
                <span id="element-count" class="element-count">0 elements</span>
            </div>
            <div class="section-content">
                <div id="tree" class="tree"></div>
            </div>
        </div>
        
        <div class="json-section">
            <div class="json-header">
                <h4 class="json-title">📋 Design Data</h4>
                <button id="copy-btn" type="button">Copy JSON</button>
            </div>
            <div id="output"></div>
        </div>
    </div>
    
    <div id="warning" class="warning show">
        Please select an <strong>element or group</strong> in your Adobe XD document to extract design information.<br>
        <small>Supports: Groups (recursive), Text, Shapes, Images - Perfect for React component generation!</small>
    </div>
</div>`;
