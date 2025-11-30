const { rgbToHex } = require('../utils/helper.js');

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
    const fontFamily = textNode.fontFamily;
    properties.fontFamily = STYLE_VARIABLES?.fontFamily?.[fontFamily.toLowerCase()] || fontFamily;

    // -------------------------------------------------------------
    // Font Weight (aka fontStyle in XD)
    // -------------------------------------------------------------
    const fontStyle = textNode.fontStyle || 'Regular';
    properties.fontWeight = STYLE_VARIABLES?.fontWeight?.[fontStyle.toLowerCase()] || fontStyle;

    // -------------------------------------------------------------
    // Font Size
    // -------------------------------------------------------------
    const fontSize = textNode.fontSize ?? 14;
    properties.fontSize = STYLE_VARIABLES?.fontSize?.[fontSize] || `${fontSize}px`;

    // -------------------------------------------------------------
    // Color
    // -------------------------------------------------------------
    let colorValue = '#000000';
    if (textNode.fill && textNode.fill.constructor.name === 'Color') {
        colorValue = rgbToHex(textNode.fill).toLowerCase();
    }
    properties.color = STYLE_VARIABLES?.fontColor?.[colorValue] || STYLE_VARIABLES?.color?.[colorValue] || colorValue;

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

module.exports = extractTextProperties;
