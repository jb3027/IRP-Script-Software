/**
 * Shows a notification message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification ('success', 'error', 'info', 'warning').
 * @param {number} duration - How long to show the notification in milliseconds (default: 3000).
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove any existing notifications
    $('.notification').remove();
    
    // Create notification element
    const notification = $(`
        <div class="notification notification-${type}">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `);
    
    // Add to page
    $('body').append(notification);
    
    // Show with fade in effect
    notification.hide().fadeIn(200);
    
    // Auto-hide after duration
    setTimeout(() => {
        notification.fadeOut(200, function() {
            $(this).remove();
        });
    }, duration);
    
    // Close button functionality
    notification.find('.notification-close').on('click', function() {
        notification.fadeOut(200, function() {
            $(this).remove();
        });
    });
}