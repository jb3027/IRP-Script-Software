/**
 * Saves the floor plan state to the production state
 * @param {string|object} floorPlanData - The floor plan data (canvas JSON string or complete floor plan object)
 * @param {array} customItems - Optional array of custom script items added by the user
 */
function saveFloorPlanState(floorPlanData, customItems = null) {
    
    if (!productionState) {
        console.warn('No production state available to save floor plan');
        return;
    }
    
    if (!floorPlanData) {
        console.warn('No floor plan data provided to save');
        return;
    }
    
    let floorPlanState;
    
    // Handle different input types
    if (typeof floorPlanData === 'string') {
        // Legacy support: just canvas JSON
        try {
            JSON.parse(floorPlanData); // Validate JSON
            floorPlanState = {
                canvasJSON: floorPlanData,
                customItems: customItems || []
            };
        } catch (error) {
            console.error('Invalid canvas JSON provided:', error);
            return;
        }
    } else if (typeof floorPlanData === 'object') {
        // New format: complete floor plan object
        floorPlanState = floorPlanData;
        if (customItems) {
            floorPlanState.customItems = customItems;
        }
    } else {
        console.error('Invalid floor plan data type provided:', typeof floorPlanData);
        return;
    }
    
    productionState.floorPlan = JSON.stringify(floorPlanState);
    
    // Update session storage
    sessionStorage.setItem('productionState', JSON.stringify(productionState));
    
}

/**
 * Retrieves the floor plan state from production state
 * @returns {string|null} The floor plan canvas JSON or null if none exists
 */
function getFloorPlanState() {
    return productionState && productionState.floorPlan ? productionState.floorPlan : null;
}

/**
 * Restores the floor plan state from production state to localStorage
 * This is needed when loading a production from file to make the floor plan data
 * available to the floor plan UI which expects it in localStorage
 */
function restoreFloorPlanToLocalStorage() {
    if (productionState && productionState.floorPlan) {
        localStorage.setItem('currentFloorPlanState', productionState.floorPlan);
        localStorage.setItem('floorPlanStateChanged', Date.now().toString());
    } else {
        // Clear any stale floor plan data
        localStorage.removeItem('currentFloorPlanState');
        localStorage.removeItem('floorPlanStateChanged');
    }
}

// Make these functions globally accessible
window.saveFloorPlanState = saveFloorPlanState;
window.getFloorPlanState = getFloorPlanState;
window.restoreFloorPlanToLocalStorage = restoreFloorPlanToLocalStorage;


// =================================================================================
// Production State Management
// =================================================================================
// This file contains all the logic for creating, updating, and managing the
// JSON representation of the production script.

// The global state object that holds the single source of truth for the production.
let productionState = {};
let isInitializing = true; // Prevents state sync during page load

/**
 * Initializes the production state with a project name and default values.
 * This function should be called when a project is first loaded.
 * @param {string} name - The name of the production.
 */
function initializeProductionState(name) {
    isInitializing = true; // Set flag to block premature syncs
    productionState = {
        name: name,
        duration: "00:00:00", // Default duration, can be updated later
        events: [],
        floorPlan: "" // Will store fabric.js canvas JSON state
    };
    
    const stateRestored = reloadProductionStateIfPresent();

    // Defer enabling sync to ensure all initialization is complete
    setTimeout(() => {
        isInitializing = false;
        
        // If no state was restored, the table will have the default starting row.
        // We need to perform the first sync now to capture it.
        if (!stateRestored) {
            syncStateFromTable();
        }
    }, 500); // Delay to ensure DOM is fully loaded and processed
}

/**
 * Updates the production title in the state and session storage.
 * This function is called when the user changes the production title.
 * @param {string} newTitle - The new title for the production.
 */
function updateProductionTitle(newTitle) {
    if (!productionState || !newTitle || newTitle.trim() === '') {
        console.warn('Cannot update production title: invalid state or title');
        return;
    }
    
    const trimmedTitle = newTitle.trim();
    
    // Update the production state
    productionState.name = trimmedTitle;
    
    // Save the updated state to session storage
    sessionStorage.setItem('productionState', JSON.stringify(productionState));
    
}

/**
 * Clears the production state when returning to project selection.
 * This function is called by the home button to reset the application state.
 */
function clearProductionState() {
    
    // Reset the production state object
    productionState = {};
    
    // Clear floor plan temporary state from localStorage
    localStorage.removeItem('currentFloorPlanState');
    localStorage.removeItem('floorPlanStateChanged');
    
    // Clear the table content
    $('#event-table tbody').empty();
    
    // Clear the production title
    $('.production-title').text('');
    
}

/**
 * Extracts all the relevant data from a single table row (<tr>) element.
 * This is a helper function to keep the data extraction logic in one place.
 * @param {HTMLElement} row - The <tr> element to extra data from.
 * @returns {object} A structured object representing the step.
 */
function extractRowData(row) {
    const rowJQuery = $(row);
    const rowObject = {};

    // Determine the type of the step (event, item, or insert)
    if (rowJQuery.hasClass('event_highlighted')) {
        rowObject.type = 'event';
    } else if (rowJQuery.hasClass('item_highlighted')) {
        rowObject.type = 'item';
    } else if (rowJQuery.hasClass('insert_highlighted')) {
        rowObject.type = 'insert';
    } else {
        rowObject.type = 'unknown';
    }

    // Extract data based on the type
    switch (rowObject.type) {
        case 'event':
            // Extract all shot types and subjects
            const shotRows = rowJQuery.find('.shot-input-row');
            const shots = [];
            
            shotRows.each(function() {
                const row = $(this);
                const shotTypeSelect = row.find('.shot-type-select');
                let shotType = shotTypeSelect.val();
                let customText = '';
                let isCustom = false;
                
                if (shotType === 'CUSTOM') {
                    customText = row.find('.custom-shot-type').val() || '';
                    isCustom = true;
                    // Keep the shotType as 'CUSTOM' but store custom text separately
                    shotType = 'CUSTOM';
                }
                
                const shotSubject = row.find('.shotSubject').val();
                
                // Always include the shot, even if it's the default "SHOT TYPE"
                shots.push({
                    shotType: shotType,
                    shotSubject: shotSubject,
                    customText: customText,
                    isCustom: isCustom
                });
            });

            rowObject.eventNumber = rowJQuery.find('td:first-child').text();
            rowObject.shot = {
                cameraNum: rowJQuery.find('.cameraNum').val(),
                cameraPos: rowJQuery.find('.cameraPos').val(),
                shots: shots,
                extraInfo: rowJQuery.find('.extraInfo').val()
            };
            rowObject.script = rowJQuery.find('td:nth-child(3)').html(); // Includes HTML formatting
            rowObject.details = rowJQuery.find('td:nth-child(4)').html();
            break;

        case 'item':
            rowObject.itemNumber = (rowJQuery.find('b').text().match(/\d+/) || [])[0] || '';
            const itemCellContainerClone = rowJQuery.find('.item-cell-container').clone();
            itemCellContainerClone.find('span:first-child').remove();
            rowObject.content = itemCellContainerClone.html().trim();
            
            // Extract the DETAILS field for item rows (4th column)
            rowObject.details = rowJQuery.find('td:nth-child(4)').html();
            
            // Try to preserve existing actualTime from state if available
            const existingItemInState = productionState.events.find(event => 
                event.type === 'item' && event.itemNumber == rowObject.itemNumber
            );
            rowObject.actualTime = existingItemInState ? existingItemInState.actualTime || '' : '';
            break;
            
        case 'insert':
            rowObject.insert = {
                title: rowJQuery.find('.insertTitle').val(),
                in: rowJQuery.find('.insertIn').val(),
                duration: rowJQuery.find('input[type="time"]').val(),
                out: rowJQuery.find('.insertOut').val()
            };
            // Capture the complete HTML content of the insert content cell to preserve cut lines
            const insertContentClone = rowJQuery.find('.insert-content').clone();
            rowObject.insertContentHtml = insertContentClone.html().trim();
            rowObject.details = rowJQuery.find('td:nth-child(4)').html();
            break;
    }

    return rowObject;
}

/**
 * Updates time input values in the DOM before syncing to ensure accurate state capture.
 * This function finds all time inputs and updates their 'value' attribute to match their current value.
 */
function updateTimeInputsInDOM() {
    $('input[type="time"]').each(function() {
        const currentValue = $(this).val();
        $(this).attr('value', currentValue);
    });
}

/**
 * Updates item input values in the DOM before syncing to ensure accurate state capture.
 * This function finds all item-content inputs and updates their 'value' attribute to match their current value.
 */
function updateItemInputsInDOM() {
    $('.item-content').each(function() {
        const currentValue = $(this).val();
        $(this).attr('value', currentValue);
    });
}

/**
 * Updates insert input values in the DOM before syncing to ensure accurate state capture.
 * This function finds all insert-related inputs and updates their 'value' attribute to match their current value.
 */
function updateInsertInputsInDOM() {
    $('.insertTitle, .insertIn, .insertOut').each(function() {
        const currentValue = $(this).val();
        $(this).attr('value', currentValue);
    });
}

/**
 * Syncs the entire productionState.events array with the current state of the HTML table.
 * This is a robust way to ensure the data is always accurate.
 */
function syncStateFromTable() {
    if (isInitializing) {
        return;
    }
    
    // Update time inputs in DOM to ensure accurate state capture
    updateTimeInputsInDOM();
    
    // Update item inputs in DOM to ensure accurate state capture
    updateItemInputsInDOM();
    
    // Update insert inputs in DOM to ensure accurate state capture
    updateInsertInputsInDOM();
    
    const newEvents = [];
    const tableRows = $('#event-table tbody tr');
    
    tableRows.each(function(index) {
        const eventData = extractRowData(this);
        newEvents.push(eventData);
    });
    
    productionState.events = newEvents;
    // Save to sessionStorage
    sessionStorage.setItem('productionState', JSON.stringify(productionState));
}


function rebuildTableFromState() {
    $('#event-table tbody').empty();

    // Helper functions to create row elements
    function createEventRow(event) {
        const shotTypeOptions = ['SHOT TYPE', 'ES', 'WS', '2S', '3S', 'MS', 'MCU', 'CU', 'ECU', 'AS DIRECTED', 'CUSTOM'];
        
        // Handle both old format (single shot) and new format (shots array)
        let shots = event.shot.shots || [];
        
        // Ensure we always have at least one shot row
        if (shots.length === 0) {
            if (event.shot.shotType && event.shot.shotType !== 'SHOT TYPE') {
                shots = [{
                    shotType: event.shot.shotType,
                    shotSubject: event.shot.shotSubject || ''
                }];
            } else {
                shots = [{
                    shotType: 'SHOT TYPE',
                    shotSubject: ''
                }];
            }
        }
        
        // Build shot type wrapper content
        let shotTypeWrapperContent = '';
        shots.forEach((shot, index) => {
            const isFirst = index === 0;
            // Create the shot type select dropdown HTML with all options and selected state
            const shotTypeSelectHTML = `
                <option value="SHOT TYPE" ${shot.shotType === 'SHOT TYPE' ? 'selected' : ''}>SHOT TYPE</option>
                <option value="ES" ${shot.shotType === 'ES' ? 'selected' : ''}>ES</option>
                <option value="WS" ${shot.shotType === 'WS' ? 'selected' : ''}>WS</option>
                <option value="2S" ${shot.shotType === '2S' ? 'selected' : ''}>2S</option>
                <option value="3S" ${shot.shotType === '3S' ? 'selected' : ''}>3S</option>
                <option value="MS" ${shot.shotType === 'MS' ? 'selected' : ''}>MS</option>
                <option value="MCU" ${shot.shotType === 'MCU' ? 'selected' : ''}>MCU</option>
                <option value="CU" ${shot.shotType === 'CU' ? 'selected' : ''}>CU</option>
                <option value="ECU" ${shot.shotType === 'ECU' ? 'selected' : ''}>ECU</option>
                <option value="AS DIRECTED" ${shot.shotType === 'AS DIRECTED' ? 'selected' : ''}>AS DIRECTED</option>
                <option value="CUSTOM" ${shot.shotType === 'CUSTOM' ? 'selected' : ''}>CUSTOM</option>
            `;
            
            // Always include remove button - no minimum restriction
            const removeButton = '<button class="remove-shot-btn" title="Remove this shot type and subject">×</button>';
            
            // If this is a custom shot, create a hidden spacer to maintain layout
            if (shot.isCustom) {
                const shotTypeSelect = `<select class="form-control shot-type-select" style="display:none; width:120px; visibility:hidden;">${shotTypeSelectHTML}</select>`;
                const customInput = `<textarea class="custom-shot-type" autocomplete="off" style="display:block; width: 100% !important; max-width: 100% !important; min-width: 100% !important; overflow: hidden !important; box-sizing: border-box !important; resize: none;">${shot.customText || ''}</textarea>`;
                const shotSubject = `<textarea class="editable-text shotSubject" name="shotSubject" autocomplete="off" placeholder="Shot Subject" style="resize: none; flex: 0 0 120px; width: 120px; display: inline-block; margin-top: 10px;">${shot.shotSubject || ''}</textarea>`;
                
                shotTypeWrapperContent += `
                    <div class="shot-input-row" data-shot-index="${index}">
                        ${shotTypeSelect}
                        ${customInput}
                        ${shotSubject}
                        ${removeButton}
                        
                    </div>
                `;
            } else {
                const shotTypeSelect = `<select class="form-control shot-type-select" style="flex: 0 0 120px; width: 120px;">${shotTypeSelectHTML}</select>`;
                const customInput = '';
                const shotSubject = `<textarea class="editable-text shotSubject" name="shotSubject" autocomplete="off" placeholder="Shot Subject" style="resize: none; flex: 0 0 120px; width: 120px; display: inline-block; margin-top: 10px;">${shot.shotSubject || ''}</textarea>`;
                
                shotTypeWrapperContent += `
                    <div class="shot-input-row" data-shot-index="${index}">
                        ${shotTypeSelect}
                        ${customInput}
                        ${shotSubject}
                        ${removeButton}
                    </div>
                `;
            }
        });
        
        // Add the add button after the last shot row
        shotTypeWrapperContent += `
            <div class="add-shot-btn" title="Add another shot type and subject">
                <div class="add-btn-line"></div>
                <div class="add-btn-circle">
                    <span class="add-btn-plus">+</span>
                </div>
                <div class="add-btn-line"></div>
            </div>
        `;

        const shotCellContent = `
            <div>
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                    <input type="text" class="editable-cell cameraNum event_highlighted" name="cameraNum" autocomplete="off" placeholder="Camera Number" value="${event.shot.cameraNum || ''}">
                    <input type="text" class="editable-cell cameraPos event_highlighted" name="cameraPos" autocomplete="off" placeholder="Camera Position" value="${event.shot.cameraPos || ''}">
                </div>
                <div class="shot-type-flex-container event_highlighted">
                    <div class="shot-type-wrapper" data-shot-group="0">
                        <div class="shot-inputs-container">
                            ${shotTypeWrapperContent}
                        </div>
                    </div>
                </div>
                <input type="text" class="editable-cell extraInfo event_highlighted" name="extraInfo" autocomplete="off" placeholder="Additional Info (E.g., TRACK OUT)" value="${event.shot.extraInfo || ''}">
            </div>
        `;

        const detailCellContent = event.details || '';

        return `
            <tr class="event_highlighted">
                <td contenteditable="false" style="text-align:center">${event.eventNumber || ''}</td>
                <td contenteditable="true">${shotCellContent}</td>
                <td contenteditable="true">${event.script || ''}</td>
                <td contenteditable="true" style="text-align:center">${detailCellContent}</td>
                <td style="border:none; width:90px">
                    <div class="row-actions">
                        <button class="row-button drag" title="Drag Row"><i class="fas fa-grip-vertical"></i></button>
                        <button class="row-button remove" title="Remove Row"><i class="fas fa-minus"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }

    function createItemRow(event) {
        const detailCellContent = event.details || '';
        
        return `
            <tr class="item_highlighted">
                <td contenteditable="false" style="text-align:center"></td>
                <td contenteditable="false" style="pointer-events: none; user-select: none;"></td>
                <td contenteditable="false">
                    <div class="item-cell-container">
                        <span contenteditable="false" style="text-decoration: underline;"><b>ITEM ${event.itemNumber}: &nbsp;</b></span>
                        ${event.content || ''}
                    </div>
                </td>
                <td contenteditable="true" style="text-align:center">${detailCellContent}</td>
                <td style="border:none; width:90px">
                    <div class="row-actions">
                        <button class="row-button drag" title="Drag Row"><i class="fas fa-grip-vertical"></i></button>
                        <button class="row-button remove" title="Remove Row"><i class="fas fa-minus"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }

    function createInsertRow(event) {
        const insert = event.insert || {};
        
        // Use saved HTML content if available, otherwise create default structure
        let insertCellContent;
        if (event.insertContentHtml && event.insertContentHtml.trim() !== '') {
            insertCellContent = `<div style="text-align: left; width: 60%; margin: 0 auto;" class="insert-content">${event.insertContentHtml}</div>`;
        } else {
            insertCellContent = `
                <div style="text-align: left; width: 60%; margin: 0 auto;" class="insert-content">
                    <u><input type="text" class="editable-cell insertTitle" autocomplete="off" placeholder="Ven: Title" value="${insert.title || ''}"></u>
                    <input type="text" class="editable-text insertIn" autocomplete="off" placeholder="In: Music" value="${insert.in || ''}">
                    <div class="insert-duration-container" style="text-align: left; width: 60%; margin: 0 auto; margin-left: 18px;">
                        <span style="white-space: nowrap;">
                            Dur: <input type="time" id="durationVT" name="durationVT" autocomplete="off" value="${insert.duration || '00:00'}" style="border: none; width: auto; margin: 0 auto;">
                        </span>
                    </div>
                    <input type="text" class="editable-cell insertOut" autocomplete="off" placeholder="Out: Music" value="${insert.out || ''}">
                </div>
            `;
        }

        const detailCellContent = event.details || '';

        return `
            <tr class="insert_highlighted">
                <td contenteditable="false" style="text-align:center"></td>
                <td contenteditable="false" style="text-align:center; pointer-events: none; user-select: none;"></td>
                <td contenteditable="true">${insertCellContent}</td>
                <td contenteditable="true" style="text-align:center">${detailCellContent}</td>
                <td style="border:none; width:90px">
                    <div class="row-actions">
                        <button class="row-button drag" title="Drag Row"><i class="fas fa-grip-vertical"></i></button>
                        <button class="row-button remove" title="Remove Row"><i class="fas fa-minus"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Append rows according to event type
    for (const event of productionState.events) {
        if (event.type === 'event') {
            $('#event-table tbody').append(createEventRow(event));
        } else if (event.type === 'item') {
            $('#event-table tbody').append(createItemRow(event));
        } else if (event.type === 'insert') {
            $('#event-table tbody').append(createInsertRow(event));
        }
    }

    // Check if the required functions are available
    if (typeof updateEventNumbers === 'function') {
        updateEventNumbers();
    } else {
        console.warn('updateEventNumbers function not available');
    }
    
    if (typeof updateItemNumbers === 'function') {
        updateItemNumbers();
    } else {
        console.warn('updateItemNumbers function not available');
    }
    
    if (typeof initDraggable === 'function') {
        initDraggable();
    } else {
        console.warn('initDraggable function not available');
    }
    
    // Update remove button visibility for all shot type wrappers
    $('.shot-type-wrapper').each(function() {
        if (typeof updateRemoveButtonVisibility === 'function') {
            updateRemoveButtonVisibility($(this));
        }
    });
    
    // Trigger event to notify that state restoration is complete
    $(document).trigger('stateRestored');
    
    // Ensure all form elements have their values properly set
    setTimeout(() => {
        $('.shot-type-select').each(function() {
            const $select = $(this);
            const selectedValue = $select.find('option:selected').val();
            if (selectedValue) {
                $select.val(selectedValue);
            }
        });
        
        $('.shotSubject').each(function() {
            const $textarea = $(this);
            const content = $textarea.text() || $textarea.val() || '';
            if (content) {
                $textarea.val(content);
            }
        });
    }, 300);
}


function reloadProductionStateIfPresent() {
    const stateString = sessionStorage.getItem('productionState');
    if (stateString) {
        try {
            const state = JSON.parse(stateString);
            if (state.name && productionState.name && state.name === productionState.name && Array.isArray(state.events) && state.events.length > 0) {
                productionState = state;
                rebuildTableFromState();
                return true; // Indicate that state was restored
            }
        } catch (e) {
            console.error('Failed to parse productionState from sessionStorage', e);
        }
    }
    return false; // Indicate that no state was restored
}


/**
 * Loads a production from a .pwpro file and updates the application state.
 * This function is called when a user selects a file to load.
 * @param {string} fileContent - The JSON content of the .pwpro file.
 * @returns {boolean} - True if the load was successful, false otherwise.
 */
function loadProductionFromFile(fileContent) {
    try {
        const loadedState = JSON.parse(fileContent);
        
        // Basic validation to ensure the loaded file is a valid production
        // Note: We allow empty events array since a new production might not have any events yet
        if (!loadedState.name || !Array.isArray(loadedState.events)) {
            console.error('Invalid file format: Missing name or events array');
            console.error('Validation details:', {
                name: loadedState.name,
                events: loadedState.events,
                isArray: Array.isArray(loadedState.events)
            });
            alert('The selected file is not a valid PaperworkPro production.');
            return false;
        }
        
        // Update the global state
        productionState = loadedState;
        
        // Save to sessionStorage to maintain state across reloads
        sessionStorage.setItem('productionState', JSON.stringify(productionState));
        sessionStorage.setItem('projectName', productionState.name);
        
        // Restore floor plan state to localStorage for UI access
        restoreFloorPlanToLocalStorage();
        
        // Update the UI
        $('.production-title').text(productionState.name);
        document.title = `${productionState.name} - Studio Script Writer`;
        
        //@
        // // Ensure we start in Script view, not Running Order view
        if (typeof window.resetToScriptView === 'function') {
            window.resetToScriptView();
        }
        
        // Rebuild the table with the loaded data
        rebuildTableFromState();
        
        return true;
        
    } catch (error) {
        console.error('Failed to parse or load production file:', error);
        alert('Could not load the production file. It may be corrupted or in the wrong format.');
        return false;
    }
}

/**
 * Saves the current production state to a local JSON file.
 * This function is triggered by the "Save" button and works from both Script and Running Order views.
 */
function saveStateToFile() {
    if (!productionState || !productionState.name) {
        alert("No production is currently loaded. Please load a project first.");
        return;
    }
    
    // Only sync from table if we're in the main script view (table is visible)
    // In Running Order view, the state is already being updated via the blur event listeners
    const mainTable = $('#event-table');
    if (mainTable.is(':visible') && mainTable.find('tbody tr').length > 0) {
        syncStateFromTable();
    } else {
    }

    // Convert the state object to a formatted JSON string
    const jsonString = JSON.stringify(productionState, null, 2);
    
    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a link to download the Blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productionState.name}-script.pwpro`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message to user
    const filename = `${productionState.name}-script.pwpro`;
    showNotification(`File saved successfully and downloaded as: ${filename}`, 'success');
    
}

/**
 * Shows a simple notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, etc.)
 */
function showNotification(message, type = 'success') {
    // Simple alert for now - could be enhanced with a proper notification system later
    alert(message);
}

// =================================================================================
// Event Listener Setup
// =================================================================================

// We wrap the event listener setup in a $(document).ready() to ensure the DOM
// is fully loaded before we try to attach listeners.
$(document).ready(function() {
    // Listen for any change, click, or input on the table that should trigger a state sync.
    $('#event-table').on('input blur change', 'td, input, select', function() {
        // Use a small timeout to let the DOM update before we sync.
        setTimeout(syncStateFromTable, 100);
    });
    
    // Hook the "Save" button to our new save function.
    $('.save-button').off('click').on('click', saveStateToFile);
});

