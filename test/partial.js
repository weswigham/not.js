var jshtml = require('../index');

module.exports = function(scope) {
  var context = jshtml.create(jshtml.string); //Get a dsl context object
  with(context(scope)) {
  
    h1; $($scope.title); $h1
    ul({class: "un-list"})
    for ($scope.scratch in $scope.items) {
      li
        $("Item: "+$scope.scratch)
      $li
    }
    $ul
    
  }
  return context.collect();
};