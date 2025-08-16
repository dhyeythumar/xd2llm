/**
 * Map of XD property values to SCSS variables
 */
const SCSS_VARIABLE_MAP = {
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
    color: {
        '#667980': '$hex-667980',
        '#88969d': '$hex-88969D',
        '#52666d': '$hex-52666D',
        '#4c5d64': '$hex-4C5D64',
        '#657980': '$hex-657980',
        '#90a1a8': '$hex-90A1A8',
        '#6f8187': '$hex-6F8187',
        '#e1e8e7': '$hex-E1E8E7',
        '#e3e9e7': '$hex-E3E9E7',
        '#eff3f2': '$hex-EFF3F2',
        '#eaefee': '$hex-EAEFEE',
        '#ffffff': '$hex-FFFFFF',
        '#000000': '$hex-000000',
        '#8fb98f': '$hex-8FB98F',
        '#8fb88f': '$hex-8FB88F',
        '#ca742b': '$hex-CA742B',
        '#d91f1f': '$hex-D91F1F',
    },
};

/**
 * Map of XD property values to CSS values
 */
const CSS_VALUE_MAP = {};

const ACCEPTABLE_CSS_VALUES = {
    textDecoration: ['underline', 'line-through'],
    textTransform: ['uppercase', 'lowercase', 'capitalize'],
};

module.exports = {
    SCSS_VARIABLE_MAP,
    CSS_VALUE_MAP,
    ACCEPTABLE_CSS_VALUES,
};
