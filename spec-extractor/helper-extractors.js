const { Rectangle, Ellipse } = require('scenegraph');

const { rgbToHex, rgbaToHex } = require('../utils/helper.js');
const { SCSS_VARIABLE_MAP } = require('../utils/const.js');

/**
 * Format of Typography properties in SCSS:
 * ----------------------------------------
 * font-family: <variable-name>;
 * font-weight: <variable-name>;
 * font-size: <variable-name>;
 * color: <variable-name>;
 * line-height: <pixel-value>;
 * letter-spacing: <pixel-value>;
 * text-align: <left/center/right/justify>;
 * text-decoration: <underline/line-through/none>;
 * text-transform: <uppercase/lowercase/capitalize/none>;
 */
function extractTextProperties(textNode, displayFunction) {
    const properties = {};

    // -------------------------------------------------------------
    // Font Family
    // -------------------------------------------------------------
    const fontFamily = textNode.fontFamily.toLowerCase();
    properties.fontFamily = SCSS_VARIABLE_MAP.fontFamily[fontFamily];

    // -------------------------------------------------------------
    // Font Weight (aka fontStyle in XD)
    // -------------------------------------------------------------
    const fontStyle = (textNode.fontStyle || 'Regular').toLowerCase();
    properties.fontWeight = SCSS_VARIABLE_MAP.fontWeight[fontStyle];

    // -------------------------------------------------------------
    // Font Size
    // -------------------------------------------------------------
    const fontSize = textNode.fontSize ?? 14;
    properties.fontSize = SCSS_VARIABLE_MAP.fontSize[fontSize] || `${fontSize}px`;

    // -------------------------------------------------------------
    // Color
    // -------------------------------------------------------------
    let colorValue = '#000000';
    if (textNode.fill && textNode.fill.constructor.name === 'Color') {
        colorValue = rgbToHex(textNode.fill).toLowerCase();
    }
    properties.color = SCSS_VARIABLE_MAP.fontColor[colorValue] || SCSS_VARIABLE_MAP.color[colorValue] || colorValue;

    // -------------------------------------------------------------
    // Line Height
    // -------------------------------------------------------------
    const localBounds = textNode.localBounds;
    const lineSpacing = textNode.lineSpacing || localBounds.height || 0;
    if (lineSpacing > 0) properties.lineHeight = `${lineSpacing}px`;
    else properties.lineHeight = 'normal';

    // -------------------------------------------------------------
    // Letter Spacing (charSpacing is in 1/1000th of font size)
    // -------------------------------------------------------------
    const charSpacing = textNode.charSpacing || 0;
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
    if (textNode.underline && textNode.strikethrough) properties.textDecoration = 'underline line-through';
    else if (textNode.underline) properties.textDecoration = 'underline';
    else if (textNode.strikethrough) properties.textDecoration = 'line-through';
    else properties.textDecoration = 'none';

    // -------------------------------------------------------------
    // Text Transform
    // -------------------------------------------------------------
    if (textNode.textTransform === 'titlecase') properties.textTransform = 'capitalize';
    else properties.textTransform = textNode.textTransform || 'none';

    // -------------------------------------------------------------
    // Display Extracted Properties
    // -------------------------------------------------------------
    if (displayFunction) {
        const nodeName = textNode.name || 'Text Node';
        displayFunction(properties, nodeName);
    }

    return properties;
}

/**
 * Format of Background properties in SCSS:
 * ----------------------------------------
 * width: <pixel-value>;
 * height: <pixel-value>;
 * border: <pixel-value> solid <variable-name>;
 * border-radius: <variable-name>;
 * background-color: <variable-name>;
 * box-shadow: <x> <y> <blur> <spread> <color>;
 */
function extractBackgroundProperties(shapeNode, displayFunction) {
    const properties = {};

    // -------------------------------------------------------------
    // Dimensions
    // -------------------------------------------------------------
    const bounds = shapeNode.localBounds;
    properties.width = `${Math.round(bounds.width)}px`;
    properties.height = `${Math.round(bounds.height)}px`;

    // -------------------------------------------------------------
    // Border (stroke properties)
    // -------------------------------------------------------------
    if (
        shapeNode.stroke &&
        shapeNode.stroke.constructor.name === 'Color' &&
        shapeNode.strokeEnabled !== false &&
        (shapeNode.strokeWidth || 0) > 0
    ) {
        const strokeColor = rgbToHex(shapeNode.stroke).toLowerCase();
        const strokeWidth = shapeNode.strokeWidth || 1;
        const strokeColorVar = SCSS_VARIABLE_MAP.color[strokeColor] || strokeColor;
        properties.border = `${strokeWidth}px solid ${strokeColorVar}`;
    }

    // -------------------------------------------------------------
    // Border Radius (for Rectangle elements)
    // -------------------------------------------------------------
    if (shapeNode instanceof Rectangle && shapeNode.cornerRadii) {
        const radii = shapeNode.cornerRadii;
        // Check if all corners have the same radius
        if (
            radii.topLeft === radii.topRight &&
            radii.topRight === radii.bottomRight &&
            radii.bottomRight === radii.bottomLeft
        ) {
            if (radii.topLeft > 0) {
                const radius = `${radii.topLeft}px`;
                properties.borderRadius = SCSS_VARIABLE_MAP.borderRadius[radius] || radius;
            }
        } else {
            // Different corner radii
            properties.borderRadius = `${radii.topLeft}px ${radii.topRight}px ${radii.bottomRight}px ${radii.bottomLeft}px`;
        }
    } else if (shapeNode instanceof Ellipse) {
        properties.borderRadius = SCSS_VARIABLE_MAP.borderRadius['50%'];
    }

    // -------------------------------------------------------------
    // Background Color (from fill property)
    // -------------------------------------------------------------
    if (shapeNode.fill && shapeNode.fill.constructor.name === 'Color') {
        const bgColor = rgbToHex(shapeNode.fill).toLowerCase();
        properties.backgroundColor = SCSS_VARIABLE_MAP.bgColor[bgColor] || SCSS_VARIABLE_MAP.color[bgColor] || bgColor;
    }

    // -------------------------------------------------------------
    // Box Shadow (from shadow property)
    // -------------------------------------------------------------
    if (shapeNode.shadow && shapeNode.shadow.visible !== false) {
        const shadow = shapeNode.shadow;
        const x = shadow.x || 0;
        const y = shadow.y || 0;
        const blur = shadow.blur || 0;
        const spread = 0; // XD doesn't have spread, default to 0

        // Extract shadow color
        let shadowColor = '#0000001a'; // default (rgba(0, 0, 0, 0.1) as hex with alpha)
        if (shadow.color && shadow.color.constructor.name === 'Color') {
            shadowColor = rgbaToHex(shadow.color).toLowerCase();
        }

        properties.boxShadow = `${x}px ${y}px ${blur}px ${spread}px ${shadowColor}`;
    }

    // -------------------------------------------------------------
    // Display Extracted Properties
    // -------------------------------------------------------------
    if (displayFunction) {
        const nodeName = shapeNode.name || `${shapeNode.constructor.name.toLowerCase()} Node`;
        displayFunction(properties, nodeName);
    }

    return properties;
}

module.exports = {
    extractTextProperties,
    extractBackgroundProperties,
};
