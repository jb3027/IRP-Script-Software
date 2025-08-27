/**
 * Comprehensive Undo/Redo Manager
 * Tracks all changes across the entire application
 */

class UndoRedoManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50;
        this.isUndoRedoAction = false;
        this.currentState = null;
        this.saveTimeout = null;
        this.lastSaveTime = 0;
        
        this.init();
    }

    init() {
        // Initialize previous values for all fields
        this.initializePreviousValues();
        
        // Set up event listeners for all changeable elements
        this.setupEventListeners();
        
        // Update button states
        this.updateButtonStates();
    }

    initializePreviousValues() {
        // Initialize previous values for all existing fields
        $('.shot-type-select').each(function() {
            $(this).data('previous-value', $(this).val());
        });
        
        $('.shotSubject').each(function() {
            $(this).data('previous-value', $(this).val());
        });
        
        $('.custom-shot-type').each(function() {
            $(this).data('previous-value', $(this).val());
        });
        
        $('.cameraNum').each(function() {
            $(this).data('previous-value', $(this).val());
        });
        
        $('.cameraPos').each(function() {
            $(this).data('previous-value', $(this).val());
        });
        
        $('.insertDuration').each(function() {
            $(this).data('previous-value', $(this).val());
        });
        
        $('.editable-cell').each(function() {
            $(this).data('previous-value', $(this).text());
        });
        
        $('.production-title').data('previous-value', $('.production-title').text());
    }

    setupEventListeners() {
        // Production title changes
        $(document).on('input blur', '.production-title', () => {
            if (!this.isUndoRedoAction) {
                this.saveState('Production Title Change');
            }
        });

        // Table content changes
        $(document).on('input blur', '.editable-cell', () => {
            if (!this.isUndoRedoAction) {
                this.saveState('Table Content Change');
            }
        });

        // Shot type changes
        $(document).on('change', '.shot-type-select', () => {
            if (!this.isUndoRedoAction) {
                this.saveState('Shot Type Change');
            }
        });

        // Shot subject changes
        $(document).on('input blur', '.shotSubject', () => {
            if (!this.isUndoRedoAction) {
                this.saveState('Shot Subject Change');
            }
        });

        // Custom shot type changes
        $(document).on('input blur', '.custom-shot-type', () => {
            if (!this.isUndoRedoAction) {
                this.saveState('Custom Shot Type Change');
            }
        });

        // Camera number changes
        $(document).on('input blur', '.cameraNum', () => {
            if (!this.isUndoRedoAction) {
                this.saveState('Camera Number Change');
            }
        });

        // Camera position changes
        $(document).on('input blur', '.cameraPos', () => {
            if (!this.isUndoRedoAction) {
                this.saveState('Camera Position Change');
            }
        });

        // Duration changes
        $(document).on('input blur', '.insertDuration', () => {
            if (!this.isUndoRedoAction) {
                this.saveState('Duration Change');
            }
        });

        // Row additions
        $(document).on('DOMNodeInserted', '#event-table tbody tr', (e) => {
            if (!this.isUndoRedoAction && e.target.nodeType === 1) {
                setTimeout(() => this.saveState('Row Added'), 100);
            }
        });

        // Row deletions
        $(document).on('DOMNodeRemoved', '#event-table tbody tr', (e) => {
            if (!this.isUndoRedoAction && e.target.nodeType === 1) {
                setTimeout(() => this.saveState('Row Deleted'), 100);
            }
        });

        // Row reordering (drag and drop)
        $(document).on('dragend', '#event-table tbody tr', () => {
            if (!this.isUndoRedoAction) {
                setTimeout(() => this.saveState('Row Reordered'), 100);
            }
        });

        // View mode changes
        $(document).on('click', '.view-button', () => {
            if (!this.isUndoRedoAction) {
                setTimeout(() => this.saveState('View Mode Change'), 100);
            }
        });

        // Running order changes
        $(document).on('click', '.runningOrder-button', () => {
            if (!this.isUndoRedoAction) {
                setTimeout(() => this.saveState('Running Order Change'), 100);
            }
        });

        // Floor plan changes
        $(document).on('click', '.floorPlan-button', () => {
            if (!this.isUndoRedoAction) {
                setTimeout(() => this.saveState('Floor Plan Change'), 100);
            }
        });

        // Add event/item/insert buttons
        $(document).on('click', '.addEvent-button, .addItem-button, .addInsert-button', () => {
            if (!this.isUndoRedoAction) {
                setTimeout(() => this.saveState('Row Added'), 100);
            }
        });

        // Remove row buttons
        $(document).on('click', '.row-button.remove', () => {
            if (!this.isUndoRedoAction) {
                this.saveState('Row Deleted');
            }
        });

        // Formatting changes (bold, italic, etc.)
        $(document).on('click', '.format-btn', () => {
            if (!this.isUndoRedoAction) {
                setTimeout(() => this.saveState('Formatting Change'), 100);
            }
        });
    }

    saveState(description) {
        if (this.isUndoRedoAction) return;

        // For input events, use debouncing to avoid too many saves
        if (description.includes('Change') && !description.includes('Row') && !description.includes('View') && !description.includes('Running') && !description.includes('Floor')) {
            // Clear any existing timeout
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            
            // Set a new timeout to save after 500ms of no input
            this.saveTimeout = setTimeout(() => {
                this.performSave(description);
            }, 500);
            
            return;
        }

        // For non-input events, save immediately
        this.performSave(description);
    }

    performSave(description) {
        let state;

        // Handle different types of changes
        if (description.includes('Shot Type Change')) {
            state = this.createFieldChangeState(description, '.shot-type-select:focus', 'shot-type-select');
        } else if (description.includes('Shot Subject Change')) {
            state = this.createFieldChangeState(description, '.shotSubject:focus', 'shotSubject');
        } else if (description.includes('Custom Shot Type Change')) {
            state = this.createFieldChangeState(description, '.custom-shot-type:focus', 'custom-shot-type');
        } else if (description.includes('Camera Number Change')) {
            state = this.createFieldChangeState(description, '.cameraNum:focus', 'cameraNum');
        } else if (description.includes('Camera Position Change')) {
            state = this.createFieldChangeState(description, '.cameraPos:focus', 'cameraPos');
        } else if (description.includes('Duration Change')) {
            state = this.createFieldChangeState(description, '.insertDuration:focus', 'insertDuration');
        } else if (description.includes('Table Content Change')) {
            state = this.createFieldChangeState(description, '.editable-cell:focus', 'editable-cell');
        } else if (description.includes('Production Title Change')) {
            state = this.createFieldChangeState(description, '.production-title', 'production-title');
        } else {
            // Fallback to full state for other actions
            state = this.createFullState(description);
        }

        if (state) {
            // Check if this state is significantly different from the last one
            const lastState = this.undoStack[this.undoStack.length - 1];
            if (lastState && this.isStateSimilar(lastState, state)) {
                // States are too similar, don't save
                return;
            }

            // Add to undo stack
            this.undoStack.push(state);
            
            // Clear redo stack when new action is performed
            this.redoStack = [];
            
            // Limit stack size
            if (this.undoStack.length > this.maxStackSize) {
                this.undoStack.shift();
            }

            this.updateButtonStates();
        }
    }

    createFieldChangeState(description, selector, fieldType) {
        const $element = $(selector);
        if (!$element.length) return null;

        const rowId = $element.closest('tr').attr('data-row-id') || Date.now();
        const fieldId = $element.attr('id') || `${fieldType}-${rowId}`;
        const oldValue = $element.data('previous-value') || '';
        const newValue = fieldType === 'production-title' ? $element.text() : $element.val();
        
        // Store current value for next comparison
        $element.data('previous-value', newValue);

        return {
            timestamp: Date.now(),
            description: description,
            type: 'field-change',
            rowId: rowId,
            fieldId: fieldId,
            fieldType: fieldType,
            oldValue: oldValue,
            newValue: newValue,
            selector: `#${fieldId}`,
            action: 'change'
        };
    }

    createFullState(description) {
        return {
            timestamp: Date.now(),
            description: description,
            type: 'full-state',
            productionTitle: $('.production-title').text(),
            tableHTML: $('.container').html(),
            viewMode: $('.main-content').hasClass('view-mode'),
            currentView: window.currentView || 'script',
            productionState: JSON.parse(sessionStorage.getItem('productionState') || '{}'),
            projectName: sessionStorage.getItem('projectName') || ''
        };
    }

    isStateSimilar(state1, state2) {
        // Handle different state types
        if (state1.type === 'field-change' && state2.type === 'field-change') {
            // For field changes, check if they're the same field and value
            return state1.fieldId === state2.fieldId && 
                   state1.oldValue === state2.oldValue && 
                   state1.newValue === state2.newValue;
        } else if (state1.type === 'full-state' && state2.type === 'full-state') {
            // For full states, use the existing similarity logic
            // Don't save if production title is the same
            if (state1.productionTitle !== state2.productionTitle) {
                return false;
            }

            // Don't save if table HTML is very similar (just minor input changes)
            if (state1.tableHTML !== state2.tableHTML) {
                // Check if it's just a minor input change
                const html1 = state1.tableHTML.replace(/\s+/g, ' ').trim();
                const html2 = state2.tableHTML.replace(/\s+/g, ' ').trim();
                
                // If HTML is more than 90% similar, consider it the same
                if (this.calculateSimilarity(html1, html2) > 0.9) {
                    return true;
                }
                return false;
            }

            // Don't save if view mode is the same
            if (state1.viewMode !== state2.viewMode) {
                return false;
            }

            // Don't save if current view is the same
            if (state1.currentView !== state2.currentView) {
                return false;
            }

            return true;
        }

        // Different state types are always considered different
        return false;
    }

    calculateSimilarity(str1, str2) {
        if (str1 === str2) return 1.0;
        if (str1.length === 0 || str2.length === 0) return 0.0;
        
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        return (longer.length - this.editDistance(longer, shorter)) / longer.length;
    }

    editDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    undo() {
        if (this.undoStack.length === 0) {
            return;
        }

        this.isUndoRedoAction = true;

        // Get the state to undo
        const stateToUndo = this.undoStack.pop();
        
        // Restore the state (this will automatically add to redo stack for field changes)
        this.restoreState(stateToUndo);

        this.updateButtonStates();
        this.isUndoRedoAction = false;
        
    }

    redo() {
        if (this.redoStack.length === 0) {
            return;
        }

        this.isUndoRedoAction = true;

        // Get the state to redo
        const stateToRedo = this.redoStack.pop();
        
        // For redo, we need to swap oldValue and newValue
        const redoState = {
            ...stateToRedo,
            oldValue: stateToRedo.newValue,
            newValue: stateToRedo.oldValue
        };
        
        // Restore the state (this will automatically add to undo stack for field changes)
        this.restoreState(redoState);

        this.updateButtonStates();
        this.isUndoRedoAction = false;
        
    }

    restoreState(state) {
        try {
            if (state.type === 'field-change') {
                // Handle granular field changes
                this.restoreFieldChange(state);
            } else {
                // Handle full state restoration
                this.restoreFullState(state);
            }
        } catch (error) {
            console.error('Error restoring state:', error);
        }
    }

    restoreFieldChange(state) {
        // Find the element to restore
        let $element;
        
        if (state.fieldType === 'production-title') {
            $element = $('.production-title');
        } else {
            // Try to find by selector first, then by field type and row
            $element = $(state.selector);
            if (!$element.length) {
                // Fallback: find by field type and row
                const $row = $(`tr[data-row-id="${state.rowId}"]`);
                if ($row.length) {
                    $element = $row.find(`.${state.fieldType}`);
                }
            }
        }

        if ($element.length) {
            // Store the current value for redo
            const currentValue = state.fieldType === 'production-title' ? $element.text() : $element.val();
            
            // Restore the old value
            if (state.fieldType === 'production-title') {
                $element.text(state.oldValue);
            } else {
                $element.val(state.oldValue);
            }
            
            // Update the stored previous value
            $element.data('previous-value', state.oldValue);
            
            // Create redo state
            const redoState = {
                ...state,
                oldValue: currentValue,
                newValue: state.oldValue
            };
            
            // Add to redo stack
            this.redoStack.push(redoState);
        }
    }

    restoreFullState(state) {
        // Restore production title
        $('.production-title').text(state.productionTitle);

        // Restore table content
        $('.container').html(state.tableHTML);

        // Restore view mode
        if (state.viewMode) {
            $('.main-content').addClass('view-mode');
        } else {
            $('.main-content').removeClass('view-mode');
        }

        // Restore current view
        window.currentView = state.currentView;

        // Restore production state
        sessionStorage.setItem('productionState', JSON.stringify(state.productionState));

        // Restore project name
        if (state.projectName) {
            sessionStorage.setItem('projectName', state.projectName);
        }

        // Reinitialize any necessary components
        this.reinitializeComponents();
    }

    reinitializeComponents() {
        // Reinitialize draggable functionality if available
        if (typeof initializeDraggableTable === 'function') {
            initializeDraggableTable();
        }

        // Reinitialize event handlers if available
        if (typeof initializeEventHandlers === 'function') {
            initializeEventHandlers();
        }

        // Reinitialize formatting buttons if available
        if (typeof initializeFormattingButtons === 'function') {
            initializeFormattingButtons();
        }

        // Reinitialize custom inputs if available
        if (typeof initializeCustomInputs === 'function') {
            initializeCustomInputs();
        }

        // Reinitialize table management if available
        if (typeof initializeTableManagement === 'function') {
            initializeTableManagement();
        }

        // Reinitialize add row handlers if available
        if (typeof initializeAddRowHandlers === 'function') {
            initializeAddRowHandlers();
        }

        // Reinitialize input handlers if available
        if (typeof initializeInputHandlers === 'function') {
            initializeInputHandlers();
        }

        // Update any UI elements that depend on the current state
        this.updateUI();
    }

    updateUI() {
        // Don't update button highlighting during undo/redo operations
        if (this.isUndoRedoAction) {
            return;
        }

        // Update button states based on current view
        if (window.currentView === 'runningOrder') {
            $('.runningOrder-button').addClass('active');
            $('.view-button').removeClass('active');
        } else {
            $('.view-button').addClass('active');
            $('.runningOrder-button').removeClass('active');
        }

        // Update any other UI elements that need refreshing
        $('.container').trigger('contentChanged');
    }

    updateButtonStates() {
        const undoButton = $('.undo-button');
        const redoButton = $('.redo-button');

        // Enable/disable undo button
        if (this.undoStack.length > 0) {
            undoButton.prop('disabled', false).removeClass('disabled');
        } else {
            undoButton.prop('disabled', true).addClass('disabled');
        }

        // Enable/disable redo button
        if (this.redoStack.length > 0) {
            redoButton.prop('disabled', false).removeClass('disabled');
        } else {
            redoButton.prop('disabled', true).addClass('disabled');
        }
    }

    clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
        this.updateButtonStates();
    }

    // Method to clear history and start fresh (useful if stack gets too cluttered)
    resetHistory() {
        this.clearHistory();
        // Save current state as the new starting point
        this.saveState('Reset Point');
    }

    getHistoryInfo() {
        return {
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length,
            lastUndoAction: this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].description : null,
            lastRedoAction: this.redoStack.length > 0 ? this.redoStack[this.redoStack.length - 1].description : null
        };
    }
}

// Initialize the undo/redo manager when document is ready
$(document).ready(function() {
    window.undoRedoManager = new UndoRedoManager();
    
    // Override the existing undo/redo button handlers
    $('.undo-button').off('click').on('click', function() {
        if (window.undoRedoManager) {
            window.undoRedoManager.undo();
        }
    });

    $('.redo-button').off('click').on('click', function() {
        if (window.undoRedoManager) {
            window.undoRedoManager.redo();
        }
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UndoRedoManager;
}
