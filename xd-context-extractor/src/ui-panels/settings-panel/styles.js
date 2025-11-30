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
    .input-label {
        display: block;
        font-size: 12px;
        color: #666;
        font-weight: 500;
        margin-bottom: 8px;
    }
    .example-code {
        font-family: 'Monaco', 'Menlo', 'Fira Code', monospace;
        font-size: 11px;
        line-height: 1.6;
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 12px;
        margin: 8px 0 12px 0;
        color: #333;
        white-space: pre;
        overflow-x: auto;
        display: block;
    }
    .json-input {
        width: 100%;
        min-height: 200px;
        max-height: 400px;
        margin: 0;
        font-family: 'Monaco', 'Menlo', 'Fira Code', monospace;
        font-size: 11px;
        line-height: 1.6;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #f8f9fa;
        color: #333;
        overflow-x: auto;
        overflow-y: auto;
        resize: vertical;
        box-sizing: border-box;
    }
    .json-input:focus {
        outline: none;
        border-color: #007ACC;
        background: #fff;
        box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
    }
    .error-message {
        margin: 0 12px 12px 12px;
        padding: 8px 12px;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        color: #721c24;
        font-size: 11px;
        font-family: 'Monaco', 'Menlo', monospace;
    }
    .save-button {
        flex: 1;
        padding: 0 16px;
        font-size: 13px;
        font-weight: 600;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .save-button {
        color: white;
    }
    .save-status {
        margin-top: 12px;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        text-align: center;
    }
    .save-status.success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }
    .save-status.error {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }
    .save-status.hide {
        display: none;
    }
    .show { display: block; }
    .hide { display: none; }
</style>`;
