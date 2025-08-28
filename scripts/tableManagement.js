// Table Management
// This file handles table structure, row creation, and table-specific functionality

// Table data and options
const tableData = [
    { eventNum: '1', shotType: '', content: 'Add your script here', details: 'E.g., Music Cues' },
];

const dropdownOptions = ['SHOT TYPE', 'ES', 'WS', '2S', '3S', 'MS', 'MCU', 'CU', 'ECU', 'AS DIRECTED', 'CUSTOM'];

// CREATE SHOT TYPE CELL
function createShotTypeCell(shotType, firstTime) {
    const selectHTML = `
        <div class="shot-type-wrapper" data-shot-group="0">
            <div class="shot-inputs-container">
                <div class="shot-input-row" data-shot-index="0">
                    <div class="shot-type-subject-wrapper">
                        <select class="form-control shot-type-select">
                            <option value="">SHOT TYPE</option>
                            <option value="ES">ES</option>
                            <option value="WS">WS</option>
                            <option value="2S">2S</option>
                            <option value="3S">3S</option>
                            <option value="MS">MS</option>
                            <option value="CU">CU</option>
                        </select>
                        <textarea class="editable-text shotSubject" name="shotSubject" autocomplete="off" placeholder="Shot Subject" style="resize: none; width: 120px;"></textarea>
                    </div>
                    <textarea class="custom-shot-type" autocomplete="off" style="display:none; width: 100% !important; max-width: 100% !important; min-width: 100% !important; overflow: hidden !important; box-sizing: border-box !important; resize: none;"></textarea>
                    <button class="remove-shot-btn" title="Remove this shot type and subject" style="display:none">×</button>
                </div>
                <div class="add-shot-btn" title="Add another shot type and subject">
                    <div class="add-btn-line"></div>
                    <div class="add-btn-circle">
                        <span class="add-btn-plus">+</span>
                    </div>
                    <div class="add-btn-line"></div>
                </div>
            </div>
        </div>`;

    const result = '<div>' +
        '<div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">' +
            '<input type="text" class="editable-cell cameraNum event_highlighted" name="cameraNum" autocomplete="off" placeholder="Camera Number">' + 
            '<input type="text" class="editable-cell cameraPos event_highlighted" name="cameraPos" autocomplete="off" placeholder="Camera Position">' + 
        '</div>' +
        '<div class="shot-type-flex-container event_highlighted">' +
            selectHTML +
        '</div>' +
        '<input type="text" class="editable-cell extraInfo event_highlighted" name="extraInfo" autocomplete="off" placeholder="Additional Info (E.g., TRACK OUT)">' +
    '</div>';
    
    return result;
}

// CREATE INSERT CELL
function createInsertCell() {
    return '<div style="text-align: left; width: 60%; margin: 0 auto;" class="insert-content">' +
        '<u><input type="text" class="editable-cell insertTitle" name="insertTitle" autocomplete="off" style="text-align: left; width: 60%; margin: 0 auto; outline: none; color: rgb(16, 16, 16);" placeholder="Ven: Title"></u>' +
        '<input type="text" class="editable-text insertIn" name="insertIn" autocomplete="off" style="text-align: left; width: 60%; margin: 0 auto; outline: none; color: rgb(16, 16, 16);" placeholder="In: Music">' +
        '<div class="insert-duration-container" style="text-align: left; width: 60%; margin: 0 auto; margin-left: 18px; outline: none; color: rgb(16, 16, 16);">' +
            '<span style="white-space: nowrap; color: rgb(16, 16, 16);">Dur: ' +
            '<input type="time" id="durationVT" name="durationVT" autocomplete="off" value="00:00" style="border: none; width: auto; margin: 0 auto; color: rgb(16, 16, 16);">' +
            '</span>' +
        '</div>' +
        '<input type="text" class="editable-cell insertOut" name="insertOut" autocomplete="off" style="text-align: left; width: 60%; margin: 0 auto; outline: none; color: rgb(16, 16, 16);" placeholder="Out: Music">' +
    '</div>';
}

// CREATE ROW BUTTONS
function createRowButtons() {
    const buttons = `<div class="row-actions">
        <button class="row-button drag" title="Drag Row">
            <i class="fas fa-grip-vertical"></i>
        </button>
        <button class="row-button remove" title="Remove Row">
            <i class="fas fa-minus"></i>
        </button>
    </div>`;
    return buttons;
}

// CREATE TABLE ROW
function createTableRow(type = 'default') {
    return `<tr class="${type}_highlighted">
        <td contenteditable="false" style="text-align:center"></td>
        <td contenteditable="true"></td>
        <td contenteditable="false"></td>
        <td contenteditable="true" style="text-align:center"></td>
        <td style="border:none; width:90px">${createRowButtons()}</td>
    </tr>`;
}

// UPDATE EVENT NUMBERS
window.updateEventNumbers = function() {
    let eventNumber = 1;
    $('#event-table tbody tr').each(function() {
        // Check if there is an event in the row (If Shot column or Insert has content)
        const hasEvent = $(this).find('td:nth-child(2)').text().trim().length > 0;
        const hasInsert = $(this).find('td:nth-child(3)').text().trim().length > 0;
        const isItem = $(this).hasClass('item_highlighted');
        
        if ((hasEvent || hasInsert) && !isItem) {  // Only number non-item rows
            $(this).find('td:first').text(eventNumber);
            eventNumber++;
        } 
    });
};

// UPDATE ITEM NUMBERS
window.updateItemNumbers = function() {
    let itemNumber = 1;
    $('#event-table tbody tr').each(function() {
        // Checks if there is an item 
        const isItem = $(this).hasClass('item_highlighted');
        
        if (isItem) { 
            // Update item number to account for dragging or deletion of rows
            const itemCell = $(this).find('td:nth-child(3)');
            const itemText = itemCell.find('b');
            itemText.text(`ITEM ${itemNumber}: \u00A0`);
            itemNumber++;
        } 
    });
};

// PREVENT DELETION FUNCTION
function preventDeletion(event, defaultContent) {
    const element = event.target;
    const row = element.closest('tr');
    
    // Use setTimeout to get the updated content after the current event cycle
    setTimeout(() => {
        const shotSubject = row.querySelector('.shotSubject');
        const cameraNum = row.querySelector('.cameraNum');
        const cameraPos = row.querySelector('.cameraPos');
        const extraInfo = row.querySelector('.extraInfo');

        // Check if any of the cells are empty
        if (shotSubject.textContent.length === 0) {
            // Restore the previous content
            shotSubject.textContent = '\u00A0';
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(shotSubject);
            range.collapse(false); // false means collapse to end
            selection.removeAllRanges();
            selection.addRange(range);     
        }

        if (cameraNum.textContent.length === 0) {
            // Restore the previous content
            cameraNum.textContent = '\u00A0';
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(shotSubject);
            range.collapse(false); // false means collapse to end
            selection.removeAllRanges();
            selection.addRange(range);     
        }

        if (cameraPos.textContent.length === 0) {
            // Restore the previous content
            cameraPos.textContent = '\u00A0';
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(shotSubject);
            range.collapse(false); // false means collapse to end
            selection.removeAllRanges();
            selection.addRange(range);     
        }

        if (extraInfo.textContent.length === 0) {
            // Restore the previous content
            extraInfo.textContent = '\u00A0';
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(shotSubject);
            range.collapse(false); // false means collapse to end
            selection.removeAllRanges();
            selection.addRange(range);     
        }
    }, 0);
}

// Make functions globally available
window.createShotTypeCell = createShotTypeCell;
window.createInsertCell = createInsertCell;
window.createRowButtons = createRowButtons;
window.createTableRow = createTableRow;
window.preventDeletion = preventDeletion;
window.tableData = tableData;
window.dropdownOptions = dropdownOptions; 