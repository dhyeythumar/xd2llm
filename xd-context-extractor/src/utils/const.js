const SETTING_KEYS = {
    STYLE_VARIABLES: 'styleVariables',
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
    SETTING_KEYS,
    CSS_VALUES,
    ACCEPTABLE_CSS_VALUES,
};
