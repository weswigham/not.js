var escape = require('escape-html');

function stringBuilder() {
  this.buffer = '';
};

stringBuilder.prototype._toAttr = function(obj) {
  var ret = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] === null) {
        ret.push(''+key);
      } else {
        ret.push(''+key+'="'+obj[key]+'"');
      }
    }
  }
  return ret.join(' ');
}

stringBuilder.prototype.complete = function() {
  return this.buffer;
};

stringBuilder.prototype.pushStartToken = function(name) {
  this.buffer += '<'+name+'>';
};

stringBuilder.prototype.rewriteStartTokenAttributes = function(obj) {
  var attr = this._toAttr(obj);
  this.buffer = this.buffer.slice(0, this.buffer.length-1) +' '+ attr + '>'
};

stringBuilder.prototype.pushEndToken = function(name) {
  this.buffer += '</'+name+'>';
};

stringBuilder.prototype.pushSingleToken = function(name) {
  this.buffer += '<'+name+' />';
};

stringBuilder.prototype.rewriteSingleTokenAttributes = function(obj) {
  var attr = this._toAttr(obj);
  this.buffer = this.buffer.slice(0,this.buffer.length-3);
  this.buffer += ' ' + attr + ' />';
};

stringBuilder.prototype.pushRaw = function(str, noEscape) {
  if (noEscape) {
    this.buffer += str;
  } else {
    this.buffer += escape(str).replace(/(?:\r\n|\r|\n)/g, '<br />');
  }
};

var indicator = '$';
var defaultScopeName = indicator+'scope';

function jshtmlProxy(builder) {
  var ret = function(scopeName, scope) {
    if (!scope) {
      scope = scopeName;
      scopeName = defaultScopeName;
    }
    var alternator = false;
    return Proxy.create({
      getPropertyDescriptor: function(key, rec) {
        return {
          value: (function() {
            if (key === scopeName) {
              return scope; 
            }
            if (key === indicator) {
              return function(str, noEscape) {
                if (typeof(str) === 'function') {
                  builder.pushRaw((/\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//).exec(str.toString())[1], noEscape);
                } else {
                  builder.pushRaw(str, noEscape);
                }
              }
            }
            alternator = !alternator;
            if (alternator) {
              return; //Skip every other invocation - called twice for HasBinding and HasOwnBinding. Or something.
            }
            if (key.slice(-1) === indicator) {
              builder.pushSingleToken(key.slice(0,key.length-1));
              return function(obj) {
                builder.rewriteSingleTokenAttributes(obj);
              }
            } else if (key.slice(0,1) === indicator) {
              builder.pushEndToken(key.slice(1));
            } else {
              builder.pushStartToken(key);
              return function(obj) {
                builder.rewriteStartTokenAttributes(obj);
              }
            }
          })(), 
          configurable: true
        }
      }
    });
  };
  
  ret.collect = function() {
    return builder.complete();
  };
  
  return ret;
}

var funcStringCache = {}; //Cache stringified functions for implied usage

function prepareFunc(func, builder) { //Prepare an implied function for repeated use
  funcStringCache[func] = funcStringCache[func] || ('with (proxy(scope)) {('+func.toString()+')() }');
  
  return function(scope) {
    var scope = scope || {};
    var builder = builder || stringBuilder;
    var proxy = jshtmlProxy(new builder());
    eval(funcStringCache[func]);
    return proxy.collect();
  }
}

function renderFunction(func, scope, builder) { 
  return prepareFunc(func, builder)(scope);
}

function renderPath(path, options, cb) {
  if (typeof(options) === 'function') {
    cb = options;
    options = {};
  }
  
  var func = require(path); //Yes.
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
      ret = renderFunction(func, options.scope, options.builder);
    } catch (e) {
      err = e;
    }
  }
  cb(err, ret);
}

module.exports = {
  string: stringBuilder, //TODO: More output format builders
  create: function(builder) {
    return jshtmlProxy((builder && new builder()) || new stringBuilder());
  },
  prepareFunc: prepareFunc,
  renderFunc: renderFunction,
  renderPath: renderPath,
  __express: renderPath
};