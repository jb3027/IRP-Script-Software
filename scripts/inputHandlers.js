// Input Handlers
// This file handles various input field interactions and validations

$(document).ready(function() {
    // Auto-resize function for custom shot type inputs
    function autoResizeInput(input) {
        // Reset height to auto to get the correct scrollHeight
        input.style.height = 'auto';
        
        // Calculate the new height based on content
        const newHeight = Math.max(30, input.scrollHeight);
        
        // Set the new height
        input.style.height = newHeight + 'px';
        
        // Force a reflow to ensure the height change is applied
        input.offsetHeight;
        
        // Additional height calculation based on line count
        const lineCount = (input.value.match(/\n/g) || []).length + 1;
        const lineHeight = 20; // Approximate line height
        const calculatedHeight = Math.max(30, lineCount * lineHeight);
        
        // Use the larger of the two heights
        const finalHeight = Math.max(newHeight, calculatedHeight);
        input.style.height = finalHeight + 'px';
        
        // Debug logging removed
    }
    
    // Initialize custom inputs that have content
    function initializeCustomInputs() {
        $('.custom-shot-type').each(function() {
            const input = $(this);
            const select = input.siblings('.shot-type-select');
            const shotSubject = input.siblings('.shotSubject');
            
            // If custom input has content, show it and hide others
            if (input.val().trim() !== '') {
                select.hide();
                shotSubject.hide();
                input.show();
                autoResizeInput(input[0]);
            }
        });
        
        // Also check for custom inputs that should be visible based on dropdown selection
        $('.shot-type-select').each(function() {
            const select = $(this);
            const input = select.siblings('.custom-shot-type');
            const shotSubject = select.siblings('.shotSubject');
            
            if (select.val() === 'CUSTOM' && input.val().trim() !== '') {
                select.hide();
                shotSubject.hide();
                input.show();
                autoResizeInput(input[0]);
            }
        });
        
        // Initialize shot subject textareas with proper height - but only for existing ones, not newly added
        $('.shotSubject').each(function() {
            if ($(this).val().trim() !== '' && !$(this).closest('.shot-input-row').attr('data-shot-index')) {
                autoResizeInput(this);
            }
        });
    }
    
    // Initialize immediately
    initializeCustomInputs();
    
    // Also initialize after a short delay to ensure DOM is fully loaded
    setTimeout(initializeCustomInputs, 100);
    
    // Initialize after state restoration (longer delay to ensure state is loaded)
    setTimeout(initializeCustomInputs, 500);
    
    // Prevent auto-resize from interfering with newly added rows
    $(document).on('DOMNodeInserted', '.shot-input-row', function() {
        // Don't auto-resize newly added rows immediately
        $(this).find('.shotSubject').css({
            'width': '120px',
            'display': 'inline-block',
            'margin-left': '8px',
            'vertical-align': 'top',
            'transform': 'translateY(30px)'
        });
    });
    
    // Also listen for state restoration events
    $(document).on('stateRestored', function() {
        setTimeout(initializeCustomInputs, 100);
        
        // Update remove button visibility after state restoration
        $('.shot-type-wrapper').each(function() {
            updateRemoveButtonVisibility($(this));
        });
        
        // Ensure shot type and shot subject values are properly set after state restoration
        setTimeout(function() {
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
                
                // Ensure shot subject is always visible and properly positioned
                $textarea.css({
                    'display': 'inline-block',
                    'visibility': 'visible',
                    'opacity': '1',
                    'position': 'relative',
                    'width': '120px',
                    'margin-left': '8px',
                    'vertical-align': 'top',
                    'transform': 'translateY(30px)'
                });
            });
        }, 200);
    });
    
    // Update remove button visibility on initial page load
    setTimeout(function() {
        $('.shot-type-wrapper').each(function() {
            updateRemoveButtonVisibility($(this));
        });
        
        // Ensure all shot subjects are visible and properly positioned
        $('.shotSubject').each(function() {
            $(this).css({
                'display': 'inline-block',
                'visibility': 'visible',
                'opacity': '1',
                'position': 'relative',
                'width': '120px',
                'margin-left': '8px',
                'vertical-align': 'top',
                'transform': 'translateY(30px)'
            });
        });
    }, 100);
    


    // Dropdown menu closes when user clicks elsewhere
    function show(value) {
        document.querySelector(".text-box").value = value;
    }
    
    let dropdown = document.querySelector(".dropdown");
    if (dropdown) {
        dropdown.onclick = function() {
            dropdown.classList.toggle("active");
        };
    }

    // Make the first item's input expandable
    $('.item-content').first().css({
        'height': 'auto',
        'min-height': '24px'
    }).on('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Add event handlers for add shot button
    $(document).on('click', '.add-shot-btn', function() {
        const $this = $(this);
        const wrapper = $this.closest('.shot-type-wrapper');
        const container = wrapper.find('.shot-inputs-container');
        const existingRows = container.find('.shot-input-row');
        const newIndex = existingRows.length;
        
        // Clone existing working row instead of creating from scratch
        const existingRow = container.find('.shot-input-row').first();
        const $newRow = existingRow.clone();
        
        // Update the data attribute and clear values
        $newRow.attr('data-shot-index', newIndex);
        $newRow.find('.shot-type-select').val('SHOT TYPE'); // Set default to "SHOT TYPE"
        $newRow.find('.shotSubject').val('');
        $newRow.find('.custom-shot-type').val('').hide();
        
        // Ensure the cloned row has all the necessary functionality
        $newRow.find('.shot-type-select').show();
        $newRow.find('.shotSubject').show();
        
        // Insert the cloned row before the add button
        $this.before($newRow);
        
        // Move the add button below the new row
        $this.insertAfter(container.find('.shot-input-row').last());
        
        // Update remove button visibility AFTER adding the new row
        updateRemoveButtonVisibility(wrapper);
        
        // Remove cursor focus from the table
        $(document.activeElement).blur();
        

    });

    // Add event handlers for remove shot button - multiple event types for better compatibility
    $(document).on('click mousedown', '.remove-shot-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $this = $(this);
        const $row = $this.closest('.shot-input-row');
        const wrapper = $this.closest('.shot-type-wrapper');
        const container = wrapper.find('.shot-inputs-container');
        const currentRowCount = container.find('.shot-input-row').length;
        
        // Only allow removal if there's more than one row
        if (currentRowCount > 1) {
            // Remove the row
            $row.remove();
            
            // Update remove button visibility
            updateRemoveButtonVisibility(wrapper);
        }
    });
    
    // Function to update remove button visibility based on row count
    function updateRemoveButtonVisibility(wrapper) {
        const rows = wrapper.find('.shot-input-row');
        const currentRowCount = rows.length;
        
        rows.each(function(index) {
            const $row = $(this);
            
            if (currentRowCount === 1) {
                // Only one row - add single-row class to hide remove button
                $row.addClass('single-row');
            } else {
                // Multiple rows - remove single-row class to show remove button
                $row.removeClass('single-row');
            }
        });
        
        // Ensure custom inputs get proper width after visibility update
        // ensureCustomInputWidth(); // Keep this disabled
    }
    
    // Make function globally available
    window.updateRemoveButtonVisibility = updateRemoveButtonVisibility;

    // Function to ensure custom inputs get proper width
    function ensureCustomInputWidth() {
        // COMPLETELY DISABLED - this function is overriding CSS and causing width issues
        return;
        
        // Simple function - just ensure basic styling, let CSS handle layout
        $('.custom-shot-type').each(function() {
            const $input = $(this);
            const $row = $input.closest('.shot-input-row');
            const $container = $row.closest('.shot-inputs-container');
            
            // Check if this is the only row and it's a custom input
            const isOnlyRow = $row.is(':only-child');
            const isCustomSelected = $input.is(':visible');
            
            if (isOnlyRow && isCustomSelected) {
                // Add a hidden spacer row to maintain layout structure
                if ($container.find('.spacer-row').length === 0) {
                    const spacerRow = `
                        <div class="spacer-row" style="display: none;">
                            <div style="width: 120px; height: 1px;"></div>
                            <div style="width: 120px; height: 1px;"></div>
                        </div>
                    `;
                    $container.append(spacerRow);
                }
            }
            
            // Just ensure basic styling - let CSS handle the width naturally
            $input.css({
                'overflow': 'visible',
                'word-wrap': 'break-word',
                'white-space': 'pre-wrap',
                'color': 'var(--main-text)',
                'border': 'none',
                'outline': 'none'
            });
        });
    }

    // Call the function immediately and on window resize
    ensureCustomInputWidth();
    $(window).on('resize', ensureCustomInputWidth);
    
    // Also call it after any DOM changes
    $(document).on('DOMNodeInserted', '.custom-shot-type', function() {
        setTimeout(ensureCustomInputWidth, 100);
    });
    
    // Initialize add button visibility on page load
    $(document).ready(function() {
        $('.shot-type-wrapper').each(function() {
            updateRemoveButtonVisibility($(this));
        });
    });
    
    // Auto-resize on input for shot subject inputs
    $(document).on('input', '.shotSubject', function() {
        autoResizeInput(this);
    });
    
    // Additional auto-resize on keyup for more responsive resizing
    $(document).on('keyup', '.shotSubject', function() {
        autoResizeInput(this);
    });
    
    // Auto-resize on paste events
    $(document).on('paste', '.shotSubject', function() {
        // Use setTimeout to ensure content is pasted before resizing
        setTimeout(() => autoResizeInput(this), 10);
    });
    
    // Auto-resize on any content change
    $(document).on('change', '.shotSubject', function() {
        autoResizeInput(this);
    });
});

// Time formatting functions
function formatTime(event) {
    // Allow only numbers, backspace, delete, tab, arrows, and colon
    if (!(['0','1','2','3','4','5','6','7','8','9','Backspace','Delete','Tab','ArrowLeft','ArrowRight',':'].includes(event.key))) {
        event.preventDefault();
        return false;
    }
}

function formatTimeInput(element) {
    let value = element.textContent.replace(/[^\d]/g, ''); // Remove non-digits
    
    // Pad with zeros if necessary
    while (value.length < 4) {
        value = '0' + value;
    }
    
    // Limit to 4 digits
    value = value.slice(0, 4);
    
    // Format as MM:SS
    const minutes = value.slice(0, 2);
    const seconds = value.slice(2, 4);
    
    // Validate seconds
    if (parseInt(seconds) > 59) {
        element.textContent = minutes + ':59';
    } else {
        element.textContent = minutes + ':' + seconds;
    }
}

// Make functions globally available
window.formatTime = formatTime;
window.formatTimeInput = formatTimeInput; 

// Mutation Observer to watch for new shot input rows and apply positioning immediately
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList && node.classList.contains('shot-input-row')) {
                    // New shot input row added - apply positioning immediately
                    setTimeout(function() {
                        const $row = $(node);
                        const $shotType = $row.find('.shot-type-select');
                        const $shotSubject = $row.find('.shotSubject');
                        
                        // Force inline layout
                        $row.css({
                            'display': 'block',
                            'white-space': 'nowrap',
                            'overflow': 'visible'
                        });
                        
                        // Force shot type and subject inline
                        $shotType.css({
                            'display': 'inline-block',
                            'width': '120px',
                            'vertical-align': 'top',
                            'float': 'none',
                            'clear': 'none'
                        });
                        
                        $shotSubject.css({
                            'display': 'inline-block',
                            'width': '120px',
                            'margin-left': '8px',
                            'vertical-align': 'top',
                            'transform': 'translateY(30px)',
                            'float': 'none',
                            'clear': 'none'
                        });
                    }, 10);
                }
            });
        }
    });
});

// Start observing the document for new shot input rows
observer.observe(document.body, {
    childList: true,
    subtree: true
}); 