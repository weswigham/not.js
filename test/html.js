var jshtml = require('../index');
require('chai').should();

describe('the jshtml dsl', function() {
  it('is a consice way of representing html in javascript', function() {
    var context = jshtml.create(jshtml.buffer);
    with (context) {
      html
        head
          meta$({title: "wat"})
        $head
        body({style: "width: 100%;"})
          p; h1({style: "text-align: right;"}); $("Title text"); $h1 //Semicolons allow for multiple on one line
            $("Paragraph content!!")
          $p
          hr$
          p
            $("Escaped <html> & such.")
          $p
          p
            $(function() {/*
              Or long form
              for all the content.
            */})        
          $p
        $body
      $html
    }
    context.collect().should.not.be.null;
  });
});