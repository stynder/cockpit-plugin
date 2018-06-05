define({
    /**
     * Adds html string of variable data to the bpmn element and return its id
     *
     * @param overlays      Collection of overlays to which can be added to
     * @param elementId     Id of element where we add overlay
     * @param html          DOM element of overlay
     * @param x             the right offset
     * @param y             the left offset
     * @returns {int}
     */
    addTextElement: function (overlays, elementId, html, bottom, left) {
        return overlays.add(elementId, {
            position: {
                bottom: bottom,
                left: left
            },
            show: {
                minZoom: -Infinity,
                maxZoom: +Infinity
            },
            html: html
        });
    },

    addDraggableFunctionality: function(localStorage, prefix, html) {
        html.classList.add("djs-draggable");

        $(html).draggable({
            stop: function() {
                // store settings in localStorage
                localStorage.setItem(prefix + "top", $(this).css("top"));
                localStorage.setItem(prefix + "left", $(this).css("left"));
            }
        });
    },

    /**
     * Clears all overlays whose id is stored in overlayIds and clears overlayIds
     *
     * @param overlays              overlays object containing all processDefinition overlays
     * @param overlayActivityIds    ids of overlays which should be removed
     * @param elementId             id of activity element
     */
    clearOverlays: function (overlays, overlayActivityIds, elementId) {
        if(overlayActivityIds[elementId] !== undefined) {
            overlayActivityIds[elementId].forEach(function (element) {
                overlays.remove(element);
            });
        }
        overlayActivityIds[elementId] = [];
    }
});