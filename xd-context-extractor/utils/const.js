/**
 * Map of XD property values to Style variables
 * This helps to generate variables for your design tokens.
 */
const STYLE_VARIABLES = {
    color: {
        '#667980': '$color-slate',
        '#8fb98f': '$color-sage',
        '#e1e8e7': '$color-glacier-gray',
        '#ffffff': '$color-white',
        '#000000': '$color-black',
    },
    borderRadius: {
        '4px': '$border-radius-sm',
        '6px': '$border-radius-md',
        '8px': '$border-radius-lg',
        '50%': '$border-radius-circle',
    },
    bgColor: {
        '#e1e8e7': '$bg-color-primary',
        '#eaefee': '$bg-color-secondary',
        '#eff3f2': '$bg-color-tertiary',
        '#f5f8f7': '$bg-color-quaternary',
    },
    // aka fontFamily in Adobe XD (no fallback)
    fontFamily: {
        'stevie sans': '$font-family-stevie',
        korolev: '$font-family-korolev',
        'nordique pro': '$font-family-nordique',
    },
    // aka fontStyle in Adobe XD (regular is the default)
    fontWeight: {
        light: '$font-weight-light',
        book: '$font-weight-book',
        normal: '$font-weight-normal',
        regular: '$font-weight-regular',
        medium: '$font-weight-medium',
        semibold: '$font-weight-semibold',
        bold: '$font-weight-bold',
    },
    // aka fontSize in Adobe XD (14 is the default)
    fontSize: {
        12: '$font-size-12',
        13: '$font-size-13',
        14: '$font-size-14',
        15: '$font-size-15',
        16: '$font-size-16',
        18: '$font-size-18',
        20: '$font-size-20',
        24: '$font-size-24',
    },
    fontColor: {
        '#667980': '$font-color-default',
        '#7d9098': '$font-color-subtle',
        '#90a1a8': '$font-color-subtlest',
    },
};

/**
 * Map of XD property values to CSS values
 * In some cases, XD refer to its own values which doesn't have a CSS equivalent.
 */
const CSS_VALUES = {};

const ACCEPTABLE_CSS_VALUES = {
    textDecoration: ['underline', 'line-through'],
    textTransform: ['uppercase', 'lowercase', 'capitalize'],
};

module.exports = {
    STYLE_VARIABLES,
    CSS_VALUES,
    ACCEPTABLE_CSS_VALUES,
};
