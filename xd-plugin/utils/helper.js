const clipboard = require('clipboard');

class UIHelper {
    static toggleSpecContent(panel, show) {
        panel.querySelector('#spec-content').className = show ? 'show' : 'hide';
        panel.querySelector('#spec-warning').className = show ? 'warning hide' : 'warning show';
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

module.exports = {
    UIHelper,
    rgbToHex,
    rgbaToHex,
    copyToClipboard,
};
