const {
    show: showJSONPanel,
    hide: hideJSONPanel,
    update: updateJSONPanel,
} = require('./src/ui-panels/json-panel/json-panel.js');
const {
    show: showSCSSPanel,
    hide: hideSCSSPanel,
    update: updateSCSSPanel,
} = require('./src/ui-panels/scss-panel/scss-panel.js');
const {
    show: showSettingsPanel,
    hide: hideSettingsPanel,
    update: updateSettingsPanel,
} = require('./src/ui-panels/settings-panel/settings-panel.js');

module.exports = {
    panels: {
        jsonDesignContextExtractor: {
            show: showJSONPanel,
            hide: hideJSONPanel,
            update: updateJSONPanel,
        },
        scssDesignContextExtractor: {
            show: showSCSSPanel,
            hide: hideSCSSPanel,
            update: updateSCSSPanel,
        },
        settings: {
            show: showSettingsPanel,
            hide: hideSettingsPanel,
            update: updateSettingsPanel,
        },
    },
    commands: {},
};
