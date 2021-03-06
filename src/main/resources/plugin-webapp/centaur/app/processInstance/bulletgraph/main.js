define(['require', 'angular', '../../common/bulletlibraries', '../../common/conversion', '../../common/options', '../../common/overlays', '../../common/variables', '../../common/bulletgraph'], function (require, angular) {

    /**
     * retrieve the bullet file contains the D3 library and functions which are needed for the bullet graphs
     * from github: https://gist.github.com/mbostock/4061961#file-bullet-js (accessed 30-5-2018)
     * and D3 library: https://d3js.org/ (accessed 30-5-2018).
     */
    require('../../common/bulletlibraries');

    /**
     * retrieve the common util files
     */
    var util = require('../../common/bulletgraph');
    util.commonOptions  = require('../../common/options');
    util.commonConversion  = require('../../common/conversion');
    util.commonOverlays = require('../../common/overlays');

    /**
     * Overlay object that contains the elements put on the diagram
     */
    var overlay = ['$scope', '$http', '$window', 'Uri', 'control', 'processData', 'pageData', '$q', 'processDiagram',
        function ($scope, $http, $window, Uri, control, processData, pageData, $q, processDiagram) {
            util.procDefId  = $scope.$parent.processDefinition.id;

            var putBulletGraph = function() {
                util.bulletgraph(util, $http, $window.localStorage, Uri, $q, control, processDiagram);
            };
            putBulletGraph();

            util.commonOptions.register($scope, ["cockpit.plugin.centaur:options:KPI-change"], putBulletGraph);
        }
    ];

    /**
    * Configuration object that places plugin
    */
    var Configuration = ['ViewsProvider', function(ViewsProvider) {
        ViewsProvider.registerDefaultView('cockpit.processInstance.diagram.plugin', {
            id: 'runtime',
            priority: 30,
            label: 'Process Instances',
            overlay: overlay
        });
    }];

  var ngModule = angular.module('cockpit.plugin.centaur.processInstance.bulletgraph', []);

  ngModule.config(Configuration);

  return ngModule;
});
