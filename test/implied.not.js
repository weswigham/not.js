module.exports = function() {

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
};