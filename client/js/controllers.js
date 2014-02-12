'use strict';

/* Controllers */
var silentAuctionControllers = angular.module('silentAuctionControllers', []);


silentAuctionControllers.controller('AuthController', ['$scope', '$http', '$window', '$location',
  function($scope, $http, $window, $location) {

      $scope.login = function() {
        var login = {userName: $scope.userName, password: $scope.password};
        $http.post('http://localhost:8887/authenticate', JSON.stringify(login), {'Content-Type': 'application/json'}).success(function(data){
            $window.localStorage.token = data.token;
            $window.localStorage.userName = $scope.userName;
            $location.path('/');
        })
          .error(function(){
            $scope.message = 'login failed.';
          });
      };
  }
])

silentAuctionControllers.controller('ItemListController', ['$scope', '$http',
    function($scope, $http) {
        $http.get('api/items')
            .success(function (data, status, headers, config) {
                 $scope.items = data;
            })
            .error(function(e){console.log(e);});

        $scope.gotoDetails = function(id){
            document.location = "#/item/" + id;
        };
    }
]);

silentAuctionControllers.controller('ItemDetailController', ['$scope', '$routeParams', '$http', '$window',
  function($scope, $routeParams, $http, $window) {
    $http.get('api/item/' + $routeParams.itemId).success(function(data) {
      $scope.item = data;
    });

    $scope.makeBid = function() {
      $http.post('api/bid', JSON.stringify({itemId: $scope.item.Id,
                                          amount: $scope.newBidAmount,
                                          userName: $window.localStorage.userName}),
                            {'Content-Type': 'application/json'}
      ).success(function(data, status, header, config){
          $scope.bidResponse = data;
      })
        .error(function(data, status, headers, config ){
        console.log(data);
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
      $http.post('http://localhost:8887/api/item', JSON.stringify($scope.item), {'Content-Type': 'application/json'}).success(function(res){
        
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

      });
    };

  } 
]);


