const styles = require('./styles.js');
const html = require('./html.js');
const settingsStorage = require('../../utils/settings-storage.js');
const { validateJSONString } = require('../../utils/helper.js');
const { SETTING_KEYS } = require('../../utils/const.js');

const SETTINGS_MAPPING = [
    {
        settingKey: SETTING_KEYS.STYLE_VARIABLES,
        inputType: 'JSON_STRING',
        sectionId: 'style-variables-section',
    },
];
let settingsPanel;

function create() {
    settingsPanel = document.createElement('div');
    settingsPanel.innerHTML = `${styles}${html}`;

    // register input validation listeners for each setting
    SETTINGS_MAPPING.forEach((setting) => {
        const parentElement = settingsPanel.querySelector(`#${setting.sectionId}`);
        const input = parentElement.querySelector('.user-input');
        const saveButton = parentElement.querySelector('.save-button');
        saveButton.addEventListener('click', () => saveSetting(parentElement, setting.settingKey));

        if (setting.inputType === 'JSON_STRING') {
            let validationTimeout;
            input.addEventListener('input', () => {
                clearTimeout(validationTimeout);

                validationTimeout = setTimeout(() => {
                    const jsonString = input.value.trim();
                    if (jsonString === '') {
                        hideError(parentElement);
                        return;
                    }

                    const validation = validateJSONString(jsonString);
                    if (!validation.valid) {
                        showError(parentElement, validation.error);
                    } else {
                        hideError(parentElement);
                    }
                }, 500);
            });
        }
    });

    // Load existing settings
    loadSettings();

    return settingsPanel;
}

// Show error message
function showError(parentElement, message) {
    const errorElement = parentElement.querySelector('.error-message');
    const saveButton = parentElement.querySelector('.save-button');

    // show error message
    errorElement.textContent = message;
    errorElement.classList.remove('hide');
    errorElement.classList.add('show');

    // hide save button
    saveButton.classList.add('hide');
    saveButton.classList.remove('show');
}

// Hide error message
function hideError(parentElement) {
    const errorElement = parentElement.querySelector('.error-message');
    const saveButton = parentElement.querySelector('.save-button');

    // hide error message
    errorElement.textContent = '';
    errorElement.classList.remove('show');
    errorElement.classList.add('hide');

    // show save button
    saveButton.classList.remove('hide');
    saveButton.classList.add('show');
}

// Save setting to storage
async function saveSetting(parentElement, settingKey) {
    try {
        const input = parentElement.querySelector('.user-input').value.trim();
        const success = await settingsStorage.saveSettings(settingKey, input);

        if (success) {
            showStatus('Settings saved successfully!', 'success');
        } else {
            showStatus('Failed to save settings. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Failed to save settings:', error);
        showStatus('An error occurred while saving settings.', 'error');
    }
}

// Load saved settings and populate the form
async function loadSettings() {
    try {
        SETTINGS_MAPPING.forEach(async (setting) => {
            const parentElement = settingsPanel.querySelector(`#${setting.sectionId}`);
            const input = parentElement.querySelector('.user-input');
            const value = await settingsStorage.loadSettings(setting.settingKey);

            if (value) {
                if (setting.inputType === 'JSON_STRING') {
                    input.value = JSON.stringify(value, null, 2);
                } else {
                    input.value = value;
                }
            }
        });
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// Show status message
function showStatus(message, type = 'success') {
    const statusElement = settingsPanel.querySelector('#save-status');

    statusElement.textContent = message;
    statusElement.className = `save-status ${type}`;
    statusElement.classList.remove('hide');

    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusElement.classList.add('hide');
    }, 3000);
}

// -------------------------------------------------------------
// Panel Functions
// -------------------------------------------------------------

function show(event) {
    if (!settingsPanel) event.node.appendChild(create());
}

function hide() {
    if (!settingsPanel) return;

    settingsPanel.remove();
    settingsPanel = null;
}

function update() {
    if (!settingsPanel) return;

    // Settings panel doesn't need to update based on selection
    // But we can reload settings if panel is already shown
    loadSettings();
}

module.exports = {
    show,
    hide,
    update,
};
