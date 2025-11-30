module.exports = `<div class="container">
    <div id="content" class="hide">
        <div class="header">
            <h3 class="title">SCSS Extractor</h3>
            <p class="subtitle">Show SCSS properties from selected XD element</p>
        </div>
        
        <div class="section">
            <div class="section-header">Properties</div>
            <div class="section-content" id="scss-properties"></div>
        </div>
        
        <div class="code-section">
            <div class="code-header">
                <h4 class="code-title">Generated SCSS</h4>
                <button id="copy-btn" type="button">Copy SCSS</button>
            </div>
            <div id="output"></div>
        </div>
    </div>

    <div id="warning" class="warning show">
        Please select an <strong>element</strong> in your Adobe XD document to generate SCSS styles.<br>
        <small>Supports: Text (typography), Rectangle, Ellipse (background & dimensions)</small>
    </div>
</div>`;
