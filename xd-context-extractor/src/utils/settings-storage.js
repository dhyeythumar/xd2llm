const fs = require('uxp').storage.localFileSystem;

class SettingsStorage {
    #FILE = 'settings.json';

    /**
     * Save user-provided settings
     */
    async saveSettings(settingKey, settingValue) {
        try {
            // load existing settings if any
            const settings = await this.loadSettings();
            settings[settingKey] = settingValue;

            // overwrite existing settings
            const dataFolder = await fs.getDataFolder();
            const file = await dataFolder.createFile(this.#FILE, { overwrite: true });
            await file.write(JSON.stringify(settings, null, 2));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    /**
     * Load saved settings
     * @param {string} [settingKey] - Optional key to retrieve a specific setting
     * @returns {Promise<Object|*>} All settings object if no key provided, or the specific setting value
     */
    async loadSettings(settingKey) {
        try {
            const dataFolder = await fs.getDataFolder();
            const file = await dataFolder.getEntry(this.#FILE);
            const contents = await file.read();
            const settings = JSON.parse(contents);
            return settingKey !== undefined ? settings[settingKey] : settings;
        } catch (error) {
            // File doesn't exist or error reading - return defaults
            console.log('No saved settings found, using defaults');
            return settingKey !== undefined ? undefined : {};
        }
    }

    /**
     * Check if settings exists
     */
    async hasSettings(settingKey) {
        try {
            const settings = await this.loadSettings();
            return settings[settingKey] !== undefined;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new SettingsStorage();
