// Draggable Table Functionality
// This file handles drag and drop operations for table rows

// Initialize draggable functionality
window.initDraggable = function() {
    const tbody = document.querySelector('#event-table tbody');
    
    // Safety check - ensure tbody exists before proceeding
    if (!tbody) {
        console.warn('Table tbody not found. Draggable functionality will not be initialized.');
        return;
    }
    
    // Enable drag only on drag buttons
    tbody.querySelectorAll('.row-button.drag').forEach(button => {
        const row = button.closest('tr');
        // Make the drag button the drag handle
        button.draggable = true; 
        
        // Handle drag events on the button
        button.addEventListener('dragstart', (e) => {
            row.classList.add('dragging');
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        button.addEventListener('dragend', () => {
            row.classList.remove('dragging');
            updateItemNumbers();
            
            // Sync state after drag operation
            setTimeout(function() {
                if (typeof syncStateFromTable === 'function') {
                    syncStateFromTable();
                }
            }, 150);
        });
    });
    
    // Handle dragover events for row reordering
    tbody.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingRow = tbody.querySelector('.dragging');
        if (!draggingRow) return;
        
        const siblings = [...tbody.querySelectorAll('tr:not(.dragging)')];
        const nextSibling = siblings.find(sibling => {
            const box = sibling.getBoundingClientRect();
            return e.clientY < box.top + box.height / 2;
        });
        
        if (nextSibling) {
            tbody.insertBefore(draggingRow, nextSibling);
            const draggedEventNum = draggingRow.querySelector('td:first-child').textContent;
            const replacementEventNum = nextSibling.querySelector('td:first-child').textContent;
        } else {
            tbody.appendChild(draggingRow);
            const draggedEventNum = draggingRow.querySelector('td:first-child').textContent;
        }
        updateEventNumbers();
        updateItemNumbers();
    });
};

// Initialize draggable on page load
$(document).ready(function() {
    initDraggable();
}); 