define(['angular',
    'jquery'], function(angular) {

    var DashboardController = ["$scope", "$http", "Uri", function($scope, $http, Uri) {

        console.log("Loaded");

    }];

    var Configuration = [ 'ViewsProvider', function(ViewsProvider) {
        ViewsProvider.registerDefaultView('cockpit.dashboard', {
            id: 'process-definitions12',
            label: 'Deployed Processes',
            url: 'plugin://sample-plugin/static/app/temp/dashboard.html',
            controller: DashboardController,
            // make sure we have a higher priority than the default plugin
            priority: 12
        });
    }];

var ngModule = angular.module('cockpit.plugin.sample-plugin.temp.defin', []);

ngModule.config(Configuration);

return ngModule;
});