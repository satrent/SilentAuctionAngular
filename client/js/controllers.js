'use strict';

/* Controllers */

var silentAuctionControllers = angular.module('silentAuctionControllers', []);

silentAuctionControllers.controller('ItemListController', ['$scope', '$http',
  function($scope, $http) {
    $http.get('http://localhost:8887/api/items').success(function(data) {
      $scope.items = data;
    });

    $scope.gotoDetails = function(id){
      document.location = "#/item/" + id;
    };
  }]);

silentAuctionControllers.controller('ItemDetailController', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    //$http.get('http://localhost:8887/api/item/' + $routeParams.lotId).success(function(data) {
    //  $scope.item = data;
    //});
  }
]);

var auctionAdminControllers = angular.module('auctionAdminControllers', []);

auctionAdminControllers.controller('AdminItemListController', ['$scope', '$http',
  function($scope, $http) {
    $http.get('http://localhost:8887/api/items').success(function(data){
      $scope.items = data;
    })

    $scope.gotoDetails = function(id){
      document.location = "#/item/" + id;
    };

  } 
]);

auctionAdminControllers.controller('AdminItemDetailsController', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {

    $http.get('http://localhost:8887/api/item/' + $routeParams.itemId).success(function(data) {
      $scope.item = data;
    });

    $scope.updateItem = function() {
      console.log($scope.item);
      $http.post('http://localhost:8887/api/item', JSON.stringify($scope.item), {'Content-Type': 'application/json'}).success(function(data){
      });
    };

  } 
]);


auctionAdminControllers.controller('AdminItemNewController', ['$scope', '$http',
  function($scope, $http) {

    $scope.item = {Id: -1,
          Title: '',
          Description: '',
          StartDate: '',
          EndDate: '',
          DonatedBy: '',
          DontaedLink: ''
    };

    $scope.addItem = function() {
      console.log($scope.item);
      $http.post('http://localhost:8887/api/item', JSON.stringify($scope.item), {'Content-Type': 'application/json'}).success(function(res){
        
        console.log('valid? ' + $scope.itemForm.$valid);


        if (res.Result) {
          $scope.message = 'new item saved';

          $scope.item = {Id: -1,
                Title: '',
                Description: '',
                StartDate: '',
                EndDate: '',
                DonatedBy: '',
                DontaedLink: ''
          };
        } else {
          $scope.message = res.message;
        }

        console.log(res);

      });
    };

  } 
]);


