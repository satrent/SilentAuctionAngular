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

silentAuctionControllers.controller('RegisterController', ['$scope', '$http', '$location', function($scope, $http, $location){

  $scope.userData = {
    userName: '',
    password: '',
    password2: '',
    email: ''
  };


  $scope.register = function(){
    console.log($scope.userData);

    $http.post('http://localhost:8889/register', JSON.stringify($scope.userData), {'Content-Type': 'application/json'})
      .success(function(data){
        $location.path('/login');
      })
      .error(function(){
        $scope.message = 'register failed.';
      });

  }

}])

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
