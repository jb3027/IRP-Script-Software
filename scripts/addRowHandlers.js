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
                    '<td contenteditable="false" style="text-align:center; pointer-events: none; user-select: none;"></td>' +
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
            '<td contenteditable="false" style="text-align:center; pointer-events: none; user-select: none;"></td>' +
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
                <td contenteditable="false" style="pointer-events: none; user-select: none;"></td>
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

    // ADD/REMOVE CUT ON CLICK
    // If user clicks cut button while in script column:
    // - If there's already a cut line: removes it (preserves text)
    // - If no cut line: creates a new one with selected text
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

        function calculateTextPosition() {
            // If no text is selected, find the last line with content
            if (!selectedText.trim()) {
                const cellText = cell.textContent || cell.innerText || '';
                const lines = cellText.split('\n');
                // Find the last non-empty line
                for (let i = lines.length - 1; i >= 0; i--) {
                    if (lines[i].trim() !== '') {
                        return i + 1; // Return 1-based line number
                    }
                }
                return 1; // If all lines are empty, return 1
            }
            
            // Get the range's start position within the cell
            const rangeStart = range.startOffset;
            const cellText = cell.textContent || cell.innerText || '';
            
            // Count newlines before the selection start
            const textBeforeSelection = cellText.substring(0, rangeStart);
            const newlineCount = (textBeforeSelection.match(/\n/g) || []).length;
            
            return newlineCount + 1; // Return 1-based line number
        }

        function createCutLine(text) {
            const span = document.createElement('span');
            span.className = 'cut-line';
            span.textContent = text;
            // Store the original text as a data attribute for restoration
            span.setAttribute('data-original-text', text);
            
            // Calculate the line position and set appropriate top offset
            const linePosition = calculateTextPosition();
            const lineHeight = 20; // Approximate line height in pixels
            const baseOffset = 30; // Base offset from CSS
            const calculatedTop = baseOffset + (linePosition - 1) * lineHeight;
            
            span.style.position = 'absolute';
            span.style.top = calculatedTop + 'px';
            span.style.left = '0';
            span.style.right = '0';
            span.style.zIndex = '1000';
            span.style.marginLeft = '-800px';
            span.style.paddingLeft = '800px';
            span.style.overflow = 'visible';
            span.style.transform = 'translateY(5px)';
            
            return span;
        }

        function addSlashAfter(element) {
            const slashSpan = document.createElement('span');
            slashSpan.textContent = " / ";
            slashSpan.className = 'cut-line-slash';
            element.after(slashSpan);
            return slashSpan;
        }

        function moveCursorAfter(node) {
            const newRange = document.createRange();
            newRange.setStartAfter(node);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }

        function alignColumnsWithCutLine() {
            const row = cell.closest('tr');
            if (!row) return;
            
            const textPos = getTextPosition();
            const lineHeight = 20;
            const baseOffset = 30;
            const cutLineTop = baseOffset + (textPos.lineNumber - 1) * lineHeight + 5; // +5 for translateY
            
            // Calculate how much padding to add to extend cells upward
            const extraPadding = Math.max(0, cutLineTop - 30); // Extra padding needed
            
            // Add padding to camera number (first column) to extend it upward
            const cameraCell = row.cells[0];
            if (cameraCell) {
                cameraCell.style.paddingTop = (extraPadding + 5) + 'px'; // Extend upward
            }
            
            // Add padding to shot type and subject (second column) to extend it upward
            const shotTypeCell = row.cells[1];
            if (shotTypeCell) {
                shotTypeCell.style.paddingTop = (extraPadding + 5) + 'px'; // Extend upward
            }
            
            // Add padding to extra info (fourth column) to extend it upward
            const extraInfoCell = row.cells[3];
            if (extraInfoCell) {
                extraInfoCell.style.paddingTop = (extraPadding + 5) + 'px'; // Extend upward
            }
            
            // Adjust row height to accommodate the cut line and extended cells
            const totalHeight = cutLineTop + 40; // Cut line + space for elements below
            row.style.minHeight = totalHeight + 'px';
        }

        function resetColumnAlignment() {
            const row = cell.closest('tr');
            if (!row) return;
            
            // Reset all cell padding
            Array.from(row.cells).forEach(cell => {
                cell.style.paddingTop = '';
            });
            
            // Reset row height
            row.style.minHeight = '';
        }

        if (existingCutLine) {
            // Get the original text that was cut
            const originalText = existingCutLine.getAttribute('data-original-text') || existingCutLine.textContent;
            
            // Remove the existing cut line and slash
            const nextNode = existingCutLine.nextSibling;
            if (nextNode && (nextNode.nodeType === Node.TEXT_NODE && nextNode.textContent.includes('/')) || 
                (nextNode.nodeType === Node.ELEMENT_NODE && nextNode.classList.contains('cut-line-slash'))) {
                nextNode.remove();
            }
            existingCutLine.remove();
            
            // Restore the original text to the cell
            const textNode = document.createTextNode(originalText);
            cell.appendChild(textNode);
            
            // Reset column alignment
            resetColumnAlignment();
            
            // Position cursor at the end of the restored text
            const newRange = document.createRange();
            newRange.setStartAfter(textNode);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            return;
        } else {
            try {
                const newSpan = createCutLine(selectedText);
                range.deleteContents();
                range.insertNode(newSpan);
                const slashSpan = addSlashAfter(newSpan);
                moveCursorAfter(slashSpan);
                
                // Align other columns with the cut line
                alignColumnsWithCutLine();
            } catch (e) {
                console.error('Error creating cut line:', e);
            }
        }
    });
}); 