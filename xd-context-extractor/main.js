const { show: showDesign, hide: hideDesign, update: updateDesign } = require('./panels/design-extractor.js');
const { show: showSCSS, hide: hideSCSS, update: updateSCSS } = require('./panels/scss.js');

module.exports = {
    panels: {
        jsonDesignContextExtractor: {
            show: showDesign,
            hide: hideDesign,
            update: updateDesign,
        },
        scssDesignContextExtractor: {
            show: showSCSS,
            hide: hideSCSS,
            update: updateSCSS,
        },
    },
    commands: {},
};
