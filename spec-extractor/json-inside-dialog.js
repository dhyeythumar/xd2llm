const { selection } = require('scenegraph');
const clipboard = require('clipboard');

async function quickSpecExtract() {
    // Check if something is selected
    if (!selection || selection.items.length === 0) {
        await showNoSelectionDialog();
        return;
    }

    // Show modal with spec extraction
    await showSpecModal(selection.items[0]);
}

async function showNoSelectionDialog() {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `
        <style>
            .modal-container {
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 400px;
            }
            .modal-title {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 16px;
                text-align: center;
            }
            .modal-message {
                font-size: 14px;
                color: #666;
                line-height: 1.5;
                margin-bottom: 20px;
                text-align: center;
            }
            .modal-icon {
                font-size: 48px;
                text-align: center;
                margin-bottom: 16px;
            }
            .modal-footer {
                display: flex;
                justify-content: center;
                gap: 10px;
            }
            .btn {
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                border: none;
            }
            .btn-primary {
                background: #007ACC;
                color: white;
            }
            .btn-primary:hover {
                background: #005a9e;
            }
        </style>
        <form method="dialog" class="modal-container">
            <div class="modal-icon">⚠️</div>
            <h2 class="modal-title">No Element Selected</h2>
            <p class="modal-message">
                Please select an element in your Adobe XD document first, then try again.
                <br><br>
                You can select any text, shape, or other design element to extract its specifications.
            </p>
            <footer class="modal-footer">
                <button class="btn btn-primary" type="submit">Got it!</button>
            </footer>
        </form>
    `;

    document.appendChild(dialog);

    try {
        await dialog.showModal();
    } catch (error) {
        console.error('Dialog error:', error);
    } finally {
        dialog.remove();
    }
}

async function showSpecModal(selectedItem) {
    const dialog = document.createElement('dialog');

    // Extract basic specs for the modal
    const specs = {
        name: selectedItem.name || 'Unnamed',
        type: selectedItem.constructor.name,
        width: Math.round(selectedItem.globalBounds.width),
        height: Math.round(selectedItem.globalBounds.height),
        x: Math.round(selectedItem.globalBounds.x),
        y: Math.round(selectedItem.globalBounds.y),
    };

    // Add type-specific properties
    if (selectedItem.constructor.name === 'Text') {
        specs.fontSize = selectedItem.fontSize || 'N/A';
        specs.fontFamily = selectedItem.fontFamily || 'N/A';
        specs.text = selectedItem.text || 'N/A';
    } else if (selectedItem.fill && selectedItem.fill.constructor.name === 'Color') {
        const fill = selectedItem.fill;
        specs.fillColor = `rgba(${Math.round(fill.r)}, ${Math.round(fill.g)}, ${Math.round(fill.b)}, ${fill.a})`;
    }

    dialog.innerHTML = `
        <style>
            .spec-modal {
                padding: 24px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 500px;
                max-height: 70vh;
                overflow-y: auto;
            }
            .spec-modal-title {
                font-size: 20px;
                font-weight: bold;
                color: #333;
                margin-bottom: 20px;
                text-align: center;
                border-bottom: 2px solid #007ACC;
                padding-bottom: 8px;
            }
            .spec-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 20px;
            }
            .spec-card {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 12px;
            }
            .spec-label {
                font-size: 12px;
                font-weight: 600;
                color: #6c757d;
                text-transform: uppercase;
                margin-bottom: 4px;
            }
            .spec-value {
                font-size: 14px;
                color: #333;
                font-family: 'Monaco', 'Menlo', monospace;
                word-break: break-all;
            }
            .json-section {
                background: #f8f8f8;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 20px;
            }
            .json-title {
                font-size: 14px;
                font-weight: 600;
                color: #495057;
                margin-bottom: 8px;
            }
            #output {
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 11px;
                line-height: 1.4;
                white-space: pre-wrap;
                background: white;
                padding: 12px;
                border-radius: 4px;
                border: 1px solid #ddd;
                max-height: 200px;
                overflow-y: auto;
            }
            .modal-footer {
                display: flex;
                justify-content: center;
                gap: 12px;
            }
            .btn {
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                border: none;
                transition: background-color 0.2s;
            }
            .btn-primary {
                background: #007ACC;
                color: white;
            }
            .btn-primary:hover {
                background: #005a9e;
            }
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            .btn-secondary:hover {
                background: #545b62;
            }
        </style>
        <form method="dialog" class="spec-modal">
            <h2 class="spec-modal-title">🎯 Quick Spec Extract</h2>
            
            <div class="spec-grid">
                ${Object.entries(specs)
                    .map(
                        ([key, value]) => `
                    <div class="spec-card">
                        <div class="spec-label">${key}</div>
                        <div class="spec-value">${value}</div>
                    </div>
                `
                    )
                    .join('')}
            </div>
            
            <div class="json-section">
                <div class="json-title">JSON Output:</div>
                <div id="output">${JSON.stringify(specs, null, 2)}</div>
            </div>
            
            <footer class="modal-footer">
                <button class="btn btn-secondary" id="copy-btn" type="button">Copy JSON</button>
                <button class="btn btn-primary" type="submit">Close</button>
            </footer>
        </form>
    `;

    document.appendChild(dialog);

    // Add event listeners
    dialog.querySelector('#copy-btn').addEventListener('click', (event) => copyToClipboard(event, '#output'));

    try {
        await dialog.showModal();
    } catch (error) {
        console.error('Dialog error:', error);
    } finally {
        dialog.remove();
    }
}

module.exports = {
    quickSpecExtract,
};
