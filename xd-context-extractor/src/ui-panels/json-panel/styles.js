module.exports = `<style>
    .container {
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-height: 100vh;
        overflow-y: auto;
    }
    #content {
        margin-top: 16px;
    }
    .header {
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e0e0e0;
    }
    .title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        margin: 0 0 4px 0;
    }
    .subtitle {
        font-size: 12px;
        color: #666;
        margin: 0;
    }
    .section {
        margin-bottom: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
    }
    .section-header {
        background: #f8f9fa;
        padding: 8px 12px;
        border-bottom: 1px solid #e0e0e0;
        font-size: 13px;
        font-weight: 600;
        color: #495057;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .section-content {
        padding: 12px;
    }
    .tree {
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 11px;
        line-height: 1.4;
        background: #f8f8f8;
        padding: 12px;
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;
        white-space: pre-wrap;
    }
    .json-section {
        margin-top: 16px;
    }
    .json-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #2d3748;
        color: white;
        padding: 8px 12px;
        border-radius: 4px 4px 0 0;
    }
    .json-title {
        font-size: 13px;
        font-weight: 600;
        margin: 0;
    }
    #copy-btn {
        margin: 0;
        font-size: 11px;
        color: white;
        cursor: pointer;
        font-weight: 500;
    }
    #copy-btn:hover {
        background: #2d3748;
    }
    #output {
        background: #1a202c;
        color: #e2e8f0;
        border-radius: 0 0 4px 4px;
        padding: 16px;
        font-family: 'Monaco', 'Menlo', 'Fira Code', monospace;
        font-size: 11px;
        line-height: 1.6;
        white-space: pre-wrap;
        overflow-x: auto;
        max-height: 400px;
        overflow-y: auto;
    }
    .warning {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
        padding: 12px;
        margin: 16px 0;
        font-size: 12px;
        color: #856404;
        text-align: center;
    }
    .show { display: block; }
    .hide { display: none; }
    .element-count {
        background: #007ACC;
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: bold;
    }
    .connection-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 12px;
        border: 1px solid;
        transition: all 0.3s ease;
    }
    .connection-status.connected {
        background: #d4edda;
        border-color: #c3e6cb;
        color: #155724;
    }
    .connection-status.disconnected {
        background: #f8d7da;
        border-color: #f5c6cb;
        color: #721c24;
    }
    .connection-status.reconnecting {
        background: #fff3cd;
        border-color: #ffeaa7;
        color: #856404;
    }
    .connection-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
        margin-right: 4px;
    }
    .connection-dot.connected {
        background: #28a745;
        box-shadow: 0 0 4px rgba(40, 167, 69, 0.5);
    }
    .connection-dot.disconnected {
        background: #dc3545;
    }
    .connection-dot.reconnecting {
        background: #ffc107;
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    .retry-button {
        margin: 0;
        margin-left: 8px;
        font-size: 10px; 
        color: white;
        cursor: pointer;
        font-weight: 500;
        display: none;
    }
    .retry-button.show {
        display: inline-block;
    }
</style>`;
