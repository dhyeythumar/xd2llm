const { Rectangle, Ellipse } = require('scenegraph');
const { rgbToHex, rgbaToHex } = require('../utils/helper.js');

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
        const strokeColorVar = STYLE_VARIABLES?.color?.[strokeColor] || strokeColor;
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
                properties.borderRadius = STYLE_VARIABLES?.borderRadius?.[radius] || radius;
            }
        } else {
            // Different corner radii
            properties.borderRadius = `${radii.topLeft}px ${radii.topRight}px ${radii.bottomRight}px ${radii.bottomLeft}px`;
        }
    } else if (shapeNode instanceof Ellipse) {
        properties.borderRadius = STYLE_VARIABLES?.borderRadius?.['50%'] || '50%';
    }

    // -------------------------------------------------------------
    // Background Color (from fill property)
    // -------------------------------------------------------------
    if (shapeNode.fill && shapeNode.fill.constructor.name === 'Color') {
        const bgColor = rgbToHex(shapeNode.fill).toLowerCase();
        properties.backgroundColor =
            STYLE_VARIABLES?.bgColor?.[bgColor] || STYLE_VARIABLES?.color?.[bgColor] || bgColor;
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

module.exports = extractBackgroundProperties;
