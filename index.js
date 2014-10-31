var JSCSFilter = require('broccoli-jscs');
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');

var processString = JSCSFilter.prototype.processString;
JSCSFilter.prototype.processString = function(content, relativePath) {
  processString.apply(this, arguments);

  if (!this.bypass && !this.disableTestGenerator) {
    return this.testGenerator(relativePath, this.errors);
  }

  return content;
};

JSCSFilter.prototype.testGenerator = function(relativePath, errors) {
  var errorText = '';
  errors.getErrorList().forEach(function(e) {
    errorText += errors.explainError(e, false) + '\n';
  });
  if (errorText) {
    errorText = this.escapeErrorString('\n' + errorText);
  }

  return "module('JSCS - " + path.dirname(relativePath) + "');\n" +
         "test('" + relativePath + " should pass jscs', function() { \n" +
         "  ok(" + !errorText + ", '" + relativePath + " should pass jscs." + errorText + "'); \n" +
         "});\n";
};

JSCSFilter.prototype.escapeErrorString = function(string) {
  string = string.replace(/\n/gi, "\\n");
  string = string.replace(/'/gi, "\\'");

  return string;
};

module.exports = {
  name: 'broccoli-jscs',

  included: function(app) {
    this.app = app;
    this._super.included.apply(this, arguments);

    if (app.tests) {
      app.registry.add('js', {
        name: 'broccoli-jscs',
        ext: 'js',
        toTree: function(tree) {
          var jscsTree = new JSCSFilter(tree, app.options.jscsOptions);

          if (!jscsTree.bypass && !jscsTree.disableTestGenerator) {
            jscsTree.targetExtension = 'jscs-test.js';

            return mergeTrees([
              tree,
              jscsTree
            ], { overwrite: true });
          }

          return tree;
        }
      });
    }
  }
};
