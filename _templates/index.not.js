module.exports = function() {
  $scope.scripts.push("assets/js/lib/not.js");
  $scope.scripts.push("assets/lib/codemirror/codemirror.js");
  $scope.scripts.push("assets/lib/codemirror/mode/javascript.js");
  $scope.scripts.push("assets/lib/codemirror/mode/xml.js");
  $scope.scripts.push("assets/lib/codemirror/mode/css.js");
  $scope.scripts.push("assets/lib/codemirror/mode/htmlmixed.js");
  $scope.scripts.push("assets/lib/codemirror/util/formatting.js");
  $scope.stylesheets.push("assets/lib/codemirror/codemirror.css");
  $scope.scripts.push("assets/js/index.js");
  
  $scope.link = '/';
  
  -using('content');
  div.container
    h2['text-center'];
      $('It\'s all just javascript... but... not.');
    $h2;
    div.row.liveedit
      div['col-md-6']
        textarea({id: 'editor'})
          $(function() {/*
h1; $($scope.title); $h1
ul({class: 'un-list'})
  for (var index in $scope.items) {
    if ($scope.items.hasOwnProperty(index)) {
      li
        $('All the tags: '+$scope.items[index]);
      $li
    }
  }
$ul
          */})
        $textarea
      $div
      div['col-md-6']
        textarea({id: 'result-html'})
          $(function(){/*
<h1>It's javascript all the way down!
</h1>
<ul class="un-list">
  <li>All the tags: &lt;html&gt;
  </li>
  <li>All the tags: &lt;head&gt;
  </li>
  <li>All the tags: &lt;body&gt;
  </li>
  <li>All the tags: &lt;whatever&gt;
  </li>
</ul>            
          */})
        $textarea
      $div
    $div
    
    h6['text-center']; $('Try viewing this page in firefox, then you can play with the code live!'); $h6;
  $div;

  -include('_layouts/nav.not.js');
};