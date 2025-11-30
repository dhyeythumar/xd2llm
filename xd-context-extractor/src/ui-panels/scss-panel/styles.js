module.exports = `<style>
    .container {
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-height: 100vh;
        overflow-y: auto;
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
    }
    .section-content {
        padding: 12px;
    }
    .prop-header {
        font-size: 14px;
        font-weight: 600;
        color: #495057;
        margin-bottom: 8px;
    }
    .prop {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        font-size: 12px;
        border-bottom: 1px solid #f0f0f0;
    }
    .prop:last-child {
        border-bottom: none;
    }
    .prop-label {
        color: #666;
        font-weight: 500;
        min-width: 100px;
    }
    .prop-value {
        color: #333;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 11px;
        padding: 2px 6px;
        background: #f8f9fa;
        border-radius: 3px;
    }
    .prop-value.variable {
        color: #0066cc;
        background: #e6f3ff;
    }
    .prop-value.direct {
        color: #cc6600;
        background: #fff3e6;
    }
    .code-section {
        margin-top: 16px;
    }
    .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #2d3748;
        color: white;
        padding: 8px 12px;
        border-radius: 4px 4px 0 0;
    }
    .code-title {
        font-size: 13px;
        font-weight: 600;
        margin: 0;
    }
    #copy-btn {
        margin: 0;
        padding: 4px 8px;
        font-size: 11px;
        border-radius: 3px;
        color: white;
        cursor: pointer;
        font-weight: 500;
    }
    #output {
        background: #1a202c;
        color: #e2e8f0;
        border-radius: 0 0 4px 4px;
        padding: 16px;
        font-family: 'Monaco', 'Menlo', 'Fira Code', monospace;
        font-size: 13px;
        line-height: 1.6;
        white-space: pre;
        overflow-x: auto;
    }
    .scss-property {
        color: #63b3ed;
    }
    .scss-variable {
        color: #68d391;
    }
    .scss-value {
        color: #fbb6ce;
    }
    .scss-comment {
        color: #a0aec0;
        font-style: italic;
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
</style>`;
