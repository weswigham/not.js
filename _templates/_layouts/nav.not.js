module.exports = function() {
  -using('body')
    nav.navbar['navbar-default']({role: 'navigation'})
      div['container-fluid']
        div['navbar-header']
          button({type: 'button'})['navbar-toggle'].collapsed({data: {toggle: 'collapse', target: '#collapsing-bar'}})
            span['sr-only']; $('Toggle-navigation'); $span;
            span['icon-bar']; $span;
            span['icon-bar']; $span;
            span['icon-bar']; $span;
          $button
          a['navbar-brand']({href: '/'}); $('Not.js'); $a; //Todo: Logo
        $div
        
        div.collapse['navbar-collapse']({id: 'collapsing-bar'})
          ul.nav['navbar-nav']
            if ($scope.navpages) {
              for (var i=0; i<$scope.navpages.length; i++) {
                var page = $scope.navpages[i];
                li[page.link === $scope.link ? 'active' : '']; a({href: page.link}); $(page.name); $a; $li;
              }
            }
          $ul
        $div
      $div
    $nav
    
    $($scope.content, true);
  
    nav.navbar['navbar-default']['navbar-fixed-bottom']({role: 'navigation'})
      div.container
        p['navbar-text']; $('Not.js is maintained by '); a({href: 'http://ham.io'}); $('weswigham'); $a; $p;
  
        p['navbar-text']['navbar-right']
          $('Want more examples? Check out '); a({href: 'https://github.com/weswigham/not.js/tree/gh-pages'}); $('this site'); $a; $('!')
        $p
      $div
    $nav;
  
  -include('main.not.js')
}