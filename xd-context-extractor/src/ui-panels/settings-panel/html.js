const exampleCode = `{
    "color": {"#667980": "$color-slate", ...},
    "borderRadius": {"4px": "$border-radius-sm", ...},
    "bgColor": {"#e1e8e7": "$bg-color-primary", ...},
    "fontFamily": {"verdana": "$font-verdana", ...},
    "fontWeight": {"bold": "$font-weight-bold", ...},
    "fontSize": {"16": "$font-size-16", ...},
    "fontColor": {"#000000": "$default-font-color", ...},
}`;

module.exports = `<div class="container">
    <div id="content">
        <div class="header">
            <h3 class="title">Settings</h3>
            <p class="subtitle">Configure plugin settings and variables.</p>
        </div>
        
        <div class="section" id="style-variables-section">
            <div class="section-header">
                <span>Custom Style Variables</span>
            </div>
            <div class="section-content">
                <label for="style-variables-input" class="input-label">
                    JSON format for custom style variables:
                </label>
                <pre class="example-code">${exampleCode}</pre>
                <textarea 
                    id="style-variables-input" 
                    class="json-input user-input" 
                    placeholder='Input JSON string here...'
                    rows="12"
                    required
                    autocomplete="off"
                    spellcheck="false"
                ></textarea>
            </div>
            <div class="error-message hide"></div>
            <button type="button" class="save-button hide">Save Settings</button>
        </div>
        
        <div id="save-status" class="save-status hide"></div>
    </div>
</div>`;
