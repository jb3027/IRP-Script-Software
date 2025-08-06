// Modal Handlers
// This file handles modal dialogs and confirmation prompts

// Show question modal function
function showQuestionModal(question, option1Text, option2Text, option1Callback, option2Callback) {
    const modalElement = document.getElementById('questionModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Set the question
    document.querySelector('#questionModal .modal-body').textContent = question;
    
    // Set button text
    const option1Button = document.getElementById('modalOption1');
    const option2Button = document.getElementById('modalOption2');
    option1Button.textContent = option1Text;
    option2Button.textContent = option2Text;
    
    // Store the element that had focus before opening the modal
    const previousActiveElement = document.activeElement;
    
    // Set up button click handlers
    option1Button.onclick = function() {
        modal.hide();
        option1Callback();
        // Return focus to the previous element
        if (previousActiveElement) {
            previousActiveElement.focus();
        }
    };
    option2Button.onclick = function() {
        modal.hide();
        option2Callback();
        // Return focus to the previous element
        if (previousActiveElement) {
            previousActiveElement.focus();
        }
    };
    
    // Handle modal events
    modalElement.addEventListener('hidden.bs.modal', function () {
        // Return focus to the previous element when modal is hidden
        if (previousActiveElement) {
            previousActiveElement.focus();
        }
    }, { once: true });
    
    modal.show();
}

// Make function globally available
window.showQuestionModal = showQuestionModal; 