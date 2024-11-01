//add the custom tooltips on window load
window.onload = function() {
    tippy('i[data-tippy-content]', {
        animation: 'scale',
        inertia: true
    });
}

/**
 * Initialize tooltips for a given selector
 * @param selector  The selector for which you want to initialize the tooltip
 */
function initializeTooltips(selector) {
    tippy(selector, {
        animation: 'scale',
        inertia: true
    });
}