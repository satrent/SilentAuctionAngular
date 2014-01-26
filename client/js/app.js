'use strict';

/* App Module */

var silentAuctionApp = angular.module('silentAuctionApp', [
  'ngRoute',
  'silentAuctionControllers'
]);

silentAuctionApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/items-all.html',
        controller: 'ItemListController'
      }).
      when('/item/:lotId', {
        templateUrl: 'partials/item-detail.html',
        controller: 'ItemDetailController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
