// TODO :: deprecated, remove this

const { UIHelper, rgbToHex, copyToClipboard } = require('../utils/helper.js');

const { selection } = require('scenegraph');
const { Rectangle, Text, Ellipse } = require('scenegraph');
let jsonPanel;

function create() {
    jsonPanel = document.createElement('div');
    jsonPanel.innerHTML = `
        <style>
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
            .spec-section {
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
            .spec-item {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 6px 0;
                font-size: 12px;
                border-bottom: 1px solid #f0f0f0;
            }
            .spec-item:last-child {
                border-bottom: none;
            }
            .spec-label {
                color: #666;
                font-weight: 500;
                min-width: 80px;
                margin-right: 12px;
            }
            .spec-value {
                color: #333;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 11px;
                word-break: break-all;
                text-align: right;
                flex: 1;
            }
            .json-section {
                margin-top: 16px;
            }
            .json-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8f9fa;
                padding: 8px 12px;
                border: 1px solid #e0e0e0;
                border-bottom: none;
                border-radius: 4px 4px 0 0;
            }
            .json-title {
                font-size: 13px;
                font-weight: 600;
                color: #495057;
                margin: 0;
            }
            #copy-btn {
                padding: 4px 8px;
                font-size: 11px;
                border: 1px solid #007ACC;
                border-radius: 3px;
                background: #007ACC;
                color: white;
                cursor: pointer;
                font-weight: 500;
            }
            #copy-btn:hover {
                background: #005a9e;
            }
            #copy-btn.copied {
                background: #28a745;
                border-color: #28a745;
            }
            .json-output {
                background: #f8f8f8;
                border: 1px solid #e0e0e0;
                border-top: none;
                border-radius: 0 0 4px 4px;
                padding: 12px;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 11px;
                white-space: pre-wrap;
                max-height: 300px;
                overflow-y: auto;
                line-height: 1.4;
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
            .color-preview {
                display: inline-block;
                width: 16px;
                height: 16px;
                border-radius: 2px;
                border: 1px solid #ccc;
                margin-left: 8px;
                vertical-align: middle;
            }
        </style>
        
        <div class="container">
            <div id="spec-content" class="hide">
                <div class="header">
                    <h3 class="title">Element Specifications</h3>
                    <p class="subtitle">Comprehensive details of selected element</p>
                </div>
                
                <div class="spec-section">
                    <div class="section-header">Basic Information</div>
                    <div class="section-content" id="basicInfo"></div>
                </div>
                
                <div class="spec-section">
                    <div class="section-header">Dimensions & Position</div>
                    <div class="section-content" id="dimensions"></div>
                </div>
                
                <div class="spec-section">
                    <div class="section-header">Visual Properties</div>
                    <div class="section-content" id="visualProps"></div>
                </div>
                
                <div class="spec-section">
                    <div class="section-header">Typography</div>
                    <div class="section-content" id="typography"></div>
                </div>
                
                <div class="spec-section">
                    <div class="section-header">Transform & Effects</div>
                    <div class="section-content" id="transforms"></div>
                </div>
                
                <div class="json-section">
                    <div class="json-header">
                        <h4 class="json-title">Complete Specifications (JSON)</h4>
                        <button id="copy-btn" type="button">Copy JSON</button>
                    </div>
                    <div id="output" class="json-output"></div>
                </div>
            </div>
            
            <div id="spec-warning" class="warning show">
                Please select an element in your Adobe XD document to extract its specifications.
            </div>
        </div>
    `;

    // Add event listeners
    jsonPanel.querySelector('#copy-btn').addEventListener('click', (event) => copyToClipboard(event, '#output'));

    return jsonPanel;
}

function extractComprehensiveSpecs(item) {
    const specs = {
        basic: {},
        dimensions: {},
        visual: {},
        typography: {},
        transforms: {},
        metadata: {},
    };

    // Basic Information
    specs.basic = {
        name: item.name || 'Unnamed',
        type: item.constructor.name,
        guid: item.guid,
        visible: item.visible,
        locked: item.locked || false,
        hasDefaultName: item.hasDefaultName || false,
    };

    // Dimensions & Position
    const bounds = item.globalBounds;
    const localBounds = item.localBounds;

    specs.dimensions = {
        globalBounds: {
            x: Math.round(bounds.x * 100) / 100,
            y: Math.round(bounds.y * 100) / 100,
            width: Math.round(bounds.width * 100) / 100,
            height: Math.round(bounds.height * 100) / 100,
        },
        localBounds: {
            x: Math.round(localBounds.x * 100) / 100,
            y: Math.round(localBounds.y * 100) / 100,
            width: Math.round(localBounds.width * 100) / 100,
            height: Math.round(localBounds.height * 100) / 100,
        },
    };

    // Visual Properties
    specs.visual = {
        opacity: item.opacity || 1,
        blendMode: item.blendMode || 'normal',
        fill: extractFillInfo(item.fill),
        stroke: extractStrokeInfo(item),
        shadow: extractShadowInfo(item.shadow),
        blur: extractBlurInfo(item.blur),
    };

    // Type-specific properties
    if (item instanceof Rectangle) {
        specs.visual.cornerRadii = extractCornerRadii(item.cornerRadii);
    } else if (item instanceof Text) {
        specs.typography = extractTextProperties(item);
        specs.visual.textFill = extractFillInfo(item.fill);
    } else if (item instanceof Ellipse) {
        specs.visual.isCircle = item.isCircle || false;
        specs.visual.startAngle = item.startAngle || 0;
        specs.visual.endAngle = item.endAngle || 360;
    }

    // Transform properties
    specs.transforms = {
        rotation: item.rotation || 0,
        flipY: item.flipY || false,
    };

    // Metadata
    specs.metadata = {
        extractedAt: new Date().toISOString(),
        pluginVersion: '1.0.0',
        xdVersion: 'Unknown', // XD doesn't expose version info to plugins
    };

    return specs;
}

function extractFillInfo(fill) {
    if (!fill) return null;

    const fillInfo = {
        type: fill.constructor.name,
    };

    if (fill.constructor.name === 'Color') {
        fillInfo.color = {
            r: Math.round(fill.r),
            g: Math.round(fill.g),
            b: Math.round(fill.b),
            a: Math.round(fill.a * 100) / 100,
            hex: rgbToHex(fill),
        };
    } else if (fill.constructor.name === 'LinearGradient') {
        fillInfo.gradient = {
            startX: fill.startX,
            startY: fill.startY,
            endX: fill.endX,
            endY: fill.endY,
            colorStops: fill.colorStops.map((stop) => ({
                stop: stop.stop,
                color: {
                    r: Math.round(stop.color.r),
                    g: Math.round(stop.color.g),
                    b: Math.round(stop.color.b),
                    a: Math.round(stop.color.a * 100) / 100,
                },
            })),
        };
    }

    return fillInfo;
}

function extractStrokeInfo(item) {
    if (!item.stroke) return null;

    return {
        color: extractFillInfo(item.stroke),
        width: item.strokeWidth || 0,
        position: item.strokePosition || 'inside',
        endCaps: item.strokeEndCaps || 'none',
        joins: item.strokeJoins || 'miter',
        miterLimit: item.strokeMiterLimit || 4,
        dashArray: item.strokeDashArray || [],
        dashOffset: item.strokeDashOffset || 0,
    };
}

function extractShadowInfo(shadow) {
    if (!shadow) return null;

    return {
        type: shadow.constructor.name,
        x: shadow.x || 0,
        y: shadow.y || 0,
        blur: shadow.blur || 0,
        color: extractFillInfo(shadow.color),
        visible: shadow.visible || false,
    };
}

function extractBlurInfo(blur) {
    if (!blur) return null;

    return {
        blurAmount: blur.blurAmount || 0,
        brightnessAmount: blur.brightnessAmount || 0,
        fillOpacity: blur.fillOpacity || 1,
        visible: blur.visible || false,
    };
}

function extractCornerRadii(cornerRadii) {
    if (!cornerRadii) return null;

    return {
        topLeft: cornerRadii.topLeft || 0,
        topRight: cornerRadii.topRight || 0,
        bottomRight: cornerRadii.bottomRight || 0,
        bottomLeft: cornerRadii.bottomLeft || 0,
    };
}

function extractTextProperties(textItem) {
    const textProps = {
        content: textItem.text || '',
        fontFamily: textItem.fontFamily || 'Arial',
        fontStyle: textItem.fontStyle || 'Regular',
        fontSize: textItem.fontSize || 12,
        textAlign: textItem.textAlign || 'left',
        lineSpacing: textItem.lineSpacing || 0,
        characterSpacing: textItem.charSpacing || 0,
        textTransform: textItem.textTransform || 'none',
        textScript: textItem.textScript || 'none',
        paragraphSpacing: textItem.paragraphSpacing || 0,
        flipY: textItem.flipY || false,
    };

    // Additional text properties if available
    if (textItem.styleRanges && textItem.styleRanges.length > 0) {
        textProps.styleRanges = textItem.styleRanges.map((range) => ({
            length: range.length,
            fontSize: range.fontSize,
            fontFamily: range.fontFamily,
            fontStyle: range.fontStyle,
            fill: extractFillInfo(range.fill),
            charSpacing: range.charSpacing,
            underline: range.underline,
            strikethrough: range.strikethrough,
            textTransform: range.textTransform,
            textScript: range.textScript,
        }));
    }

    return textProps;
}

function displaySpecs(specs) {
    displayBasicInfo(specs.basic);
    displayDimensions(specs.dimensions);
    displayVisualProps(specs.visual);
    displayTypography(specs.typography);
    displayTransforms(specs.transforms);
    displayJson(specs);
}

function displayBasicInfo(basic) {
    const container = jsonPanel.querySelector('#basicInfo');
    container.innerHTML = '';

    Object.entries(basic).forEach(([key, value]) => {
        const item = createSpecItem(key, value);
        container.appendChild(item);
    });
}

function displayDimensions(dimensions) {
    const container = jsonPanel.querySelector('#dimensions');
    container.innerHTML = '';

    // Global bounds
    const globalHeader = document.createElement('div');
    globalHeader.style.fontWeight = 'bold';
    globalHeader.style.marginBottom = '8px';
    globalHeader.style.fontSize = '11px';
    globalHeader.textContent = 'Global Bounds:';
    container.appendChild(globalHeader);

    Object.entries(dimensions.globalBounds).forEach(([key, value]) => {
        const item = createSpecItem(key, `${value}px`);
        container.appendChild(item);
    });

    // Local bounds
    const localHeader = document.createElement('div');
    localHeader.style.fontWeight = 'bold';
    localHeader.style.marginTop = '12px';
    localHeader.style.marginBottom = '8px';
    localHeader.style.fontSize = '11px';
    localHeader.textContent = 'Local Bounds:';
    container.appendChild(localHeader);

    Object.entries(dimensions.localBounds).forEach(([key, value]) => {
        const item = createSpecItem(key, `${value}px`);
        container.appendChild(item);
    });
}

function displayVisualProps(visual) {
    const container = jsonPanel.querySelector('#visualProps');
    container.innerHTML = '';

    Object.entries(visual).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            let displayValue = value;

            if (key === 'fill' && value && value.color) {
                displayValue = value.color.rgba;
                const item = createSpecItem(key, displayValue, value.color.hex);
                container.appendChild(item);
            } else if (typeof value === 'object') {
                displayValue = JSON.stringify(value, null, 2);
                const item = createSpecItem(key, displayValue);
                container.appendChild(item);
            } else {
                const item = createSpecItem(key, displayValue);
                container.appendChild(item);
            }
        }
    });
}

function displayTypography(typography) {
    const container = jsonPanel.querySelector('#typography');
    container.innerHTML = '';

    if (Object.keys(typography).length === 0) {
        const noData = document.createElement('div');
        noData.style.color = '#999';
        noData.style.fontStyle = 'italic';
        noData.style.fontSize = '11px';
        noData.textContent = 'Not applicable for this element type';
        container.appendChild(noData);
        return;
    }

    Object.entries(typography).forEach(([key, value]) => {
        if (key !== 'styleRanges') {
            const item = createSpecItem(key, value);
            container.appendChild(item);
        }
    });
}

function displayTransforms(transforms) {
    const container = jsonPanel.querySelector('#transforms');
    container.innerHTML = '';

    Object.entries(transforms).forEach(([key, value]) => {
        let displayValue = value;
        if (key === 'rotation') {
            displayValue = `${value}°`;
        }
        const item = createSpecItem(key, displayValue);
        container.appendChild(item);
    });
}

function createSpecItem(label, value, colorHex = null) {
    const item = document.createElement('div');
    item.className = 'spec-item';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'spec-label';
    labelSpan.textContent = label;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'spec-value';
    valueSpan.textContent = value;

    item.appendChild(labelSpan);
    item.appendChild(valueSpan);

    // Add color preview if it's a color value
    if (colorHex) {
        const colorPreview = document.createElement('span');
        colorPreview.className = 'color-preview';
        colorPreview.style.backgroundColor = colorHex;
        valueSpan.appendChild(colorPreview);
    }

    return item;
}

function displayJson(specs) {
    const container = jsonPanel.querySelector('#output');
    container.textContent = JSON.stringify(specs, null, 2);
}

// -------------------------------------------------------------
// Panel Functions
// -------------------------------------------------------------

function show(event) {
    if (!jsonPanel) event.node.appendChild(create());
}

// Clean up or hide panel-specific content
function hide() {
    jsonPanel.remove();
    jsonPanel = null;
}

function update() {
    if (!jsonPanel) return;

    const selectedItem = selection?.items?.[0];
    if (!selectedItem) {
        UIHelper.toggleSpecContent(jsonPanel, false);
        return;
    }

    const specs = extractComprehensiveSpecs(selectedItem);
    displaySpecs(specs);

    UIHelper.toggleSpecContent(jsonPanel, true);
}

module.exports = {
    show,
    hide,
    update,
};
