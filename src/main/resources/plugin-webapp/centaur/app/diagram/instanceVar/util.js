define({
    /**
     * Creates DOM element from data and options settings
     *
     * @param Uri       uniform resource identifier to create link
     * @param data      variable data from GET request
     * @returns {object}
     */
    createDOMElement: function (Uri, data) {

        var html = document.createElement('ul');
        html.className = "variableText";

        // loop over all variables to add to html string
        data.forEach(function(variable) {

            var variableHtml = document.createElement('li');

            var innerHtml = "<b>" + variable.name + ":</b> " + variable.data;

            if(variable.clickable) {
                var link = document.createElement('a');
                link.setAttribute('href', Uri.appUri("engine://engine/:engine/variable-instance/" + variable.id + "/data"));
                link.innerHTML = innerHtml;

                variableHtml.appendChild(link);
            } else {
                variableHtml.innerHTML = innerHtml;
            }

            html.appendChild(variableHtml);
        });

        return html;
    },

    /**
     * Removes all variables which are not selected by the user
     *
     * @param localStorage  contains user options
     * @param item          used for getting localStorage item option
     */
    isSelectedVariable: function(localStorage, item) {
        return localStorage.getItem(item) === 'true';
    },

    /**
     * Transforms raw variable data to object with name and data string
     *
     * @param data      has name, type and (long_, double_, text, text2)
     * @returns {{name: string, data: string}}
     */
    transformVariableData: function (data) {

        // string storing the data value of variable
        var dataString = "";

        // boolean value whether the object should be clickable
        var clickable = (data.type === "file");

        // handle different variable data types with null checking
        if (data.double_ != null) dataString = String(data.double_);
        else if (data.long_ != null) dataString = String(data.long_);
        else if (data.text != null) dataString = String(data.text);
        else dataString = String(data.text2);

        // Transform boolean 1 or 0 to true or false
        if (data.type === "boolean") dataString = (data.long_ === 1 ? "true" : "false");

        // return object with name, the data and whether or not it is a file (clickable)
        return {id: data.id, name: String(data.name), data: dataString, clickable: clickable};
    },

    /**
     * Adds html string of variable data to the bpmn element and return its id
     *
     * @param overlays      Collection of overlays to which can be added to
     * @param elementId     Id of element where we add overlay
     * @param html          DOM element of overlay
     * @returns {int}
     */
    addTextElement: function (overlays, elementId, html) {
        return overlays.add(elementId, {
            position: {
                bottom: 25,
                left: -150
            },
            show: {
                minZoom: -Infinity,
                maxZoom: +Infinity
            },
            html: html
        });
    },

    /**
     * Clears all overlays whose id is stored in overlayIds and clears overlayIds
     *
     * @param overlays      overlays object containing all diagram overlays
     * @param overlayIds    ids of overlays which should be removed
     */
    clearOverlays: function (overlays, overlayIds) {
        overlayIds.forEach(function (element) {
            overlays.remove(element);
        });
        overlayIds.length = 0;
    }
});