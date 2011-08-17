goog.provide('treesaver.ui.Publication');

goog.require('treesaver.ui.Index');

treesaver.ui.Publication = function (config) {
  this.index = new treesaver.ui.Index();

  if (config['contents']) {
    this.index.parse(config['contents']);
    this.index.update();
  }

  if (config['settings']) {
  }
};

treesaver.ui.Publication.prototype.parseSettings = function (settings) {
};

treesaver.ui.Publication.prototype.load = function (initialHTML) {
  if (initialHTML) {

  }
};

treesaver.ui.Publication.prototype.unload = function () {
  this.index = null;
}
