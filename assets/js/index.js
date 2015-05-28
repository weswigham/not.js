$(function() {
  var readOnly = true;
  if (window.Proxy) {
    readOnly = false;
  }
  
  var scope = {
    title: 'It\'s javascript all the way down!',
    items: ['<html>', '<head>', '<body>', '<whatever>'],
    window: window
  }
  var textarea = document.querySelector('#editor');
  var resultarea = document.querySelector('#result-html');
  var cm = CodeMirror.fromTextArea(textarea, {mode: 'javascript', lineNumbers: true, readOnly: readOnly});
  var resulteditor = CodeMirror.fromTextArea(resultarea, {mode: 'htmlmixed', lineNumbers: true, readOnly: true});
  if (!readOnly) {
    cm.on("changes", function(instance, changes) {
      var doc = instance.getDoc();
      var contentFunc = eval('(function() { return (function() { '+doc.getValue()+' }) })()');
      var result;
      try {
        result = notjs.renderFunc(contentFunc, scope);
      }
      catch(e) {
        console.warn(e);
        return;
      }
      resulteditor.setValue(result);
      resulteditor.autoFormatRange({line: 0, ch: 0}, {line: 1, ch: result.length});
    });
  }
})