'use strict';

/* App Module */

var silentAuctionApp = angular.module('silentAuctionApp', [
  'ngRoute',
  'silentAuctionControllers'
]);


silentAuctionApp.factory('authInterceptor', function ($rootScope, $q, $window, $location) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.localStorage.token) {
              config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
            }
            return config;
        },
        response: function (response) {
            if (response.status >= 400) {
              $location.path("/#/login");
            }
            return response || $q.when(response);
        }
    };
});


silentAuctionApp.config(['$routeProvider','$httpProvider',
    function($routeProvider, $httpProvider) {
        $routeProvider.
          when('/', {
            templateUrl: '/partials/items-all.html',
            controller: 'ItemListController'
          }).
          when('/item/:itemId', {
            templateUrl: '/partials/item-detail.html',
            controller: 'ItemDetailController'
          }).
          when('/login', {
            templateUrl: '/partials/login.html',
            controller: 'AuthController'
          }).
          when('/register', {
            templateUrl: '/partials/register.html',
            controller: 'RegisterController'
          }).
          when('/activate', {
            templateUrl: '/partials/activate.html',
            controller: 'ActivateController'
          }).
          when('/closed', {
            templateUrl: '/partials/items-closed.html',
            controller: 'ClosedListController'
          }).
          when('/dashboard', {
            templateUrl: '/partials/my-bids.html',
            controller: 'DashboardController'
          }).
          otherwise({
            redirectTo: '/'
          });

        $httpProvider.interceptors.push('authInterceptor');

    }
]);
