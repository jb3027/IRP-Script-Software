// UI Event Handlers
// This file handles all toolbar button clicks and UI interactions

// Draggable Formatting Sidebar
$(document).ready(function() {
    const sidebar = $('#formatting-sidebar');
    const dragHandle = $('#drag-handle');
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    // Get sidebar dimensions and screen boundaries
    function getBoundaries() {
        const sidebarWidth = sidebar.outerWidth();
        const sidebarHeight = sidebar.outerHeight();
        const navHeight = $('.nav-toolbar').outerHeight() || 40; // Default nav height
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();
        
        return {
            minX: -20,
            maxX: windowWidth - sidebarWidth - 5,
            minY: navHeight - 100, // 1px padding below nav
            maxY: windowHeight - sidebarHeight - 100, // 10px padding from bottom
            sidebarWidth,
            sidebarHeight
        };
    }

    // Only allow dragging when clicking on the drag handle
    dragHandle.on('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        isDragging = true;
        sidebar.addClass('dragging');
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        // Change cursor to grabbing
        dragHandle.css('cursor', 'grabbing');
    });

    // Optimized mousemove with requestAnimationFrame and boundary constraints
    let animationId;
    $(document).on('mousemove', function(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // Cancel any pending animation frame
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        // Use requestAnimationFrame for smooth dragging
        animationId = requestAnimationFrame(function() {
            const boundaries = getBoundaries();
            
            // Calculate new position
            let newX = e.clientX - initialX;
            let newY = e.clientY - initialY;
            
            // Apply boundary constraints
            newX = Math.max(boundaries.minX, Math.min(boundaries.maxX, newX));
            newY = Math.max(boundaries.minY, Math.min(boundaries.maxY, newY));
            
            xOffset = newX;
            yOffset = newY;
            
            setTranslate(newX, newY, sidebar);
        });
    });

    $(document).on('mouseup', function() {
        if (!isDragging) return;
        
        isDragging = false;
        sidebar.removeClass('dragging');
        dragHandle.css('cursor', 'grab');
        
        // Cancel any pending animation
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        // Store final position
        initialX = xOffset;
        initialY = yOffset;
    });

    // Handle window resize to keep sidebar within bounds
    $(window).on('resize', function() {
        const boundaries = getBoundaries();
        
        // If current position is outside new boundaries, adjust it
        if (xOffset < boundaries.minX) xOffset = boundaries.minX;
        if (xOffset > boundaries.maxX) xOffset = boundaries.maxX;
        if (yOffset < boundaries.minY) yOffset = boundaries.minY;
        if (yOffset > boundaries.maxY) yOffset = boundaries.maxY;
        
        setTranslate(xOffset, yOffset, sidebar);
    });

    function setTranslate(xPos, yPos, el) {
        el.css('transform', `translate3d(${xPos}px, ${yPos}px, 0)`);
    }
});

$(document).ready(function() {
    // BOLD
    $('.bold-button').on('click', function() {
        document.execCommand('bold', false, null);
    });

    // ITALIC
    $('.italic-button').on('click', function() {
        document.execCommand('italic', false, null);
    });

    // UNDERLINE
    $('.underline-button').on('click', function() {
        document.execCommand('underline', false, null);
    });

    // HIGHLIGHT
    $('.highlight-button').on('click', function() {
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            document.execCommand('backColor', false, 'yellow');
        } else {
            document.execCommand('backColor', false, 'transparent');
        }
    });

    // FONT
    $('.font-button').on('click', function() {
        const body = document.body;
        const currentFont = window.getComputedStyle(body).fontFamily;
        
        // Toggle between Arial and OpenDyslexic
        if (currentFont.includes('OpenDyslexic')) {
            body.style.setProperty('font-family', 'Arial, sans-serif', 'important');
            localStorage.setItem('preferredFont', 'Arial');
        } else {
            body.style.setProperty('font-family', 'OpenDyslexic, Arial, sans-serif', 'important');
            localStorage.setItem('preferredFont', 'OpenDyslexic');
        }
    });

    // UNDO/REDO - Now handled by UndoRedoManager

    // HOME BUTTON - Functionality moved to sidebar navigation


    // Function to load view mode content (for sidebar navigation)
    window.loadViewMode = function() {
        const viewContent = document.getElementById('view-content');
        if (!viewContent) return;

        // Extract all values before cloning to ensure they're preserved
        const originalTable = $('.container');
        const shotData = [];
        
        // Collect shot data from the original table before cloning
        originalTable.find('tr.event_highlighted').each(function() {
            const row = $(this);
            const shotCell = row.find('td:nth-child(2)');
            const shotRows = shotCell.find('.shot-input-row');
            const rowData = [];
            
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
                    
                    rowData.push({
                        shotType: shotType,
                        shotSubject: shotSubject,
                        customText: customText,
                        isCustom: isCustom
                    });
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
                
                rowData.push({
                    shotType: shotType,
                    shotSubject: shotSubject,
                    customText: customText,
                    isCustom: isCustom
                });
            }
            
            shotData.push(rowData);
        });

        const tableClone = $('.container').clone();
        const productionTitle = $('.production-title').text();
        
        // Store the original top positions as CSS variables
        tableClone.find('tr.event_highlighted').each(function() {
            const row = $(this);
            const shotCell = row.find('td:nth-child(2)');
            const scriptCell = row.find('td:nth-child(3)');
            
            // Store the original top positions as CSS variables
            shotCell.find('.editable-cell, .shot-type-flex-container').each(function() {
                const topValue = $(this).css('top');
                if (topValue && topValue !== 'auto') {
                    $(this).css('--original-top', topValue);
                }
            });
        });

        // Handle shot type cells specifically
        tableClone.find('tr.event_highlighted').each(function(index) {
            const row = $(this);
            const shotCell = row.find('td:nth-child(2)');
            const scriptCell = row.find('td:nth-child(3)');
            const cameraNum = shotCell.find('.cameraNum').val() || '';
            const cameraPos = shotCell.find('.cameraPos').val() || '';
            
            // Use the extracted shot data instead of trying to read from cloned table
            const rowShotData = shotData[index] || [];
            let shotTypesAndSubjects = '';
            
            if (rowShotData.length > 0) {
                // Process each shot from the extracted data
                rowShotData.forEach((shot, shotIndex) => {
                    let shotType = shot.shotType;
                    const shotSubject = shot.shotSubject;
                    
                    // Check if it's a custom shot type
                    if (shot.isCustom && shot.customText) {
                        shotType = shot.customText;
                    }
                    
                    if (shotType && shotSubject) {
                        if (shotIndex > 0) shotTypesAndSubjects += '<br>';
                        shotTypesAndSubjects += `<strong>${shotType}</strong> ${shotSubject}`;
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
                    shotTypesAndSubjects = `<strong>${displayShotType}</strong> ${shotSubject}`;
                }
            }
            
            // Update the shot cell content
            shotCell.html(`
                <div class="view-shot-content">
                    ${shotTypesAndSubjects}
                    ${cameraNum ? `<br><small>Camera: ${cameraNum}</small>` : ''}
                    ${cameraPos ? `<br><small>Position: ${cameraPos}</small>` : ''}
                </div>
            `);
            
            // Update the script cell content
            const scriptContent = scriptCell.find('.editable-cell').map(function() {
                return $(this).text();
            }).get().join('<br>');
            
            scriptCell.html(`
                <div class="view-script-content">
                    ${scriptContent}
                </div>
            `);
        });

        // Create the view content
        const viewHTML = `
            <div class="view-container">
                <h2>${productionTitle || 'Untitled Production'}</h2>
                <div class="view-table-container">
                    ${tableClone.html()}
                </div>
            </div>
        `;
        
        viewContent.innerHTML = viewHTML;
        
        // Apply view-specific styles
        viewContent.querySelectorAll('.view-shot-content, .view-script-content').forEach(el => {
            el.style.padding = '10px';
            el.style.border = '1px solid var(--border-color)';
            el.style.borderRadius = '4px';
            el.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        });
    };

    // Event table row click handler - auto-focus script column
    $(document).on('click', '#event-table tbody tr', function(e) {
        // Don't auto-focus if user clicked on a specific input field or button
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' || 
            e.target.tagName === 'SELECT' || 
            e.target.tagName === 'BUTTON' ||
            e.target.closest('button') ||
            e.target.closest('input') ||
            e.target.closest('textarea') ||
            e.target.closest('select')) {
            return;
        }
        
        // Don't auto-focus if user clicked on the SHOT column (2nd column) of Item or Insert rows
        const $row = $(this);
        const clickedCell = $(e.target).closest('td');
        const cellIndex = clickedCell.index();
        
        // If clicked on SHOT column (index 1) and row is Item or Insert, do nothing
        if (cellIndex === 1 && ($row.hasClass('item_highlighted') || $row.hasClass('insert_highlighted'))) {
            return;
        }
        
        // If clicked on DETAILS column (index 3), let the default behavior handle it
        // The DETAILS column is editable for all row types
        if (cellIndex === 3) {
            // Ensure the cell is editable and focus it
            clickedCell.attr('contenteditable', 'true');
            clickedCell.focus();
            
            // Place cursor at the click position (default behavior will handle this)
            return;
        }
        
        // For other columns, auto-focus the script column (3rd column, index 2)
        const scriptCell = $(this).find('td:nth-child(3)');
        if (scriptCell.length > 0) {
            // Make the cell editable and focus it
            scriptCell.attr('contenteditable', 'true');
            scriptCell.focus();
            
            // Place cursor at the end of the content
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(scriptCell[0]);
            range.collapse(false); // false = collapse to end
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });

    // VIEW MODE - Updated for new navigation system
    $(document).on('click', '.view-button', function() {
        // Switch to script mode first before opening view mode
        // Use the sidebar navigation's script mode switching logic
        if (window.sidebarNav) {
            // Remove active class from all mode buttons
            document.querySelectorAll('.mode-nav-btn').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to script button
            const scriptModeBtn = document.getElementById('script-mode-btn');
            if (scriptModeBtn) {
                scriptModeBtn.classList.add('active');
            }
            
            // Navigate to script page and show script table
            window.sidebarNav.navigateToPage('script');
            $('.container').show();
            $('.running-order-container').hide();
        }
        
        // Extract all values before cloning to ensure they're preserved
        const originalTable = $('.container');
        const shotData = [];
        
        // Collect shot data from the original table before cloning
        originalTable.find('tr.event_highlighted').each(function() {
            const row = $(this);
            const shotCell = row.find('td:nth-child(2)');
            const shotRows = shotCell.find('.shot-input-row');
            const rowData = [];
            
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
                    
                    rowData.push({
                        shotType: shotType,
                        shotSubject: shotSubject,
                        customText: customText,
                        isCustom: isCustom
                    });
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
                
                rowData.push({
                    shotType: shotType,
                    shotSubject: shotSubject,
                    customText: customText,
                    isCustom: isCustom
                });
            }
            
            shotData.push(rowData);
        });
        

        
        const tableClone = $('.container').clone();
        const productionTitle = $('.production-title').text();
        
        // Store the original top positions as CSS variables
        tableClone.find('tr.event_highlighted').each(function() {
            const row = $(this);
            const shotCell = row.find('td:nth-child(2)');
            const scriptCell = row.find('td:nth-child(3)');
            
            // Store the original top positions as CSS variables
            shotCell.find('.editable-cell, .shot-type-flex-container').each(function() {
                const topValue = $(this).css('top');
                if (topValue && topValue !== 'auto') {
                    $(this).css('--original-top', topValue);
                }
            });
        });

        // Handle shot type cells specifically
        tableClone.find('tr.event_highlighted').each(function(index) {
            const row = $(this);
            const shotCell = row.find('td:nth-child(2)');
            const scriptCell = row.find('td:nth-child(3)');
            const cameraNum = shotCell.find('.cameraNum').val() || '';
            const cameraPos = shotCell.find('.cameraPos').val() || '';
            
            // Use the extracted shot data instead of trying to read from cloned table
            const rowShotData = shotData[index] || [];
            let shotTypesAndSubjects = '';
            
            if (rowShotData.length > 0) {
                // Process each shot from the extracted data
                rowShotData.forEach((shot, shotIndex) => {
                    let shotType = shot.shotType;
                    const shotSubject = shot.shotSubject;
                    
                    // Check if it's a custom shot type
                    if (shot.isCustom && shot.customText) {
                        shotType = shot.customText;
                    }
                    
                    // Always show shot subject if it exists, regardless of shot type
                    if (shotSubject && shotSubject.trim()) {
                        if (shotTypesAndSubjects) {
                            shotTypesAndSubjects += '\n';
                        }
                        if (shotType && shotType !== 'SHOT TYPE') {
                            shotTypesAndSubjects += `${shotType} ${shotSubject}`;
                        } else {
                            shotTypesAndSubjects += shotSubject;
                        }
                    } else if (shotType && shotType !== 'SHOT TYPE') {
                        // Show shot type even if no subject
                        if (shotTypesAndSubjects) {
                            shotTypesAndSubjects += '\n';
                        }
                        shotTypesAndSubjects += shotType;
                    }
                });
            }
            
            const extraInfo = shotCell.find('.extraInfo').val() || '';

            // Get the original top position from the style attribute
            const originalTop = shotCell.find('.shot-type-flex-container').css('top') || '0px';

            // Structure the content in three distinct lines
            const newContent = `
                <div style="position: relative; top: ${originalTop}; display: flex; flex-direction: column; gap: 4px;">
                    <div style="margin-bottom: 4px;">${cameraNum}${cameraPos}</div>
                    <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
                        <span style="white-space: pre-line;">${shotTypesAndSubjects}</span>
                    </div>
                    <div>${extraInfo}</div>
                </div>
            `;

            // Replace the shot cell with the user inputs while preserving positioning
            shotCell.html(newContent);

            // Preserve the script cell content including cut lines
            const scriptContent = scriptCell.html();
            if (scriptContent) {
                scriptCell.html(scriptContent);
            }
        });

        // Preserve cut line positioning and styling
        tableClone.find('.cut-line').each(function() {
            $(this).css({
                'position': 'relative',
                'display': 'inline',
                'white-space': 'pre-wrap'
            });
        });

        // Add cut line styles to the view window
        const cutLineStyles = `
            .cut-line {
                position: relative;
                display: inline;
                white-space: pre-wrap;
            }
            .cut-line::after {
                content: '';
                position: absolute;
                left: -350px;
                right: 0;
                bottom: -3px;
                height: 2px;
                background-color: black;
                z-index: 1;
                pointer-events: none;
            }
        `;

        // Remove editable custom cell from shot column
        tableClone.find('td:nth-child(2) .custom-shot-type').each(function() {
            const content = $(this).text().trim();
            $(this).replaceWith($('<span>').text(' '));
        });
        
        // Make all contenteditable elements non-editable in view mode
        tableClone.find('[contenteditable="true"]').attr('contenteditable', 'false');

        function setDuration() {
            // Make all duration elements uneditable strings
            tableClone.find('input[type="time"]').each(function() {
                const timeValue = $(this).val() || '00:00';
                const [minutes, seconds] = timeValue.split(':');
                $(this).replaceWith($('<span>').text(`${minutes}'${seconds}"`));
            });
        }
        
        // Replace Inserts with what the user has inputted
        // NOTE: Process inserts BEFORE calling setDuration() to preserve time values
        tableClone.find('td:nth-child(3) .insert-content').each(function() {
            const insertTitle = $(this).find('.insertTitle').val() || 'Ven: Title';
            const insertIn = $(this).find('.insertIn').val() || 'In: Music';
            const insertOut = $(this).find('.insertOut').val() || 'Out: Music';
            // Get the time value BEFORE setDuration replaces the input
            const timeInput = $(this).find('input[type="time"]');
            const timeValue = timeInput.val() || timeInput.attr('value') || '00:00';
            const [minutes, seconds] = timeValue.split(':');

            // Create a formatted insert display
            const formattedInsert = `
                <div class="insert-content">
                    <div style="text-align: left; width: 60%; margin: 0 auto;">
                        <u>${insertTitle}</u>
                        <div>${insertIn}</div>
                        <div>Dur: ${`${minutes}'${seconds}"`}</div>
                        <div>${insertOut}</div>
                    </div>
                </div>
            `;
            
            $(this).replaceWith(formattedInsert);
        });

        // Call setDuration function AFTER processing inserts
        setDuration();

        // Replace 'New Item' with what the user has inputted
        tableClone.find('td:nth-child(3) .item-content').each(function() {
            const userInput = $(this).val() || $(this).text() || 'New Item';
            const span = $('<span style="text-decoration: underline; margin-left: -8px; display: inline-block;">').text(userInput);
            $(this).replaceWith(span);
        });
        
        // Create new window/tab and write content
        const viewWindow = window.open('', '_blank');
        viewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>View Mode</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
                <style>
                    ${cutLineStyles}
                    body { 
                        padding-top: 20px;
                        color: rgb(16, 16, 16) !important;
                    }
                    table {
                        width: 794px !important;
                        table-layout: fixed;
                        margin: 0 auto;
                        border-collapse: collapse !important;
                        border-spacing: 0 !important;
                    }
                    td, th{
                        border: none !important;
                        outline: none !important;
                    }
                    .editable-cell,
                    .editable-text,
                    div[contenteditable] {
                        outline: none !important;
                        border: none !important;
                        min-height: 24px;
                        vertical-align: top !important;
                        height: auto;
                        min-height: 24px;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        overflow: visible;
                        resize: vertical;
                        padding: 4px 8px;
                        width: 100%;
                        box-sizing: border-box;
                    }
                    .shot-type-select {
                        width: fit-content;
                        text-align: left;
                        border: none;
                        outline: none;
                        background-color: none !important;
                    }
                    .btn {
                        display: none;
                    }
                    .cut-line {
                        position: relative;
                    }
                    .cut-line::after {
                        content: '';
                        position: absolute;
                        left: -350px;
                        right: 0;
                        bottom: -3px;
                        height: 2px;
                        background-color: black;
                        z-index: 1;
                        pointer-events: none;
                    }
                    .shot-type-flex-container {
                        display: flex;
                        align-items: center;
                        gap: 2px; 
                    }
                    .shot-type-flex-container2 {
                        display: flex;
                        align-items: center;
                        gap: 0.5px; 
                    }
                    .shot-type-text {
                        flex-grow: 1;
                        margin-left: 8px;
                    }
                    .shotTypeDropdown {
                        flex-shrink: 0;
                        margin-right: 4px;
                    }
                    .insert-duration-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                        margin: 0 auto;
                    }
                    .insert-duration-container > * {
                        display: inline-block;
                        vertical-align: middle;
                        margin: 0;
                    }
                    .insert-duration-container > * {
                        display: inline-block;
                        vertical-align: middle;
                        margin: 0;
                    }
                    .insertDuration {
                        padding-right: 4px !important;
                        text-align: right !important;
                    }
                    .production-title {
                        text-align: left;
                        font-size: 24px;
                        font-weight: bold;
                        padding: 8px 16px;
                        margin-top: 150px;
                        margin-bottom: 0px;
                        margin-left: 250px;
                        outline: none !important;
                        border: none !important;
                    }
                    .insert-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 4px;
                        color: rgb(16, 16, 16) !important;
                    }
                    .insert-content > * {
                        margin: 0;
                        width: 100%;
                        text-align: center;
                        color: rgb(16, 16, 16) !important;
                    }
                    .insert-content span {
                        color: rgb(16, 16, 16) !important;
                    }
                    td {
                        color: rgb(16, 16, 16) !important;
                    }
                    .shot-type-wrapper {
                        margin-top: 0;
                        padding-top: 0;
                    }
                    td:nth-child(2) {
                        vertical-align: top !important;
                        padding-top: 8px !important;
                    }
                    td:first-child {
                        vertical-align: top !important;
                        padding-top: 8px !important;
                    }
                    td event_highlighted {
                        position: absolute;
                    }
                    
                    /* Add these styles */
                    td {
                        vertical-align: top !important;
                        padding-top: 8px !important;
                    }
                    
                    td > div {
                        text-align: left;
                        margin-top: 0;
                        padding-top: 0;
                    }
                    
                    .script-cell {
                        text-align: left;
                        vertical-align: top !important;
                        padding-top: 8px !important;
                    }
                    
                    /* Fix table spacing to prevent overlap with production title */
                    table {
                        margin-top: 60px !important;
                        margin-left: 250px !important;
                        border-collapse: collapse !important;
                        width: calc(100% - 250px) !important;
                    }
                    
                    /* Ensure proper spacing for the first row */
                    tr:first-child {
                        margin-top: 20px !important;
                    }
                    
                    /* Add spacing to the body to push content down */
                    body {
                        padding-top: 50px !important;
                    }
                </style>
            </head>
            <body class="view-mode">
                <div class="production-title">${productionTitle}</div>
                ${tableClone.html()}
            </body>
            </html>
        `);
        
        // Add this after the document.write to ensure styles are applied
        viewWindow.document.close();
        viewWindow.addEventListener('load', function() {
            // Force a repaint of cut lines and apply view mode positioning
            const cutLines = viewWindow.document.querySelectorAll('.cut-line');
            cutLines.forEach(line => {
                line.style.display = 'inline';
                line.style.position = 'relative';
                line.style.transform = 'translateY(0px)';
                line.style.top = '0px';
                line.style.marginLeft = '-250px';
                line.style.paddingLeft = '250px';
                // Force a repaint
                line.offsetHeight;
            });
        });
        
        // Remove the last column (the add/remove buttons)
        viewWindow.document.querySelectorAll('tr').forEach(row => {
            const lastCell = row.lastElementChild;
            if (lastCell) {
                lastCell.remove();
            }
        });

        // Remove the text in the header
        viewWindow.document.querySelectorAll('th').forEach(header => {
            header.textContent = '';
        });
        
        viewWindow.document.close();
        
        // Focus the new window
        viewWindow.focus();
    });
}); 