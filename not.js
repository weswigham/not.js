var load = function (name, definition){
  if (typeof(module) !== 'undefined' && module.exports) { // Node.js
    module.exports = definition(require('escape-html'));
  } else {
    var escapeHtml = function (str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    };

    if (typeof define === 'function'){ // AMD
      define(function() { return definition(escapeHtml) });
    } else { // Browser

      var notjs = definition(escapeHtml);
      var global = this;
      var old = global[name];
      notjs.noConflict = function () {
        global[name] = old;
        return notjs;
      };
      global[name] = notjs;
    }
  }
};

load('notjs', function(escape) {
function stringBuilder(basepath) {
  if (basepath) {
    this.basepath = basepath;
  }
  this.buffer = [];
};

stringBuilder.prototype._toAttr = function(obj) {
  var ret = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if(key === 'data' && typeof(obj[key]) === 'object') {
        for (var subkey in obj[key]) {
          if (obj[key].hasOwnProperty(subkey)) {
            ret.push('data-'+subkey+'="'+obj.data[subkey]+'"');
          }
        }
      } else {
        ret.push(''+key+'="'+obj[key]+'"');
      }
    }
  }
  
  var str = new String(ret.join(' ')); //Wrap with 'String' so it has methods/properties
  str.original = obj; //for rewriting attr
  str.arguments = arguments; //for capturing for use in shortcuts
  return str;
}

stringBuilder.prototype.reset = function() {
  this.buffer = [];
}

stringBuilder.prototype.complete = function() {
  return this.buffer.join('');
};

stringBuilder.prototype.pushStartToken = function(name) {
  this.buffer.push('<');
  this.buffer.push(name);
  this.buffer.push('>');
};

stringBuilder.prototype.rewriteStartTokenAttributes = function(obj) {
  var attr = this._toAttr(obj);
  var last = this.buffer.pop();
  if (last == '>') {
    this.buffer.push(' ');
    this.buffer.push(attr);
    this.buffer.push('>');
  } else {
    throw new Error('Attempted to rewrite tag with attributes when there was no tag');
  }
};

stringBuilder.prototype.pushEndToken = function(name) {
  this.buffer.push('</');
  this.buffer.push(name);
  this.buffer.push('>');
};

stringBuilder.prototype.pushSingleToken = function(name) {
  this.buffer.push('<');
  this.buffer.push(name);
  this.buffer.push(' />');
};

var merge = function(dest, source) {
  for (prop in source) {
    if (source.hasOwnProperty(prop)) {
      if (prop != 'data') {
        obj[prop] = source[prop];
      } else { //merge data, too, ignore all else
        obj[prop] = merge(obj[prop] || {}, source[prop]);
      }
    }
  }
}

stringBuilder.prototype.rewriteSingleTokenAttributes = function(obj) {
  var third = this.buffer[this.buffer.length-3];
  if (third === ' ') { //Attrs already exist on tag, get previous and overwrite any duplicates
    var newobj = merge(third.original, obj);
    var attr = this._toAttr(newobj);
    this.buffer[this.buffer.length-3] = attr;
  } else {
    var attr = this._toAttr(obj);
    attr.original = obj;
    var last = this.buffer.pop();
    if (last == ' />') {
      this.buffer.push(' ');
      this.buffer.push(attr);
      this.buffer.push(' />');
    } else {
      throw new Error('Attempted to rewrite tag with attributes when there was no tag');
    }
  }
};

stringBuilder.prototype.pushRaw = function(str, noEscape) {
  if (noEscape) {
    this.buffer.push(str);
  } else {
    this.buffer.push(escape(str));
  }
};

stringBuilder.prototype.addClass = function(name) {
  //if the 3rd elem form the top is ' ', then attr already exists and we should add classes to that
  var third = this.buffer[this.buffer.length-3];
  var last = this.buffer.pop();
  if (third === ' ') {
    var oldattr = this.buffer.pop();
    
    var obj = oldattr.original;
    
    obj['class'] = ((obj['class'] ? obj['class']+' ' : '')+name);
    var attr = this._toAttr(obj);
    
    this.buffer.push(attr);
    this.buffer.push(last);
  } else { //otherwise, insert an attr with the class
    this.buffer.push(last);
    if (last === '>') { //start
      this.rewriteStartTokenAttributes({class: name});
    } else if (last === ' />') { //single
      this.rewriteSingleTokenAttributes({class: name});
    } else {
      throw new Error('Attempted to add a class to a tag when there was no closed tag');
    }
  }
}

stringBuilder.prototype.dropLastToken = function() {
var third = this.buffer[this.buffer.length-3];
  if (third === ' ') { //Attrs already exist on tag
    this.buffer.pop();
    var attrs = this.buffer.pop();
    this.buffer.pop();
    this.buffer.pop();
    this.buffer.pop();
    return attrs.arguments;
  } else {
    this.buffer.pop();
    this.buffer.pop();
    this.buffer.pop();
  }
}

var indicator = '$';
var defaultScopeName = indicator+'scope';

var shortcuts = {}
shortcuts['comment'] = function(builder) {
  builder.pushRaw('<!-- ', true);
};

shortcuts['$comment'] = function(builder) {
  builder.pushRaw(' -->', true);
};

shortcuts['doctype'] = function(builder, scope, args) {
  builder.pushRaw('<!DOCTYPE '+args[0]+'>', true);
}

shortcuts['script'] = function(builder, scope, args) {
  builder.pushRaw('<script src="'+args[0]+'"></script>', true);
}

shortcuts['include'] = function(builder, scope, args) {
  shortcuts['done'](builder, scope, args);
  var pathname = args[0];
  var newbase;
  if (builder.basepath) {
    var path = require('path');
    pathname = path.join(builder.basepath, pathname);
    newbase = path.dirname(pathname);
  }
  var result = require(pathname);
  var res = renderFunction(result, scope, builder.constructor, newbase);
  if (typeof(res) == 'function') {
    throw new Error('Attempted to directly include an asynchronous template. Please handle this without the shortcut.');
  }
  builder.pushRaw(res, true);
}

shortcuts['render'] = function(builder, scope, args) {
  var res = renderFunction(args[0], scope, builder.constructor, newbase);
  if (typeof(res) == 'function') {
    throw new Error('Attempted to render an asynchronous template. Please handle this without the shortcut.');
  }
  builder.pushRaw(res, true);
}

shortcuts['using'] = function(builder, scope, args) {
  shortcuts['done'](builder, scope, args);
  var name = args[0];
  Object.defineProperty(scope, name, {
    get: function() {
      return builder.complete();
    },
    configurable: true
  });
  builder.section = name;
}

shortcuts['done'] = function(builder, scope, args) {
  if (builder.section) { //'lock in' any in progress 'using's
    var completed = builder.complete();
    Object.defineProperty(scope, builder.section, {
      get: function() {
        return completed;
      },
      configurable: true
    });
    builder.reset();
    builder.section = null;
  }
}


function jshtmlProxy(builder) {
  var ret = function(scopeName, scope) {
    if (!scope) {
      scope = scopeName;
      scopeName = defaultScopeName;
    }
    var proxy = Proxy.createFunction({ //TODO: Alternate implementation for the newer harmony proxy API supported by Firefox
      getPropertyDescriptor: function(key) {return {value: true, configurable: true}}, //We are all the properties!
      get: function(rec, key) {
        return (function() {
            if (key === scopeName) {
              return scope; 
            }
            if (key === indicator) {
              return proxy;
            }
            if (key.slice(-1) === indicator) {
              builder.pushSingleToken(key.slice(0,key.length-1));
              var classproxy = Proxy.createFunction({
                get: function(rec, key) {
                  builder.addClass(key);
                  return classproxy;
                }
              },
              function(obj) {
                builder.rewriteSingleTokenAttributes(obj);
                return classproxy;
              });
              return classproxy;
            } else if (key.slice(0,1) === indicator) {
              builder.pushEndToken(key.slice(1));
              return {
                valueOf: function() {
                  if (shortcuts.hasOwnProperty(key)) {
                    var args = builder.dropLastToken();
                    
                    shortcuts[key](builder, scope, args);
                  } else {
                    throw new Error('Attempted to call nonexistant shortcut');
                  }
                  return 0;
                }
              }
            }  else {
              builder.pushStartToken(key);
              var classproxy = Proxy.createFunction({
                get: function(rec, nkey) {
                  if (nkey === 'valueOf') {
                    if (shortcuts.hasOwnProperty(key)) {
                      var args = builder.dropLastToken();
                      
                      shortcuts[key](builder, scope, args);
                    } else {
                      throw new Error('Attempted to call nonexistant shortcut');
                    }
                    return function() {return 0};
                  }
                  builder.addClass(nkey);
                  return classproxy;
                }
              },
              function(obj) {
                builder.rewriteStartTokenAttributes(obj);
                return classproxy;
              });
              return classproxy;
            }
          })();
      }
    }, function(str, noEscape) {
      if (typeof(str) === 'function') {
        builder.pushRaw((/\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//).exec(str.toString())[1], noEscape);
      } else {
        builder.pushRaw(str, noEscape);
      }
    });
    
    return proxy;
  };
  
  ret.collect = function() {
    return builder.complete();
  };
  
  ret.restart = function() {
    builder.reset();
  }
  
  return ret;
}

var funcStringCache = {}; //Cache stringified functions for implied usage

function prepareFunc(func, builder, basepath) { //Prepare an implied function for repeated use
  funcStringCache[func] = funcStringCache[func] || ('(function() { with (proxy(scope)) { return ('+func.toString()+')('+defaultScopeName+'); } })()');
  
  return function(scope) {
    var scope = scope || {};
    var builder = builder || stringBuilder;
    var proxy = jshtmlProxy(new builder(basepath));
    var ret = eval(funcStringCache[func]);
    if (ret && typeof(ret.then) === 'function') { //looks like a promise. Let's use it why don't we?
      ret.proxy = proxy;
      return ret;
    }
    return proxy.collect();
  }
}

function renderFunction(func, scope, builder, basepath) { 
  return prepareFunc(func, builder, basepath)(scope);
}

function renderPath(path, options, cb) {
  
  if (typeof(options) === 'function') {
    cb = options;
    options = {};
  }
  
  var func = require(path); //Yes.
  if (!options.basepath) {
    var pathlib = require('path');
    var basepath = pathlib.dirname(pathlib.resolve(path));
    options.basepath = basepath;
  }
  var ret;
  var err;
  if (options.explicit) { //Assume implied use rather than explicit 'with' by default
    try {
      ret = func(options.scope);
    } catch (e) {
      err = e;
    }
  } else {
    try {
      ret = renderFunction(func, options.scope, options.builder, options.basepath);
    } catch (e) {
      err = e;
    }
  }
  if (ret && typeof(ret.then) === 'function') { //looks like a promise. Let's use it why don't we?
    return ret.then(function(data) {
      if (data) {
        cb(err, data);
      } else {
        cb(err, ret.proxy.collect());
      }
    });
  }
  process.nextTick(function() {
    cb(err, ret);
  });
}

var exposed = {
  string: stringBuilder, //TODO: More output format builders, eg DOM Objects, Buffer
  create: function(builder) {
    return jshtmlProxy((builder && new builder()) || new stringBuilder());
  },
  prepareFunc: prepareFunc,
  renderFunc: renderFunction,
  renderPath: renderPath,
  __express: renderPath
};

return exposed;

});