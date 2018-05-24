'use strict';

define(['angular'], function(angular) {

    /**
     * variable containing process definition id of the process shown
      */
    var procDefId;

    /**
     * variable containing all ids of overlays created here
     */
    var overlayIds = [];

    /**
     * Overlay object that contains the elements put on the diagram
     */
    var overlay = ['$scope', '$http', '$window', '$rootScope', 'Uri', 'control', 'processDiagram',
        function($scope, $http, $window, $rootScope, Uri, control, processDiagram) {

            // process definition id is set (HARDCODED nr. of parents)
            procDefId = $scope.$parent.processDefinition.id;

            // get overlay and elements from the diagram
            var viewer = control.getViewer();
            var overlays = viewer.get('overlays');
            var elementRegistry = viewer.get('elementRegistry');

            // subscribe to broadcast any variable options change
            $rootScope.$on("cockpit.plugin.centaur:options:variable-change", function() {

                // clear any current overlays displayed
                clearOverlays(overlays);

                // rerun adding the overlays to all activities
                addActivityElements($window, $http, elementRegistry, processDiagram, overlays, Uri);
            });

            // add the activity variable elements to the overlay
            addActivityElements($window, $http, elementRegistry, processDiagram, overlays, Uri);
        }
    ];

    /**
     * Adds an element with variables to each activity
     *
     * @param $window           browser window containing localStorage
     * @param $http             http client for GET request
     * @param elementRegistry   registry containing bpmn elements
     * @param processDiagram    diagram containing elements
     * @param overlays          collection of overlays to add to
     * @param Uri uniform       resource identifier to create GET request
     */
    function addActivityElements($window, $http, elementRegistry, processDiagram, overlays, Uri) {

        // loop over all elements in the diagram
        elementRegistry.forEach(function(shape) {

            // get corresponding element from processDiagram
            var element = processDiagram.bpmnElements[shape.businessObject.id];

            // get all variables attached to this activity
            $http.get(Uri.appUri("plugin://centaur/:engine/instance-variables" +
                "?procDefId=" + procDefId +
                "&actId=" + element.id))
                .success(function(data) {

                    // create html string from data
                    var html = createHtmlText($window, Uri, data);

                    // create element from html string and add to overlay
                    addTextElement(shape, overlays, element.id, html);
                });
        });
    }

    /**
     * Creates html string from data and options settings
     *
     * @param $window   browser window containing localStorage
     * @param data      variable data from GET request
     * @returns {string}
     */
    function createHtmlText($window, Uri, data) {

        // object storing current html string
        var htmlText = "<div class='variableText'>";

        // loop over all variables to add to html string
        for(var i in data) {

            // get variable object {name, data} from raw variable data
            var variable = getVariableData(data[i]);

            // skip over variable which is not in localStorage option settings
            if($window.localStorage.getItem(procDefId + "_" + variable.name) === null ||
                $window.localStorage.getItem(procDefId + "_" + variable.name) === 'false') continue;

            htmlText += "<b>" + variable.name + ":</b> ";

            // if clickable link to file data
            if(variable.clickable) htmlText += "<a href=" +
                Uri.appUri("engine://engine/:engine/variable-instance/" + data[i].id + "/data") +
                ">";

            htmlText += variable.data;

            // close link tag if clickable
            if(variable.clickable) htmlText += "</a>";

            htmlText += "<br>";
        }

        htmlText += "</div>";

        return htmlText;
    }

    /**
     * Transforms raw variable data to object with name and data string
     *
     * @param data
     * @returns {{name: string, data: string}}
     */
    function getVariableData(data) {

        // string storing the data value of variable
        var dataString = "";

        // boolean value whether the object should be clickable
        var clickable = (data.type === "file");

        // handle different variable data types with null checking
        if(data.double_ != null) dataString = String(data.double_);
        else if(data.long_ != null) dataString = String(data.long_);
        else if(data.text != null) dataString = String(data.text);
        else dataString = String(data.text2);

        // Transform boolean 1 or 0 to true or false
        if(data.type === "boolean") dataString = (data.long_ === 1 ? "true" : "false");

        // return object with name, the data and whether or not it is a file (clickable)
        return {name: String(data.name), data: dataString, clickable: clickable};
    }

    /**
     * Adds html string of variable data to the bpmn element
     *
     * @param shape         Activity element containing information like height/width
     * @param overlays      Collection of overlays to which can be added to
     * @param elementId     Id of element where we add overlay
     * @param htmlText      Text of html string of variable data
     */
    function addTextElement(shape, overlays, elementId, htmlText) {

        // create html object of html string and add some css
        var $html = $(htmlText).css({
            width: shape.width * 1.5,
            height: shape.height
        });

        // add our overlay to the bpmn element with our html object
        var element = overlays.add(elementId, {
            position: {
                bottom: 25,
                left: -120
            },
            show: {
                minZoom: -Infinity,
                maxZoom: +Infinity
            },
            html: $html
        });

        // add element id returned from overlays.add to array
        overlayIds.push(element);
    }

    /**
     * Clears all custom made overlays whose id is stored in overlayIds
     *
     * @param overlays  overlays object containing all diagram overlays
     */
    function clearOverlays(overlays) {
        overlayIds.forEach(function(element) {
            overlays.remove(element);
        });
    }

    /**
     * Configuration object that places plugin
     */
    var Configuration = [ 'ViewsProvider', function(ViewsProvider) {
        ViewsProvider.registerDefaultView('cockpit.processDefinition.diagram.plugin', {
            id: 'runtime',
            label: 'Instance Variables',
            priority: 20,
            overlay: overlay
        });
    }];

    var ngModule = angular.module('cockpit.plugin.centaur.diagram.instanceVar', []);

    ngModule.config(Configuration);

    return ngModule;
});