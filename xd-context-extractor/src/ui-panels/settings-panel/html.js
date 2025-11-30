module.exports = `<div class="container">
    <div id="content">
        <div class="header">
            <h3 class="title">Settings</h3>
            <p class="subtitle">Configure plugin settings and variables.</p>
        </div>
        
        <div class="section" id="style-variables-section">
            <div class="section-header">
                <span>Custom Style Variables Mapping</span>
            </div>
            <div class="section-content">
                <label for="style-variables-input" class="input-label">
                    JSON format custom style variables mapping example:<br>
                    <pre>{
                        "color": {"#667980": "$color-slate", ...},
                        "borderRadius": {"4px": "$border-radius-sm", ...},
                        "bgColor": {"#e1e8e7": "$bg-color-primary", ...},
                        ...
                    }</pre>
                </label>
                <textarea 
                    id="style-variables-input" 
                    class="json-input user-input" 
                    placeholder='Input JSON string here...'
                    rows="12"
                ></textarea>
                <div class="error-message hide"></div>
            </div>
            <button type="button" class="save-button hide">Save Settings</button>
        </div>
        
        <div id="save-status" class="save-status hide"></div>
    </div>
</div>`;
