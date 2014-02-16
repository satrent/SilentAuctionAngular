'use strict';


/* Controllers */
var app = angular.module('admin');

app.controller('AuthController', ['$scope', '$http', '$window', '$location',
  function($scope, $http, $window, $location) {

    $scope.login = function() {
      var login = {userName: $scope.userName, password: $scope.password};
      $http.post('authenticate', JSON.stringify(login), {'Content-Type': 'application/json'}).success(function(data){
        $window.localStorage.token = data.token;
        $window.localStorage.userName = $scope.userName;
        $location.path('/');
      })
        .error(function(){
          $scope.message = 'login failed.';
        });
    };
  }
]);


app.controller('AdminItemListController', ['$scope', '$http',
  function($scope, $http) {
    $http.get('api/items').success(function(data){
      $scope.items = data;
    })

    $scope.gotoDetails = function(id){
      document.location = "#/item/" + id;
    };
  }
]);

app.controller('AdminItemDetailController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
  $http.get('api/item/' + $routeParams.id).success(function(data){
    $scope.item = data;
  });

  $scope.updateItem = function() {
    console.log($scope.item.StartDate);
    console.log($scope.item.EndDate);
    $http.post('api/item', JSON.stringify($scope.item), {'Content-Type': 'application/json'}).success(function(data){
    });
  };
}]);
