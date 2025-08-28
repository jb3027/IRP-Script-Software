// Project Management
// This file handles project creation, loading, and file operations

$(document).ready(function() {
    // Handler for Create New Production button
    document.getElementById('createNewBtn').addEventListener('click', function() {
        createNewProduction();
    });
    
    // Handler for Load Existing Production button
    document.getElementById('loadExistingBtn').addEventListener('click', function() {
        loadExistingProduction();
    });
});

// Function to ensure the main script view is shown (not Running Order)
function resetToScriptView() {
    // Check if we're currently in Running Order view
    const isRunningOrderView = $('#runningOrder-table').length > 0;
    
    if (isRunningOrderView) {
        // Restore the main script table structure
        $('.container').html(`
            <table style="margin-top:100px;" id="event-table" class="draggable-table">
                <thead>
                    <tr>
                        <th scope="col" style="border: 1px solid black; width:100px; text-align: center;">Event number</th>
                        <th scope="col" style="border: 1px solid black; width:350px; text-align: center;">Shot</th>
                        <th scope="col" style="border: 1px solid black; width:450px; text-align: center;">Script</th>
                        <th scope="col" style="border: 1px solid black; width:150px; text-align: center;">Details</th>
                        <th scope="col" style="border: none; width:90px; text-align: center;"></th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        `);
        
        // Remove any Show Script button if it exists
        $('.showScript-button').remove();
        
        // Restore the Running Order button if it doesn't exist
        if ($('.runningOrder-button').length === 0) {
            const runningOrderButton = $('<button class="btn button2 runningOrder-button" title="Running Order">Running Order</button>');
            $('.toolbar-group.dynamic-buttons').append(runningOrderButton);
        }
    }
}

function createNewProduction() {
    // Check if user is authenticated with Kinde first
    const isKindeLoggedIn = sessionStorage.getItem('isKindeLoggedIn');
    if (isKindeLoggedIn !== 'true') {
        alert("Please log in first");
        return;
    }
    
    const projectName = "New Production";
    sessionStorage.setItem('projectName', projectName);
    
    // Clear all existing data and start fresh
    clearAllProductionData();
    
    // Hide project login and show main content immediately
    $('#project-login').hide();
    $('.main-content').show();
    $('.production-title').text(projectName);
    document.title = projectName + ' - Studio Script Writer';
    
    // Ensure we start in Script view, not Running Order view
    resetToScriptView();
    
    // Initialize the production state for this new project
    setTimeout(() => {
        initializeProductionState(projectName);
        
        // Clear any existing camera card notes from previous projects
        if (typeof clearCameraCardNotes === 'function') {
            clearCameraCardNotes(projectName);
        }
        
        // Auto-select the production title for easy editing
        selectProductionTitle();
    }, 100);
}

function clearAllProductionData() {
    // Clear the script table
    const eventTable = document.getElementById('event-table');
    if (eventTable && eventTable.querySelector('tbody')) {
        eventTable.querySelector('tbody').innerHTML = '';
    }
    
    // Clear any running order data
    const runningOrderTable = document.getElementById('runningOrder-table');
    if (runningOrderTable && runningOrderTable.querySelector('tbody')) {
        runningOrderTable.querySelector('tbody').innerHTML = '';
    }
    
    // Clear any view mode content
    const viewContent = document.getElementById('view-content');
    if (viewContent) {
        viewContent.innerHTML = '';
    }
    
    // Clear any camera cards content
    const cameraCardsContent = document.getElementById('camera-cards-content');
    if (cameraCardsContent) {
        cameraCardsContent.innerHTML = '';
    }
    
    // Clear any floor plan content
    const floorPlanContent = document.getElementById('floor-plan-content');
    if (floorPlanContent) {
        floorPlanContent.innerHTML = '';
    }
    
    // Clear any form inputs in the main content area
    const inputs = document.querySelectorAll('.main-content input, .main-content textarea, .main-content select');
    inputs.forEach(input => {
        if (input.type === 'text' || input.type === 'textarea' || input.type === 'select-one') {
            input.value = '';
        } else if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        }
    });
    
    // Clear any contenteditable elements
    const contentEditableElements = document.querySelectorAll('[contenteditable="true"]');
    contentEditableElements.forEach(element => {
        if (element.classList.contains('production-title')) {
            // Don't clear the production title as it's set to "New Production"
            return;
        }
        element.textContent = '';
    });
    
    // Clear any dropdowns or modals that might be open
    $('.dropdown .options').removeClass('active');
    $('.modal').modal('hide');
    
    // Reset any global state variables if they exist
    if (typeof window.undoRedoManager !== 'undefined' && window.undoRedoManager.clearHistory) {
        window.undoRedoManager.clearHistory();
    }
    
    // Clear any localStorage or sessionStorage data related to the previous project
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('production') || key.includes('script') || key.includes('camera') || key.includes('floorPlan'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => {
        if (key !== 'projectName' && key !== 'isKindeLoggedIn') {
            sessionStorage.removeItem(key);
        }
    });
    
    // Production data cleared
}

function loadExistingProduction() {
    document.getElementById('file-loader').click();
}

// Function to automatically select the production title text for easy editing
function selectProductionTitle() {
    const productionTitleElement = document.querySelector('.production-title');
    if (productionTitleElement) {
        // Focus on the element first
        productionTitleElement.focus();
        
        // Select all the text inside the element
        const range = document.createRange();
        range.selectNodeContents(productionTitleElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Make functions globally available
window.resetToScriptView = function() {
    // Check if we're currently in Running Order view
    const isRunningOrderView = $('#runningOrder-table').length > 0;
    
    if (isRunningOrderView) {
        // Restore the main script table structure
        $('.container').html(`
            <table style="margin-top:100px;" id="event-table" class="draggable-table">
                <thead>
                    <tr>
                        <th scope="col" style="border: 1px solid black; width:100px; text-align: center;">Event number</th>
                        <th scope="col" style="border: 1px solid black; width:350px; text-align: center;">Shot</th>
                        <th scope="col" style="border: 1px solid black; width:450px; text-align: center;">Script</th>
                        <th scope="col" style="border: 1px solid black; width:150px; text-align: center;">Details</th>
                        <th scope="col" style="border: none; width:90px; text-align: center;"></th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        `);
        
        // Remove any Show Script button if it exists
        $('.showScript-button').remove();
        
        // Restore the Running Order button if it doesn't exist
        if ($('.runningOrder-button').length === 0) {
            const runningOrderButton = $('<button class="btn button2 runningOrder-button" title="Running Order">Running Order</button>');
            $('.toolbar-group.dynamic-buttons').append(runningOrderButton);
        }
    }
};

window.createNewProduction = createNewProduction;
window.loadExistingProduction = loadExistingProduction;
window.selectProductionTitle = selectProductionTitle; 