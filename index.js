var escape = require('escape-html');

var buffer = "";
function toAttr(obj) {
  var ret = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret.push(""+key+"=\""+obj[key]+"\"");
    }
  }
  return ret.join(' ');
}

var alternator = false;
var xml = Proxy.create({ //TODO: Proxy as a function and let calling the context pass an object to expose as $scope
  getPropertyDescriptor: function(key, rec) {
    return {
      value: (function() {
        if (key === '$') {
          return function(str, noEscape) {
            var escape = escape;
            if (noEscape) {
              escape = function(s) {return s;};
            }
            if (typeof(str) === 'function') {
              buffer += escape((/\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//).exec(str.toString())[1]);
            } else {
              buffer += escape(str);
            }
          }
        }
        alternator = !alternator;
        if (alternator) {
          return; //Skip every other invocation - called twice for HasBinding and HasOwnBinding. Or something.
        }
        if (key.slice(-1) === '$') {
          (buffer += "<"+key.slice(0,key.length-1)+" />");
          return function(obj) {
            var attr = toAttr(obj);
            buffer = buffer.slice(0,buffer.length-3)
            buffer += " " + attr + " />"
            attr = null;
          }
        } else if (key.slice(0,1) === ('$')) {
          (buffer += "</"+key.slice(1)+">");
        } else {
          (buffer += "<"+key+">");
          return function(obj) {
            var attr = toAttr(obj);
            buffer = buffer.slice(0, buffer.length-1) +" "+ attr + ">"
            attr = null;
          }
        }
      })(), 
      configurable: true
    }
  }
});

module.exports = {
  buffer: "", //TODO: Output format builders
  string: "",
  xml: "",
  dom: "",
  create: function(builder) { //TODO: Create proxy with given builder
  
  }
};