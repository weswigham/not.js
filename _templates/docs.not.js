module.exports = function() {
  $scope.link = 'docs.html';
  -using('content');
    div.container  
      div.jumbotron
        h1['text-center']
          $('Proper API references are coming soon! In the meantime, checkout the '); a({href: 'https://github.com/weswigham/not.js/blob/master/README.md'}); $('README'); $a;
        $h1
      $div
    $div;
  -include('_layouts/nav.not.js');
};