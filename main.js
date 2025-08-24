const { show: showSCSS, hide: hideSCSS, update: updateSCSS } = require('./spec-extractor/scss.js');
const { show: showJSON, hide: hideJSON, update: updateJSON } = require('./spec-extractor/json.js');

module.exports = {
    panels: {
        scssDesignSpecExtractor: {
            show: showSCSS,
            hide: hideSCSS,
            update: updateSCSS,
        },
        jsonDesignSpecExtractor: {
            show: showJSON,
            hide: hideJSON,
            update: updateJSON,
        },
    },
    commands: {
        quickSpecExtract,
    },
    commands: {},
};
