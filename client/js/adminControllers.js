'use strict';

var app = angular.module('admin');  // don't add dependencies here.  Add them to the adminApp.js

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

  if ($routeParams.id == 'new') {
   var m = moment();
    var item = {
      Id: -1,
      StartDate: new Date(m.year(), m.month(), m.date(), 10 + (m.zone() / 60), 0, 0),
      EndDate: new Date(m.year(), m.month(), m.date(), 15 + (m.zone() / 60), 0, 0)
    }

    $scope.item = item;

  } else {
    $http.get('api/item/' + $routeParams.id).success(function(data){
      $scope.item = data;
    });
  }

  $scope.fileMessage = 'no message';

  $scope.updateItem = function() {
    $http.post('api/item', JSON.stringify($scope.item), {'Content-Type': 'application/json'}).success(function(data){
      $scope.message = "item updated."
    });
  };

  $scope.uploadFile = function(files) {
    var fd = new FormData();
    fd.append("file", files[0]);
    fd.append("itemId", $scope.item.Id);

    $http.post('images', fd, {
      withCredentials: true,
      headers: {'Content-Type': undefined },
      transformRequest: angular.identity
    }).success(
        function() {
          $scope.fileMessage = 'file uploaded successfully.';
        }
      ).error(
        function() {
          $scope.fileMessage = 'something went wrong.';
        }
      );
  };

}]);
