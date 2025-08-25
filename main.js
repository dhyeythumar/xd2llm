const { show: showSCSS, hide: hideSCSS, update: updateSCSS } = require('./panels/scss.js');
const { show: showJSON, hide: hideJSON, update: updateJSON } = require('./panels/json.js');
const { show: showDesign, hide: hideDesign, update: updateDesign } = require('./panels/exp/design-extractor.js');

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
