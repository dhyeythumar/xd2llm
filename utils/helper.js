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
    copyToClipboard,
};
