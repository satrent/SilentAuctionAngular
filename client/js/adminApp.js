'use strict';

/* App Module */

var app = angular.module('admin', ['ngRoute', 'adminControllers']);

app.factory('authInterceptor', function ($rootScope, $q, $window, $location) {
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


app.config(['$routeProvider','$httpProvider',
    function($routeProvider, $httpProvider) {
        $routeProvider.
          when('/', {
            templateUrl: '/partials/admin/items.html',
            controller: 'AdminItemListController'
          }).
          when('/login', {
            templateUrl: '/partials/login.html',
            controller: 'AuthController'
          }).
          otherwise({
            redirectTo: '/'
          });

        $httpProvider.interceptors.push('authInterceptor');
    }
]);
