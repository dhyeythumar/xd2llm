const { show: showSCSS, hide: hideSCSS, update: updateSCSS } = require('./spec-extractor/scss.js');
const { show: showJSON, hide: hideJSON, update: updateJSON } = require('./spec-extractor/json.js');
const { show: showDesign, hide: hideDesign, update: updateDesign } = require('./exp/design-extractor.js');

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
        designInfoExtractor: {
            show: showDesign,
            hide: hideDesign,
            update: updateDesign,
        },
    },
    commands: {},
};
