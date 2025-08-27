/**
 * Sidebar Navigation System
 * Handles sidebar functionality, page switching, and content management
 */

class SidebarNavigation {
    constructor() {
        this.currentPage = 'home';
        this.sidebar = null;
        this.sidebarToggle = null;
        this.contentWrapper = null;
        this.pageContainer = null;
        this.navLinks = null;
        
        this.init();
    }

    init() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.contentWrapper = document.getElementById('content-wrapper');
        this.pageContainer = document.getElementById('page-container');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.setupEventListeners();
        // Start on the script page since script navigation is now handled by the mode nav bar
        this.navigateToPage('script');
    }

    setupEventListeners() {
        // Sidebar toggle
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Mobile navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                this.toggleMobileNav();
            });
        }

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToPage('script');
                        break;
                }
            }
        });

        // Click outside dropdown to close it
        document.addEventListener('click', (e) => {
            // This section is no longer needed since camera cards dropdown was removed from sidebar
        });

        // Click outside mode navigation dropdowns to close them
        document.addEventListener('click', (e) => {
            if (!$(e.target).closest('.mode-nav-toolbar .dropdown').length) {
                $('.mode-nav-toolbar .dropdown .options').removeClass('active');
            }
        });

        // Mode navigation buttons
        this.setupModeNavigation();
        
        // Add camera cards dropdown functionality to mode navigation button
        this.setupCameraCardsDropdown();
    }

    setupCameraCardsDropdown() {
        // Handle camera cards mode button clicks
        $(document).on('click', '#camera-cards-mode-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle dropdown visibility
            const dropdownContainer = $(this).closest('.dropdown');
            const dropdownOptions = dropdownContainer.find('.options');
            const isVisible = dropdownOptions.hasClass('active');
            
            if (isVisible) {
                dropdownOptions.removeClass('active');
                return;
            }
            
            let camList = []; // stores list of unique cameras
            
            // Method 1: Look for camera number inputs specifically
            const allInputs = $('#event-table input');
            allInputs.each(function(index) {
                const input = $(this);
                const inputClass = input.attr('class') || '';
                const inputName = input.attr('name') || '';
                const inputValue = input.val() || '';
                
                // Only look for camera number inputs - be very specific
                // Must contain 'camera' AND a number, but NOT 'position'
                if ((inputClass.includes('camera') || inputName.includes('camera') || 
                     inputClass.includes('Camera') || inputName.includes('Camera')) &&
                    !inputClass.includes('position') && !inputName.includes('position') &&
                    !inputClass.includes('Position') && !inputName.includes('Position') &&
                    !inputClass.includes('pos') && !inputName.includes('pos') &&
                    !inputClass.includes('Pos') && !inputName.includes('Pos') &&
                    !inputClass.includes('location') && !inputName.includes('location') &&
                    !inputClass.includes('Location') && !inputName.includes('Location') &&
                    !inputClass.includes('place') && !inputName.includes('place') &&
                    !inputClass.includes('Place') && !inputName.includes('Place')) {
                    
                    // Only add if the value contains a number (actual camera number)
                    // and looks like a camera number (not a position description)
                    if (inputValue && inputValue.trim() !== '' && 
                        inputValue.trim() !== 'Camera Number' && 
                        /\d/.test(inputValue.trim()) &&
                        !inputValue.toLowerCase().includes('position') &&
                        !inputValue.toLowerCase().includes('pos') &&
                        !inputValue.toLowerCase().includes('location') &&
                        !inputValue.toLowerCase().includes('place')) {
                        
                        console.log(`Found camera input: ${inputValue} (class: ${inputClass}, name: ${inputName})`);
                        camList.push(inputValue.trim());
                    }
                }
            });
            
            // Method 2: Look for camera number text specifically (not positions)
            const allCells = $('#event-table td');
            allCells.each(function(index) {
                const cell = $(this);
                const cellText = cell.text().trim();
                
                // Look for patterns like "Camera 1", "CAM 2" but exclude "Camera Position"
                // Must contain camera + number, but NOT position-related text
                if ((cellText.match(/camera\s*\d+/i) || cellText.match(/cam\s*\d+/i)) &&
                    !cellText.toLowerCase().includes('position') &&
                    !cellText.toLowerCase().includes('pos') &&
                    !cellText.toLowerCase().includes('location') &&
                    !cellText.toLowerCase().includes('place')) {
                    const match = cellText.match(/\d+/);
                    if (match) {
                        camList.push(match[0]);
                    }
                }
            });
            
            // Remove duplicates
            camList = [...new Set(camList)];
            
            // Clear existing options
            dropdownOptions.empty();
            
            if (camList.length === 0) {
                dropdownOptions.append('<div style="padding: 10px; color: #666; text-align: center;">No cameras found</div>');
                return;
            } else {
                camList.forEach((camera) => {
                    const cameraOption = $(`<div style="margin: 5px 0;"><button class="btn button3 createCamCard-button" id="${camera}" title="Create camera card for Camera ${camera}"> CAMERA ${camera}</button></div>`);
                    dropdownOptions.append(cameraOption);
                });
            }
            
            // Show the dropdown
            dropdownOptions.addClass('active');
            
            // Force the exact width using JavaScript to make dropdown narrower on right side
            const buttonWidth = $(this).outerWidth();
            const dropdownWidth = buttonWidth - 20; // Make dropdown 20px narrower on right side
            dropdownOptions.css({
                'width': dropdownWidth + 'px',
                'max-width': dropdownWidth + 'px',
                'min-width': dropdownWidth + 'px'
            });
        });
    }

    toggleSidebar() {
        console.log('Toggle sidebar clicked');
        this.sidebar.classList.toggle('collapsed');
        console.log('Sidebar collapsed:', this.sidebar.classList.contains('collapsed'));
        
        // Update toggle button icon
        const icon = this.sidebarToggle.querySelector('i');
        if (this.sidebar.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-right';
        } else {
            icon.className = 'fas fa-chevron-left';
        }
        console.log('Icon updated to:', icon.className);
        
        // Handle text animation timing
        if (!this.sidebar.classList.contains('collapsed')) {
            // Sidebar is opening - wait for animation to complete then fade in text
            console.log('Sidebar opening - setting timeout for text animation');
            setTimeout(() => {
                const comingSoonNotice = document.querySelector('.coming-soon-notice');
                console.log('Found coming soon notice:', comingSoonNotice);
                if (comingSoonNotice) {
                    console.log('Setting opacity to 1 and transform to translateY(0)');
                    comingSoonNotice.style.opacity = '1';
                    comingSoonNotice.style.transform = 'translateY(0)';
                }
            }, 300); // Wait 300ms for sidebar to finish opening
        } else {
            // Sidebar is closing - immediately hide text
            console.log('Sidebar closing - hiding text immediately');
            const comingSoonNotice = document.querySelector('.coming-soon-notice');
            if (comingSoonNotice) {
                console.log('Setting opacity to 0 and transform to translateY(20px)');
                comingSoonNotice.style.opacity = '0';
                comingSoonNotice.style.transform = 'translateY(20px)';
            }
        }
    }

    setupModeNavigation() {
        // Mode navigation button event listeners
        const modeButtons = document.querySelectorAll('.mode-nav-btn');
        console.log('Found mode buttons:', modeButtons.length);
        
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = button.getAttribute('data-mode');
                console.log('Mode button clicked:', mode);
                
                // Remove active class from all buttons
                modeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Handle mode switching based on existing functionality
                switch (mode) {
                    case 'script':
                        console.log('Switching to script mode');
                        // Show script page and ensure script table is visible
                        this.navigateToPage('script');
                        // Make sure the script table is visible
                        $('.container').show();
                        // Hide any running order container
                        $('.running-order-container').hide();
                        break;
                    case 'running-order':
                        console.log('Switching to running order mode');
                        // Trigger the actual running order functionality
                        this.triggerRunningOrder();
                        break;
                    case 'view':
                        console.log('Switching to view mode');
                        // Trigger the actual view mode functionality
                        this.triggerViewMode();
                        break;
                    case 'camera-cards':
                        console.log('Switching to camera cards mode');
                        // Show camera cards page and ensure proper visibility
                        this.navigateToPage('camera-cards');
                        // Hide script table and running order
                        $('.container').hide();
                        $('.running-order-container').hide();
                        break;
                    case 'floor-plan':
                        console.log('Switching to floor plan mode');
                        // Show floor plan page
                        this.navigateToPage('floor-plan');
                        break;
                    default:
                        console.warn('Unknown mode:', mode);
                        break;
                }
            });
        });

        // Set script mode as active by default
        const scriptModeBtn = document.getElementById('script-mode-btn');
        if (scriptModeBtn) {
            scriptModeBtn.classList.add('active');
        }
    }

    

    toggleMobileNav() {
        // Toggle mobile navigation visibility
        const centerGroup = document.querySelector('.toolbar-group.center');
        const formattingGroup = document.querySelector('.toolbar-group.formatting');
        
        if (centerGroup && formattingGroup) {
            const isVisible = centerGroup.style.display !== 'none';
            
            if (isVisible) {
                centerGroup.style.display = 'none';
                formattingGroup.style.display = 'none';
            } else {
                centerGroup.style.display = 'flex';
                formattingGroup.style.display = 'flex';
            }
        }
    }

    navigateToPage(page) {
        console.log('Navigating to page:', page);
        
        // Update active navigation link
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });

        // Hide all page content
        const pageContents = document.querySelectorAll('.page-content');
        pageContents.forEach(content => {
            content.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            console.log('Found target page:', targetPage.id);
            targetPage.classList.add('active');
        } else {
            console.warn('Target page not found:', `${page}-page`);
        }

        // Clear sidebar content when navigating to a new page
        const sidebarContent = document.getElementById('sidebar-content');
        if (sidebarContent) {
            sidebarContent.innerHTML = '';
        }

        // Load page-specific content
        this.loadPageContent(page);
        
        // Update current page
        this.currentPage = page;
        
        // Update URL hash
        window.location.hash = page;
    }

    loadPageContent(page) {
        switch (page) {
            case 'home':
                this.loadHomePage();
                break;
            case 'script':
                this.loadScriptPage();
                break;
            case 'camera-cards':
                this.loadCameraCardsPage();
                break;
            case 'floor-plan':
                this.loadFloorPlanPage();
                break;
            case 'running-order':
                this.loadRunningOrderPage();
                break;
            case 'view':
                this.loadViewPage();
                break;


        }
    }

    loadHomePage() {
        // Check if running order is currently displayed and restore script table
        if ($('.running-order-container').length > 0) {
            // Save running order data before removing it
            if (typeof saveAllRunningOrderData === 'function') {
                saveAllRunningOrderData();
            }
            
            // Running order is displayed, remove it and show script table
            $('.running-order-container').remove();
            $('.container').show();
            // Restore the running order button
            if ($('.runningOrder-button').length === 0) {
                const runningOrderButton = $('<button class="btn button2 runningOrder-button" title="Running Order"><i class="fas fa-list-ol"></i> Running Order</button>');
                $('.toolbar-group.center').append(runningOrderButton);
            }
        }
        
        // Go directly to script page instead of home
        this.navigateToPage('script');
    }

    hasUnsavedChanges() {
        // Check if there are any changes that need saving
        // This is a simple check - you might want to enhance this
        const table = document.querySelector('#event-table tbody');
        return table && table.querySelector('tr') && table.querySelectorAll('tr').length > 0;
    }

    showHomeWarning() {
        // Show confirmation dialog before proceeding to home
        if (typeof showQuestionModal === 'function') {
            showQuestionModal(
                "Are you sure you want to close this project? Any unsaved changes will be lost.",
                "Cancel",
                "Close Project",
                // Cancel callback - do nothing, stay on current page
                () => {},
                // Close Project callback - proceed to home
                () => {
                    this.goToHome();
                }
            );
        } else {
            // Fallback if showQuestionModal is not available
            if (confirm("Are you sure you want to close this project? Any unsaved changes will be lost.")) {
                this.goToHome();
            }
        }
    }

    goToHome() {
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

    loadScriptPage() {
        // Always ensure the script table container is visible
        $('.container').show();
        
        // Check if running order is currently displayed and restore script table
        if ($('.running-order-container').length > 0) {
            // Save running order data before removing it
            if (typeof saveAllRunningOrderData === 'function') {
                saveAllRunningOrderData();
            }
            
            // Running order is displayed, remove it and show script table
            $('.running-order-container').remove();
            // Restore the running order button
            if ($('.runningOrder-button').length === 0) {
                const runningOrderButton = $('<button class="btn button2 runningOrder-button" title="Running Order"><i class="fas fa-list-ol"></i> Running Order</button>');
                $('.toolbar-group.center').append(runningOrderButton);
            }
        }
        
        // Hide any other mode pages that might be visible
        $('.page-content').removeClass('active');
        const scriptPage = document.getElementById('script-page');
        if (scriptPage) {
            scriptPage.classList.add('active');
        }
        
        // Script page contains the main script editor
        // Initialize the table and draggable functionality AFTER ensuring table exists
        if (typeof initDraggable === 'function') {
            // Use a more robust approach to ensure table is ready
            const checkTableReady = () => {
                const tbody = document.querySelector('#event-table tbody');
                if (tbody && tbody.children.length > 0) {
                    // Table is ready, initialize draggable
                    initDraggable();
                } else {
                    // Table not ready yet, check again in a moment
                    setTimeout(checkTableReady, 100);
                }
            };
            checkTableReady();
        }
        
        console.log('Script page loaded, container should be visible');
    }

    loadCameraCardsPage() {
        console.log('Loading camera cards page, hiding script table');
        
        // Hide script table and show camera cards content
        $('.container').hide();
        $('.running-order-container').hide();
        
        // Hide any other mode pages
        $('.page-content').removeClass('active');
        
        // Show camera cards page content
        const cameraCardsPage = document.getElementById('camera-cards-page');
        if (cameraCardsPage) {
            cameraCardsPage.classList.add('active');
            console.log('Camera cards page activated');
        } else {
            console.warn('Camera cards page not found');
        }
        
        // Initialize camera cards functionality if available
        if (typeof initializeCameraCards === 'function') {
            initializeCameraCards();
        } else {
            console.log('initializeCameraCards function not found, camera cards should still work');
        }
    }

    loadFloorPlanPage() {
        // Floor plan should open in a new window, not show a page
        // Get production title and camera data from the script table
        const productionTitle = $('.production-title').text() || 'New Production';
        let camList = [];
        let eventInfo = [];

        // Collect camera numbers and shot subjects from the script table
        $('#event-table').find('tr.event_highlighted').each(function() {
            const row = $(this);
            const shotCell = row.find('td:nth-child(2)');
    
            const cameraNum = shotCell.find('.cameraNum').val() || '';
            const shotSubject = shotCell.find('.shotSubject').val() || '';
        
            // Adds events to the camera array as objects
            let event = {
                cameraNumber: cameraNum,
                shotSubject: shotSubject,
            };  
            eventInfo.push(event);
        });

        // Extract unique camera numbers
        for(let i = 0; i < eventInfo.length; i++) {
            let tempCamNum = eventInfo[i].cameraNumber;
            if(tempCamNum && !(camList.includes(tempCamNum))) {
                camList.push(tempCamNum);
            }
        }

        // Open floor plan in new window
        if (typeof openFloorPlan === 'function') {
            openFloorPlan(productionTitle, camList, []);
            // Start floor plan sync if available
            if (typeof startFloorPlanSync === 'function') {
                startFloorPlanSync();
            }
        } else {
            console.warn('openFloorPlan function not found');
            // Fallback: try to trigger the floor plan button
            if ($('.floorPlan-button').length > 0) {
                $('.floorPlan-button').click();
            }
        }
    }

    loadRunningOrderPage() {
        console.log('Loading running order page');
        
        // Hide script table and show running order content
        $('.container').hide();
        
        // Show running order page content
        const runningOrderPage = document.getElementById('running-order-page');
        if (runningOrderPage) {
            runningOrderPage.classList.add('active');
            console.log('Running order page activated');
        } else {
            console.warn('Running order page not found');
        }
        
        // Initialize running order functionality if available
        if (typeof initializeRunningOrder === 'function') {
            initializeRunningOrder();
        } else {
            console.log('initializeRunningOrder function not found, running order should still work');
        }
    }

    loadViewPage() {
        console.log('Loading view page');
        
        // Hide script table and show view content
        $('.container').hide();
        $('.running-order-container').hide();
        
        // Hide any other mode pages
        $('.page-content').removeClass('active');
        
        // Show view page content
        const viewPage = document.getElementById('view-page');
        if (viewPage) {
            viewPage.classList.add('active');
            console.log('View page activated');
        } else {
            console.warn('View page not found');
        }
        
        // Initialize view functionality if available
        if (typeof initializeViewMode === 'function') {
            initializeViewMode();
        } else {
            console.log('initializeViewMode function not found, view mode should still work');
        }
    }

    // Trigger the actual running order functionality
    triggerRunningOrder() {
        console.log('Triggering running order functionality');
        
        // Hide script table
        $('.container').hide();
        
        // Remove any existing running order container
        $('.running-order-container').remove();
        
        // Trigger the running order button click event to create the table
        // This will use the existing functionality from runningOrder.js
        $('.runningOrder-button').click();
        
        // If no running order button exists, create one temporarily and click it
        if ($('.runningOrder-button').length === 0) {
            const tempButton = $('<button class="runningOrder-button" style="display:none;"></button>');
            $('body').append(tempButton);
            tempButton.click();
            tempButton.remove();
        }
    }

    // Trigger the actual view mode functionality
    triggerViewMode() {
        console.log('Triggering view mode functionality');
        
        // Hide script table
        $('.container').hide();
        
        // Remove any existing running order container
        $('.running-order-container').remove();
        
        // Trigger the view button click event to open the new window
        // This will use the existing functionality from uiEventHandlers.js
        $('.view-button').click();
        
        // If no view button exists, create one temporarily and click it
        if ($('.view-button').length === 0) {
            const tempButton = $('<button class="view-button" style="display:none;"></button>');
            $('body').append(tempButton);
            tempButton.click();
            tempButton.remove();
        }
    }

    // Public method to get current page
    getCurrentPage() {
        return this.currentPage;
    }

    // Public method to refresh current page
    refreshCurrentPage() {
        this.loadPageContent(this.currentPage);
    }


}

// Initialize sidebar navigation when DOM is ready
let sidebarNav;
document.addEventListener('DOMContentLoaded', () => {
    sidebarNav = new SidebarNavigation();
});

// Make it globally accessible
window.sidebarNav = sidebarNav;
