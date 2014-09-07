module.exports = function() {
  html
    head
      meta({charset: 'utf-8'})
      meta({'http-equiv': 'X-UA-Compatible', content: 'IE=edge'})
      meta({name: 'viewport', content: 'width=device-width, initial-scale=1'})
      
      link({rel: 'stylesheet', href: 'assets/lib/bootstrap/css/bootstrap.min.css'})
      link({rel: 'stylesheet', href: 'assets/lib/bootstrap/css/bootstrap-theme.min.css'})
      link({rel: 'stylesheet', href: 'assets/css/main.css'})
      if ($scope.stylesheets) {
        for (var i in $scope.stylesheets) {
          link({rel: 'stylesheet', href: $scope.stylesheets[i]})
        }
      }
      
      title; $($scope.title || $scope.sitename); $title
    $head
    body
      $($scope.body, true);
      
      -script('https://code.jquery.com/jquery-2.1.1.min.js');
      -script('assets/lib/bootstrap/js/bootstrap.min.js');
      if ($scope.scripts) {
        for (var i in $scope.scripts) {
          -script($scope.scripts[i]);
        }
      }
    $body
  $html
}