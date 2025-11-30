/**
 * Styles can be classified into the following subgroups:
 *
 * - **Display & Layout**: Properties like: `display`, `position`, `top/right/bottom/left`, `flex`, `grid`, `z-index`, `overflow`, `visibility`.
 * - **Box Model**: Properties like: `width`, `height`, `margin`, `padding`, `box-sizing`, `border`, `border-radius`, `outline`.
 * - **Backgrounds**: Properties like: `background-color`, `background-image`, `background-*`.
 * - **Typography**: Properties like: `font-family`, `font-weight`, `font-size`, `font-style`, `color`, `line-height`, `letter-spacing`, `text-align`, `text-decoration`, `text-transform`, `white-space`.
 * - **Visual Effects**: Properties like: `opacity`, `box-shadow`, `transform`, `filter`, `pointer-events`.
 * - **Transitions & Animations**
 * - **Pseudo-elements & pseudo-classes**: Properties like: `::before`, `::after`, `:hover`, `:focus`, `:active`
 */

const { selection } = require('scenegraph');

const styles = require('./styles.js');
const html = require('./html.js');
const extractTextProperties = require('../../extractors/text.js');
const extractBackgroundProperties = require('../../extractors/background.js');
const { UIHelper, copyToClipboard, loadStyleVariables } = require('../../utils/helper.js');
const { ACCEPTABLE_CSS_VALUES } = require('../../utils/const.js');

let scssPanel;

function create() {
    scssPanel = document.createElement('div');
    scssPanel.innerHTML = `${styles}${html}`;

    // Add event listeners
    scssPanel.querySelector('#copy-btn').addEventListener('click', (event) => copyToClipboard(event, '#output'));

    return scssPanel;
}

function displayProperties(properties, elementName) {
    const container = scssPanel.querySelector('#scss-properties');
    container.innerHTML = '';
    scssPanel.querySelector('.section-header').innerHTML = `Properties: ${elementName}`;

    Object.entries(properties).forEach(([property, value]) => {
        if (value) {
            const propDiv = document.createElement('div');
            propDiv.className = 'prop';

            const isVariable = value.toString().startsWith('$');
            const valueClass = isVariable ? 'variable' : 'direct';

            propDiv.innerHTML = `
                <span class="prop-label">${property}:</span>
                <span class="prop-value ${valueClass}">${value}</span>
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

function generateTextSCSS(properties) {
    let scss = '';

    // Add properties in the order specified in comments
    if (properties.fontFamily) scss += `font-family: ${properties.fontFamily};\n`;
    if (properties.fontWeight) scss += `font-weight: ${properties.fontWeight};\n`;
    if (properties.fontSize) scss += `font-size: ${properties.fontSize};\n`;
    if (properties.color) scss += `color: ${properties.color};\n`;
    if (properties.lineHeight) scss += `line-height: ${properties.lineHeight};\n`;
    if (properties.letterSpacing) scss += `letter-spacing: ${properties.letterSpacing};\n`;
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

function generateBackgroundSCSS(properties) {
    let scss = '';

    // Add properties in logical order for CSS
    if (properties.width) scss += `width: ${properties.width};\n`;
    if (properties.height) scss += `height: ${properties.height};\n`;
    if (properties.border) scss += `border: ${properties.border};\n`;
    if (properties.borderRadius) scss += `border-radius: ${properties.borderRadius};\n`;
    if (properties.backgroundColor) scss += `background-color: ${properties.backgroundColor};\n`;
    if (properties.boxShadow) scss += `box-shadow: ${properties.boxShadow};\n`;

    // -------------------------------------------------------------
    // Display the SCSS code
    // -------------------------------------------------------------
    displaySCSS(scss);

    return scss;
}

// -------------------------------------------------------------
// Panel Functions
// -------------------------------------------------------------

async function show(event) {
    if (!scssPanel) {
        event.node.appendChild(create());
        await loadStyleVariables();
    }
}

// Clean up or hide panel-specific content
function hide() {
    if (!scssPanel) return;

    scssPanel.remove();
    scssPanel = null;
}

function update() {
    if (!scssPanel) return;

    const selectedItem = selection?.items?.[0];
    if (!selectedItem) {
        UIHelper.toggleContent(scssPanel, false);
        return;
    }

    // Handle different types of XD Nodes / Elements
    switch (selectedItem.constructor.name) {
        case 'Text': {
            generateTextSCSS(extractTextProperties(selectedItem, displayProperties));
            break;
        }
        case 'Rectangle':
        case 'Ellipse':
        case 'Path':
        case 'Line': {
            generateBackgroundSCSS(extractBackgroundProperties(selectedItem, displayProperties));
            break;
        }
        default: {
            UIHelper.toggleContent(scssPanel, false);
            return;
        }
    }

    UIHelper.toggleContent(scssPanel, true);
}

module.exports = {
    show,
    hide,
    update,
};
