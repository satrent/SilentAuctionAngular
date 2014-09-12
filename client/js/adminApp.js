'use strict';

/* App Module */

var app = angular.module('admin', ['ngRoute', 'directives']);

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


app.config(['$routeProvider', '$httpProvider',
    function($routeProvider, $httpProvider) {
        $routeProvider.
          when('/', {
            templateUrl: '/partials/admin/items.html',
            controller: 'AdminItemListController'
          }).
          when('/item/:id', {
            templateUrl: '/partials/admin/item-detail.html',
            controller: 'AdminItemDetailController'
          }).
          otherwise({
            redirectTo: '/'
          });

        $httpProvider.interceptors.push('authInterceptor');
    }
]);



app.directive('input', function () {
  return {
    require: '?ngModel',
    restrict: 'E',
    link: function (scope, element, attrs, ngModel) {
      if ( attrs.type="date" && ngModel ) {
        element.bind('change', function () {
          scope.$apply(function() {
            ngModel.$setViewValue(element.val());
          });
        });
      }
    }
  };
});
