const application = require('application');
const fs = require('uxp').storage.localFileSystem;
const storage = require('uxp').storage;
const clipboard = require('clipboard');

class UIHelper {
    static toggleContent(panel, show) {
        panel.querySelector('#content').className = show ? 'show' : 'hide';
        panel.querySelector('#warning').className = show ? 'warning hide' : 'warning show';
    }
}

function rgbToHex(fill) {
    return (
        '#' +
        ((1 << 24) + (Math.round(fill.r) << 16) + (Math.round(fill.g) << 8) + Math.round(fill.b)).toString(16).slice(1)
    );
}

function rgbaToHex(fill) {
    // XD color values: ALL values (r, g, b, a) are in 0-255 range
    const r = Math.round(fill.r);
    const g = Math.round(fill.g);
    const b = Math.round(fill.b);
    const a = Math.round(fill.a); // Alpha is already in 0-255 range, no conversion needed

    // Convert each component to hex and pad with zeros if needed
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    const aHex = a.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}${aHex}`;
}

function copyToClipboard(event, contentId) {
    const content = document.querySelector(contentId);
    if (!content.textContent) return;

    clipboard.copyText(content.textContent);

    // Update button text temporarily
    const copyBtn = document.querySelector(`#${event.target.id}`);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');

    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
    }, 2000);
}

/**
 * Convert ArrayBuffer to base64 string
 * @param {ArrayBuffer} buffer - The ArrayBuffer to convert
 * @returns {string} Base64 encoded string
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Export XD node as base64 encoded PNG image
 * @param {Object} node - The XD node to export
 * @returns {Promise<string>} Base64 encoded image string
 */
async function exportNodeAsBase64(node) {
    try {
        // Create a temporary file to store the rendition
        const tempFolder = await fs.getTemporaryFolder();
        const file = await tempFolder.createFile('rendition.png', { overwrite: true });

        // Define rendition settings
        const renditionSettings = [
            {
                node: node,
                outputFile: file,
                type: application.RenditionType.PNG,
                scale: 1,
            },
        ];

        // Create the rendition using Adobe XD's official API
        await application.createRenditions(renditionSettings);

        // Read the file and convert to base64
        const fileContents = await file.read({ format: storage.formats.binary });

        if (!fileContents || fileContents.length === 0) {
            throw new Error('Rendition file is empty');
        }

        const base64String = arrayBufferToBase64(fileContents);

        return base64String;
    } catch (error) {
        console.error('Error exporting node as base64:', error);

        return '';
    }
}

module.exports = {
    UIHelper,
    rgbToHex,
    rgbaToHex,
    copyToClipboard,
    arrayBufferToBase64,
    exportNodeAsBase64,
};
