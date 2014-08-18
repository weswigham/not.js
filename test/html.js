var jshtml = require('../index');
require('chai').should();

describe('the jshtml dsl', function() {
  it('is an intuitive, consice way of representing and creating html in javascript', function() {
  
    var context = jshtml.create(jshtml.string); //Get a dsl context object
    var scope = { //Make a scope to allow calling within the dsl
      paragraph: "Paragraph content!!"
    };
    //Call the context with the name you want the scope accessible by and the scope object itself
    //"$scope" is the default and may be omitted
    with (context("$scope", scope)) {
    
      //Any valid identifier is a used as a tag (with some exceptions, see below)
      html
        head
          
          //Set attributes by 'calling' the tag with them (does not function on closing tags, obviously)
          meta$({title: "jshtml wat?"}) //Identifiers ending with a $ are 'self-closing' tags
          
        $head //Identifiers starting with a $ are closing tags
        
        body({style: "width: 100%;"})
        
          //Use the $ function to make a text node
          p; h1({style: "text-align: right;"}); $("Title text"); $h1 //Semicolons allow for multiple tags on one line
          
            $($scope.paragraph) //Access scoped variables that won't be intercepted by the dsl using the specified name
          $p
          hr$
          p
            //Disable automatic escaping of text nodes, (this lets you use partials!)
            $("Unescaped html <strong> and such. </strong>", true)
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
              $("I'm number "+$scope.i+"!");
            $p
          }
        $body
      $html
    }
    context.collect().should.be.equal(
'<html><head><meta title=\"jshtml wat?\" /></head><body style=\"width: 100%;\"><p><h1 style=\"text-align: right;\">Title '+
'text</h1>Paragraph content!!</p><hr /><p>Unescaped html <strong> and such. </strong></p><p>              Or long form<br'+
' />              for all the content.</p><p>I&#39;m number 0!</p><p>I&#39;m number 1!</p><p>I&#39;m number 2!</p><p>I&#3'+
'9;m number 3!</p></body></html>'
    );
  });
});