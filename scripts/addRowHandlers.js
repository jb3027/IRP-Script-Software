// Add Row Handlers
// This file handles adding events, inserts, items, durations, and cuts to the table

$(document).ready(function() {
    // ADD EVENT 
    $('.addEvent-button').on('click', function() {
        const selection = window.getSelection();
        let targetRow;

        // Find if the user has text selected
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            // First try to find the closest td, then find its parent tr
            const cell = range.commonAncestorContainer.nodeType === 1 
                ? range.commonAncestorContainer.closest('td')?.closest('tr')
                : range.commonAncestorContainer.parentElement.closest('td')?.closest('tr');
            if (cell) {
                targetRow = $(cell);
                const newRow = $('<tr class="event_highlighted">' +
                    '<td contenteditable="false" style="text-align:center"></td>' +
                    '<td contenteditable="true">' + createShotTypeCell("SHOT TYPE", false) + '</td>' +
                    '<td contenteditable="true"></td>' +
                    '<td contenteditable="true" style="text-align:center"></td>' +
                    '<td style="border:none; width:90px">' + createRowButtons() + '</td>' +
                '</tr>');
                
                $(newRow).insertAfter(targetRow);
                updateEventNumbers();
                initDraggable(); // Make it draggable
                // Sync state after adding new event row
                setTimeout(function() {
                    if (typeof syncStateFromTable === 'function') {
                        syncStateFromTable();
                    }
                }, 150);
                return;
            }
        }

        // If no selection, create new row at the end
        const newRow = '<tr class="event_highlighted">' +
            '<td contenteditable="false" style="text-align:center"></td>' +
            '<td contenteditable="true">' + createShotTypeCell("SHOT TYPE", false) + '</td>' +
            '<td contenteditable="true"></td>' +
            '<td contenteditable="true" style="text-align:center"></td>' +
            '<td style="border:none; width:90px">' + createRowButtons() + '</td>' +
        '</tr>';
        $('#event-table tbody').append(newRow);
        updateEventNumbers();
        
        // Initialize draggable on the newly added row
        initDraggable();
        
        // Sync state after adding new event row
        setTimeout(function() {
            if (typeof syncStateFromTable === 'function') {
                syncStateFromTable();
            }
        }, 150);
    });

    // ADD INSERT
    $('.addInsert-button').on('click', function() {
        const selection = window.getSelection();
        let targetRow;

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            // First try to find the closest td, then find its parent tr
            const cell = range.commonAncestorContainer.nodeType === 1 
                ? range.commonAncestorContainer.closest('td')?.closest('tr')
                : range.commonAncestorContainer.parentElement.closest('td')?.closest('tr');
            if (cell) {
                targetRow = $(cell);
                const newRow = $('<tr class="insert_highlighted">' +
                    '<td contenteditable="false" style="text-align:center"></td>' +
                    '<td contenteditable="true" style="text-align:center"></td>' +
                    '<td contenteditable="true">' + createInsertCell() + '</td>' +
                    '<td contenteditable="true" style="text-align:center"></td>' +
                    '<td style="border:none; width:90px">' + createRowButtons() + '</td>' +
                '</tr>');
                
                $(newRow).insertAfter(targetRow);
                updateEventNumbers();
                initDraggable(); // Make it draggable
                // Sync state after adding new insert row
                setTimeout(function() {
                    if (typeof syncStateFromTable === 'function') {
                        syncStateFromTable();
                    }
                }, 150);
                return;
            }
        }

        // If no selection, create new row at the end
        const newRow = '<tr class="insert_highlighted">' +
            '<td contenteditable="false" style="text-align:center"></td>' +
            '<td contenteditable="true" style="text-align:center"></td>' +
            '<td contenteditable="true">' + createInsertCell() + '</td>' +
            '<td contenteditable="true" style="text-align:center"></td>' +
            '<td style="border:none; width:90px">' + createRowButtons() + '</td>' +
        '</tr>';
        $('#event-table tbody').append(newRow);
        updateEventNumbers();
        
        // Initialize draggable on the newly added row
        initDraggable();
        
        // Sync state after adding new insert row
        setTimeout(function() {
            if (typeof syncStateFromTable === 'function') {
                syncStateFromTable();
            }
        }, 150);
    });

    // ADD ITEM
    $('.addItem-button').on('click', function() {
        const selection = window.getSelection();
        
        // Calculate item number upfront to avoid DOM timing issues
        const itemCount = $('#event-table tbody tr.item_highlighted').length;
        const newItemNumber = itemCount + 1;
        
        const newRow = $(`
            <tr class="item_highlighted">
                <td contenteditable="false" style="text-align:center"></td>
                <td contenteditable="true"></td>
                <td contenteditable="false">
                    <div class="item-cell-container">
                        <span contenteditable="false" style="text-decoration: underline;"><b>ITEM ${newItemNumber}: &nbsp;</b></span>
                        <input type="text" class="item-content" autocomplete="off" placeholder="New Item" style="background-color: black; margin-left: -15px;">
                    </div>
                </td>
                <td contenteditable="true" style="text-align:center"></td>
                <td style="border:none; width:90px">${createRowButtons()}</td>
            </tr>
        `);
        
        // Check if there's a meaningful selection (not just cursor in input field)
        let targetRow = null;
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString().trim();
            
            // Use selection-based insertion ONLY if there is actual selected text OR
            // the selection is inside a contenteditable cell (and not an input field).
            const isInsideEditable = range.commonAncestorContainer.nodeType === 1 && 
                                 range.commonAncestorContainer.closest('[contenteditable="true"]');
            const isInsideInput = $(range.commonAncestorContainer).closest('input, textarea').length > 0;

            if (selectedText.length > 0 || (isInsideEditable && !isInsideInput)) {
                const cell = range.commonAncestorContainer.nodeType === 1 
                    ? range.commonAncestorContainer.closest('tr')
                    : range.commonAncestorContainer.parentElement.closest('tr');
                
                if (cell && cell.closest('#event-table')) {
                    targetRow = $(cell);
                }
            }
        }
        
        if (targetRow) {
            // Insert after the selected row
            targetRow.after(newRow);
        } else {
            // Default: append to end of table
            $('#event-table tbody').append(newRow);
        }
        
        updateItemNumbers();
        initDraggable();
        
        // Sync state after adding new item row
        setTimeout(function() {
            if (typeof syncStateFromTable === 'function') {
                syncStateFromTable();
            }
        }, 150);
    });

    // ADD DURATION
    $('.addDur-button').on('click', function() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const timeInput = $('<input type="time" style="border: none; width: auto;">');
        range.deleteContents();
        range.insertNode(timeInput[0]);
        timeInput.focus();
    });

    // ADD CUT ON CLICK
    $('.addCut-button').on('click', function() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const cell = range.commonAncestorContainer.nodeType === 1 
            ? range.commonAncestorContainer.closest('td')
            : range.commonAncestorContainer.parentElement.closest('td');
            
        if (!cell || cell.cellIndex !== 2) return;

        const selectedText = selection.toString();
        const existingCutLine = cell.querySelector('.cut-line');

        function createCutLine(text) {
            const span = document.createElement('span');
            span.className = 'cut-line';
            span.textContent = text;
            span.style.transform = 'translateY(5px)';
            return span;
        }

        function addSlashAfter(element) {
            const textNode = document.createTextNode(" / ");
            element.after(textNode);
            return textNode;
        }

        function moveCursorAfter(node) {
            const newRange = document.createRange();
            newRange.setStartAfter(node);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }

        if (existingCutLine) {
            showQuestionModal(
                "Remove or Add new event?", // question
                "Remove", // option 1
                "Add new event", // option 2

                // REMOVE
                function() {
                    const selection = window.getSelection();
                    const range = selection.getRangeAt(0);
                    let newText = selection.toString();
                    // Removes the '/' cut within the highlight
                    newText = newText.replace(/ \/ /g, ' ').trim();           

                    // Get the cell containing the selection
                    const cell = range.commonAncestorContainer.nodeType === 1 
                        ? range.commonAncestorContainer.closest('td')
                        : range.commonAncestorContainer.parentElement.closest('td');
                    
                    // Find and remove the existing cut line
                    const existingCutLine = cell.querySelector('.cut-line');
                    if (existingCutLine) {
                        // Remove the cut line and the following slash
                        const nextNode = existingCutLine.nextSibling;
                        if (nextNode && nextNode.nodeType === Node.TEXT_NODE && nextNode.textContent.includes('/')) {
                            nextNode.remove();
                        }
                        existingCutLine.remove();
                    }
                },
                // ADD TO NEW EVENT
                function() {
                    const selectedText = selection.toString();

                    $('.addEvent-button').trigger('click');
                    updateEventNumbers();

                    const newRow = cell.closest('tr').nextElementSibling;
                    const newScriptCell = newRow.cells[2];

                    const cutLineSpan = createCutLine(selectedText);
                    newScriptCell.appendChild(cutLineSpan);
                    addSlashAfter(cutLineSpan);

                    range.deleteContents();
                    if (cell.textContent.trim() === '') {
                        cell.textContent = '';
                    }
                }
            );
        } else {
            try {
                const newSpan = createCutLine(selectedText);
                range.deleteContents();
                range.insertNode(newSpan);
                const textNode = addSlashAfter(newSpan);
                moveCursorAfter(textNode);
            } catch (e) {
            }
        }
    });
}); 