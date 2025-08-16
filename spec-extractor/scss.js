const { UIHelper, rgbToHex, copyToClipboard } = require('../utils/helper.js');
const { SCSS_VARIABLE_MAP, ACCEPTABLE_CSS_VALUES } = require('../utils/const.js');

const { selection } = require('scenegraph');
let scssPanel;

/**
 * - **Display & Layout**: Properties like: `display`, `position`, `top/right/bottom/left`, `flex`, `grid`, `z-index`, `overflow`, `visibility`.
 *
 * - **Box Model**: Properties like: `width`, `height`, `margin`, `padding`, `box-sizing`, `border`, `outline`.
 *
 * - **Backgrounds**: Properties like: `background-color`, `background-image`, `background-*`.
 *
 * - **Typography**: Properties like: `font-family`, `font-weight`, `font-size`, `font-style`, `color`, `line-height`, `letter-spacing`, `text-align`, `text-transform`, `text-decoration`, `white-space`.
 *
 * - **Visual Effects**: Properties like: `opacity`, `box-shadow`, `border-radius`, `transform`, `filter`, `pointer-events`.
 *
 * - **Transitions & Animations**
 *
 * - **Pseudo-elements & pseudo-classes**: Properties like: `::before`, `::after`, `:hover`, `:focus`, `:active`
 */

function create() {
    scssPanel = document.createElement('div');
    scssPanel.innerHTML = `
        <style>
            .scss-container {
                padding: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-height: 100vh;
                overflow-y: auto;
            }
            .scss-header {
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e0e0e0;
            }
            .scss-title {
                font-size: 16px;
                font-weight: bold;
                color: #333;
                margin: 0 0 4px 0;
            }
            .scss-subtitle {
                font-size: 12px;
                color: #666;
                margin: 0;
            }
            .scss-section {
                margin-bottom: 16px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
            }
            .scss-section-header {
                background: #f8f9fa;
                padding: 8px 12px;
                border-bottom: 1px solid #e0e0e0;
                font-size: 13px;
                font-weight: 600;
                color: #495057;
            }
            .scss-section-content {
                padding: 12px;
            }
            .scss-prop-header {
                font-size: 14px;
                font-weight: 600;
                color: #495057;
                margin-bottom: 8px;
            }
            .scss-prop {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 0;
                font-size: 12px;
                border-bottom: 1px solid #f0f0f0;
            }
            .scss-prop:last-child {
                border-bottom: none;
            }
            .scss-prop-label {
                color: #666;
                font-weight: 500;
                min-width: 100px;
            }
            .scss-prop-value {
                color: #333;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 11px;
                padding: 2px 6px;
                background: #f8f9fa;
                border-radius: 3px;
            }
            .scss-prop-value.variable {
                color: #0066cc;
                background: #e6f3ff;
            }
            .scss-prop-value.direct {
                color: #cc6600;
                background: #fff3e6;
            }
            .scss-code-section {
                margin-top: 16px;
            }
            .scss-code-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #2d3748;
                color: white;
                padding: 8px 12px;
                border-radius: 4px 4px 0 0;
            }
            .scss-code-title {
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
        </style>
        
        <div class="scss-container">
            <div id="spec-content" class="hide">
                <div class="scss-header">
                    <h3 class="scss-title">SCSS Generator</h3>
                    <p class="scss-subtitle">Show SCSS properties from selected XD element</p>
                </div>
                
                <div class="scss-section">
                    <div class="scss-section-header">Properties</div>
                    <div class="scss-section-content" id="scss-properties"></div>
                </div>
                
                <div class="scss-code-section">
                    <div class="scss-code-header">
                        <h4 class="scss-code-title">Generated SCSS</h4>
                        <button id="copy-btn" type="button">Copy SCSS</button>
                    </div>
                    <div id="output"></div>
                </div>
            </div>
            
            <div id="spec-warning" class="warning show">
                Please select a <strong>text element</strong> in your Adobe XD document to generate SCSS typography styles.
            </div>
        </div>
    `;

    // Add event listeners
    scssPanel.querySelector('#copy-btn').addEventListener('click', (event) => copyToClipboard(event, '#output'));

    return scssPanel;
}

function displayProperties(properties, elementName) {
    const container = scssPanel.querySelector('#scss-properties');
    container.innerHTML = '';
    scssPanel.querySelector('.scss-section-header').innerHTML = `Properties: ${elementName}`;

    Object.entries(properties).forEach(([property, value]) => {
        if (value) {
            const propDiv = document.createElement('div');
            propDiv.className = 'scss-prop';

            const isVariable = value.toString().startsWith('$');
            const valueClass = isVariable ? 'variable' : 'direct';

            propDiv.innerHTML = `
                <span class="scss-prop-label">${property}:</span>
                <span class="scss-prop-value ${valueClass}">${value}</span>
            `;

            container.appendChild(propDiv);
        }
    });
}

function displaySCSS(scss) {
    const container = scssPanel.querySelector('#output');

    // Add syntax highlighting
    const highlightedCode = scss
        .replace(/^(\.[a-z-]+)/gm, '<span class="scss-property">$1</span>')
        .replace(/(\$[a-zA-Z]+[a-zA-Z0-9-]*)/g, '<span class="scss-variable">$1</span>')
        .replace(/(: )([^;]+)(;)/g, '$1<span class="scss-value">$2</span>$3')
        .replace(/(\/\*.*?\*\/)/g, '<span class="scss-comment">$1</span>');

    container.innerHTML = highlightedCode;
}

/**
 * Format of Typography properties in SCSS:
 * ----------------------------------------
 * font-family: <variable-name>;
 * font-weight: <variable-name>;
 * font-size: <variable-name>;
 * color: <variable-name>;
 * line-height: 18px;
 * letter-spacing: 0.66px;
 * text-align: left;
 * text-decoration: none;
 * text-transform: uppercase;
 */
function extractTextProperties(textItem) {
    const properties = {};

    // -------------------------------------------------------------
    // Font Family
    // -------------------------------------------------------------
    const fontFamily = textItem.fontFamily.toLowerCase();
    properties.fontFamily = SCSS_VARIABLE_MAP.fontFamily[fontFamily];

    // -------------------------------------------------------------
    // Font Weight (aka fontStyle in XD)
    // -------------------------------------------------------------
    const fontStyle = (textItem.fontStyle || 'Regular').toLowerCase();
    properties.fontWeight = SCSS_VARIABLE_MAP.fontWeight[fontStyle];

    // -------------------------------------------------------------
    // Font Size
    // -------------------------------------------------------------
    const fontSize = textItem.fontSize ?? 14;
    properties.fontSize = SCSS_VARIABLE_MAP.fontSize[fontSize] || `${fontSize}px`;

    // -------------------------------------------------------------
    // Color
    // -------------------------------------------------------------
    let colorValue = '#000000';
    if (textItem.fill && textItem.fill.constructor.name === 'Color') {
        colorValue = rgbToHex(textItem.fill).toLowerCase();
    }
    properties.color = SCSS_VARIABLE_MAP.color[colorValue] || colorValue;

    // -------------------------------------------------------------
    // Line Height
    // -------------------------------------------------------------
    const localBounds = textItem.localBounds;
    const lineSpacing = textItem.lineSpacing || localBounds.height || 0;
    if (lineSpacing > 0) properties.lineHeight = `${lineSpacing}px`;
    else properties.lineHeight = 'normal';

    // -------------------------------------------------------------
    // Letter Spacing (charSpacing is in 1/1000th of font size)
    // -------------------------------------------------------------
    const charSpacing = textItem.charSpacing || 0;
    if (charSpacing !== 0) {
        // Convert from 1/1000th of font size to pixels
        const letterSpacingPx = (charSpacing * fontSize) / 1000;
        properties.letterSpacing = `${letterSpacingPx.toFixed(2)}px`;
    }

    // -------------------------------------------------------------
    // Text Align (Mostly incorrect, hence depends on user to set it correctly)
    // -------------------------------------------------------------
    // properties.textAlign = textItem.textAlign || 'left';

    // -------------------------------------------------------------
    // Text Decoration - Check for underline and strikethrough
    // -------------------------------------------------------------
    if (textItem.underline && textItem.strikethrough) properties.textDecoration = 'underline line-through';
    else if (textItem.underline) properties.textDecoration = 'underline';
    else if (textItem.strikethrough) properties.textDecoration = 'line-through';
    else properties.textDecoration = 'none';

    // -------------------------------------------------------------
    // Text Transform
    // -------------------------------------------------------------
    if (textItem.textTransform === 'titlecase') properties.textTransform = 'capitalize';
    else properties.textTransform = textItem.textTransform || 'none';

    // -------------------------------------------------------------
    // Display Properties
    // -------------------------------------------------------------
    const elementName = textItem.name || 'text-element';
    displayProperties(properties, elementName);

    return properties;
}

function generateTextSCSS(properties) {
    let scss = '';

    // Add properties in the order specified in comments
    if (properties.fontFamily) {
        scss += `font-family: ${properties.fontFamily};\n`;
    }
    if (properties.fontWeight) {
        scss += `font-weight: ${properties.fontWeight};\n`;
    }
    if (properties.fontSize) {
        scss += `font-size: ${properties.fontSize};\n`;
    }
    if (properties.color) {
        scss += `color: ${properties.color};\n`;
    }
    if (properties.lineHeight) {
        scss += `line-height: ${properties.lineHeight};\n`;
    }
    if (properties.letterSpacing) {
        scss += `letter-spacing: ${properties.letterSpacing};\n`;
    }
    // if (properties.textAlign && properties.textAlign !== 'left') {
    //     scss += `text-align: ${properties.textAlign};\n`;
    // }
    if (properties.textDecoration && properties.textDecoration !== 'none') {
        scss += `text-decoration: ${properties.textDecoration};\n`;
    }
    if (properties.textTransform && ACCEPTABLE_CSS_VALUES.textTransform.includes(properties.textTransform)) {
        scss += `text-transform: ${properties.textTransform};\n`;
    }

    // -------------------------------------------------------------
    // Display the SCSS code
    // -------------------------------------------------------------
    displaySCSS(scss);

    return scss;
}

// -------------------------------------------------------------
// Panel Functions
// -------------------------------------------------------------

function show(event) {
    if (!scssPanel) event.node.appendChild(create());
}

// Clean up or hide panel-specific content
function hide() {
    scssPanel.remove();
    scssPanel = null;
}

function update() {
    if (!scssPanel) return;

    const selectedItem = selection?.items?.[0];
    if (!selectedItem) {
        UIHelper.toggleSpecContent(scssPanel, false);
        return;
    }

    // Handle different types of XD Nodes / Elements
    switch (selectedItem.constructor.name) {
        case 'Text': {
            generateTextSCSS(extractTextProperties(selectedItem));
            break;
        }
        default: {
            UIHelper.toggleSpecContent(scssPanel, false);
            return;
        }
    }

    UIHelper.toggleSpecContent(scssPanel, true);
}

module.exports = {
    show,
    hide,
    update,
};
