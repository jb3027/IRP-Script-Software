// Main Application Initialization
// This file contains the main application setup and initialization logic

// Global variables
let role;
let highlight = true;
let cutLine = true;

// Floor plan state synchronization variables
let floorPlanSyncInterval = null;
let lastFloorPlanStateHash = null;

// Global reference to floor plan window
let floorPlanWindow = null;

// Main application initialization
$(document).ready(function() {
    
    // Initialize sidebar navigation if it exists
    if (typeof sidebarNav !== 'undefined') {
        // Handle URL hash navigation
        if (window.location.hash) {
            const page = window.location.hash.substring(1);
            sidebarNav.navigateToPage(page);
        }
        
        // Initialize the first rows on the script page
        if (typeof sidebarNav !== 'undefined') {
            // Wait for the script page to be loaded, then initialize rows
            setTimeout(() => {
                if (sidebarNav.getCurrentPage() === 'script') {
                    // Removed automatic row creation - let users add rows manually
                }
            }, 100);
        }
    }
    
    // Set up storage event listeners
    window.addEventListener('storage', function(e) {
        if (e.key === 'projectName' || e.key === 'isKindeLoggedIn') {
            location.reload();
        }
    });
    
    // Set up file loader event listener
    $('#file-loader').on('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            if (typeof loadProductionFromFile === 'function') {
                const success = loadProductionFromFile(fileContent);
                if (success) {
                    $('#project-login').hide();
                    $('.main-content').show();
                }
            } else {
                alert('Error: state management script not loaded correctly.');
            }
            // Reset the input
            event.target.value = '';
        };
        reader.readAsText(file);
    });
    
    // Set up production title change listeners
    $(document).on('input blur', '.production-title', function() {
        const newTitle = $(this).text().trim();
        
        // Only update if the title has actually changed and is not empty
        if (newTitle && newTitle !== sessionStorage.getItem('projectName')) {
            
            // Get the old project name before updating
            const oldProjectName = sessionStorage.getItem('projectName');
            
            // Update session storage
            sessionStorage.setItem('projectName', newTitle);
            
            // Update the page title
            document.title = newTitle + ' - Studio Script Writer';
            
            // Clear camera card notes from the old project if it exists
            if (oldProjectName && typeof clearCameraCardNotes === 'function') {
                clearCameraCardNotes(oldProjectName);
            }
            
            // Update the production state if the function exists
            if (typeof updateProductionTitle === 'function') {
                updateProductionTitle(newTitle);
            }
        }
    });
    
    // Set up dropdown close functionality
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown').length) {
            $('.dropdown').removeClass('active');
        }
    });
    
    // Set up row action event listeners
    $(document).on('click', '.row-button.remove', function() {
        
        $(this).closest('tr').remove();
        updateEventNumbers(); // Reorder event numbers
        updateItemNumbers(); // Reorder item numbers for the running order
        initDraggable(); // Reinitialize draggable after removing a row
        
        // Sync state after removing row
        setTimeout(function() {
            if (typeof syncStateFromTable === 'function') {
                syncStateFromTable();
            }
        }, 150);
    
    });
    
    // Set up draggable reinitialization
    $(document).on('click', '.row-button.drag, .addEvent-button, .addInsert-button, .addItem-button', function() {
        setTimeout(initDraggable, 0);
    });
    
});

// Page load handler for authentication and project state
window.onload = function() {
    // Show the loader and hide other views
    $('#loader').show();
    $('#logged_out_view').hide();
    $('#project-login').hide();
    $('.main-content').hide();

    // Use setTimeout to ensure Kinde auth script has finished initializing
    setTimeout(() => {
        const isKindeLoggedIn = sessionStorage.getItem('isKindeLoggedIn');
        const projectName = sessionStorage.getItem('projectName');
        
        // If user is authenticated with Kinde and has selected a project
        if (isKindeLoggedIn === 'true' && projectName) {
            $('#logged_out_view').hide();
            $('#project-login').hide();
            $('.main-content').show();
            $('.production-title').text(projectName);
            document.title = projectName + ' - Studio Script Writer';
            
            // Ensure we start in Script view, not Running Order view
            resetToScriptView();
            
            // Initialize the production state for this project on page load
            setTimeout(() => {
                initializeProductionState(projectName);
            }, 200); // Additional delay to ensure DOM is fully ready
            
            // Show logout button if not already visible
            const logoutContainer = document.getElementById('logout-container');
            if (logoutContainer && window.kindeAuth) {
                logoutContainer.style.display = 'flex';
            }
        } else if (isKindeinLoggedIn === 'true') {
            // Authenticated but no project selected - only show project-login if no project is being created
            if (!sessionStorage.getItem('projectName')) {
                $('#logged_out_view').hide();
                $('#project-login').show();
            } else {
                // If there's a project name, go straight to main content
                $('#logged_out_view').hide();
                $('#project-login').hide();
                $('.main-content').show();
            }
        } else {
            // Not authenticated
            $('#logged_out_view').show();
        }
        
        // Hide the loader
        $('#loader').hide();
    }, 100); // Small delay to ensure Kinde script has finished
};

// Make functions globally available
window.role = role;
window.highlight = highlight;
window.cutLine = cutLine;
window.floorPlanSyncInterval = floorPlanSyncInterval;
window.lastFloorPlanStateHash = lastFloorPlanStateHash;
window.floorPlanWindow = floorPlanWindow; 

// Disable right click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
//Disable key combinations that allow a user to open developer tools
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'u' || e.ctrlKey && e.key === 'u' || e.ctrlKey && e.key === 'u') {
        e.preventDefault();
    }
});