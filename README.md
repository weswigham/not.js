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

Logic
-----
Just write javascript. Really; write _any_ javascript inline with your markup and it just works (tm). 

Known exceptions:
`var` statements do bad things (like write tags), since they try to bind to the context. As a workaround (until I start 
using the new Proxy API - _and_ `node` supports the new Proxy API), store all scratch variables on $scope (if you're 
using an explicit context, you can pass a different identifier as the first argument to the context-generator, 
if $scope is too long/misleading for you).

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
Since `http` (and `sink`, and `JSON`) will be overridden by the implicit context. You have two options: 
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
```

_The result object is built synchronously. Do. Not. Mix. In. Async. Calls._ You will likely have experience unexpected results. 
Use promises or the like to execute somewhat synchronously and predictably.

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
  $scope.promise = new $scope.Promise(function(resolve, reject) {
    $scope.http.get('www.github.com', function(cli) {
      $scope.sink = '';
      cli.on('data', function(data) {
          $scope.sink += data;
      });
      cli.on('end', function() {
          $(sink, true);
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
    
  return $scope.promise
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
Figure out how to fix 'var' within the dsl sensibly. Likely involves some metatrickery with the correct flow of calls through the proxy object chain (just overriding `get` hasn't worked, in my experience). It's complicated by variable hoisting.
Benchmarks?