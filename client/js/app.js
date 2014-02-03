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
      when('/item/:itemId', {
        templateUrl: 'partials/item-detail.html',
        controller: 'ItemDetailController'
      }).
      when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'AuthController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }
]);

var auctionAdminApp = angular.module('auctionAdminApp', [
  'ngRoute', 
  'auctionAdminControllers'
]);

auctionAdminApp.config(['$routeProvider', 
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/admin/items.html',
        controller: 'AdminItemListController'
      }).
      when('/item/new', {
        templateUrl: 'partials/admin/item-new.html',
        controller: 'AdminItemNewController'
      }).
      when('/item/:itemId', {
        templateUrl: 'partials/admin/item-detail.html',
        controller: 'AdminItemDetailsController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }
]);

