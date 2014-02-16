'use strict';

/* Controllers */
var app = angular.module('adminControllers', []);

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
])


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

//app.controller('AdminItemDetailsController', ['$scope', '$routeParams', '$http',
//  function($scope, $routeParams, $http) {
//
//    $http.get('api/item/' + $routeParams.itemId).success(function(data) {
//      $scope.item = data;
//    });
//
//    $scope.updateItem = function() {
//      $http.post('api/item', JSON.stringify($scope.item), {'Content-Type': 'application/json'}).success(function(data){
//      });
//    };
//  }
//]);
//
//
//
//app.controller('AdminItemNewController', ['$scope', '$http',
//  function($scope, $http) {
//
//    $scope.item = {Id: -1,
//          Title: '',
//          Description: '',
//          StartDate: '',
//          EndDate: '',
//          DonatedBy: '',
//          DontaedLink: ''
//    };
//
//    $scope.addItem = function() {
//      $http.post('api/item', JSON.stringify($scope.item), {'Content-Type': 'application/json'}).success(function(res){
//
//        if (res.Result) {
//          $scope.message = 'new item saved';
//
//          $scope.item = {Id: -1,
//                Title: '',
//                Description: '',
//                StartDate: '',
//                EndDate: '',
//                DonatedBy: '',
//                DontaedLink: ''
//          };
//        } else {
//          $scope.message = res.message;
//        }
//
//      });
//    };
//
//  }
//]);


