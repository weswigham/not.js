var notjs = require('../not');
require('chai').should();


describe('document writing shortcuts', function() {
  describe('the comment shortcut', function() {
    it('inserts comment tags around content', function() {
      var content = function() {
        h1;
        - comment;
        $('A comment:');
        - $comment;
        $('The making of');
        $h1;
      }
      
      var res = notjs.renderFunc(content);
      res.should.be.equal('<h1><!-- A comment: -->The making of</h1>');
    });
  });
  
  describe('the doctype shortcut', function() {
    it('inserts a doctype tag', function() {
      var content = function() {
        - doctype('html')
        html
        $html
      }
      
      var res = notjs.renderFunc(content);
      res.should.be.equal('<!DOCTYPE html><html></html>');
    });
  });
  
  describe('the script shortcut', function() {
    it('inserts a acript tag', function() {
      var content = function() {
        html
          head;
            - script('/a/script')
          $head
        $html
      }
      
      var res = notjs.renderFunc(content);
      res.should.be.equal('<html><head><script src="/a/script"></script></head></html>');
    });
    
    it('inserts a acript tag using other unary operators', function() {
      var content = function() {
        html
          head;
            +script('/b/script');
            ~script('/c/script');
            // !script('/a/script'); //Causes really odd output due to type coercions, as do the following
            //void script('/d/script'); //why would you ever want to do this
            //typeof script('/e/script'); //or this
            //delete script('/f/script'); //~wat~
          $head
        $html
      }
      
      var res = notjs.renderFunc(content);
      res.should.be.equal('<html><head><script src="/b/script">'+
      '</script><script src="/c/script">'+
      '</script></head></html>');
    });
  });
  
  describe('the include shortcut', function() {
    it('directly includes another template\'s content', function() {
      var content = function() {
        $scope.items = ['Foo'];
        - include('./test/implied.not.js')
      }
      
      var res = notjs.renderFunc(content, {title: 'Yes', items: ['Foo', 'Bar']});
      res.should.be.equal('<h1>Yes</h1><ul class="un-list"><li>Item: Foo</li></ul>');
    });
  });
});