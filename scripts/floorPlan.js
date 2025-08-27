// Floor Plan Functionality
// This file handles floor plan window creation and synchronization

// Function to start monitoring floor plan state changes
function startFloorPlanSync() {
    if (floorPlanSyncInterval) {
        clearInterval(floorPlanSyncInterval);
    }
    
    // Test localStorage access immediately
    const testState = localStorage.getItem('currentFloorPlanState');
    
    floorPlanSyncInterval = setInterval(function() {
        const currentFloorPlanState = localStorage.getItem('currentFloorPlanState');
        
        if (currentFloorPlanState) {
            // Create a proper hash to detect changes - use the entire string length and a checksum
            const currentHash = currentFloorPlanState.length + '_' + btoa(currentFloorPlanState).slice(-10);
            
            if (currentHash !== lastFloorPlanStateHash) {
                lastFloorPlanStateHash = currentHash;
                
                // Parse the floor plan state to get the complete object
                try {
                    const floorPlanData = JSON.parse(currentFloorPlanState);
                    
                    // Ensure productionState exists
                    if (!productionState) {
                        console.error('Production state is undefined or null');
                        return;
                    }
                    
                    let syncSuccessful = false;
                    
                    // Try to sync with production state using the proper function
                    if (typeof saveFloorPlanState === 'function') {
                        try {
                            saveFloorPlanState(floorPlanData);
                            syncSuccessful = true;
                        } catch (error) {
                            console.error('Error calling saveFloorPlanState:', error);
                        }
                    } else if (typeof window.saveFloorPlanState === 'function') {
                        try {
                            window.saveFloorPlanState(floorPlanData);
                            syncSuccessful = true;
                        } catch (error) {
                            console.error('Error calling window.saveFloorPlanState:', error);
                        }
                    }

                    // Fallback: Direct update to productionState if saveFloorPlanState function isn't available
                    if (!syncSuccessful && typeof productionState !== 'undefined' && productionState && productionState.name) {
                        try {
                            // Store the complete floor plan data under the floorPlan key as expected by stateManagement.js
                            productionState.floorPlan = JSON.stringify(floorPlanData);
                            sessionStorage.setItem('productionState', JSON.stringify(productionState));
                            syncSuccessful = true;
                        } catch (error) {
                            console.error('Error updating productionState.floorPlan directly:', error);
                        }
                    }
                    
                    if (!syncSuccessful) {
                        console.error('CRITICAL: Floor plan sync completely failed - no method worked');
                    }
                    
                } catch (error) {
                    console.error('Failed to parse or sync floor plan state:', error);
                }
            }
        }
    }, 1000); // Check every second
}

// Function to stop monitoring floor plan state changes
function stopFloorPlanSync() {
    if (floorPlanSyncInterval) {
        clearInterval(floorPlanSyncInterval);
        floorPlanSyncInterval = null;
    }
}

$(document).ready(function() {
    // FLOORPLAN
    $('.floorPlan-button').on('click', function () {
        const productionTitle = $('.production-title').text();
        let cameraNumber = (this.id);
        let eventInfo = [];
        let camList = [];
        let subjectList = [];
        let subjectInitials = [];

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

        for(let i = 0; i < eventInfo.length; i++) {
            let alreadyAdded = false;
            let tempCamNum = eventInfo[i].cameraNumber; // Store current cam number
            let tempSubject = eventInfo[i].shotSubject;

            if(tempCamNum && !(camList.includes(tempCamNum))) {
                camList.push(tempCamNum);
            }
            if(tempSubject && !(subjectList.includes(tempSubject))) {
                subjectList.push(tempSubject);
            }
        }

        // If no subjects found, open floor plan directly
        if (subjectList.length === 0) {
            openFloorPlan(productionTitle, camList, []);
            
            startFloorPlanSync();
            return;
        }

        // Populate the modal with checkboxes
        const subjectCheckboxes = document.getElementById('subjectCheckboxes');
        const checkboxHTML = subjectList.map(subject => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="subject_${subject}" value="${subject}" checked>
                <label class="form-check-label" for="subject_${subject}">
                    ${subject}
                </label>
            </div>
        `).join('');
        subjectCheckboxes.innerHTML = checkboxHTML;

        // Show the modal
        const subjectModal = new bootstrap.Modal(document.getElementById('subjectModal'));
        subjectModal.show();
    });

    // Handle submit button click with event delegation (outside the floor plan button click handler)
    $(document).on('click', '#submitSubjects', function() {
        
        // Get all subjects from the checkboxes in the modal
        const selectedSubjects = [];
        $('#subjectCheckboxes .form-check-input:checked').each(function() {
            selectedSubjects.push($(this).val());
        });
        
        
        // Get the current modal instance and hide it
        const subjectModal = bootstrap.Modal.getInstance(document.getElementById('subjectModal'));
        if (subjectModal) {
            subjectModal.hide();
        }
        
        // Get the production title and data needed for floor plan
        const productionTitle = $('.production-title').text();
        let camList = [];
        let eventInfo = [];

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

        for(let i = 0; i < eventInfo.length; i++) {
            let tempCamNum = eventInfo[i].cameraNumber;
            if(tempCamNum && !(camList.includes(tempCamNum))) {
                camList.push(tempCamNum);
            }
        }
        
        
        // Open floor plan with selected subjects
        openFloorPlan(productionTitle, camList, selectedSubjects, []);
        
        
        // Start monitoring floor plan state changes
        startFloorPlanSync();
        
    });
});

// Function to open the floor plan window
function openFloorPlan(productionTitle, camList, selectedSubjects, subjectInitials) {
    // Stop any existing sync before opening new floor plan
    stopFloorPlanSync();
    
    const floorPlanWindow = window.open('', '_blank');
    
    // Store reference to floor plan window globally
    window.floorPlanWindow = floorPlanWindow;
    
    // Write the floor plan HTML content
    floorPlanWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>  
            <title>${productionTitle} Floor Plan</title>
            
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
                integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
                crossorigin="anonymous" referrerpolicy="no-referrer"/>

            <style>
                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background-color: #e3dede;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: Arial;
                }

                .container {
                    display: flex;
                    gap: 10px;
                    height: 540px;
                    max-width: 1050px;
                    width: 100%;
                    border-radius: 20px;
                }

                .tools-board {
                    width: 210px;
                    height: 590px;
                    border-radius: 20px;
                    background-color: #f8f7f6;
                    padding: 15px 22px 0;
                }

                .tools-board .row {
                    margin-bottom: 20px;
                }

                .row .options {
                    list-style: none;
                    margin: 10px 0 0 5px;
                }

                .row .options .option {
                    display: flex;
                    cursor: pointer;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .option:is(:hover, .active) img {
                    filter: grayscale(20%);
                }

                .option :where(span, label) {
                    color: black;
                    cursor: pointer;
                    padding-left: 10px;
                }

                .option:is(:hover, .active) :where(span, label) {
                    color: #f4130b;
                }

                .option.active {
                    background-color: #e0e0e0;
                    border-radius: 5px;
                }

                .option #fill-color {
                    height: 14px;
                    cursor: pointer;
                    width: 14px;
                }

                #fill-color:checked~label {
                    color: #e93e2b;
                }

                .option #size-slider {
                    width: 100%;
                    height: 5px;
                    margin-top: 10px;
                }

                .colors .options {
                    display: flex;
                    justify-content: space-between;
                }

                .colors .option {
                    height: 20px;
                    width: 20px;
                    margin-top: 3px;
                    position: relative;
                }

                .option #color-picker {
                    opacity: 1;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    border: none !important;
                    outline: none !important;
                    padding: 0;
                    margin: 0;
                    overflow: hidden;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }

                .buttons button {
                    width: 80%;
                    color: #fff;
                    border: none;
                    outline: none;
                    font-size: 0.9rem;
                    padding: 3px 0;
                    margin-bottom: 13px;
                    background: none;
                    border-radius: 5px;
                    cursor: pointer;
                }

                .buttons .clear-canvas {
                    color: black;
                    border: 1px solid #9fc39f;
                    transition: all 0.2s ease;
                    border: 2px solid black;
                    font-size: 13px;
                }

                .clear-canvas:hover {
                    color: #fff;
                    background: #6c757d;
                }

                .buttons .save-img,
                .addSub {
                    background: white;
                    color: black;
                    border: 1px solid #6c757d;
                }

                .mode-buttons {
                    margin-top: 10px;
                }

                .mode-btn {
                    width: 80%;
                    color: #fff;
                    border: none;
                    outline: none;
                    font-size: 0.9rem;
                    padding: 8px 0;
                    margin-bottom: 8px;
                    background: #6c757d;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .mode-btn.active {
                    background: #28a745;
                    color: white;
                }

                .mode-btn:hover {
                    opacity: 0.8;
                }

                .drawing-board {
                    flex: 1;
                }

                .drawing-board canvas {
                    width: 100%;
                    height: 590px;
                    border-radius: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <section class="tool-board">
                    <div class="row">
                        <div class="col-md-6">
                            <label class="title"><strong>Tools</strong></label>
                            <ul class="options">
                                <li class="option tool" id="pencil">
                                    <i class="fas fa-pencil" id="icon"></i>
                                    <span>Pencil</span>
                                </li>
                                <li class="option tool" id="eraser">
                                    <i class="fas fa-eraser" id="icon"></i>
                                    <span>Eraser</span>
                                </li>
                                <li class="option tool" id="text">
                                    <i class="fas fa-font" id="icon"></i>
                                    <span>Text</span>
                                </li>
                                <li class="option">
                                    <input type="range" id="size-slider" min="1" max="30" value="5">
                                </li>
                            </ul>
                        </div>
                        <div class="row colours">
                            <label for="" class="title">Colours</label>
                            <ul class="options">
                                <li class="option">
                                    <input type="color" value="#000000" name="" id="color-picker" style="background-color: #000000; border: none;">
                                </li>
                            </ul>
                        </div>

                        <div class="row">
                            <label for="" class="title"><strong>Shapes</strong></label>
                            <ul class="options">
                                <li class="option tool" id="rectangle">
                                    <i class="fa-solid fa-dice-one"></i>
                                    <span>Rectangle</span>
                                </li>
                                <li class="option tool" id="circle">
                                    <i class="fa-solid fa-circle"></i>
                                    <span>Circle</span>
                                </li>
                                <li class="option tool" id="triangle">
                                    <i class="fa-solid fa-mountain"></i>
                                    <span>Triangle</span>
                                </li>
                                <li class="option tool" id="line">
                                    <i class="fa-solid fa-grip-lines"></i>
                                    <span>Line</span>
                                </li>
                                <li class="option tool" id="arrow">
                                    <i class="fa-solid fa-arrow-up"></i>
                                    <span>Arrow</span>
                                </li>
                                <li class="option tool" id="square">
                                    <i class="far fa-square"></i>
                                    <span>Square</span>
                                </li>
                                <li class="option tool" id="hexagon">
                                    <i class="fa-solid fa-cube"></i>
                                    <span>Hexagon</span>
                                </li>
                                <li class="option tool" id="pentagon">
                                    <i class="fa-solid fa-dice-d6"></i>
                                    <span>Pentagon</span>
                                </li>
                                <li class="option">
                                    <input type="checkbox" id="fill-color">
                                    <label for="fill-color">Fill Color</label>
                                </li>
                            </ul>
                        </div>
                        <div class="row buttons">
                            <button class="clear-canvas">Clear Canvas</button>
                            <button class="save-img">Save Image</button>
                        </div>
                        <div class="row mode-buttons">
                            <button class="mode-btn draw-mode active" id="draw-mode">Draw Mode</button>
                            <button class="mode-btn select-mode" id="select-mode">Select Mode</button>
                        </div>
                    </section>
                    <section class="drawing-board">
                        <canvas id="canvas" width="600" height="590" style="border:1px solid #000000;"></canvas>
                    </section>
                    <section class="tool-board">
                        <div class="row">
                            <label class="title"><strong>Script Items</strong></label>
                            <ul id="scriptItems"></ul>
                            <input type="text" id="newSub" name="newSubject" autocomplete="off" onfocus="this.value=''" placeholder="Enter new subject">
                            <button class="addSub">Add Subject</button>
                        </div>
                    </section>
            </div>
        </body>
        </html>
    `);
    
    floorPlanWindow.document.close();
    
    // Initialize the floor plan after document is ready
    if (floorPlanWindow.document.readyState === 'loading') {
        floorPlanWindow.document.addEventListener('DOMContentLoaded', function() {
            initializeFloorPlan(floorPlanWindow, selectedSubjects, camList);
        });
    } else {
        // Delay to ensure DOM is fully ready
        setTimeout(function() {
            initializeFloorPlan(floorPlanWindow, selectedSubjects, camList);
        }, 100);
    }
}

// Initialize floor plan function
function initializeFloorPlan(floorPlanWindow, selectedSubjects, camList) {
    // Load FontAwesome script
    const fontAwesomeScript = floorPlanWindow.document.createElement('script');
    fontAwesomeScript.src = 'https://kit.fontawesome.com/c353d71a36.js';
    fontAwesomeScript.crossOrigin = 'anonymous';
    floorPlanWindow.document.head.appendChild(fontAwesomeScript);
    
    // Load Fabric.js script
    const fabricScript = floorPlanWindow.document.createElement('script');
    fabricScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
    
    fabricScript.onload = function() {
        // Check if Fabric.js is available
        if (typeof floorPlanWindow.fabric === 'undefined') {
            console.error('Fabric.js not loaded properly');
            alert('Fabric.js failed to load. Please refresh the page.');
            return;
        }
        
        // Check if canvas element exists
        const canvasElement = floorPlanWindow.document.getElementById('canvas');
        if (!canvasElement) {
            console.error('Canvas element not found in DOM');
            alert('Canvas element not found. Please refresh the page.');
            return;
        }
        
        try {
            // Initialize Fabric.js canvas
            const canvas = new floorPlanWindow.fabric.Canvas('canvas', {
                backgroundColor: '#ffffff',
                width: 600,
                height: 590,
                isDrawingMode: false
            });
            
            // Store canvas reference
            floorPlanWindow.canvas = canvas;
            
            // Check for existing floor plan state and load it
            const savedFloorPlanState = localStorage.getItem('currentFloorPlanState');
            if (savedFloorPlanState) {
                try {
                    // Parse the complete floor plan state
                    const floorPlanData = JSON.parse(savedFloorPlanState);
                    
                    // Check if it's the new format with canvas and custom items
                    if (floorPlanData.canvasJSON && floorPlanData.customItems !== undefined) {
                        // New format: load canvas first, then restore custom items
                        if (floorPlanData.canvasJSON && floorPlanData.canvasJSON !== '{}') {
                            canvas.loadFromJSON(floorPlanData.canvasJSON, function() {
                                canvas.renderAll();
                            });
                        }
                        
                        // Restore custom script items after a short delay to ensure DOM is ready
                        setTimeout(() => {
                            restoreCustomScriptItems(floorPlanData.customItems);
                        }, 250);
                        
                    } else {
                        // Legacy format: just canvas JSON
                        canvas.loadFromJSON(savedFloorPlanState, function() {
                            canvas.renderAll();
                        });
                    }
                } catch (error) {
                    console.error('Failed to load floor plan state:', error);
                    // Try loading as legacy format
                    try {
                        canvas.loadFromJSON(savedFloorPlanState, function() {
                            canvas.renderAll();
                        });
                    } catch (legacyError) {
                        console.error('Failed to load floor plan state as legacy format:', legacyError);
                    }
                }
            }
            
            // Function to sync floor plan state with main window
            window.syncFloorPlanWithMainWindow = function() {
                if (canvas) {
                    const canvasJSON = JSON.stringify(canvas.toJSON());
                    
                    // Capture custom script items from the scriptItems list
                    const customItems = captureCustomScriptItems();
                    
                    // Create complete floor plan state object
                    const floorPlanState = {
                        canvasJSON: canvasJSON,
                        customItems: customItems
                    };
                    
                    const floorPlanStateJSON = JSON.stringify(floorPlanState);
                    
                    localStorage.setItem('currentFloorPlanState', floorPlanStateJSON);
                    localStorage.setItem('floorPlanStateChanged', Date.now().toString());
                    
                    // Call the global saveFloorPlanState function to sync with productionState
                    if (typeof window.opener !== 'undefined' && window.opener && typeof window.opener.saveFloorPlanState === 'function') {
                        window.opener.saveFloorPlanState(floorPlanState);
                    } else if (typeof parent !== 'undefined' && parent !== window && typeof parent.saveFloorPlanState === 'function') {
                        parent.saveFloorPlanState(floorPlanState);
                    } else {
                        // Trigger a custom storage event that the main window can listen for
                        if (typeof window.opener !== 'undefined' && window.opener) {
                            try {
                                window.opener.dispatchEvent(new StorageEvent('storage', {
                                    key: 'floorPlanStateChanged',
                                    newValue: Date.now().toString(),
                                    url: window.location.href
                                }));
                            } catch (e) {
                            }
                        }
                    }
                }
            };

            // Function to capture custom script items added by the user
            function captureCustomScriptItems() {
                const scriptItems = floorPlanWindow.document.getElementById('scriptItems');
                const customItems = [];
                
                if (scriptItems) {
                    // Find all li elements that are custom items
                    const listItems = scriptItems.querySelectorAll('li.option.tool');
                    
                    listItems.forEach((item, index) => {
                        const itemId = item.id;
                        const itemText = item.querySelector('span')?.textContent || itemId;
                        
                        // Include items that are:
                        // 1. Not camera items (don't start with 'camera-')
                        // 2. Not in the original selectedSubjects list
                        // This captures user-added custom subjects
                        if (itemId && !itemId.startsWith('camera-') && !selectedSubjects.includes(itemId)) {
                            customItems.push({
                                id: itemId,
                                text: itemText
                            });
                        }
                    });
                } else {
                    console.error('CUSTOM ITEMS CAPTURE: scriptItems element not found!');
                }
                
                return customItems;
            }
            
            // Function to restore custom script items from saved state
            function restoreCustomScriptItems(customItems) {
                if (!customItems || customItems.length === 0) {
                    return;
                }
                
                const scriptItems = floorPlanWindow.document.getElementById('scriptItems');
                if (!scriptItems) {
                    console.error('FLOOR PLAN: Script items container not found');
                    return;
                }
                
                // Add each custom item as a new list element
                customItems.forEach((item, index) => {
                    // Sanitize the ID to make it safe for HTML
                    const safeId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
                    
                    const customItemHTML = `<li class="option tool" id="${safeId}">
                        <i class="fa-solid fa-user"></i>
                        <span>${item.text}</span>
                    </li>`;
                    
                    // Check if item already exists to avoid duplicates
                    const existingItem = scriptItems.querySelector(`#${safeId}`);
                    if (!existingItem) {
                        scriptItems.insertAdjacentHTML('beforeend', customItemHTML);
                    }
                });
            }
            
            // Save floor plan state when canvas changes
            canvas.on('object:added', function(e) {
                syncFloorPlanWithMainWindow();
            });
            canvas.on('object:removed', function(e) {
                syncFloorPlanWithMainWindow();
            });
            canvas.on('object:modified', function(e) {
                syncFloorPlanWithMainWindow();
            });
            canvas.on('path:created', function(e) {
                syncFloorPlanWithMainWindow();
            });
            
            // Set up all event handlers and UI
            setupFloorPlanUI(canvas, floorPlanWindow, selectedSubjects, camList);
            
            // Configure canvas selection behavior - start in draw mode
            canvas.selection = false;
            canvas.forEachObject(function(obj) {
                obj.selectable = false;
            });
            
            // Disable canvas default behaviors for drawing
            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
            
        } catch (error) {
            console.error('Error initializing Fabric.js canvas:', error);
            alert('Error initializing canvas. Please refresh the page.');
            return;
        }
    };
    
    fabricScript.onerror = function() {
        console.error('Failed to load Fabric.js');
        alert('Fabric.js failed to load. Please refresh the page.');
    };
    
    floorPlanWindow.document.head.appendChild(fabricScript);
}

// Setup floor plan UI function
function setupFloorPlanUI(canvasInstance, floorPlanWindow, selectedSubjects, camList) {
    if (!canvasInstance) {
        console.error('Canvas is not available for UI setup');
        return;
    }
    
    const toolBtns = floorPlanWindow.document.querySelectorAll(".tool");
    const fillColor = floorPlanWindow.document.querySelector("#fill-color");
    const sizeSlider = floorPlanWindow.document.querySelector("#size-slider");
    const colorBtns = floorPlanWindow.document.querySelectorAll(".colors .option");
    const colorPicker = floorPlanWindow.document.querySelector("#color-picker");
    const clearCanvas = floorPlanWindow.document.querySelector(".clear-canvas");
    const saveImage = floorPlanWindow.document.querySelector(".save-img");
    const addSubject = floorPlanWindow.document.querySelector(".addSub");
    const scriptItems = floorPlanWindow.document.getElementById('scriptItems');
    const drawModeBtn = floorPlanWindow.document.querySelector("#draw-mode");
    const selectModeBtn = floorPlanWindow.document.querySelector("#select-mode");

    // Global variables
    let selectedTool = "pencil";
    let brushWidth = 5;
    let selectedColor = "#000";
    let isDrawing = false;
    let path = null;
    let lastPoint = null;
    let drawMode = true; // Start in draw mode
    let currentLine = null; // For interactive line/arrow drawing
    
    // Initialize free drawing brushes
    canvasInstance.freeDrawingBrush = new floorPlanWindow.fabric.PencilBrush(canvasInstance);
    canvasInstance.freeDrawingBrush.width = brushWidth;
    canvasInstance.freeDrawingBrush.color = selectedColor;
    
    // Set pencil as default active tool
    const defaultTool = floorPlanWindow.document.querySelector('#pencil');
    if (defaultTool) {
        defaultTool.classList.add('active');
        defaultTool.style.backgroundColor = '#e0e0e0';
    }
    
    // Setup initial free drawing
    setupFreeDrawing();

    // Populate script items
    if (camList && camList.length > 0) {
        const li = camList.map(cam => `<li class="option tool" id="camera-${cam}">
            <i class="fa-solid fa-camera"></i>
            <span>Camera ${cam}</span>
        </li>`).join('');
        scriptItems.innerHTML = li;
    } else {
        scriptItems.innerHTML = '';
    }

    //Add selected subjects to the script items
    if (selectedSubjects && selectedSubjects.length > 0) {
        const subjectLi = selectedSubjects.map(subject => `<li class="option tool" id="${subject}">
            <i class="fa-solid fa-user"></i>
            <span>${subject}</span>
        </li>`).join('');
        scriptItems.innerHTML += subjectLi;
    }

    // Handle free drawing tools (pencil and eraser)
    function setupFreeDrawing() {
        if (selectedTool === "pencil") {
            canvasInstance.isDrawingMode = true;
            canvasInstance.freeDrawingBrush = new floorPlanWindow.fabric.PencilBrush(canvasInstance);
            canvasInstance.freeDrawingBrush.width = brushWidth;
            canvasInstance.freeDrawingBrush.color = selectedColor;
        } else if (selectedTool === "eraser") {
            canvasInstance.isDrawingMode = true;
            canvasInstance.freeDrawingBrush = new floorPlanWindow.fabric.PencilBrush(canvasInstance);
            canvasInstance.freeDrawingBrush.width = brushWidth;
            canvasInstance.freeDrawingBrush.color = "#ffffff"; // White for eraser
        } else {
            canvasInstance.isDrawingMode = false;
        }
    }
    
    // Keep Fabric.js events for other tools
    canvasInstance.on('mouse:move', function(opt) {
        if (!isDrawing || !drawMode) return;
        
        const pointer = canvasInstance.getPointer(opt.e);
        
        // Update interactive line drawing
        if (selectedTool === "line" && currentLine) {
            currentLine.set({
                x2: pointer.x,
                y2: pointer.y
            });
            canvasInstance.renderAll();
        }
        
        // Update interactive arrow drawing
        if (selectedTool === "arrow" && currentLine) {
            currentLine.set({
                x2: pointer.x,
                y2: pointer.y
            });
            canvasInstance.renderAll();
        }
    });
    
    canvasInstance.on('mouse:up', function(opt) {
        if (!isDrawing || !drawMode) return;
        
        // Finalize interactive line and arrow drawing
        if ((selectedTool === "line" || selectedTool === "arrow") && currentLine) {
            if (selectedTool === "arrow") {
                // Add arrowhead to the line
                const x1 = currentLine.x1;
                const y1 = currentLine.y1;
                const x2 = currentLine.x2;
                const y2 = currentLine.y2;
                
                // Calculate arrowhead
                const arrowLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const arrowAngle = Math.atan2(y2 - y1, x2 - x1);
                const arrowheadLength = Math.min(20, arrowLength * 0.2);
                const arrowheadAngle = Math.PI / 4; // 45 degrees - wider angle
                
                // Create arrowhead lines - start them slightly back from the end point
                const arrowheadStartDistance = 5; // Start arrowhead 5 pixels back from the end
                const startX = x2 - arrowheadStartDistance * Math.cos(arrowAngle);
                const startY = y2 - arrowheadStartDistance * Math.sin(arrowAngle);
                
                const head1X = startX - arrowheadLength * Math.cos(arrowAngle - arrowheadAngle);
                const head1Y = startY - arrowheadLength * Math.sin(arrowAngle - arrowheadAngle);
                const head2X = startX - arrowheadLength * Math.cos(arrowAngle + arrowheadAngle);
                const head2Y = startY - arrowheadLength * Math.sin(arrowAngle + arrowheadAngle);
                
                const head1 = new floorPlanWindow.fabric.Line([startX, startY, head1X, head1Y], {
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: false,
                    evented: false
                });
                
                const head2 = new floorPlanWindow.fabric.Line([startX, startY, head2X, head2Y], {
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: false,
                    evented: false
                });
                
                // Add arrowhead lines to canvas
                canvasInstance.add(head1);
                canvasInstance.add(head2);
            }
            
            // Make the line/arrow selectable and editable
            currentLine.set({
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true,
                lockRotation: false,
                lockScalingX: false,
                lockScalingY: false
            });
            
            canvasInstance.setActiveObject(currentLine);
            currentLine = null;
            isDrawing = false;
            lastPoint = null;
        }
    });
    
    canvasInstance.on('mouse:down', function(opt) {
        if (!drawMode) return;
        
        const pointer = canvasInstance.getPointer(opt.e);
        
        if (selectedTool === "text") {
            // Add text object
            const text = new floorPlanWindow.fabric.IText('Click to edit', {
                left: pointer.x,
                top: pointer.y,
                fontFamily: 'Arial',
                fontSize: 20,
                fill: selectedColor,
                selectable: true,
                editable: true
            });
            canvasInstance.add(text);
            canvasInstance.setActiveObject(text);
            text.enterEditing();
            return;
        }
        
        // Handle interactive line and arrow drawing
        if (selectedTool === "line" || selectedTool === "arrow") {
            isDrawing = true;
            lastPoint = pointer;
            
            if (selectedTool === "line") {
                currentLine = new floorPlanWindow.fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: false,
                    evented: false
                });
            } else if (selectedTool === "arrow") {
                // Just create a simple line like the line tool
                currentLine = new floorPlanWindow.fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: false,
                    evented: false
                });
            }
            
            canvasInstance.add(currentLine);
            return;
        }
        
        // Handle shape drawing and other tools
        if (selectedTool === "rectangle" || selectedTool === "circle" || selectedTool === "triangle" || 
            selectedTool === "square" || selectedTool === "hexagon" || selectedTool === "pentagon" || 
            selectedTool.startsWith("camera-") || 
            (selectedTool !== 'pencil' && selectedTool !== 'eraser' && selectedTool !== 'text')) {
            drawShape(selectedTool, pointer);
        }
    });

    // Shape drawing functions
    const drawShape = function(shapeType, pointer) {
        let shape;
        
        switch(shapeType) {
            case 'rectangle':
                shape = new floorPlanWindow.fabric.Rect({
                    left: pointer.x,
                    top: pointer.y,
                    width: 100,
                    height: 100,
                    fill: fillColor.checked ? selectedColor : 'transparent',
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: true
                });
                break;
            case 'circle':
                shape = new floorPlanWindow.fabric.Circle({
                    left: pointer.x,
                    top: pointer.y,
                    radius: 50,
                    fill: fillColor.checked ? selectedColor : 'transparent',
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: true
                });
                break;
            case 'triangle':
                shape = new floorPlanWindow.fabric.Triangle({
                    left: pointer.x,
                    top: pointer.y,
                    width: 100,
                    height: 100,
                    fill: fillColor.checked ? selectedColor : 'transparent',
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: true
                });
                break;
            case 'square':
                shape = new floorPlanWindow.fabric.Rect({
                    left: pointer.x,
                    top: pointer.y,
                    width: 100,
                    height: 100,
                    fill: fillColor.checked ? selectedColor : 'transparent',
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: true
                });
                break;
            case 'hexagon':
                const hexPoints = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (2 * Math.PI / 6) * i;
                    const x = pointer.x + 50 * Math.cos(angle);
                    const y = pointer.y + 50 * Math.sin(angle);
                    hexPoints.push({x: x, y: y});
                }
                shape = new floorPlanWindow.fabric.Polygon(hexPoints, {
                    fill: fillColor.checked ? selectedColor : 'transparent',
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: true
                });
                break;
            case 'pentagon':
                const pentPoints = [];
                for (let i = 0; i < 5; i++) {
                    const angle = (2 * Math.PI / 5) * i - Math.PI / 2;
                    const x = pointer.x + 50 * Math.cos(angle);
                    const y = pointer.y + 50 * Math.sin(angle);
                    pentPoints.push({x: x, y: y});
                }
                shape = new floorPlanWindow.fabric.Polygon(pentPoints, {
                    fill: fillColor.checked ? selectedColor : 'transparent',
                    stroke: selectedColor,
                    strokeWidth: brushWidth,
                    selectable: true
                });
                break;
            default:
                // Subject or other tool
                if (selectedTool !== 'pencil' && selectedTool !== 'eraser' && selectedTool !== 'text') {
                    const subjectCircle = new floorPlanWindow.fabric.Circle({
                        left: pointer.x,
                        top: pointer.y,
                        radius: 30,
                        fill: fillColor.checked ? selectedColor : 'transparent',
                        stroke: selectedColor,
                        strokeWidth: brushWidth,
                        selectable: true
                    });
                    
                    const subjectText = new floorPlanWindow.fabric.Text(selectedTool, {
                        left: pointer.x,
                        top: pointer.y,
                        fontSize: 12,
                        fill: selectedColor,
                        originX: 'center',
                        originY: 'center',
                        selectable: false
                    });
                    
                    canvasInstance.add(subjectCircle);
                    canvasInstance.add(subjectText);
                    return;
                }
                return;
        }
        
        if (shape) {
            canvasInstance.add(shape);
            canvasInstance.setActiveObject(shape);
        }
    };

    // Tool selection logic
    toolBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            selectTool(btn);
        });
    });

    // Function to handle tool selection
    function selectTool(toolElement) {
        // Remove active class from all tools
        floorPlanWindow.document.querySelectorAll(".tool").forEach(tool => {
            tool.classList.remove("active");
            tool.style.backgroundColor = '';
        });
        toolElement.classList.add("active");
        toolElement.style.backgroundColor = '#e0e0e0';
        selectedTool = toolElement.id;
        
        // Setup free drawing for pencil/eraser
        if (drawMode) {
            setupFreeDrawing();
        }
    }
    
    // Add event delegation only for dynamically added tools (cameras and subjects)
    floorPlanWindow.document.addEventListener("click", (e) => {
        const clickedTool = e.target.closest('.tool');
        if (clickedTool && (clickedTool.id.startsWith('camera-') || !Array.from(toolBtns).includes(clickedTool))) {
            selectTool(clickedTool);
        }
    });

    sizeSlider.addEventListener("change", () => {
        brushWidth = parseInt(sizeSlider.value);
        if (canvasInstance.freeDrawingBrush) {
            canvasInstance.freeDrawingBrush.width = brushWidth;
        }
    });

    colorBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            floorPlanWindow.document.querySelector(".options .selected")?.classList.remove("selected");
            btn.classList.add("selected"); 
            selectedColor = floorPlanWindow.getComputedStyle(btn).getPropertyValue("background-color");
        });
    });

    colorPicker.addEventListener("change", () => {
        selectedColor = colorPicker.value;
        if (canvasInstance.freeDrawingBrush && selectedTool === "pencil") {
            canvasInstance.freeDrawingBrush.color = selectedColor;
        }
    });

    clearCanvas.addEventListener("click", () => {
        canvasInstance.clear();
        canvasInstance.backgroundColor = '#ffffff';
        canvasInstance.renderAll();
    });

    saveImage.addEventListener("click", () => {
        const link = floorPlanWindow.document.createElement("a");
        link.download = `${Date.now()}.jpg`;
        link.href = canvasInstance.toDataURL();
        link.click();
    });

    addSubject.addEventListener("click", () => {
        const newSubject = floorPlanWindow.document.getElementById("newSub").value;
        
        if (newSubject.trim() === '') {
            alert('Please enter a subject name');
            return;
        }

        // Create the new list item using proper DOM methods
        const newListItem = floorPlanWindow.document.createElement('li');
        newListItem.className = 'option tool';
        newListItem.id = newSubject;
        
        // Create the icon
        const icon = floorPlanWindow.document.createElement('i');
        icon.className = 'fa-solid fa-user';
        
        // Create the span with subject text
        const span = floorPlanWindow.document.createElement('span');
        span.textContent = newSubject;
        
        // Append icon and span to the list item
        newListItem.appendChild(icon);
        newListItem.appendChild(span);
        
        // Append the new list item to the script items container
        scriptItems.appendChild(newListItem);
        
        // Clear the input field
        floorPlanWindow.document.getElementById("newSub").value = '';
        
        // Trigger floor plan state synchronization after adding the new subject
        setTimeout(() => {
            syncFloorPlanWithMainWindow();
        }, 100);
    });

    // Mode button event handlers
    drawModeBtn.addEventListener("click", () => {
        drawMode = true;
        drawModeBtn.classList.add("active");
        selectModeBtn.classList.remove("active");
        
        // Disable selection in draw mode
        canvasInstance.selection = false;
        canvasInstance.forEachObject(function(obj) {
            obj.selectable = false;
        });
        
        // Set drawing cursor
        canvasInstance.defaultCursor = 'crosshair';
        canvasInstance.hoverCursor = 'crosshair';
        
        // Setup free drawing for current tool
        setupFreeDrawing();
    });

    selectModeBtn.addEventListener("click", () => {
        drawMode = false;
        selectModeBtn.classList.add("active");
        drawModeBtn.classList.remove("active");
        
        // Enable selection in select mode
        canvasInstance.selection = true;
        canvasInstance.forEachObject(function(obj) {
            obj.selectable = true;
        });
        
        // Set selection cursor
        canvasInstance.defaultCursor = 'default';
        canvasInstance.hoverCursor = 'move';
        
        // Disable free drawing
        canvasInstance.isDrawingMode = false;
    });
}

// Make functions globally available
window.startFloorPlanSync = startFloorPlanSync;
window.stopFloorPlanSync = stopFloorPlanSync;
window.openFloorPlan = openFloorPlan;
window.initializeFloorPlan = initializeFloorPlan;
window.setupFloorPlanUI = setupFloorPlanUI; 

// Function to load floor plan content (for sidebar navigation)
window.loadFloorPlan = function() {
    const floorPlanContent = document.getElementById('floor-plan-content');
    if (!floorPlanContent) return;

    // Check if there's existing floor plan data
    const existingFloorPlan = localStorage.getItem('currentFloorPlanState');
    
    if (existingFloorPlan) {
        try {
            const floorPlanData = JSON.parse(existingFloorPlan);
            this.loadExistingFloorPlan(floorPlanContent, floorPlanData);
        } catch (error) {
            console.error('Error parsing floor plan data:', error);
            this.createNewFloorPlan(floorPlanContent);
        }
    } else {
        this.createNewFloorPlan(floorPlanContent);
    }
};

// Helper function to load existing floor plan
function loadExistingFloorPlan(container, floorPlanData) {
    container.innerHTML = `
        <div class="floor-plan-container">
            <div class="floor-plan-header">
                <h3>Floor Plan</h3>
                <div class="floor-plan-actions">
                    <button class="btn button2" onclick="editFloorPlan()">Edit Floor Plan</button>
                    <button class="btn button2" onclick="exportFloorPlan()">Export</button>
                    <button class="btn button2" onclick="createNewFloorPlan()">New Floor Plan</button>
                </div>
            </div>
            <div class="floor-plan-preview">
                <div class="floor-plan-canvas" id="floor-plan-canvas">
                    <!-- Floor plan canvas will be loaded here -->
                </div>
            </div>
            <div class="floor-plan-info">
                <h4>Floor Plan Information</h4>
                <p><strong>Last Modified:</strong> ${new Date(floorPlanData.lastModified || Date.now()).toLocaleString()}</p>
                <p><strong>Items:</strong> ${floorPlanData.customItems ? floorPlanData.customItems.length : 0} custom items</p>
            </div>
        </div>
    `;

    // Apply floor plan styles
    this.applyFloorPlanStyles();
    
    // Load the actual floor plan canvas if it exists
    if (floorPlanData.canvasJSON) {
        this.loadFloorPlanCanvas(floorPlanData.canvasJSON);
    }
}

// Helper function to create new floor plan
function createNewFloorPlan(container) {
    container.innerHTML = `
        <div class="floor-plan-container">
            <div class="floor-plan-header">
                <h3>Create New Floor Plan</h3>
                <p>Design your set layout and camera positions</p>
            </div>
            <div class="floor-plan-setup">
                <div class="setup-options">
                    <h4>Setup Options</h4>
                    <div class="option-group">
                        <label>Canvas Size:</label>
                        <select id="canvas-size">
                            <option value="800x600">800 x 600</option>
                            <option value="1024x768">1024 x 768</option>
                            <option value="1200x900">1200 x 900</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Background:</label>
                        <select id="background-type">
                            <option value="grid">Grid</option>
                            <option value="plain">Plain</option>
                            <option value="image">Image</option>
                        </select>
                    </div>
                    <button class="btn button2 primary" onclick="initializeFloorPlan()">Create Floor Plan</button>
                </div>
                <div class="setup-preview">
                    <h4>Preview</h4>
                    <div class="preview-canvas">
                        <div class="canvas-placeholder">
                            <i class="fas fa-map"></i>
                            <p>Floor plan preview will appear here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Apply floor plan styles
    this.applyFloorPlanStyles();
}

// Helper function to apply floor plan styles
function applyFloorPlanStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .floor-plan-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .floor-plan-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .floor-plan-header h3 {
            color: var(--text-white);
            font-size: 28px;
            margin-bottom: 8px;
        }
        .floor-plan-header p {
            color: var(--text-light);
            font-size: 16px;
        }
        .floor-plan-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 16px;
        }
        .floor-plan-preview {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            min-height: 400px;
        }
        .floor-plan-canvas {
            width: 100%;
            height: 400px;
            background: rgba(255, 255, 255, 0.02);
            border: 2px dashed var(--border-color);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .floor-plan-info {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
        }
        .floor-plan-info h4 {
            color: var(--text-white);
            margin-bottom: 16px;
        }
        .floor-plan-info p {
            color: var(--text-light);
            margin-bottom: 8px;
        }
        .floor-plan-setup {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
        }
        .setup-options {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
        }
        .setup-options h4 {
            color: var(--text-white);
            margin-bottom: 20px;
        }
        .option-group {
            margin-bottom: 20px;
        }
        .option-group label {
            display: block;
            color: var(--text-light);
            margin-bottom: 8px;
        }
        .option-group select {
            width: 100%;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: var(--text-white);
        }
        .setup-preview {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
        }
        .setup-preview h4 {
            color: var(--text-white);
            margin-bottom: 20px;
        }
        .preview-canvas {
            height: 300px;
            background: rgba(255, 255, 255, 0.02);
            border: 2px dashed var(--border-color);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .canvas-placeholder {
            text-align: center;
            color: var(--text-light);
        }
        .canvas-placeholder i {
            font-size: 48px;
            margin-bottom: 16px;
            color: var(--accent-green);
        }
        @media (max-width: 768px) {
            .floor-plan-setup {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}

// Helper function to load floor plan canvas
function loadFloorPlanCanvas(canvasJSON) {
    // This would integrate with the existing floor plan system
    // For now, we'll show a placeholder
    const canvas = document.getElementById('floor-plan-canvas');
    if (canvas) {
        canvas.innerHTML = `
            <div class="canvas-loaded">
                <i class="fas fa-check-circle"></i>
                <p>Floor plan loaded successfully</p>
                <small>Canvas data available</small>
            </div>
        `;
    }
} 