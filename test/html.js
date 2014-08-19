﻿var notjs = require('../index');
require('chai').should();

describe('the not.js html dsl', function() {
  it('is an intuitive, consice way of representing and creating html in javascript', function() {
  
    var context = notjs.create(notjs.string); //Get a dsl context object
    var scope = { //Make a scope to allow calling within the dsl
      partial: require('./partial.js'),
      impliedContext: notjs.prepareFunc(require('./implied.not.js')),
      paragraph: 'Paragraph content!!',
      sublayout: {
        title: 'Sublayout title!',
        items: ['Foo', 'Bar', 'Baz', 'Bat']
      }
    };
    //Call the context with the name you want the scope accessible by and the scope object itself
    //"$scope" is the default and may be omitted
    with (context('$scope', scope)) {
    
      //Any valid identifier is a used as a tag (with some exceptions, see below)
      html
        head
          
          //Set attributes by 'calling' the tag with them (does not function on closing tags, obviously)
          meta$({title: 'not.js wat?'}) //Identifiers ending with a $ are 'self-closing' tags
          
        $head //Identifiers starting with a $ are closing tags
        
        body({style: 'width: 100%;'})
        
          //Use the $ function to make a text node
          p; h1({style: 'text-align: right;'}); $('Title text'); $h1 //Semicolons allow for multiple tags on one line
          
            $($scope.paragraph) //Access scoped variables that won't be intercepted by the dsl using the specified name
          $p
          hr$
          p
            //Disable automatic escaping of text nodes, (this lets you use partials!)
            $('Unescaped html <strong> and such. </strong>', true)
          $p
          p //Built in easy multiline 'string' support (and newlines are auto replaced with 'br's if it's escaped)
            $(function() {/*
              Or long form
              for all the content.
            */})
          $p
          
          //Include plain js logic inline with your template!
          for ($scope.i=0; $scope.i<4; $scope.i++) {
            p
              $('I\'m number '+$scope.i+'!');
            $p
          }
          
          //And yes, including partials is a thing that's pretty simple, too
          $($scope.partial($scope.sublayout), true)
          
          $($scope.impliedContext($scope.sublayout), true)
        $body
      $html
    }
    context.collect().should.be.equal(
'<html><head><meta title=\"not.js wat?\" /></head><body style=\"width: 100%;\"><p><h1 style=\"text-align: right;\">Title '+
'text</h1>Paragraph content!!</p><hr /><p>Unescaped html <strong> and such. </strong></p><p>              Or long form<br'+
' />              for all the content.</p><p>I&#39;m number 0!</p><p>I&#39;m number 1!</p><p>I&#39;m number 2!</p><p>I&#3'+
'9;m number 3!</p><h1>Sublayout title!</h1><ul class=\"un-list\"><li>Item: Foo</li><li>Item: Bar</li><li>Item: Baz</li><li>Item'+
': Bat</li></ul><h1>Sublayout title!</h1><ul class=\"un-list\"><li>Item: Foo</li><li>Item: Bar</li><li>Item: Baz</li><li>Item: Bat</li></ul></body></html>'
    );
  });
  
  it('has a shorthand syntax where you pass any function and it\'s \'eval\'uated like a not.js-enabled function', function() {
    var scope = {
      content: 'body content'
    };
    var block = function() {
      html
        body
          $($scope.content)
        $body
      $html
    };
    
    var str = notjs.renderFunc(block, scope); //Takes a builder as a 3rd argument, defaults to string
    
    str.should.be.equal('<html><body>'+scope.content+'</body></html>');
  });
  
  it('can render a path a la express middleware', function(done) {
    var scope = { //Make a scope to allow calling within the dsl
      title: 'Title!',
      items: ['Foo', 'Bar', 'Baz', 'Bat']
    };
    
    var path = require('path').resolve('test', 'implied.not.js');
    notjs.renderPath(path, {scope: scope}, function(err, res) {
      if (err) throw err;
      res.should.be.equal('<h1>Title!</h1><ul class=\"un-list\"><li>Item: Foo</li><li>Item: Bar</li><li>Item: Baz</li><li>Item: Bat</li></ul>');
      done();
    });
  });
});