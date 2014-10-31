var jscsFilter = require('broccoli-jscs');
var mergeTrees = require('broccoli-merge-trees');

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
          var jscsTree = new jscsFilter(tree, app.options.jscsOptions, true);
          return mergeTrees([
            tree,
            jscsTree
          ], { overwrite: true });
        }
      });
    }
  }
};
