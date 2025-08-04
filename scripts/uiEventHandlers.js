// UI Event Handlers
// This file handles all toolbar button clicks and UI interactions

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

    // UNDO
    $('.undo-button').on('click', function() {
        document.execCommand('undo', false, null);
    });

    // REDO
    $('.redo-button').on('click', function() {
        document.execCommand('redo', false, null);
    });

    // HOME BUTTON - Return to project selection
    $('.home-button').on('click', function() {
        // Show confirmation dialog before proceeding
        showQuestionModal(
            "Are you sure you want to close this project? Any unsaved changes will be lost.",
            "Cancel",
            "Close Project",
            // Cancel callback - do nothing
            function() {
                console.log('Home button action cancelled by user');
            },
            // Close Project callback - proceed with original functionality
            function() {                    
                // Clear production state
                if (typeof clearProductionState === 'function') {
                    clearProductionState();
                }
                
                // Clear project name from session storage
                sessionStorage.removeItem('projectName');
                
                // Hide main content and show project selection
                $('.main-content').hide();
                $('#logged_out_view').hide();
                
                // Force show project selection with explicit CSS
                const projectLogin = $('#project-login');
                projectLogin.show();
                
                // Override the CSS !important rule by setting style attribute directly
                projectLogin[0].style.setProperty('display', 'flex', 'important');
                projectLogin[0].style.setProperty('visibility', 'visible', 'important');
                projectLogin[0].style.setProperty('opacity', '1', 'important');
                
                // Clear the project input field
                $('#projectName').val('');
                
                // Reset the page title
                document.title = 'PaperworkPro';
            }
        );
    });

    // VIEW MODE
    $('.view-button').on('click', function() {
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
        tableClone.find('tr.event_highlighted').each(function() {
            const row = $(this);
            const shotCell = row.find('td:nth-child(2)');
            const scriptCell = row.find('td:nth-child(3)');
            const cameraNum = shotCell.find('.cameraNum').val() || '';
            const cameraPos = shotCell.find('.cameraPos').val() || '';
            const shotTypeSelect = shotCell.find('.shot-type-select');
            const customInput = shotCell.find('.custom-shot-type');
            
            // Get the selected shot type value correctly
            let shotType;
            if(customInput.val() !== '') {
                shotType = customInput.val();
            } else {
                const originalSelects = $('.container .shot-type-select');
                tableClone.find('.shot-type-select').each(function(index) {
                    const originalSelect = originalSelects.eq(index);
                    const selectedText = originalSelect.find('option:selected').text();
                    shotType = selectedText;
                    if(shotType === 'SHOT TYPE') {
                        shotType = '';
                    }
                });
            }
            
            const shotSubject = shotCell.find('.shotSubject').val() || '';
            const extraInfo = shotCell.find('.extraInfo').val() || '';

            // Get the original top position from the style attribute
            const originalTop = shotCell.find('.shot-type-flex-container').css('top') || '0px';

            // Structure the content in three distinct lines
            const newContent = `
                <div style="position: relative; top: ${originalTop}; display: flex; flex-direction: column; gap: 4px;">
                    <div style="margin-bottom: 4px;">${cameraNum}${cameraPos}</div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="white-space: nowrap;">${shotType}</span>
                        <span style="margin-left: 8px;">${shotSubject}</span>
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
        
        // Call setDuration function
        setDuration();

        // Replace 'New Item' with what the user has inputted
        tableClone.find('td:nth-child(3) .item-content').each(function() {
            const userInput = $(this).val() || $(this).text() || 'New Item';
            const span = $('<span style="text-decoration: underline; margin-left: -8px; display: inline-block;">').text(userInput);
            $(this).replaceWith(span);
        });

        // Replace Inserts with what the user has inputted
        tableClone.find('td:nth-child(3) .insert-content').each(function() {
            const insertTitle = $(this).find('.insertTitle').val() || 'Ven: Title';
            const insertIn = $(this).find('.insertIn').val() || 'In: Music';
            const insertOut = $(this).find('.insertOut').val() || 'Out: Music';
            const timeValue = ($(this).find('input[type="time"]')).val();
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
                        border-collapse: separate !important;
                        border-spacing: 0 10px;
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
                        margin-top: 100px;
                        margin-bottom: -75px;
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
            // Force a repaint of cut lines
            const cutLines = viewWindow.document.querySelectorAll('.cut-line');
            cutLines.forEach(line => {
                line.style.display = 'inline';
                line.style.position = 'relative';
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
    });
}); 