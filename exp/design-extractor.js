const { selection, Text } = require('scenegraph');

const { extractTextProperties, extractBackgroundProperties } = require('../spec-extractor/helper-extractors.js');
const { UIHelper, copyToClipboard } = require('../utils/helper.js');

let designPanel;

/**
 * Design Info Extractor for LLM-powered React Component Generation
 *
 * Extracts comprehensive design information from XD elements in JSON format
 * that can be fed to an LLM to generate React components.
 *
 * Features:
 * - Recursive traversal of groups and nested elements
 * - Complete style extraction (colors, typography, layout)
 * - Semantic element classification
 * - Component hierarchy mapping
 * - Design system token mapping
 */

function create() {
    designPanel = document.createElement('div');
    designPanel.innerHTML = `
        <style>
            .design-container {
                padding: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-height: 100vh;
                overflow-y: auto;
            }
            .design-header {
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e0e0e0;
            }
            .design-title {
                font-size: 16px;
                font-weight: bold;
                color: #333;
                margin: 0 0 4px 0;
            }
            .design-subtitle {
                font-size: 12px;
                color: #666;
                margin: 0;
            }
            .design-section {
                margin-bottom: 16px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
            }
            .design-section-header {
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
            .design-section-content {
                padding: 12px;
            }
            .design-tree {
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
            .design-json-section {
                margin-top: 16px;
            }
            .design-json-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #2d3748;
                color: white;
                padding: 8px 12px;
                border-radius: 4px 4px 0 0;
            }
            .design-json-title {
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
                border: 1px solid #4a5568;
                background: #4a5568;
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
        </style>
        
        <div class="design-container">
            <div id="spec-content" class="hide">
                <div class="design-header">
                    <h3 class="design-title">🎨 Design Info Extractor</h3>
                    <p class="design-subtitle">Extract comprehensive design data for LLM-powered React component generation</p>
                </div>
                
                <div class="design-section">
                    <div class="design-section-header">
                        <span>Component Hierarchy</span>
                        <span id="element-count" class="element-count">0 elements</span>
                    </div>
                    <div class="design-section-content">
                        <div id="design-tree" class="design-tree"></div>
                    </div>
                </div>
                
                <div class="design-json-section">
                    <div class="design-json-header">
                        <h4 class="design-json-title">📋 Design Data</h4>
                        <button id="copy-btn" type="button">Copy JSON</button>
                    </div>
                    <div id="output"></div>
                </div>
            </div>
            
            <div id="spec-warning" class="warning show">
                Please select an <strong>element or group</strong> in your Adobe XD document to extract design information.<br>
                <small>Supports: Groups (recursive), Text, Shapes, Images - Perfect for React component generation!</small>
            </div>
        </div>
    `;

    // Add event listeners
    designPanel.querySelector('#copy-btn').addEventListener('click', (event) => copyToClipboard(event, '#output'));

    return designPanel;
}

/**
 * Extract comprehensive design information from XD Node
 * Recursively traverses groups and builds nested component structure
 */
function extractDesignInfo(node, depth = 0, parentBounds = null) {
    const info = {
        // Basic node information
        id: node.guid,
        nodeName: node.name || 'Unnamed Node',
        nodeType: node.constructor.name.toUpperCase(),
        semanticType: classifyNode(node),

        // Text content
        textContent: node instanceof Text ? node.text || 'Placeholder Text' : null,

        visualProperties: extractVisualProperties(node, parentBounds),

        // Hierarchy information
        depth: depth,
        childCount: 0,
        children: [],
    };

    // Recursively extract children for groups
    if (info.semanticType === 'GROUP' && node.children && node.children.length > 0) {
        info.childCount = node.children.length;
        info.children = node.children.map((child) => extractDesignInfo(child, depth + 1, node.globalBounds));
    }
    return info;
}

/**
 * Classify node for semantic understanding
 */
function classifyNode(node) {
    const name = (node.name || '').toLowerCase();
    const type = node.constructor.name;

    // Semantic classification based on name patterns
    if (name.includes('button') || name.includes('btn')) return 'BUTTON';
    if (name.includes('header') || name.includes('title')) return 'HEADER';
    if (name.includes('card') || name.includes('container')) return 'CONTAINER';
    if (name.includes('icon')) return 'ICON';
    if (name.includes('image') || name.includes('img')) return 'IMAGE';
    if (name.includes('input') || name.includes('field')) return 'INPUT';
    if (name.includes('nav') || name.includes('menu')) return 'NAVIGATION';
    if (name.includes('footer')) return 'FOOTER';
    if (name.includes('sidebar')) return 'SIDEBAR';
    if (name.includes('modal') || name.includes('dialog')) return 'MODAL';

    // Fallback to XD type
    switch (type) {
        case 'Text':
            return 'TEXT';
        case 'Rectangle':
            return 'SHAPE';
        case 'Ellipse':
            return 'SHAPE';
        case 'Group':
            return 'GROUP';
        case 'RepeatGrid':
            return 'LIST';
        default:
            return type.toUpperCase();
    }
}

/**
 * Extract comprehensive style information
 */
function extractVisualProperties(node, parentBounds = null) {
    const styles = {
        // Layout and positioning relative to parent
        bounds: {
            x: parentBounds?.x ? Math.round(Math.abs(node.globalBounds.x) - Math.abs(parentBounds.x)) : 0,
            y: parentBounds?.y ? Math.round(Math.abs(node.globalBounds.y) - Math.abs(parentBounds.y)) : 0,
            width: Math.round(node.localBounds.width),
            height: Math.round(node.localBounds.height),
        },
    };

    switch (node.constructor.name) {
        case 'Text':
            // Typography (for text elements)
            styles.typography = extractTextProperties(node);
            break;
        case 'Rectangle':
        case 'Ellipse':
            styles.background = extractBackgroundProperties(node);
            break;
        default:
            break;
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
        styles.opacity = node.opacity;
    }

    return styles;
}

/**
 * Generate component tree visualization
 */
function generateComponentTree(designInfo, prefix = '', isLast = true, isRoot = true) {
    let tree = '';

    // Format element info with text content preview
    const dimensions = `(${designInfo.visualProperties.bounds.width} x ${designInfo.visualProperties.bounds.height})`;

    let textPreview = designInfo.textContent?.replace(/\n/g, '');
    textPreview = textPreview ? ` "${textPreview.substring(0, 12)}${textPreview.length > 12 ? '...' : ''}"` : '';

    // Root element doesn't need tree symbols
    if (isRoot) {
        tree += `${designInfo.semanticType} ${dimensions}${textPreview}\n`;
    } else {
        // Use proper tree symbols for nested elements
        const connector = isLast ? '└── ' : '├── ';
        tree += `${prefix}${connector}${designInfo.semanticType} ${dimensions}${textPreview}\n`;
    }

    // Process children with proper indentation
    if (designInfo.children && designInfo.children.length > 0) {
        designInfo.children.forEach((child, index) => {
            const isLastChild = index === designInfo.children.length - 1;

            // Calculate new prefix for children
            let newPrefix;
            if (isRoot) {
                newPrefix = '';
            } else {
                // If current element is last, use spaces; otherwise use vertical line
                newPrefix = prefix + (isLast ? '    ' : '│   ');
            }

            tree += generateComponentTree(child, newPrefix, isLastChild, false);
        });
    }

    return tree;
}

/**
 * Count total elements in design tree
 */
function countElements(designInfo) {
    let count = 1; // Current element
    if (designInfo.children) {
        count += designInfo.children.reduce((sum, child) => sum + countElements(child), 0);
    }
    return count;
}

/**
 * Display design information
 */
function displayDesignInfo(designInfo) {
    // Update element count
    designPanel.querySelector('#element-count').textContent = `${countElements(designInfo)} elements`;

    // Display component tree
    designPanel.querySelector('#design-tree').textContent = generateComponentTree(designInfo, '', true, true);

    // Display JSON
    designPanel.querySelector('#output').textContent = JSON.stringify(designInfo, null, 4);
}

// -------------------------------------------------------------
// Panel Functions
// -------------------------------------------------------------

function show(event) {
    if (!designPanel) event.node.appendChild(create());
}

function hide() {
    designPanel.remove();
    designPanel = null;
}

function update() {
    if (!designPanel) return;

    const selectedItem = selection?.items?.[0];
    if (!selectedItem) {
        UIHelper.toggleSpecContent(designPanel, false);
        return;
    }

    // Extract design information recursively
    const designInfo = extractDesignInfo(selectedItem);
    displayDesignInfo(designInfo);

    UIHelper.toggleSpecContent(designPanel, true);
}

module.exports = {
    show,
    hide,
    update,
};
