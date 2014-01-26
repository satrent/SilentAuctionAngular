'use strict';

/* Controllers */

var silentAuctionControllers = angular.module('silentAuctionControllers', []);

silentAuctionControllers.controller('ItemListController', ['$scope', '$http',
  function($scope, $http) {
    $http.get('http://localhost:8887/api/items').success(function(data) {
      $scope.items = data;
    });
  }]);

silentAuctionControllers.controller('ItemDetailController', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $http.get('http://localhost:8887/api/item/' + $routeParams.lotId).success(function(data) {
      $scope.item = data;
    });
  }]);
