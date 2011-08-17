goog.provide('treesaver.ui.Settings');

treesaver.ui.Settings = function (s) {
  this.settings = {};

  if (s) {
    // Do a shallow copy of the settings for now
    Object.keys(s, function (key) {
      this.settings[key] = s[key];
    }, this);
  }
};

treesaver.ui.Settings.prototype.get = function (name, defaultValue) {
  if (this.settings.hasOwnProperty(name)) {
    return this.settings[name];
  } else {
    return defaultValue;
  }
};

treesaver.ui.Settings.prototype.set = function (name, value) {
  this.settings[name] = value;
  return value;
};
