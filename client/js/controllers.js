'use strict';

/* Controllers */
var silentAuctionControllers = angular.module('silentAuctionControllers', []);


silentAuctionControllers.controller('AuthController', ['$scope', '$http', '$window',
  function($scope, $http, $window) {

      $scope.login = function() {
          var login = {username: $scope.userName,
          password: $scope.password};
        $http.post('http://localhost:8887/authenticate', JSON.stringify(login), {'Content-Type': 'application/json'}).success(function(data){
          $window.localStorage.token = data.token;
        });
      };

  }
])

silentAuctionControllers.controller('ItemListController', ['$scope', '$http',
    function($scope, $http) {
        $http.get('http://localhost:8887/api/items')
            .success(function (data, status, headers, config) {
                console.log('inside the success?');
                 $scope.items = data;
            })
            .error(function(e){console.log(e);});

        $scope.gotoDetails = function(id){
            document.location = "#/item/" + id;
        };
    }
]);

silentAuctionControllers.controller('ItemDetailController', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $http.get('http://localhost:8887/api/item/' + $routeParams.itemId).success(function(data) {
      $scope.item = data;
    });

    $scope.makeBid = function() {
        $http.post('http://localhost:8887/api/bid', JSON.stringify({ItemId: $scope.item.Id, Amount: $scope.newBidAmount, UserName: 'Trent'}), {'Content-Type': 'application/json'}).success(function(data){

        });
    };
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


