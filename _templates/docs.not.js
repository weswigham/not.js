module.exports = function() {
  $scope.link = 'docs.html';
  -using('content');
    div.container  
      div.jumbotron
        h1['text-center']
          $('Checkout the '); a({href: 'https://github.com/weswigham/not.js/blob/master/README.md'}); $('README'); $a; $(' for usage details.');
        $h1
      $div
    $div;
  -include('_layouts/nav.not.js');
};