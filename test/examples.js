var notjs = require('../not');
require('chai').should();

describe('the first functional example in the readme', function() {
  it('should run and produce correct html', function() {
  
    var first = function() { //Export a plain js function
      h1; $($scope.title); $h1 //Write your tags, seperated by semicolons if on the same line
      ul({class: 'un-list'}) //Pass attributes by calling the tag
      for ($scope.scratch in $scope.items) {
        if ($scope.items.hasOwnProperty($scope.scratch)) { //Do logic wherever
        
          li.item //Chain classes off tags
            $('Item: '+$scope.items[$scope.scratch]) //Write text nodes with $
          $li
          
        }
      }
      $ul //Write close nodes by ending the tag with a $
    };
    
    var res = notjs.renderFunc(first, {title: 'Yes', items: ['Foo', 'Bar']});
    res.should.be.equal('<h1>Yes</h1><ul class="un-list"><li class="item">Item: Foo</li><li class="item">Item: Bar</li></ul>')
  });
});

describe('the second functional example in the readme', function() {
  it('should run and produce correct html', function(done) {
    this.timeout(5000);
    
    var http = require('http');
    var Promise = require('promise');

    var explicitExample = function(scope) {
      var context = notjs.create();

      var promise = new Promise(function(resolve, reject) {
        http.get('http://www.github.com', function(cli) {
          var sink = '';
          cli.on('data', function(data) {
            sink += data;
          });
          cli.on('end', function() {
            context(scope).$(sink, true); //One statement, don't bother actually making a context

            resolve(context.collect());
          });
          cli.on('error', function(e) {
            scope.error = JSON.parse(e);
            with (context(scope)) { //Make a context
              html
                head
                  meta({title: $scope.error})
                $head
                body
                  $($scope.error);
                $body
              $html
            }

            resolve(context.collect());
          });
        });
      });

      return promise; //For your convenience, the renderPath function will handle promises
    };
    
    explicitExample({}).then(function(data) {
      data.should.not.be.null; //I just realized that testing 'should look like the github homepage' is hard
      done();
    });
  });
});

describe('the third functional example in the readme', function() {
  it('should run and produce correct html', function(done) {
    this.timeout(5000);
    
    var implicitExample = function() {
      $scope.promise = new $scope.Promise(function(resolve, reject) {
        $scope.http.get('http://www.github.com', function(cli) {
          $scope.sink = '';
          cli.on('data', function(data) {
              $scope.sink += data;
          });
          cli.on('end', function() {
              $($scope.sink, true);
              $scope.log('Wrote result.')
              resolve(); //The return value of implied functions isn't actually used
          });
          cli.on('error', function(e) {
            $scope.error = $scope.JSON.parse(e);
            html
              head
                meta({title: $scope.error})
              $head
              body
                $($scope.error);
              $body
            $html
            resolve();
          });
        });
      });
      
      return $scope.promise;
    };
  
    var result = notjs.renderFunc(implicitExample, {
      Promise: require('promise'),
      http: require('http'),
      log: console.log,
      JSON: JSON
    });
    result.then(function() {
      var data = result.proxy.collect();
      data.should.not.be.null; //I just realized that testing 'should look like the github homepage' is hard
      done();
    });
  });
});