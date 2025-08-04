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
    
    // Hide project login and show main content
    $('#project-login').hide();
    $('.main-content').show();
    $('.production-title').text(projectName);
    document.title = projectName + ' - Studio Script Writer';
    
    // Ensure we start in Script view, not Running Order view
    resetToScriptView();
    
    // Initialize the production state for this new project
    setTimeout(() => {
        initializeProductionState(projectName);
        
        // Auto-select the production title for easy editing
        selectProductionTitle();
    }, 100);
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