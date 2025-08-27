// Running Order Functionality
// This file handles the running order view generation and management

$(document).ready(function() {
    // RUNNING ORDER
    $(document).on('click', '.runningOrder-button', function() {
        
        // Check if running order is already displayed - prevent duplicates
        if ($('.running-order-container').length > 0) {
            console.log('Running order already displayed, ignoring click');
            return;
        }
        
        // Deselect all sidebar buttons when running order is displayed
        $('.sidebar-nav .nav-link').removeClass('active');
        

        


        // Event > Item numbers
        const eventNumbers = [];
        const itemNumbers = [];
        const sourceType = [];
        const soundSource = [];
        const itemLength = [];
        const accumulatedTime = [];
        const timeStore = [];
        const itemTitle = [];
        let accumulatedCalc = 0;

        // Calculate how long it would take for dialogue to be spoken
        function wordCalculation(content) { // Passes in the dialogue in the event
            const wordCount = content.trim().split(' ').length; // Get word count
            const wordsPerSecond = 2.5; // Average words per second
            const totalSeconds = wordCount * wordsPerSecond; 
            // Call the function to convert this to a time format
            return timeConvert(totalSeconds); 
        }

        function secondCalc(time) {
            const timeString = String(time).trim();
            const timeFormat = timeString.split(':');
            const minutes = parseInt(timeFormat[0], 10);
            const seconds = parseInt(timeFormat[1], 10);
            const totalSeconds = minutes * 60 + seconds;
            return totalSeconds;
        }

        // Convert time in seconds to '00:00' format for running order
        function timeConvert(time) {
            const totalSeconds = Math.round(time); // Round total seconds
            const minutes = Math.floor(totalSeconds / 60); // Convert seconds to minutes
            const seconds = totalSeconds % 60; // Get the remainder seconds
            // Return this in a '00:00' format
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        let currentItem = null;

        // Find all item rows and their indices
        const itemRows = [];
        // $('#event-table').find('tr.event_highlighted').each(function(index) {
        $('#event-table tbody tr').each(function(index) {
            if ($(this).hasClass('item_highlighted')) {
                itemRows.push({
                    index: index,
                    itemNumber: $(this).find('td:nth-child(3)').text().match(/ITEM\s+(\d+)/i)?.[1]
                });
            }
        });

        // Process rows between each pair of items
        for (let i = 0; i < itemRows.length; i++) {
            const currentItem = itemRows[i];
            const nextItem = itemRows[i + 1];
            const startIndex = currentItem.index + 1;
            const endIndex = nextItem ? nextItem.index : $('#event-table tbody tr').length;

            // Get the item title and push it into the list
            const itemContent = $('#event-table tbody tr').eq(currentItem.index)
                .find('.item-content')
                .map(function() {
                    // Try getting value first, then fall back to text content
                    return $(this).val() || $(this).text();
                })
                .get(0)
                .trim();
            itemTitle.push(itemContent);
            itemNumbers.push(currentItem.itemNumber);
            
            // Initialize total time for item
            let totalSeconds = 0;
            let hasVT = false;

            // Process rows between current item and next item 
            for (let j = startIndex; j < endIndex; j++) {
                const row = $('#event-table tbody tr').eq(j);
                const hasEvent = row.find('td:nth-child(2)').text().trim().length > 0;
                const hasInsert = row.find('input[type="time"]').length > 0;

                if (hasEvent) {
                    // Calculate timing based on word count for events
                    const scriptCell = row.find('td:nth-child(3)');
                    const content = scriptCell.clone()
                        .find('.cut-line').remove().end()
                        .text()
                        .trim();
                    
                    const wordCount = content ? content.split(' ').length : 0;
                    const wordsPerSecond = 2.5;
                    totalSeconds += wordCount * wordsPerSecond;
                } else if (hasInsert) {
                    hasVT = true;
                    // Add insert duration
                    const durationInput = row.find('input[type="time"]');
                    if (durationInput.length > 0 && durationInput.val()) {
                        const [minutes, seconds] = durationInput.val().split(':');
                        totalSeconds += parseInt(minutes) * 60 + parseInt(seconds);
                    }
                }
            }

            // Push all data for this item
            sourceType.push(hasVT ? "VT" : "CAMS");
            soundSource.push(hasVT ? "VT" : "");
            itemLength.push(timeConvert(totalSeconds));
            
            // Debug logging
            console.log(`Item ${currentItem.itemNumber}: totalSeconds=${totalSeconds}, itemLength=${timeConvert(totalSeconds)}`);
            console.log(`Item ${currentItem.itemNumber}: hasVT=${hasVT}, sourceType=${hasVT ? "VT" : "CAMS"}`);
        }


        function accumulatedTimeCalc() {
            for(let i = 0; i < itemLength.length; i++) {
                if(i == 0) {
                    accumulatedTime.push(timeConvert(secondCalc(itemLength[i])));
                } else {
                    const currentTime = secondCalc(itemLength[i]);
                    const previousAccumulated = secondCalc(accumulatedTime[i-1]);
                    const total = currentTime + previousAccumulated;
                    accumulatedTime.push(timeConvert(total));
                }
            }
        }

        accumulatedTimeCalc();
        
        // Debug logging for arrays
        console.log('=== RUNNING ORDER ARRAYS ===');
        console.log('itemNumbers:', itemNumbers);
        console.log('itemLength:', itemLength);
        console.log('accumulatedTime:', accumulatedTime);
        console.log('sourceType:', sourceType);
        console.log('soundSource:', soundSource);
        console.log('itemTitle:', itemTitle);
        console.log('=== END ARRAYS ===');
        
        // Display running order in the main content area (like camera cards)
        // Hide the script table and show running order instead
        $('.container').hide();
        
        const runningOrderContent = $(`
            <div class="running-order-container" style="
                background: white;
                padding: 20px;
                font-family: Arial, sans-serif;
                color: black;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                margin: 20px;
            ">
                <div class="running-order-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 15px;
            
                ">
                    <h2 style="margin: 0; color: #333;">Running Order</h2>
                </div>
                <div class="running-order-info-bar" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8f9fa;
                    padding: 12px 20px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border: 1px solid #dee2e6;
                    font-size: 16px;
                    font-weight: 500;
                ">
                    <span style="color: #495057;">Total Items: <strong style="color: #333;">${itemNumbers.length}</strong></span>
                    <span style="color: #495057;">Total Run-time: <strong style="color: #333;">${accumulatedTime.length > 0 ? accumulatedTime[accumulatedTime.length - 1] : '00:00'}</strong></span>
                </div>
                <table style="width: 100%; text-align:center; border-collapse: collapse;" id="runningOrder-table" class="table">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="width:8%; padding: 12px; border: 1px solid #dee2e6;">ITEM NUM.</th>
                            <th style="width:12%; padding: 12px; border: 1px solid #dee2e6;">SOURCE</th>
                            <th style="width:40%; padding: 12px; border: 1px solid #dee2e6;">CONTENT</th>
                            <th style="width:20%; padding: 12px; border: 1px solid #dee2e6;">SOUND</th>
                            <th style="width:10%; padding: 12px; border: 1px solid #dee2e6;">ITEM TIME</th>
                            <th style="width:10%; padding: 12px; border: 1px solid #dee2e6;">ACC. TIME</th>
                            <th style="width:10%; padding: 12px; border: 1px solid #dee2e6;">ACTUAL TIME</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemNumbers.map((num, index) => {
                            const stateItem = productionState.events.find(event => event.type === 'item' && event.itemNumber == num);
                            const actualTime = stateItem ? stateItem.actualTime : '';
                            const savedSoundSource = stateItem ? stateItem.soundSource : soundSource[index];
                            const savedItemLength = stateItem ? stateItem.itemLength : itemLength[index];
                            const savedItemContent = stateItem ? stateItem.itemContent : itemTitle[index];
                            const savedSourceType = stateItem ? stateItem.sourceType : sourceType[index];
                            
                            // Debug logging for each row
                            console.log(`Row ${index}: num=${num}, itemLength[index]=${itemLength[index]}, savedItemLength=${savedItemLength}`);
                            console.log(`Row ${index}: savedItemContent=${savedItemContent}, savedSourceType=${savedSourceType}`);
                            
                            return `
                            <tr style="border-bottom: 1px solid #dee2e6;">
                                <td style="padding: 12px; border: 1px solid #dee2e6;">${num}</td>
                                <td contenteditable="true" class="source-type" style="padding: 12px; border: 1px solid #dee2e6;">${savedSourceType || sourceType[index]}</td>
                                <td contenteditable="true" class="item-content" style="padding: 12px; border: 1px solid #dee2e6; text-align:left;">${savedItemContent || itemTitle[index]}</td>
                                <td contenteditable="true" class="sound-source" style="padding: 12px; border: 1px solid #dee2e6;">${savedSoundSource || ''}</td>
                                <td contenteditable="true" class="item-length" style="padding: 12px; border: 1px solid #dee2e6;">${savedItemLength || itemLength[index] || '00:00'}</td>
                                <td style="padding: 12px; border: 1px solid #dee2e6;">${accumulatedTime[index]}</td>
                                <td contenteditable="true" class="actual-time-cell" data-item-number="${num}" style="padding: 12px; border: 1px solid #dee2e6;">${actualTime || ''}</td>
                            </tr>
                            `
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `);
        
        // Insert the running order content after the production title
        $('.production-title-container').after(runningOrderContent);


        

        




        // Add event listeners for all editable cells to save changes
        $(document).on('blur', '.actual-time-cell', function() {
            const itemNumber = $(this).data('item-number');
            const actualTime = $(this).text();
            console.log(`Saving actual time for item ${itemNumber}: ${actualTime}`);
            
            const itemInState = productionState.events.find(event => event.type === 'item' && event.itemNumber == itemNumber);
            if (itemInState) {
                itemInState.actualTime = actualTime;
                sessionStorage.setItem('productionState', JSON.stringify(productionState));
                console.log(`Saved actual time to productionState for item ${itemNumber}`);
            } else {
                console.warn(`Could not find item ${itemNumber} in productionState`);
            }
        });

        // Save any other editable content in the running order
        $(document).on('blur', '[contenteditable="true"]', function() {
            console.log('=== BLUR EVENT TRIGGERED ===');
            console.log('Element that lost focus:', this);
            console.log('Element classes:', $(this).attr('class'));
            
            const itemNumber = $(this).closest('tr').find('.actual-time-cell').data('item-number');
            console.log('Item number found:', itemNumber);
            
            if (itemNumber) {
                const content = $(this).text();
                const fieldType = $(this).hasClass('sound-source') ? 'soundSource' : 
                                 $(this).hasClass('item-length') ? 'itemLength' : 
                                 $(this).hasClass('item-content') ? 'itemContent' :
                                 $(this).hasClass('source-type') ? 'sourceType' : 'other';
                
                console.log(`Field type: ${fieldType}, Content: ${content}`);
                console.log(`Current sourceType array:`, sourceType);
                console.log(`Current itemNumbers array:`, itemNumbers);
                
                const itemInState = productionState.events.find(event => event.type === 'item' && event.itemNumber == itemNumber);
                if (itemInState) {
                    if (fieldType === 'soundSource') {
                        itemInState.soundSource = content;
                    } else if (fieldType === 'itemLength') {
                        itemInState.itemLength = content;
                        
                        // If this is a VT item and the item time changed, sync with script insert durations
                        const itemIndex = itemNumbers.indexOf(itemNumber);
                        console.log(`Item index in arrays: ${itemIndex}`);
                        console.log(`Source type at index ${itemIndex}: ${sourceType[itemIndex]}`);
                        
                        if (itemIndex !== -1 && sourceType[itemIndex] === 'VT') {
                            console.log(`✅ Item ${itemNumber} is VT type, syncing with script insert durations...`);
                            syncItemTimeWithInsertDurations(itemNumber, content);
                        } else {
                            console.log(`❌ Item ${itemNumber} is not VT type (${sourceType[itemIndex]}), skipping insert sync`);
                            console.log(`Available source types:`, sourceType);
                        }
                    } else if (fieldType === 'itemContent') {
                        itemInState.itemContent = content;
                    } else if (fieldType === 'sourceType') {
                        itemInState.sourceType = content;
                    }
                    sessionStorage.setItem('productionState', JSON.stringify(productionState));
                    console.log(`Saved ${fieldType} to productionState for item ${itemNumber}`);
                } else {
                    console.warn(`Could not find item ${itemNumber} in productionState for ${fieldType}`);
                }
            } else {
                console.warn('No item number found for this element');
            }
            console.log('=== BLUR EVENT COMPLETED ===');
        });
        
        // Also save data when the running order is about to be hidden/removed
        // This ensures data is saved even if blur events don't fire
        $(document).on('click', '.sidebar-nav .nav-link', function() {
            if ($('.running-order-container').length > 0) {
                console.log('Saving running order data before navigation...');
                saveAllRunningOrderData();
            }
        });
        
        
        
        // Listen for changes to insert durations in the script table
        $(document).on('change', 'input[type="time"]', function() {
            if ($('.running-order-container').length > 0) {
                // Find which item this insert belongs to
                const insertRow = $(this).closest('tr');
                const itemRow = insertRow.prevAll('tr').filter(function() {
                    return $(this).find('td:nth-child(2) .item-content').length > 0;
                }).last();
                
                if (itemRow.length > 0) {
                    const itemContent = itemRow.find('td:nth-child(2) .item-content').text().trim();
                    const itemNumberMatch = itemContent.match(/\d+/);
                    if (itemNumberMatch) {
                        const itemNumber = itemNumberMatch[0];
                        console.log(`Insert duration changed for item ${itemNumber}, updating running order`);
                        
                        // Update the running order item time for this item
                        updateRunningOrderItemTime(itemNumber);
                    }
                }
            }
        });
        
        // Ensure the running order button is restored when switching away
        // This will be handled by the sidebar navigation methods
    });
}); 

// Function to sync running order item time with script insert durations for VT items
function syncItemTimeWithInsertDurations(itemNumber, newItemTime) {
    console.log(`=== SYNC OPERATION STARTED ===`);
    console.log(`Syncing item ${itemNumber} time (${newItemTime}) with script insert durations`);
    
    // Validate input
    if (!itemNumber || !newItemTime) {
        console.warn('Invalid input: itemNumber or newItemTime is missing');
        return;
    }
    
    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(newItemTime)) {
        console.warn(`Invalid time format: ${newItemTime}. Expected format: MM:SS`);
        return;
    }
    
    console.log(`Looking for item ${itemNumber} in script table...`);
    
    // Find the item row in the script table
    console.log('Searching for item row in script table...');
    console.log('Total script table rows:', $('#event-table tbody tr').length);
    
    // First, let's temporarily show the script table if it's hidden
    if ($('.container').is(':hidden')) {
        console.log('Script table is hidden, temporarily showing it for lookup...');
        $('.container').show();
        // Give it a moment to render
        setTimeout(() => {
            console.log('Script table should now be visible');
        }, 100);
    }
    
    const itemRow = $('#event-table tbody tr').filter(function() {
        const hasItemContent = $(this).find('td:nth-child(2) .item-content').length > 0;
        const itemText = $(this).find('td:nth-child(2) .item-content').text().trim();
        const containsItemNumber = itemText.includes(itemNumber);
        
        console.log(`Row ${$(this).index()}: hasItemContent=${hasItemContent}, itemText="${itemText}", containsItemNumber=${containsItemNumber}`);
        
        return hasItemContent && containsItemNumber;
    });
    
    if (itemRow.length === 0) {
        console.warn(`❌ Could not find item ${itemNumber} row in script table`);
        console.log('Available item rows:', $('#event-table tbody tr').filter(function() {
            return $(this).find('td:nth-child(2) .item-content').length > 0;
        }).map(function() {
            return $(this).find('td:nth-child(2) .item-content').text().trim();
        }).get());
        
        // Hide the script table again since we couldn't find the item
        $('.container').hide();
        return;
    }
    
    console.log(`✅ Found item ${itemNumber} row at index ${itemRow.index()}`);
    
    const itemIndex = itemRow.index();
    const nextItemRow = $('#event-table tbody tr').slice(itemIndex + 1).filter(function() {
        return $(this).find('td:nth-child(2) .item-content').length > 0;
    }).first();
    
    const endIndex = nextItemRow.length > 0 ? nextItemRow.index() : $('#event-table tbody tr').length;
    console.log(`Searching for inserts between row ${itemIndex + 1} and row ${endIndex}`);
    
    // Find all insert rows between this item and the next item
    const insertRows = $('#event-table tbody tr').slice(itemIndex + 1, endIndex).filter(function() {
        return $(this).find('input[type="time"]').length > 0;
    });
    
    if (insertRows.length === 0) {
        console.log(`⚠️ No insert rows found for item ${itemNumber}`);
        return;
    }
    
    console.log(`✅ Found ${insertRows.length} insert rows for item ${itemNumber}`);
    
    // Convert new item time to seconds
    const [newMinutes, newSeconds] = newItemTime.split(':');
    const newTotalSeconds = parseInt(newMinutes) * 60 + parseInt(newSeconds);
    
    if (isNaN(newTotalSeconds) || newTotalSeconds < 0) {
        console.warn(`❌ Invalid time calculation: ${newMinutes}:${newSeconds} = ${newTotalSeconds}s`);
        return;
    }
    
    console.log(`New item time: ${newItemTime} = ${newTotalSeconds} seconds`);
    
    // Calculate current total duration of inserts
    let currentTotalSeconds = 0;
    insertRows.each(function(index) {
        const durationInput = $(this).find('input[type="time"]');
        if (durationInput.val()) {
            const [minutes, seconds] = durationInput.val().split(':');
            const insertSeconds = parseInt(minutes) * 60 + parseInt(seconds);
            if (!isNaN(insertSeconds)) {
                currentTotalSeconds += insertSeconds;
                console.log(`Insert ${index + 1} current duration: ${durationInput.val()} = ${insertSeconds}s`);
            }
        }
    });
    
    console.log(`Current insert total: ${currentTotalSeconds}s, New item time: ${newTotalSeconds}s`);
    
    if (currentTotalSeconds === 0) {
        console.log(`Distributing ${newTotalSeconds}s evenly across ${insertRows.length} inserts...`);
        // If no current duration, distribute evenly
        const durationPerInsert = Math.floor(newTotalSeconds / insertRows.length);
        const remainingSeconds = newTotalSeconds % insertRows.length;
        
        insertRows.each(function(index) {
            const durationInput = $(this).find('input[type="time"]');
            const insertDuration = durationPerInsert + (index < remainingSeconds ? 1 : 0);
            const minutes = Math.floor(insertDuration / 60);
            const seconds = insertDuration % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            durationInput.val(timeString);
            console.log(`✅ Set insert ${index + 1} duration to ${timeString}`);
        });
    } else {
        console.log(`Scaling existing durations proportionally...`);
        // Scale existing durations proportionally
        const scaleFactor = newTotalSeconds / currentTotalSeconds;
        
        if (scaleFactor <= 0) {
            console.warn(`❌ Invalid scale factor: ${scaleFactor}. Cannot scale durations.`);
            return;
        }
        
        console.log(`Scale factor: ${scaleFactor}`);
        
        insertRows.each(function(index) {
            const durationInput = $(this).find('input[type="time"]');
            if (durationInput.val()) {
                const [minutes, seconds] = durationInput.val().split(':');
                const currentSeconds = parseInt(minutes) * 60 + parseInt(seconds);
                const newSeconds = Math.round(currentSeconds * scaleFactor);
                const newMinutes = Math.floor(newSeconds / 60);
                const newSecs = newSeconds % 60;
                const timeString = `${newMinutes.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
                
                const oldValue = durationInput.val();
                durationInput.val(timeString);
                console.log(`✅ Scaled insert ${index + 1} duration from ${oldValue} to ${timeString}`);
            }
        });
    }
    
    // Update the production state to reflect the changes
    if (typeof syncStateFromTable === 'function') {
        console.log('Syncing script state...');
        setTimeout(() => {
            syncStateFromTable();
            console.log('✅ Script state synced after insert duration updates');
        }, 100);
    } else {
        console.warn('⚠️ syncStateFromTable function not available');
    }
    
    // Hide the script table again since we're done with the lookup
    if ($('.container').is(':visible')) {
        console.log('Hiding script table again...');
        $('.container').hide();
    }
    
    console.log(`=== SYNC OPERATION COMPLETED ===`);
    console.log(`Successfully synced item ${itemNumber} time with ${insertRows.length} insert durations`);
}

// Function to update running order item time when insert durations change in script
function updateRunningOrderItemTime(itemNumber) {
    console.log(`Updating running order item time for item ${itemNumber} based on script insert durations`);
    
    // Validate input
    if (!itemNumber) {
        console.warn('Invalid input: itemNumber is missing');
        return;
    }
    
    // Find the item row in the script table
    const itemRow = $('#event-table tbody tr').filter(function() {
        return $(this).find('td:nth-child(2) .item-content').length > 0 && 
               $(this).find('td:nth-child(2) .item-content').text().trim().includes(itemNumber);
    });
    
    if (itemRow.length === 0) {
        console.warn(`Could not find item ${itemNumber} row in script table`);
        return;
    }
    
    const itemIndex = itemRow.index();
    const nextItemRow = $('#event-table tbody tr').slice(itemIndex + 1).filter(function() {
        return $(this).find('td:nth-child(2) .item-content').length > 0;
    }).first();
    
    const endIndex = nextItemRow.length > 0 ? nextItemRow.index() : $('#event-table tbody tr').length;
    
    // Find all insert rows between this item and the next item
    const insertRows = $('#event-table tbody tr').slice(itemIndex + 1, endIndex).filter(function() {
        return $(this).find('input[type="time"]').length > 0;
    });
    
    if (insertRows.length === 0) {
        console.log(`No insert rows found for item ${itemNumber}`);
        return;
    }
    
    // Calculate total duration from inserts
    let totalSeconds = 0;
    insertRows.each(function() {
        const durationInput = $(this).find('input[type="time"]');
        if (durationInput.val()) {
            const [minutes, seconds] = durationInput.val().split(':');
            const insertSeconds = parseInt(minutes) * 60 + parseInt(seconds);
            if (!isNaN(insertSeconds)) {
                totalSeconds += insertSeconds;
            }
        }
    });
    
    // Add word count timing for events between inserts
    for (let j = itemIndex + 1; j < endIndex; j++) {
        const row = $('#event-table tbody tr').eq(j);
        const hasEvent = row.find('td:nth-child(2)').text().trim().length > 0;
        const hasInsert = row.find('input[type="time"]').length > 0;
        
        if (hasEvent && !hasInsert) {
            // Calculate timing based on word count for events
            const scriptCell = row.find('td:nth-child(3)');
            const content = scriptCell.clone()
                .find('.cut-line').remove().end()
                .text()
                .trim();
            
            const wordCount = content ? content.split(' ').length : 0;
            const wordsPerSecond = 2.5;
            totalSeconds += wordCount * wordsPerSecond;
        }
    }
    
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        console.warn(`Invalid total seconds calculation: ${totalSeconds}`);
        return;
    }
    
    const newItemTime = timeConvert(totalSeconds);
    console.log(`Calculated new item time for item ${itemNumber}: ${newItemTime} (${totalSeconds}s)`);
    
    // Update the running order display
    const runningOrderRow = $(`.running-order-container tr`).filter(function() {
        return $(this).find('td:first-child').text().trim() === itemNumber;
    });
    
    if (runningOrderRow.length > 0) {
        const itemLengthCell = runningOrderRow.find('.item-length');
        itemLengthCell.text(newItemTime);
        
        // Update the production state
        const itemInState = productionState.events.find(event => event.type === 'item' && event.itemNumber == itemNumber);
        if (itemInState) {
            itemInState.itemLength = newItemTime;
            sessionStorage.setItem('productionState', JSON.stringify(productionState));
            console.log(`Updated productionState itemLength for item ${itemNumber} to ${newItemTime}`);
        }
        
        // Recalculate accumulated times for all subsequent items
        recalculateAccumulatedTimes();
        
        console.log(`Successfully updated running order item time for item ${itemNumber} to ${newItemTime}`);
    } else {
        console.warn(`Could not find running order row for item ${itemNumber}`);
    }
}

// Function to recalculate accumulated times after item time changes
function recalculateAccumulatedTimes() {
    console.log('Recalculating accumulated times in running order');
    
    const rows = $('.running-order-container tbody tr');
    let accumulatedSeconds = 0;
    
    rows.each(function(index) {
        const itemLengthCell = $(this).find('.item-length');
        const itemTime = itemLengthCell.text().trim();
        
        if (itemTime && itemTime !== '00:00') {
            const [minutes, seconds] = itemTime.split(':');
            const itemSeconds = parseInt(minutes) * 60 + parseInt(seconds);
            accumulatedSeconds += itemSeconds;
            
            const accumulatedTimeCell = $(this).find('td:nth-child(6)');
            const newAccumulatedTime = timeConvert(accumulatedSeconds);
            accumulatedTimeCell.text(newAccumulatedTime);
            
            console.log(`Row ${index + 1}: item time ${itemTime}, accumulated ${newAccumulatedTime}`);
        }
    });
}

// Global function to save all running order data
window.saveAllRunningOrderData = function() {
    if ($('.running-order-container').length === 0) {
        console.log('No running order container found to save data from');
        return;
    }
    
    $('.running-order-container [contenteditable="true"]').each(function() {
        const itemNumber = $(this).closest('tr').find('.actual-time-cell').data('item-number');
        if (itemNumber) {
            const content = $(this).text();
            const fieldType = $(this).hasClass('sound-source') ? 'soundSource' : 
                             $(this).hasClass('item-length') ? 'itemLength' : 
                             $(this).hasClass('item-content') ? 'itemContent' :
                             $(this).hasClass('source-type') ? 'sourceType' : 'other';
            
            if (fieldType !== 'other') {
                const itemInState = productionState.events.find(event => event.type === 'item' && event.itemNumber == itemNumber);
                if (itemInState) {
                    if (fieldType === 'soundSource') {
                        itemInState.soundSource = content;
                    } else if (fieldType === 'itemLength') {
                        itemInState.itemLength = content;
                    } else if (fieldType === 'itemContent') {
                        itemInState.itemContent = content;
                    } else if (fieldType === 'sourceType') {
                        itemInState.sourceType = content;
                    }
                }
            }
        }
    });
    
    // Save actual time data
    $('.actual-time-cell').each(function() {
        const itemNumber = $(this).data('item-number');
        const actualTime = $(this).text();
        const itemInState = productionState.events.find(event => event.type === 'item' && event.itemNumber == itemNumber);
        if (itemInState) {
            itemInState.actualTime = actualTime;
        }
    });
    
    // Save to sessionStorage
    sessionStorage.setItem('productionState', JSON.stringify(productionState));
    console.log('All running order data saved to productionState');
};

// Function to load running order content (for sidebar navigation)
window.loadRunningOrder = function() {
    const runningOrderContent = document.getElementById('running-order-content');
    if (!runningOrderContent) return;

    // Get the current table data
    const table = $('#event-table');
    const rows = table.find('tbody tr');
    let runningOrderHTML = '<div class="running-order-container">';
    
    runningOrderHTML += '<h3>Production Running Order</h3>';
    runningOrderHTML += '<div class="running-order-list">';
    
    let eventNumber = 1;
    rows.each(function() {
        const row = $(this);
        const shotCell = row.find('td:nth-child(2)');
        const scriptCell = row.find('td:nth-child(3)');
        const detailsCell = row.find('td:nth-child(4)');
        
        // Get shot information
        let shotInfo = '';
        const shotRows = shotCell.find('.shot-input-row');
        if (shotRows.length > 0) {
            shotRows.each(function() {
                const shotRow = $(this);
                const shotType = shotRow.find('.shot-type-select').val() || '';
                const shotSubject = shotRow.find('.shotSubject').val() || '';
                let customText = '';
                let isCustom = false;
                
                if (shotType === 'CUSTOM') {
                    customText = shotRow.find('.custom-shot-type').val() || '';
                    isCustom = true;
                }
                
                if (shotType && shotSubject) {
                    let displayShotType = shotType;
                    if (isCustom && customText) {
                        displayShotType = customText;
                    }
                    shotInfo += `<div class="shot-item"><strong>${displayShotType}</strong>: ${shotSubject}</div>`;
                }
            });
        } else {
            // Fallback for old format
            const shotType = shotCell.find('.shot-type-select').val() || '';
            const shotSubject = shotCell.find('.shotSubject').val() || '';
            let customText = '';
            let isCustom = false;
            
            if (shotType === 'CUSTOM') {
                customText = shotCell.find('.custom-shot-type').val() || '';
                isCustom = true;
            }
            
            if (shotType && shotSubject) {
                let displayShotType = shotType;
                if (isCustom && customText) {
                    displayShotType = customText;
                }
                shotInfo = `<div class="shot-item"><strong>${displayShotType}</strong>: ${shotSubject}</div>`;
            }
        }
        
        // Get script content
        const scriptContent = scriptCell.find('.editable-cell').map(function() {
            return $(this).text();
        }).get().join(' ');
        
        // Get details
        const details = detailsCell.find('.editable-cell').map(function() {
            return $(this).text();
        }).get().join(' ');
        
        if (shotInfo || scriptContent) {
            runningOrderHTML += `
                <div class="running-order-item">
                    <div class="item-header">
                        <span class="event-number">${eventNumber}</span>
                        <span class="item-type">Event</span>
                    </div>
                    <div class="item-content">
                        ${shotInfo ? `<div class="shot-info">${shotInfo}</div>` : ''}
                        ${scriptContent ? `<div class="script-content">${scriptContent}</div>` : ''}
                        ${details ? `<div class="details-content">${details}</div>` : ''}
                    </div>
                </div>
            `;
            eventNumber++;
        }
    });
    
    runningOrderHTML += '</div></div>';
    runningOrderContent.innerHTML = runningOrderHTML;
    
    // Apply running order styles
    const style = document.createElement('style');
    style.textContent = `
        .running-order-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .running-order-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .running-order-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        .running-order-item:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: var(--accent-green);
        }
        .item-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        .event-number {
            background: var(--accent-green);
            color: var(--text-white);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
        .item-type {
            background: rgba(53, 194, 154, 0.2);
            color: var(--accent-green);
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .item-content {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .shot-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 8px 12px;
            border-radius: 6px;
            border-left: 3px solid var(--accent-green);
        }
        .script-content {
            color: var(--text-white);
            line-height: 1.6;
        }
        .details-content {
            color: var(--text-light);
            font-size: 14px;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
};