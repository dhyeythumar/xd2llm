/**
 * Extractor for LLM-powered React Component Generation
 *
 * Extracts comprehensive design information from XD elements in JSON format
 * that can be fed to an LLM as a context to generate perfect React components.
 *
 * Features:
 * - Recursive traversal of groups and nested elements
 * - Complete style extraction (colors, typography, layout)
 * - Semantic element classification
 * - Component hierarchy mapping
 * - Design system token mapping
 */

const { selection, Text } = require('scenegraph');

const styles = require('./styles.js');
const html = require('./html.js');
const WSConnector = require('../../services/ws-connector.js');
const extractTextProperties = require('../../extractors/text.js');
const extractBackgroundProperties = require('../../extractors/background.js');
const { UIHelper, copyToClipboard, exportNodeAsBase64, loadStyleVariables } = require('../../utils/helper.js');

// Initialize WebSocket connector
const wsConnector = new WSConnector();
let jsonPanel;

function create() {
    jsonPanel = document.createElement('div');
    jsonPanel.innerHTML = `${styles}${html}`;

    // Add event listeners
    jsonPanel.querySelector('#copy-btn').addEventListener('click', (event) => copyToClipboard(event, '#output'));

    jsonPanel.querySelector('#retry-button').addEventListener('click', () => wsConnector.manualReconnect());

    // Set up connection status callback
    wsConnector.setConnectionStatusCallback(() => updateConnectionStatus());

    // Initialize with current connection status
    updateConnectionStatus();

    return jsonPanel;
}

// -------------------------------------------------------------
// WebSocket Connection Functions
// -------------------------------------------------------------

/**
 * Update connection status indicator
 */
function updateConnectionStatus() {
    if (!jsonPanel) return;

    const { isConnected, reconnectAttempts, maxReconnectAttempts } = wsConnector.getConnectionStatus();
    const statusElement = jsonPanel.querySelector('#connection-status');
    const dotElement = jsonPanel.querySelector('.connection-dot');
    const textElement = jsonPanel.querySelector('#connection-text');
    const retryButton = jsonPanel.querySelector('#retry-button');

    if (!statusElement || !dotElement || !textElement || !retryButton) return;

    // Remove all status classes
    statusElement.classList.remove('connected', 'disconnected', 'reconnecting');
    dotElement.classList.remove('connected', 'disconnected', 'reconnecting');
    retryButton.classList.remove('show');

    if (isConnected) {
        // Connected state
        statusElement.classList.add('connected');
        dotElement.classList.add('connected');
        textElement.textContent = 'Connected with WebSocket Server';
    } else if (reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts) {
        // Reconnecting state
        statusElement.classList.add('reconnecting');
        dotElement.classList.add('reconnecting');
        textElement.textContent = `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})`;
    } else {
        // Disconnected state
        statusElement.classList.add('disconnected');
        dotElement.classList.add('disconnected');

        if (reconnectAttempts >= maxReconnectAttempts) {
            // Retries exhausted - show retry button
            textElement.textContent = 'Connection failed - retries exhausted';
            retryButton.classList.add('show');
        } else {
            // Initial disconnected state
            textElement.textContent = 'Disconnected from WebSocket Server';
        }
    }
}

async function sendDesignContext(designContext, selectedNode) {
    const base64Image = await exportNodeAsBase64(selectedNode);

    wsConnector.handleSelectionChange({
        json: designContext,
        image: base64Image,
    });
}

// -------------------------------------------------------------
// Design Context Extraction Functions
// -------------------------------------------------------------

/**
 * Extract comprehensive context information from XD Node
 * Recursively traverses groups and builds nested component structure
 */
function extractDesignContext(node, depth = 0, parentBounds = null) {
    const context = {
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
    if (
        (context.nodeType === 'GROUP' ||
            context.nodeType === 'SYMBOLINSTANCE' ||
            context.nodeType === 'SCROLLABLEGROUP') &&
        context.semanticType !== 'ICON' && // avoid extracting children for icons
        node.children &&
        node.children.length > 0
    ) {
        context.childCount = node.children.length;
        context.children = node.children.map((child) => extractDesignContext(child, depth + 1, node.globalBounds));
    }
    return context;
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
        typography: null,
        background: null,
    };

    switch (node.constructor.name) {
        case 'Text':
            styles.typography = extractTextProperties(node);
            break;
        case 'Rectangle':
        case 'Ellipse':
        case 'Path':
        case 'Line':
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
function generateComponentTree(designContext, prefix = '', isLast = true, isRoot = true) {
    let tree = '';

    // Format element info with text content preview
    const dimensions = `(${designContext.visualProperties.bounds.width} x ${designContext.visualProperties.bounds.height})`;

    let textPreview = designContext.textContent?.replace(/\n/g, '');
    textPreview = textPreview ? ` "${textPreview.substring(0, 12)}${textPreview.length > 12 ? '...' : ''}"` : '';

    // Root element doesn't need tree symbols
    if (isRoot) {
        tree += `${designContext.semanticType} ${dimensions}${textPreview}\n`;
    } else {
        // Use proper tree symbols for nested elements
        const connector = isLast ? '└── ' : '├── ';
        tree += `${prefix}${connector}${designContext.semanticType} ${dimensions}${textPreview}\n`;
    }

    // Process children with proper indentation
    if (designContext.children && designContext.children.length > 0) {
        designContext.children.forEach((child, index) => {
            const isLastChild = index === designContext.children.length - 1;

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
function countElements(designContext) {
    let count = 1; // Current element
    if (designContext.children) {
        count += designContext.children.reduce((sum, child) => sum + countElements(child), 0);
    }
    return count;
}

/**
 * Display design context information
 */
function displayDesignContext(designContext) {
    // Update element count
    jsonPanel.querySelector('#element-count').textContent = `${countElements(designContext)} elements`;

    // Display component tree
    jsonPanel.querySelector('#tree').textContent = generateComponentTree(designContext, '', true, true);

    // Display JSON
    jsonPanel.querySelector('#output').textContent = JSON.stringify(designContext, null, 2);
}

// -------------------------------------------------------------
// Panel Functions
// -------------------------------------------------------------

async function show(event) {
    wsConnector.handleSelectionChange(null);

    if (!jsonPanel) {
        event.node.appendChild(create());
        await loadStyleVariables();
    }
}

function hide() {
    wsConnector.handleSelectionChange(null);
    if (!jsonPanel) return;

    jsonPanel.remove();
    jsonPanel = null;
}

function update() {
    wsConnector.handleSelectionChange(null);
    if (!jsonPanel) return;

    const selectedNode = selection?.items?.[0];
    if (!selectedNode) {
        UIHelper.toggleContent(jsonPanel, false);
        return;
    }

    // Extract context information recursively
    const designContext = extractDesignContext(selectedNode);
    displayDesignContext(designContext);

    // Send selected node to server
    sendDesignContext(designContext, selectedNode);

    UIHelper.toggleContent(jsonPanel, true);
}

module.exports = {
    show,
    hide,
    update,
};
