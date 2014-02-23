'use strict';

angular.module('directives', [])
  .directive('dateSelects', [function(){

    return {
      templateUrl: '/templates/dateSelectsTemplate.html',
      restrict: 'A',
      replace: true,
      scope: {
        selectDate: '='
      },
      link: function(scope, e, a, c) {

        setTimeout(function(){
          var m = moment(scope.selectDate);
          m = m.add('minutes', (m.zone() * -1));

          scope.selectedMonth = m.month();
          scope.selectedDay = m.date();
          scope.selectedYear = m.year();
          scope.selectedHour = m.hour();
          scope.$apply();
        }, 200);


        var updateDate = function(){
          if (!scope.selectDate) return;

          var dateObj = new Date(scope.selectedYear, (scope.selectedMonth), scope.selectedDay, scope.selectedHour, 0, 0);
          var newDate = dateObj.toJSON();
          scope.selectDate = newDate;
        }

        scope.$watch('selectedMonth', function(a, b){
          updateDate();
        });

        scope.$watch('selectedDay', function(a, b){
          updateDate();
        });

        scope.$watch('selectedYear', function(a, b){
          updateDate();
        });

        scope.$watch('selectedHour', function(a, b){
          updateDate();
        })

        scope.months = [{value: 0, name: 'January'},
          {value: 1, name: 'February'},
          {value: 2, name: 'March'},
          {value: 3, name: 'April'},
          {value: 4, name: 'May'},
          {value: 5, name: 'June'},
          {value: 6, name: 'July'},
          {value: 7, name: 'August'},
          {value: 8, name: 'September'},
          {value: 9, name: 'October'},
          {value: 10, name: 'November'},
          {value: 11, name: 'December'}
        ];

        scope.days = [];

        var totalDays = moment(scope.selectDate).daysInMonth();
        var i = 1
        while(i <= totalDays){
          scope.days.push(i);
          i += 1;
        }

        scope.years = [2013, 2014, 2015];

        scope.hours = [
          {value:8, name: "8am"},
          {value:9, name: "9am"},
          {value:10, name: "10am"},
          {value:11, name: "11am"},
          {value:12, name: "12pm"},
          {value:13, name: "1pm"},
          {value:14, name: "2pm"},
          {value:15, name: "3pm"},
          {value:16, name: "4pm"},
          {value:17, name: "5pm"}
        ];

      }
    }
  }]);