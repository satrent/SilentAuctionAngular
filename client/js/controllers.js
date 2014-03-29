'use strict';

/* Controllers */
var silentAuctionControllers = angular.module('silentAuctionControllers', []);


silentAuctionControllers.controller('AuthController', ['$scope', '$http', '$window', '$location', '$rootScope',
  function($scope, $http, $window, $location, $rootScope) {

    $scope.login = function() {
      var login = {userName: $scope.userName, password: $scope.password};
      $http.post('/authenticate', JSON.stringify(login), {'Content-Type': 'application/json'}).success(function(data){
        $window.localStorage.token = data.token;
        $window.localStorage.userName = $scope.userName;
        $rootScope.$broadcast('login', []);
        $location.path('/');
      })
        .error(function(){
          $scope.message = 'login failed.';
        });
    };

    $scope.$on('loutout', function(event, date){$scope.userName = '';});

  }
])

silentAuctionControllers.controller('RegisterController', ['$scope', '$http', '$location', function($scope, $http, $location){

  $scope.userData = {
    userName: '',
    password: '',
    password2: '',
    email: '',
  };


  $scope.register = function(){
    if ($scope.userData.password != $scope.userData.password2) {
      $scope.message = 'passwords do not match, homie'; 
      return;
    }

    var user = {
      userName: $scope.userData.userName,
      password: $scope.userData.password,
      email: $scope.userData.email,
      isAdmin: false,

    };

    $http.post('/register', JSON.stringify({user: user}), {'Content-Type': 'application/json'})
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

          angular.forEach(data, function(item){
            if (item.images && item.images.length > 0) {
              item.imageName = item.images[0];
            }
          })

          $scope.items = data;
        })
        .error(function(e){console.log(e);});

    $scope.gotoDetails = function(id){
        document.location = "#/item/" + id;
    };

    $scope.addItem = function(){
      $scope.items.push({Title: 'new item', Description: 'we are cool'});
    }


  }
]);

silentAuctionControllers.controller('ClosedListController', ['$scope', '$http',
  function($scope, $http) {

    $http.get('api/closed')
      .success(function (data, status, headers, config) {

        angular.forEach(data, function(item){
          if (item.images && item.images.length > 0) {
            item.imageName = item.images[0];
          }
        })

        $scope.items = data;
      })
      .error(function(e){console.log(e);});

  }
]);


silentAuctionControllers.controller('headerCtrl', ['$scope', '$window', '$location', '$rootScope', '$http', function($scope, $window, $location, $rootScope, $http){
  $scope.loggedIn = false;

  var _checkStatus = function() {
    if ($window.localStorage.userName) {
      $scope.loggedIn = true;
      $scope.userName = $window.localStorage.userName;
    }
  }

  $http.get('/api/items/totalRaised').success(function(data) {
    $scope.totalRaised = data.total;
  });

  _checkStatus();

  $scope.$on('login', function(event, date){_checkStatus();});

  $scope.logout = function() {
    $window.localStorage.userName = '';
    $window.localStorage.token = {};
    $scope.loggedIn = false;
    $rootScope.$broadcast('logout', []);
    $location.path('/login');
  }

}])

silentAuctionControllers.controller('DashboardController', ['$scope', '$http', function($scope, $http){

  $http.get('/api/myBids').success(function(data){
    $scope.bids = data;
  })

}])

silentAuctionControllers.controller('ItemDetailController', ['$scope', '$routeParams', '$http', '$window',
  function($scope, $routeParams, $http, $window) {
    $http.get('api/item/' + $routeParams.itemId).success(function(data) {

      if (data.images && data.images.length > 0) {
        data.imageName = data.images[0];
      }

      if (data.bids && data.bids.length > 0){
        data.highBid = data.bids[data.bids.length - 1].amount;
      }

      $scope.item = data;
      if (data.images && data.images.length > 0) {
        $scope.mainImage = data.images[0];
      }
    });

    $scope.switchImage = function(i){
      $scope.mainImage = $scope.item.images[i];
    }

    $scope.makeBid = function() {
      $http.post('api/bid', JSON.stringify({itemId: $scope.item._id,
                                          amount: $scope.newBidAmount,
                                          userName: $window.localStorage.userName}),
                            {'Content-Type': 'application/json'}
      ).success(function(data, status, header, config){
          $scope.bidResponse = data;

          if (!$scope.bidResponse.error) {
            $scope.item.highBid = $scope.newBidAmount;
          }
      })
        .error(function(data, status, headers, config ){
        console.log(data);
      });
    };
  }
]);
