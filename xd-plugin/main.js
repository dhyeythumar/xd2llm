const { show: showDesign, hide: hideDesign, update: updateDesign } = require('./panels/design-extractor.js');
const { show: showSCSS, hide: hideSCSS, update: updateSCSS } = require('./panels/scss.js');

module.exports = {
    panels: {
        designInfoExtractor: {
            show: showDesign,
            hide: hideDesign,
            update: updateDesign,
        },
        scssDesignSpecExtractor: {
            show: showSCSS,
            hide: hideSCSS,
            update: updateSCSS,
        },
    },
    commands: {},
};
