define({
    /**
    * common overlays util file
    */
    commonOverlays: {},

    /**
     * common options util file
     */
    commonOptions: {},

    /**
    * process definition id
    */
    procDefId: "",

    /**
     * array containig all ids for deletion
     */
    overlayIds: [],

    /**
     * Set counters for the processs diagram
     *
     * @param {Object}  localStorage        for getting and setting settings
     * @param {Object}  $http               for get requests to back-end
     * @param {Object}  Uri                 for resolving query address
     * @param {Object}  control             contains viewer and overlays
     * @param {Object}  processDiagram      BPMN diagram with elements
     * @param {Object}  util                this file containing util functions
     */
    setCounters: function(localStorage, $http, Uri, control, processDiagram, util) {
        var viewer = control.getViewer();
        var overlays = viewer.get('overlays');
        var elementRegistry = viewer.get('elementRegistry');

        util.commonOverlays.clearOverlays(overlays, util.overlayIds);

        if(!util.commonOptions.isSelectedVariable(localStorage, util.procDefId + "_KPI_Counter")) {
          return;
        }

        $http.get(Uri.appUri("plugin://centaur/:engine/execution-sequence-counter"))
            .success(function(data) {
                elementRegistry.forEach(function(shape) {
                    var element = processDiagram.bpmnElements[shape.businessObject.id];
                    if(element.$type !== 'bpmn:CallActivity') return;
                    util.setCounter(data, element, localStorage, overlays, util);
                });
            });
    },

    /**
     * Sets counter for one specific call activity element
     *
     * @param {Array}   data            contains elements with activityId and counter
     * @param {Object}  element         process diagram element
     * @param {Object}  localStorage    for setting offset
     * @param {Object}  overlays        to add counter overlay
     * @param {Object}  util            util object with functions
     */
    setCounter(data, element, localStorage, overlays, util) {
        var obj = {};

        data.forEach(function(el) {
            if (el.activityId === element.id && el.counter > 0) {
                if(el.name === 'nrOfInstances') {
                    obj.sequenceCounter = el.counter;
                } else if(el.name === 'nrOfCompletedInstances') {
                    obj.completedCounter = el.counter;
                }
            }
        });

        if(Object.keys(obj).length) {
            util.addOverlay(localStorage, util, overlays, obj, element.id);
        }
    },

    /**
    * Combines all information of given process into single
    * String variable which is added to its diagram element.
    *
    * @param   {Object}  localStorage              contains offset settings
    * @param   {Object}  util                      object of this class, to call its functions and variables
    * @param   {Object}  overlays                  collection of overlays to add to
    * @param   {Number}  counters                  number of processes called
    * @param   {Number}  elementID                 ID of element
    */
    addOverlay: function(localStorage, util, overlays, counters, elementID) {
        var html = util.createHTML(counters);
        util.overlayIds.push(util.commonOverlays.addTextElement(overlays, elementID, html, -20, 50));
        util.commonOverlays.setOffset(html, localStorage, util.procDefId + "_" + elementID + "_counter");
        util.commonOverlays.addDraggableFunctionality(localStorage, util.procDefId + "_" + elementID + "_counter", elementID, html);
    },


    /**
    * Creates an HTML line with has a class that includes the elementID
    *
    * @param   {Object}  counters       o
    * @return  {Object}                 A string which represents an HTML line which will be added later
    */
    createHTML: function (counters) {
        var html = document.createElement('DIV');

        html.classList.add("custom-overlay", "counter-text");
        var ul = document.createElement('UL');

        if(counters.sequenceCounter !== undefined) {
            var li1 = document.createElement('LI');
            li1.innerHTML = "<b>Counter: </b>" + counters.sequenceCounter;
            ul.appendChild(li1);
        }
        if(counters.completedCounter !== undefined) {
            var li2 = document.createElement('LI');
            li2.innerHTML = "<b>Completed: </b>" + counters.completedCounter;
            ul.appendChild(li2);
        }

        html.appendChild(ul);

        return html;
    }
});
