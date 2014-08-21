`not.js`
=======

`not.js` is a [DSL](http://en.wikipedia.org/wiki/Domain-specific_language) written in javascript, 
for html. It allows you to easily define html without leaving the comfort of your own javascript file. 
It's all just valid javascript... but... not.

Usage
=====
####NOTE: Ensure any node app using `not.js` is run with `--harmony`, or hilarious failure will ensue

The tests are a great place to look, but here's the gist of it:
`implied.not.js`:
```js
module.exports = function() { //Export a plain js function
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
```
You'll notice that virtually nothing in that function is defined within that file. How is this still valid, you ask? 
Magic. And dynamic runtime environment overrides. Mostly magic.

Tags
----
All top-level identifiers aside from `$scope` and `$` are interpreted as tags. Bare identifiers are written as 
opening tags. Identifiers ending with `$` are interpreted as self-closing tags. Identifiers starting with 
`$` are ending tags. 'Call' a start or self-closing tag with an object to specify any attributes you'd like 
on the tag. The `$` function acts as a text node - strings you pass are escaped. You may instead pass a function 
with a comment inside it, which will be interpreted as a multiline string. Passing 'true' as the second argument
disables escaping. Multiple tags can go on one line if separated by a semicolon.

Classes
-------
Chaining off a tag or a called tag will result in classes being added to that tag. 
`div({class="col-md-6"}).content.main` -> `<div class="col-md-6 content main">`

Logic
-----
Just write javascript. Really; write _any_ javascript inline with your markup and it just works (tm). 

Known exceptions to 'just working':
`var` statements don't function immediately within an explicitly defined context. 
Make an IIFE within the explicit with (like in the first test) to get around the problem, 
or use implied contexts. Or don't use locals.

Scope
-------
If using express, pass an object to the 'scope' field on the options object to reveal that object as '$scope' within
the dsl call. Otherwise, your API looks like so:

- `string`: builder function used for outputting as a string
- `create([builder])`: Outputs a proxy object for use - see `test/html.js` for usage.
- `prepareFunc(func, [builder])`: Outputs a function that when called with a scope object, returns the builder's result
- `renderFunc(func, [scope], [builder])`: Shortcut for `prepareFunc(func, builder)(scope)`
- `renderPath(path, [options], callback)`: Connect-standard view engine callback (aliased to `__express`). 
Valid options are:
```js
{
    "explicit": boolean, //If truthy, it no longer assumes you want
                         // your function implicitly dsl-ified, and
                         // simply calls the required function with
                         // the scope, expecting a string in return
                         // defaults to false
    
    "builder": builder, //Optional builder function to output as 
                        // some alternate format (like DOM nodes)
                        // defaults to string
    
    "scope": object //Object to expose within the dsl for use in logic
                    // defaults to {}
}
```

Suggestions for ease of use
===========================
The implied context by default is nice, however, that means the following silly example does not function:
```js
var http = require('http');
module.exports = function() {
    http.get('http://www.github.com', function(cli) {
        var sink = '';
        cli.on('data', function(data) {
            sink += data;
        });
        cli.on('end', function() {
            $(sink, true);
        });
        cli.on('error', function(e) {
          html
            head
              meta({title: JSON.parse(e)})
            $head
            body
              $(JSON.parse(e));
            $body
          $html
        });
    });
};
```
Since `http` (and `JSON`) will be overridden by the implicit context. You have two options: 
- Export the desired functions into the `$scope`
- Utilize _explicit contexts_ for complicated files

On a per-file basis, the easiest is with 'explicit' contexts, like so:
```js
var http = require('http');
var Promise = require('promise');
var notjs = require('not.js');

module.exports = function(scope) {
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
        with (context(scope)) { //Make a context - you may invoke this multiple times (and with different contexts)
          html
            head
              meta({title: $scope.error})
            $head
            body
              $($scope.error);
            $body
          $html
        }

        resolve(context.collect()); //The total results are returned when .collect() is called 
                                    //(and can be reset with a call to .restart())
      });
    });
  });

  return promise; //For your convenience, the renderPath function will handle promises
};
```

The result object is built as tags appear. _Do. Not. Mix. Async. Calls. With. Sync. Calls._ You will likely have experience 
unexpected results, as the templates build apparently random orders. Use promise chaining or the like to execute 
chunks of async template somewhat predictably.

Doing the same thing with a lot of things in the scope object but still within an implied context:
Scope object passed in the options object:
```js
{
    Promise: require('promise'),
    http: require('http'),
    JSON: JSON
}
```

`not.js` File:
```js
module.exports = function() {
  var promise = new $scope.Promise(function(resolve, reject) {
    $scope.http.get('http://www.github.com', function(cli) {
      var sink = '';
      cli.on('data', function(data) {
          sink += data;
      });
      cli.on('end', function() {
          $(sink, true);
          resolve(); //The return value of implied functions isn't actually used
      });
      cli.on('error', function(e) {
        var error = $scope.JSON.parse(e);
        html
          head
            meta({title: error})
          $head
          body
            $(error);
          $body
        $html
        resolve();
      });
    });
  });
    
  return promise; //Implied functions that return promises have their .proxy attribute
                  //set to the proxy generated for them - call .collect() on the proxy
                  //to get the result string when the promise resolves
                  //eg. promise.then(function() { return promise.proxy.collect(); })
                  //    .then(function(rendered) {doStuff(rendered);});
};
```


`not.js` Is From The Future
===========================
`not.js` relies on a draft of the [harmony](http://en.wikipedia.org/wiki/ECMAScript#ECMAScript_Harmony_.286th_Edition.29) 
[Proxy object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) currently available
in your standard `node` v0.10 installation with the `--harmony` flag enabled. Currently, it only has an implementation 
for the `node` v0.10 proxy implementation (which is based on an older version of the spec), but another based on the
new Proxy spec (available now in your local Firefox instance) will be available soon (tm).

TODO
====
Doctype shorthand?
Shorthand for inlining a script (something shorter than `script({type: 'text/javascript'}); $($scope.func.toString(), true); script`)
Benchmarks?