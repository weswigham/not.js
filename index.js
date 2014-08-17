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
var xml = Proxy.create({
  getPropertyDescriptor: function(key, rec) {
    return {
      value: (function() {
        if (key === '$') {
          return function(str) {
            if (typeof(str) === 'function') {
              buffer += escape((/\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//).exec(str.toString())[1]);
            } else {
              buffer += escape(str);
            }
          }
        }
        alternator = !alternator;
        if (alternator) {
          return;
        }
        if (key.slice(-1) === '$') {
          console.log("Got single-tag at: ", buffer);
          (buffer += "<"+key.slice(0,key.length-1)+" />");
          return function(obj) {
            var attr = toAttr(obj);
            buffer = buffer.slice(0,buffer.length-3)
            buffer += " " + attr + " />"
            attr = null;
            console.log("Got single attribute applied at: ", buffer);
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

function buildInlineXml() {
  with (xml) {
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
}

buildInlineXml();

console.log(buffer);