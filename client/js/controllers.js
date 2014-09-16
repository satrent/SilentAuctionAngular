'use strict';

/* Controllers */
var silentAuctionControllers = angular.module('silentAuctionControllers', []);


silentAuctionControllers.controller('AuthController', ['$scope', '$http', '$window', '$location', '$rootScope',
  function($scope, $http, $window, $location, $rootScope) {
    $scope.domain = '';

    $http.get('/domain', {'Content-Type': 'application/json'})
      .success(function(data) {
        $scope.domain = data.domain;
      });

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
]);

silentAuctionControllers.controller('ActivateController', ['$scope', '$http', '$location', function($scope, $http, $location) {

  var user = {userName: $location.search().username, activationKey: $location.search().key};

  $scope.activate = {};

  $http.post('/activate', JSON.stringify({user: user}), {'Content-Type': 'application/json'})
    .success(function(data) {
      $scope.activate.message = "your account has been activated.";
    })
    .error(function(){
      $scope.activate.message = 'sorry... something went wrong.';
    })

}]);


silentAuctionControllers.controller('RegisterController', ['$scope', '$http', '$location', function($scope, $http, $location){

  $scope.userData = {
    userName: '',
    password: '',
    password2: ''
  };

  $scope.domain = '';

  $http.get('/domain', {'Content-Type': 'application/json'})
    .success(function(data) {
      $scope.domain = data.domain;
    });

  $scope.register = function(){
    if ($scope.userData.password != $scope.userData.password2) {
      $scope.message = 'passwords do not match';
      return;
    }

    var user = {
      userName: $scope.userData.userName.toLowerCase(),
      password: $scope.userData.password,
      email: $scope.userData.userName.toLowerCase() + '@porticobenefits.org',
      isAdmin: false
    };

    $http.post('/register', JSON.stringify({user: user}), {'Content-Type': 'application/json'})
      .success(function(data){

        if (data.result) {
          $scope.message = 'registration successful. Please check your email to activate your account.';
        } else {
          $scope.message = data.messages.errors.join(" ");
        }
      })
      .error(function(){
        $scope.message = 'register failed.';
      });
  }

}])

silentAuctionControllers.controller('ItemListController', ['$scope', '$http', '$location',
  function($scope, $http, $location) {

    $http.get('api/items')
        .success(function (data, status, headers, config) {

          angular.forEach(data, function(item){
            if (item.images && item.images.length > 0) {
              item.imageName = item.images[0];
            }

            if (item.bids && item.bids.length > 0){
                item.highBid = item.bids[item.bids.length - 1].amount;
                item.highBidUserName = item.bids[item.bids.length - 1].userName;
                $scope.newBidAmount = item.highBid + 1;
              } else {
                $scope.newBidAmount = item.minimumBid + 1;
            }
          })

          $scope.items = data;
        })
        .error(function(e){console.log(e);});

    $scope.gotoDetails = function(id){
        $location.path('item/' + id).replace();
    };

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

          if (item.bids && item.bids.length > 0){
              item.highBid = item.bids[item.bids.length - 1].amount;
              item.highBidUsername = item.bids[item.bids.length - 1].userName;
          }
        })

        $scope.items = data;
      })
      .error(function(e){console.log(e);});

  }
]);

silentAuctionControllers.controller('UpcomingListController', ['$scope', '$http',
  function($scope, $http) {

    $http.get('api/upcoming')
    .success(function (data, status, headers, config) {

      angular.forEach(data, function(item){
        if (item.images && item.images.length > 0){
          item.imageName = item.images[0];
        }
      })

      $scope.items = data;
    })
    .error(function(e){console.log(e);});

  }
]);


silentAuctionControllers.controller('headerCtrl', ['$scope', '$window', '$location', '$rootScope', '$http', '$timeout', function($scope, $window, $location, $rootScope, $http, $timeout){

  $scope.systemTime = Date.now();
  $scope.tickInterval = 1000 //ms

  var tick = function() {
      $scope.systemTime = Date.now();
      $timeout(tick, $scope.tickInterval); // reset the timer
  }

  $timeout(tick, $scope.tickInterval);

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

silentAuctionControllers.controller('DashboardController', ['$scope', '$http', '$window', function($scope, $http, $window){

  // TODO - redirect to login if not logged in.


  var user = $window.localStorage.userName;

  $http.get('/api/myBids/' + user).success(function(data){
    $scope.data = data;
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
        data.highBidUserName = data.bids[data.bids.length - 1].userName;
        $scope.newBidAmount = data.highBid + 1;
      } else {
        $scope.newBidAmount = parseInt(data.MinimumBid) + 1;
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

          if ($scope.bidResponse.result) {
            $scope.item.highBid = $scope.newBidAmount;
            $scope.item.highBidder = $window.localStorage.userName;
          }
      })
        .error(function(data, status, headers, config ){
        console.log(data);
      });
    };
  }
]);
