// Input Handlers
// This file handles various input field interactions and validations

$(document).ready(function() {
    // If CUSTOM option selected on dropdown, insert an editable cell instead
    $(document).on('change', '.shot-type-select', function() {
        const select = $(this);
        const input = select.siblings('.custom-shot-type');
        if (select.val() === 'CUSTOM') {
            select.hide();
            input.show().focus();
        }
    });

    // Event handler for the CUSTOM input
    $(document).on('blur', '.custom-shot-type', function() {
        const input = $(this);
        const select = input.siblings('.shot-type-select');
        if (!input.val().trim()) {
            input.hide();
            select.show().val('SHOT TYPE');
        }
    });

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