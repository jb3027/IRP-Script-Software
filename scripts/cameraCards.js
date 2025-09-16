//Camera Cards 

$(document).ready(function() {
    // This functionality is now handled in sidebarNavigation.js
    // to avoid conflicts and duplication

    // CREATE CAMERA CARD - Handle both old and new button systems
    $(document).on('click', '.createCamCard-button, .camera-option', function() {

        
        let cameraNumber = this.id || this.textContent.replace('CAMERA ', '');
        
        let camCards = [];

        // Find all rows with camera data (don't restrict to specific classes)
        $('#event-table tbody tr').each(function() {
            const row = $(this);
                        
            // Check if this row has camera data by looking for camera inputs
            const cameraInputs = row.find('.cameraNum, [name="cameraNum"], input[class*="camera"]');
            const hasCameraData = cameraInputs.length > 0;
            
            if (!hasCameraData) {
                return; // Skip rows without camera data
            }
            
            
            const eventNum = row.find('td:first-child').text().trim() || '';
            const shotCell = row.find('td:nth-child(2)');
            
            
            // Look for camera number in multiple ways
            const cameraNum = shotCell.find('.cameraNum').val() || 
                             shotCell.find('.cameraNum').text() || 
                             shotCell.find('[name="cameraNum"]').val() ||
                             shotCell.find('input[class*="camera"]:not([class*="cameraPos"])').val() || '';
            
            
            // Only process events for the selected camera
            if (cameraNum && cameraNum.trim() === cameraNumber) {
                const cameraPos = shotCell.find('.cameraPos').val() || shotCell.find('.cameraPos').text() || '';
                const info = shotCell.find('.extraInfo').val() || shotCell.find('.extraInfo').text() || '';

                // Get all shot types and subjects from the shot-type-wrapper
                const shotWrapper = shotCell.find('.shot-type-wrapper');
                const shotRows = shotWrapper.find('.shot-input-row');
                
                if (shotRows.length > 0) {
                    // Collect all shot types and subjects for this event
                    let allShotTypes = [];
                    let allShotSubjects = [];
                    
                    shotRows.each(function() {
                        const row = $(this);
                        let shotType = row.find('.shot-type-select').val() || '';
                        const shotSubject = row.find('.shotSubject').val() || row.find('.shotSubject').text() || '';

                        // If shot type is "SHOT TYPE", set it to empty string
                        if(shotType === "SHOT TYPE") {
                            shotType = '';
                        }

                        // Check if it's a custom shot type and get the actual custom text
                        if (shotType === 'CUSTOM') {
                            const customShotType = row.find('.custom-shot-type').val() || '';
                            if (customShotType.trim() !== '') {
                                shotType = customShotType.trim();
                            }
                        }

                        // Always collect shot types and subjects (even if shot type is empty)
                            allShotTypes.push(shotType);
                            allShotSubjects.push(shotSubject);
                    });
                    
                    // If we have valid shots, create separate events for each shot type/subject pair
                    if (allShotTypes.length > 0) {
                        for (let i = 0; i < allShotTypes.length; i++) {
                            const shotType = allShotTypes[i];
                            const shotSubject = allShotSubjects[i];
                            
                            if (shotType && shotType.trim() !== '') {
                        let event = {
                            eventNumber: eventNum,
                            cameraNumber: cameraNum.trim(),
                            cameraPosition: cameraPos,
                                    shotType: shotType,
                                    shotSubject: shotSubject,
                                    extraInfo: info,
                                    notes: loadCameraCardNotes({eventNumber: eventNum, extraInfo: info}, cameraNum.trim())
                                };  
                                                                console.log('Adding event to camCards:', event);
                        camCards.push(event);
                            }
                        }
                    }
                } else {
                    // Fallback for old format (single shot type)
                    let shotType = shotCell.find('.shot-type-select').val() || shotCell.find('select[name="shotType"]').val() || '';
                    const shotSubject = shotCell.find('.shotSubject').val() || shotCell.find('.shotSubject').text() || '';

                    if(shotType === "SHOT TYPE") {
                        shotType = '';
                    }

                    if (shotType === 'CUSTOM') {
                        const customShotType = shotCell.find('.custom-shot-type').val() || '';
                        if (customShotType.trim() !== '') {
                            shotType = customShotType.trim();
                        }
                    }

                    // Always create an event (even if shot type is empty)
                        let event = {
                            eventNumber: eventNum,
                            cameraNumber: cameraNum.trim(),
                            cameraPosition: cameraPos,
                            shotType: shotType,
                            shotSubject: shotSubject,
                        extraInfo: info,
                        notes: loadCameraCardNotes({eventNumber: eventNum, extraInfo: info}, cameraNum.trim())
                        };  
                        camCards.push(event);
                }            }
        });


        // Display the camera card directly here instead of calling displayCameraCardInline
        displayCameraCardDirectly(cameraNumber, camCards);
    });
}); 

// Function to display camera card directly (same scope as data collection)
function displayCameraCardDirectly(cameraNumber, camCards) {
                    console.log('displayCameraCardDirectly called with:', cameraNumber, camCards);
        
        // Create the camera card HTML directly
        const cardHTML = `
        <div id="camera-card-content" style="
            background: white !important;
            padding: 20px !important;
            font-family: Arial, sans-serif !important;
            font-size: 12px !important;
            color: black !important;
            border-radius: 8px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            margin: 20px !important;
        ">
            <!-- Print Button -->
            <button style="
                background: #007bff !important;
                color: white !important;
                border: none !important;
                padding: 10px 20px !important;
                border-radius: 6px !important;
                cursor: pointer !important;
                font-size: 16px !important;
                margin-bottom: 20px !important;
                float: right !important;
            " onclick="window.print()">Print Camera Card</button>
            
            <!-- Camera Card Content -->
            <div style="
                width: 100% !important;
                background: white !important;
                clear: both !important;
            ">
                <div style="
                    text-align: center !important;
                    font-size: 28px !important;
                    font-weight: bold !important;
                    margin: 20px 0 30px 0 !important;
                    color: #000 !important;
                    padding-bottom: 10px !important;
                ">CAMERA ${cameraNumber}</div>
                
                <table class="camera-card-table" style="
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin-top: 20px !important;
                    background: white !important;
                ">
                    <thead class="camera-card-thead">
                        <tr class="camera-card-header-row">
                            <th class="camera-card-th" style="
                                background-color: #f0f0f0 !important;
                                border: 1px solid #000 !important;
                                padding: 12px 8px !important;
                                text-align: center !important;
                                font-weight: bold !important;
                                font-size: 14px !important;
                                width: 20% !important;
                                color: black !important;
                            ">Event Number</th>
                            <th class="camera-card-th" style="
                                background-color: #f0f0f0 !important;
                                border: 1px solid #000 !important;
                                padding: 12px 8px !important;
                                text-align: center !important;
                                font-weight: bold !important;
                                font-size: 14px !important;
                                width: 20% !important;
                                color: black !important;
                            ">Position</th>
                            <th class="camera-card-th" style="
                                background-color: #f0f0f0 !important;
                                border: 1px solid #000 !important;
                                padding: 12px 8px !important;
                                font-size: 14px !important;
                                width: 40% !important;
                                color: black !important;
                            ">Details</th>
                            <th class="camera-card-th" style="
                                background-color: #f0f0f0 !important;
                                border: 1px solid #000 !important;
                                padding: 12px 8px !important;
                                text-align: center !important;
                                font-weight: bold !important;
                                font-size: 14px !important;
                                width: 20% !important;
                                color: black !important;
                            ">NOTES</th>
                        </tr>
                    </thead>
                    <tbody class="camera-card-tbody">
                        ${camCards.map(event => {
                            // Generating row for event
                            return `
                            <tr class="camera-card-row" style="background: white !important;">
                                <td class="camera-card-td" style="
                                    border: 1px solid #000 !important;
                                    padding: 8px !important;
                                    text-align: center !important;
                                    vertical-align: middle !important;
                                    font-size: 11px !important;
                                    color: black !important;
                                    background: white !important;
                                ">${event.eventNumber || ''}</td>
                                <td class="camera-card-td" style="
                                    border: 1px solid #000 !important;
                                    padding: 8px !important;
                                    text-align: center !important;
                                    vertical-align: middle !important;
                                    font-size: 11px !important;
                                    color: black !important;
                                    background: white !important;
                                ">${event.cameraPosition || 'A'}</td>
                                <td class="camera-card-td" style="
                                    border: 1px solid #000 !important;
                                    padding: 8px !important;
                                    text-align: left !important;
                                    vertical-align: top !important;
                                    font-size: 11px !important;
                                    color: black !important;
                                    background: white !important;
                                ">
                                    <div style="display: flex !important; align-items: center !important; gap: 8px !important;">
                                        <span style="font-weight: bold !important;">${event.shotType || ''}</span>
                                        <span>${event.shotSubject || ''}</span>
                                    </div>
                                </td>
                                <td class="camera-card-td" 
                                    contenteditable="true"
                                    placeholder="Add notes..."
                                    data-event-number="${event.eventNumber}"
                                    data-camera-number="${event.cameraNumber}"
                                    style="
                                        border: 1px solid #000 !important;
                                        padding: 8px !important;
                                        text-align: center !important;
                                        vertical-align: middle !important;
                                        font-size: 11px !important;
                                        color: black !important;
                                        background: white !important;
                                        min-height: 20px !important;
                                        cursor: text !important;
                                    "
                                    onfocus="this.style.background='#f8f9fa'"
                                    onblur="this.style.background='white'; saveCameraCardNote(this)"
                                    oninput="this.setAttribute('data-notes', this.textContent)">
                                    ${event.notes || ''}
                                </td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Final HTML being generated
    // camCards array at HTML generation
    
    // Replace the camera cards page content
    const cameraCardsPage = document.getElementById('camera-cards-page');
    if (cameraCardsPage) {
        cameraCardsPage.innerHTML = cardHTML;
        // Camera card content replaced successfully
    } else {
        console.error('camera-cards-page not found');
    }
    
    // Navigate to the camera cards page to show the card
    if (typeof sidebarNav !== 'undefined' && sidebarNav.navigateToPage) {
        sidebarNav.navigateToPage('camera-cards');
    }
}

// Function to display camera card inline within the same page
window.displayCameraCardInline = function(cameraNumber, preCollectedCamCards = null) {
    let camCards = preCollectedCamCards;
    
    // If no pre-collected data, fall back to collecting it (for backward compatibility)
    if (!camCards) {
        camCards = [];
        // No pre-collected data, falling back to data collection
        
        // Get the main script table
        const table = $('#event-table');
        const rows = table.find('tbody tr');
        
        // Find all event rows with the specified camera number
        rows.each(function() {
            const row = $(this);
            const eventNum = row.find('td:first-child').text().trim();
            const shotCell = row.find('td:nth-child(2)');
            
            // Check if this row has multiple shots (new format)
            const shotRows = shotCell.find('.shot-input-row');
            
            if (shotRows.length > 0) {
                // New format with multiple shots
                shotRows.each(function() {
                    const shotRow = $(this);
                    const cameraNum = shotRow.find('.cameraNum').val();
                    
                    // Check if this shot matches the selected camera number
                    if (cameraNum && cameraNum.trim() === cameraNumber) {
                        const cameraPos = shotRow.find('.cameraPos').val() || '';
                        let shotType = shotRow.find('.shot-type-select').val() || '';
                        const shotSubject = shotRow.find('.shotSubject').val() || '';
                        
                        if (shotType === "SHOT TYPE") {
                            shotType = '';
                        }
                        
                        // Check if it's a custom shot type and get the actual custom text
                        if (shotType === 'CUSTOM') {
                            const customShotType = shotRow.find('.custom-shot-type').val() || '';
                            if (customShotType.trim() !== '') {
                                shotType = customShotType.trim();
                            }
                        }
                        
                        if (shotType && shotType.trim() !== '') {
                            let event = {
                                eventNumber: eventNum,
                                cameraPosition: cameraPos,
                                shotType: shotType,
                                shotSubject: shotSubject
                            };  
                            camCards.push(event);
                        }
                    }
                });
            } else {
                // Fallback for old format (single shot type)
                const cameraNum = shotCell.find('.cameraNum').val();
                
                if (cameraNum && cameraNum.trim() === cameraNumber) {
                    const cameraPos = shotCell.find('.cameraPos').val() || '';
                    let shotType = shotCell.find('.shot-type-select').val() || shotCell.find('select[name="shotType"]').val() || '';
                    const shotSubject = shotCell.find('.shotSubject').val() || shotCell.find('.shotSubject').text() || '';

                    if(shotType === "SHOT TYPE") {
                        shotType = '';
                    }

                    if (shotType === 'CUSTOM') {
                        const customShotType = shotCell.find('.custom-shot-type').val() || '';
                        if (customShotType.trim() !== '') {
                            shotType = customShotType.trim();
                        }
                    }

                    if (shotType && shotType.trim() !== '') {
                        let event = {
                            eventNumber: eventNum,
                            cameraPosition: cameraPos,
                            shotType: shotType,
                            shotSubject: shotSubject
                        };  
                        camCards.push(event);
                    }
                }
            }
        });
    }
    
    // displayCameraCardInline - Using camCards
    
    // Display camera card within the same page
    const cameraCardsContent = document.getElementById('camera-cards-content');
    if (cameraCardsContent) {
        // Create a camera card that fits within the normal page layout
        const cardHTML = `
            <div id="camera-card-content" style="
                background: white !important;
                padding: 20px !important;
                font-family: Arial, sans-serif !important;
                font-size: 12px !important;
                color: black !important;
                border-radius: 8px !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                margin: 20px !important;
            ">
                <!-- Print Button -->
                <button style="
                    background: #007bff !important;
                    color: white !important;
                    border: none !important;
                    padding: 10px 20px !important;
                    border-radius: 6px !important;
                    cursor: pointer !important;
                    font-size: 16px !important;
                    margin-bottom: 20px !important;
                    float: right !important;
                " onclick="window.print()">Print Camera Card</button>
                
                <!-- Test Sync Button -->
                <button style="
                    background: #28a745 !important;
                    color: white !important;
                    border: none !important;
                    padding: 10px 20px !important;
                    border-radius: 6px !important;
                    cursor: pointer !important;
                    font-size: 16px !important;
                    margin-bottom: 20px !important;
                    margin-right: 10px !important;
                    float: right !important;
                " onclick="testBidirectionalSync('${cameraNumber}')">Test Sync</button>
                
                <!-- Camera Card Content -->
                <div style="
                    width: 100% !important;
                    background: white !important;
                    clear: both !important;
                ">
                    <div style="
                        text-align: center !important;
                        font-size: 28px !important;
                        font-weight: bold !important;
                        margin: 20px 0 30px 0 !important;
                        color: #000 !important;
                        padding-bottom: 10px !important;
                    ">CAMERA ${cameraNumber}</div>
                    
                    <table class="camera-card-table" style="
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin-top: 20px !important;
                        background: white !important;
                    ">
                        <thead class="camera-card-thead">
                            <tr class="camera-card-header-row">
                                <th class="camera-card-th" style="
                                    background-color: #f0f0f0 !important;
                                    border: 1px solid #000 !important;
                                    padding: 12px 8px !important;
                                    text-align: center !important;
                                    font-weight: bold !important;
                                    font-size: 14px !important;
                                    width: 20% !important;
                                    color: black !important;
                                ">Event Number</th>
                                <th class="camera-card-th" style="
                                    background-color: #f0f0f0 !important;
                                    border: 1px solid #000 !important;
                                    padding: 12px 8px !important;
                                    text-align: center !important;
                                    font-weight: bold !important;
                                    font-size: 14px !important;
                                    width: 20% !important;
                                    color: black !important;
                                ">Position</th>
                                <th class="camera-card-th" style="
                                    background-color: #f0f0f0 !important;
                                    border: 1px solid #000 !important;
                                    padding: 12px 8px !important;
                                    font-size: 14px !important;
                                    width: 40% !important;
                                    color: black !important;
                                ">Details</th>
                                <th class="camera-card-th" style="
                                    background-color: #f0f0f0 !important;
                                    border: 1px solid #000 !important;
                                    padding: 12px 8px !important;
                                    text-align: center !important;
                                    font-weight: bold !important;
                                    font-size: 14px !important;
                                    width: 20% !important;
                                    color: black !important;
                                ">NOTES</th>
                            </tr>
                        </thead>
                        <tbody class="camera-card-tbody">
                            ${camCards.map(event => {
                                // Generating row for event
                                return `
                                <tr class="camera-card-row" style="background: white !important;">
                                    <td class="camera-card-td" style="
                                        border: 1px solid #000 !important;
                                        padding: 8px !important;
                                        text-align: center !important;
                                        vertical-align: middle !important;
                                        font-size: 11px !important;
                                        color: black !important;
                                        background: white !important;
                                    ">${event.eventNumber || ''}</td>
                                    <td class="camera-card-td" style="
                                        border: 1px solid #000 !important;
                                        padding: 8px !important;
                                        text-align: center !important;
                                        vertical-align: middle !important;
                                        font-size: 11px !important;
                                        color: black !important;
                                        background: white !important;
                                    ">${event.cameraPosition || 'A'}</td>
                                    <td class="camera-card-td" style="
                                        border: 1px solid #000 !important;
                                        padding: 8px !important;
                                        text-align: left !important;
                                        vertical-align: top !important;
                                        font-size: 11px !important;
                                        color: black !important;
                                        background: white !important;
                                    ">
                                        <div style="display: flex !important; align-items: center !important; gap: 8px !important;">
                                            <span style="font-weight: bold !important;">${event.shotType || ''}</span>
                                            <span>${event.shotSubject || ''}</span>
                                        </div>
                                    </td>
                                    <td class="camera-card-td" style="
                                        border: 1px solid #000 !important;
                                        padding: 8px !important;
                                        text-align: center !important;
                                        vertical-align: middle !important;
                                        font-size: 11px !important;
                                        color: black !important;
                                        background: white !important;
                                    ">
                                        <input type="text" 
                                               placeholder="Add notes..." 
                                               style="
                                                   width: 100% !important;
                                                   border: 1px solid #ccc !important;
                                                   padding: 4px 6px !important;
                                                   font-size: 11px !important;
                                                   background: white !important;
                                                   color: black !important;
                                               "
                                               class="camera-card-notes-input">
                                    </td>
                                </tr>
                            `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Final HTML being generated
        // camCards array at HTML generation
        
        // Replace the ENTIRE camera cards page content to avoid the existing header
        const cameraCardsPage = document.getElementById('camera-cards-page');
        if (cameraCardsPage) {
            cameraCardsPage.innerHTML = cardHTML;
            // Store which camera is currently being displayed for synchronization
            $(cameraCardsPage).data('current-camera', cameraNumber);
        } else {
            // Fallback: just replace the content area
            cameraCardsContent.innerHTML = cardHTML;
        }
        
        // Navigate to the camera cards page to show the card
        if (typeof sidebarNav !== 'undefined' && sidebarNav.navigateToPage) {
            sidebarNav.navigateToPage('camera-cards');
        }
    }
};

// Function to save camera card notes
window.saveCameraCardNote = function(noteCell) {
    const eventNumber = noteCell.getAttribute('data-event-number');
    const cameraNumber = noteCell.getAttribute('data-camera-number');
    const notes = noteCell.textContent.trim();
    
    // Get current project name for unique storage
    const projectName = sessionStorage.getItem('projectName') || 'default';
    
    // Store the notes in localStorage with project-specific key
    const storageKey = `${projectName}_camera_${cameraNumber}_event_${eventNumber}_notes`;
    localStorage.setItem(storageKey, notes);
    
    // Update the script table's extra info field to sync the changes
    updateScriptExtraInfo(eventNumber, cameraNumber, notes);
    
            // Saved notes for camera and event
};

// Function to load camera card notes
function loadCameraCardNotes(event, cameraNumber) {
    // Get current project name for unique storage
    const projectName = sessionStorage.getItem('projectName') || 'default';
    
    const storageKey = `${projectName}_camera_${cameraNumber}_event_${event.eventNumber}_notes`;
    const savedNotes = localStorage.getItem(storageKey);
    
    // If there are saved notes, use those; otherwise use the extra info
    if (savedNotes && savedNotes.trim() !== '') {
        return savedNotes;
    } else {
        return event.extraInfo || '';
    }
}

// Function to update the script table's extra info field
function updateScriptExtraInfo(eventNumber, cameraNumber, notes) {
    // Find the event row in the script table
    const eventRow = $(`#event-table tbody tr`).filter(function() {
        const rowEventNum = $(this).find('td:first-child').text().trim();
        return rowEventNum === eventNumber;
    });
    
    if (eventRow.length > 0) {
        const shotCell = eventRow.find('td:nth-child(2)');
        
        // Look for the extra info field in this row - try multiple selectors
        let extraInfoField = shotCell.find('.extraInfo');
        
        if (extraInfoField.length === 0) {
            // Try alternative selectors
            extraInfoField = shotCell.find('input[name="extraInfo"]');
        }
        
        if (extraInfoField.length === 0) {
            // Try finding by class that contains extraInfo
            extraInfoField = shotCell.find('[class*="extraInfo"]');
        }
        
        if (extraInfoField.length > 0) {
            // Update the extra info field with the new notes
            if (extraInfoField.is('input')) {
                extraInfoField.val(notes);
            } else {
                extraInfoField.text(notes);
            }
            
            // Trigger change event to ensure the update is registered
            extraInfoField.trigger('change');
            extraInfoField.trigger('input');
        }
    }
}

// Function to update camera card notes when script extra info changes
function updateCameraCardNotes(eventNumber, cameraNumber, newNotes) {
    // Get the current project name
    const projectName = sessionStorage.getItem('projectName') || 'default';
    
    // Create the storage key
    const storageKey = `${projectName}_camera_${cameraNumber}_event_${eventNumber}_notes`;
    
    // Save to localStorage
    localStorage.setItem(storageKey, newNotes);
    
    // If camera card is currently open, refresh it to show the updated notes
    if ($('#camera-cards-page').is(':visible')) {
        // Find the note cell in the current camera card and update it
        const noteCell = $(`[data-event-number="${eventNumber}"][data-camera-number="${cameraNumber}"]`);
        if (noteCell.length > 0) {
            noteCell.text(newNotes);
        }
        
        // Also refresh the entire camera card display to ensure all data is current
        const currentCamera = $('#camera-cards-page').data('current-camera');
        if (currentCamera) {
            // Trigger a refresh by re-displaying the camera card
            displayCameraCardInline(currentCamera);
        }
    }
}

// Function to force shot subject inline positioning
function forceShotSubjectInline() {
    // Target all possible shot subject selectors
    $('.shot-input-row .shotSubject, .shot-input-row textarea[name="shotSubject"], .shot-input-row .editable-text.shotSubject').each(function() {
        const $shotSubject = $(this);
        
        // Force inline positioning with !important equivalent
        $shotSubject.attr('style', function(i, style) {
            return (style || '') + '; display: inline-block !important; float: none !important; clear: none !important; position: relative !important; width: 120px !important; margin-left: 8px !important; top: 30px !important; transform: translateY(30px) !important;';
        });
        
        // Also apply via CSS as backup
        $shotSubject.css({
            'display': 'inline-block',
            'float': 'none',
            'clear': 'none',
            'position': 'relative',
            'width': '120px',
            'margin-left': '8px',
            'top': '30px',
            'transform': 'translateY(30px)'
        });
        
        // Force remove any conflicting classes or attributes
        $shotSubject.removeClass('hidden').removeAttr('hidden');
    });
    
            // Applied inline positioning to shot subjects
}

// Run the fix when the page loads and after any dynamic content changes
$(document).ready(function() {
    forceShotSubjectInline();
    
    // Also run it after a short delay to catch any late-loading elements
    setTimeout(forceShotSubjectInline, 100);
    setTimeout(forceShotSubjectInline, 500);
    setTimeout(forceShotSubjectInline, 1000);
});

// Monitor for table changes and apply positioning
$(document).on('DOMNodeInserted', '#event-table', function() {
    setTimeout(forceShotSubjectInline, 50);
});

// Also run when rows are added or modified
$(document).on('click', '.add-row-button, .add-event-button', function() {
    setTimeout(forceShotSubjectInline, 100);
});

// Run after any table modifications
$(document).on('input', '.shotSubject, .shot-type-select', function() {
    setTimeout(forceShotSubjectInline, 50);
});

// Continuous monitoring - run every 2 seconds to catch any missed elements
setInterval(forceShotSubjectInline, 2000);

// Function to clear camera card notes for a specific project
window.clearCameraCardNotes = function(projectName) {
    if (!projectName) {
        console.warn('No project name provided for clearing camera card notes');
        return;
    }
    
    // Find and remove all localStorage items for this project
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${projectName}_camera_`)) {
            keysToRemove.push(key);
        }
    }
    
    // Remove the keys
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        // Removed camera card notes
    });
    
    // Cleared camera card notes for project
};

// Function to clear all camera card notes (use with caution)
window.clearAllCameraCardNotes = function() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('_camera_') && key.includes('_event_') && key.includes('_notes')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        // Removed camera card notes
    });
    
    // Cleared all camera card notes
};

// Function to load camera cards content (for sidebar navigation)
window.loadCameraCards = function() {
    const cameraCardsContent = document.getElementById('camera-cards-content');
    if (!cameraCardsContent) return;

    // Get camera data from the current table
    const table = $('#event-table');
    const rows = table.find('tbody tr');
    const cameras = new Set();
    
    // Collect all camera numbers
    rows.each(function() {
        const row = $(this);
        const shotCell = row.find('td:nth-child(2)');
        const shotRows = shotCell.find('.shot-input-row');
        
        if (shotRows.length > 0) {
            shotRows.each(function() {
                const shotRow = $(this);
                const cameraNum = shotRow.find('.cameraNum').val();
                if (cameraNum) {
                    cameras.add(cameraNum);
                }
            });
        } else {
            // Fallback for old format
            const cameraNum = shotCell.find('.cameraNum').val();
            if (cameraNum) {
                cameras.add(cameraNum);
            }
        }
    });

    if (cameras.size === 0) {
        cameraCardsContent.innerHTML = `
            <div class="camera-cards-empty">
                <h3>No Camera Assignments Found</h3>
                <p>Add camera numbers to your shots to generate camera cards.</p>
                <button class="btn button2" onclick="sidebarNav.navigateToPage('script')">Go to Script</button>
            </div>
        `;
        return;
    }

    let cameraCardsHTML = '<div class="camera-cards-container">';
    cameraCardsHTML += '<h3>Camera Cards</h3>';
    cameraCardsHTML += '<div class="camera-cards-grid">';
    
    // Sort cameras numerically
    const sortedCameras = Array.from(cameras).sort((a, b) => parseInt(a) - parseInt(b));
    
    sortedCameras.forEach(cameraNum => {
        // Get shots for this camera
        const cameraShots = [];
        rows.each(function() {
            const row = $(this);
            const shotCell = row.find('td:nth-child(2)');
            const shotRows = shotCell.find('.shot-input-row');
            
            if (shotRows.length > 0) {
                shotRows.each(function() {
                    const shotRow = $(this);
                    const rowCameraNum = shotRow.find('.cameraNum').val();
                    if (rowCameraNum === cameraNum) {
                        const shotType = shotRow.find('.shot-type-select').val() || '';
                        const shotSubject = shotRow.find('.shotSubject').val() || '';
                        const cameraPos = shotRow.find('.cameraPos').val() || '';
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
                            cameraShots.push({
                                shotType: displayShotType,
                                shotSubject: shotSubject,
                                cameraPos: cameraPos
                            });
                        }
                    }
                });
            } else {
                // Fallback for old format
                const rowCameraNum = shotCell.find('.cameraNum').val();
                if (rowCameraNum === cameraNum) {
                    const shotType = shotCell.find('.shot-type-select').val() || '';
                    const shotSubject = shotCell.find('.shotSubject').val() || '';
                    const cameraPos = shotCell.find('.cameraPos').val() || '';
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
                        cameraShots.push({
                            shotType: displayShotType,
                            shotSubject: shotSubject,
                            cameraPos: cameraPos
                        });
                    }
                }
            }
        });

        cameraCardsHTML += `
            <div class="camera-card">
                <div class="camera-header">
                    <div class="camera-number">CAMERA ${cameraNum}</div>
                    <div class="camera-position">${cameraShots[0]?.cameraPos || 'Position TBD'}</div>
                </div>
                <div class="camera-shots">
                    <h4>Assigned Shots</h4>
                    ${cameraShots.map(shot => `
                        <div class="shot-item">
                            <span class="shot-type">${shot.shotType}</span>
                            <span class="shot-subject">${shot.shotSubject}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="camera-actions">
                    <button class="btn button2" onclick="displayCameraCardInline('${cameraNum}')">Create Card</button>
                </div>
            </div>
        `;
    });
    
    cameraCardsHTML += '</div></div>';
    cameraCardsContent.innerHTML = cameraCardsHTML;
    
    // Apply camera cards styles
    const style = document.createElement('style');
    style.textContent = `
        .camera-cards-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .camera-cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 24px;
            margin-top: 24px;
        }
        .camera-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            transition: all 0.3s ease;
        }
        .camera-card:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: var(--accent-green);
            transform: translateY(-2px);
        }
        .camera-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
        }
        .camera-number {
            background: var(--accent-green);
            color: var(--text-white);
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 16px;
            letter-spacing: 1px;
        }
        .camera-position {
            color: var(--text-light);
            font-size: 14px;
            font-style: italic;
        }
        .camera-shots h4 {
            color: var(--text-white);
            margin-bottom: 16px;
            font-size: 18px;
        }
        .shot-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        .shot-type {
            color: var(--accent-green);
            font-weight: 500;
            font-size: 14px;
        }
        .shot-subject {
            color: var(--text-white);
            font-size: 14px;
        }
        .camera-actions {
            margin-top: 20px;
            text-align: center;
        }
        .camera-cards-empty {
            text-align: center;
            padding: 60px 20px;
        }
        .camera-cards-empty h3 {
            color: var(--text-white);
            margin-bottom: 16px;
        }
        .camera-cards-empty p {
            color: var(--text-light);
            margin-bottom: 24px;
        }
    `;
    document.head.appendChild(style);
};

// Set up bidirectional synchronization between script and camera cards
$(document).ready(function() {
    // Monitor changes in script extra info fields
    $(document).on('input', '.extraInfo, input[name="extraInfo"]', function() {
        const $field = $(this);
        const newValue = $field.val() || $field.text() || '';
        
        // Find the event row this field belongs to
        const eventRow = $field.closest('tr');
        const eventNumber = eventRow.find('td:first-child').text().trim();
        
        // Find the camera number for this row
        const cameraField = eventRow.find('.cameraNum, [name="cameraNum"], input[class*="camera"]');
        let cameraNumber = '';
        
        if (cameraField.length > 0) {
            if (cameraField.is('input')) {
                cameraNumber = cameraField.val() || '';
            } else {
                cameraNumber = cameraField.text().replace('CAMERA ', '') || '';
            }
        }
        
        if (eventNumber && cameraNumber) {
            updateCameraCardNotes(eventNumber, cameraNumber, newValue);
        }
    });
    
    // Also monitor on blur to catch any final changes
    $(document).on('blur', '.extraInfo, input[name="extraInfo"]', function() {
        const $field = $(this);
        const newValue = $field.val() || $field.text() || '';
        
        // Find the event row this field belongs to
        const eventRow = $field.closest('tr');
        const eventNumber = eventRow.find('td:first-child').text().trim();
        
        // Find the camera number for this row
        const cameraField = eventRow.find('.cameraNum, [name="cameraNum"], input[class*="camera"]');
        let cameraNumber = '';
        
        if (cameraField.length > 0) {
            if (cameraField.is('input')) {
                cameraNumber = cameraField.val() || '';
            } else {
                cameraNumber = cameraField.text().replace('CAMERA ', '') || '';
            }
        }
        
        if (eventNumber && cameraNumber) {
            updateCameraCardNotes(eventNumber, cameraNumber, newValue);
        }
    });
    
    // Bidirectional synchronization is now active
});

// Test function for bidirectional synchronization
window.testBidirectionalSync = function(cameraNumber) {
    // Testing bidirectional sync for camera
    
    // Test 1: Update script extra info and see if camera card updates
    const testEvent = 1; // Test with first event
    const testNotes = `TEST SYNC: ${new Date().toLocaleTimeString()}`;
    
    // Testing script -> camera card sync
    updateScriptExtraInfo(testEvent, cameraNumber, testNotes);
    
    // Test 2: Update camera card notes and see if script updates
    setTimeout(() => {
        // Testing camera card -> script sync
        updateCameraCardNotes(testEvent, cameraNumber, `REVERSE TEST: ${new Date().toLocaleTimeString()}`);
    }, 1000);
    
    // Test 3: Check localStorage
    setTimeout(() => {
        const projectName = sessionStorage.getItem('projectName') || 'default';
        const storageKey = `${projectName}_camera_${cameraNumber}_event_${testEvent}_notes`;
        const storedNotes = localStorage.getItem(storageKey);
        // localStorage check completed
    }, 2000);
}; 