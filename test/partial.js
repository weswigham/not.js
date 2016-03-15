var notjs = require('../not');

module.exports = function(scope) {
  var context = notjs.create(); //Get a dsl context object, let the string builder be implied
  with(context(scope)) {

    h1; $($scope.title); $h1
    ul({class: 'un-list'})
    for ($scope.scratch in $scope.items) {
      if ($scope.items.hasOwnProperty($scope.scratch)) {
        li
          $('Item: '+$scope.items[$scope.scratch])
        $li
      }
    }
    $ul

  }
  return context.collect();
};
