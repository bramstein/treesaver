/**
 * @fileoverview Helper functions for manipulating arrays.
 */

goog.provide('treesaver.array');

goog.require('treesaver.constants');

// IE doesn't support these
if (SUPPORT_IE) {
  // TODO: Move into legacy?
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function arrayForEach(fun /*, thisp*/) {
      var i = 0,
          len = this.length,
          thisp = arguments[1];

      for (; i < len; i += 1) {
        if (i in this) {
          fun.call(thisp, this[i], i, this);
        }
      }
    };
  }

  // Array functional helpers from MDC
  if (!Array.prototype.some) {
    Array.prototype.some = function arraySome(fun /*, thisp*/) {
      var i = 0,
          len = this.length,
          thisp = arguments[1];

      for (; i < len; i += 1) {
        if (i in this && fun.call(thisp, this[i], i, this)) {
          return true;
        }
      }

      return false;
    };
  }

  if (!Array.prototype.every) {
    Array.prototype.every = function arrayEvery(fun /*, thisp*/) {
      var i = 0,
          len = this.length,
          thisp = arguments[1];

      for (; i < len; i += 1) {
        if (i in this && !fun.call(thisp, this[i], i, this)) {
          return false;
        }
      }

      return true;
    };
  }

  if (!Array.prototype.map) {
    Array.prototype.map = function arrayMap(fun /*, thisp*/) {
      var i = 0,
          len = this.length,
          thisp = arguments[1],
          res = [];

      for (; i < len; i += 1) {
        if (i in this) {
          res[i] = fun.call(thisp, this[i], i, this);
        }
      }

      return res;
    };
  }

  if (!Array.prototype.filter) {
    Array.prototype.filter = function arrayFilter(fun /*, thisp*/) {
      var i = 0, val,
          len = this.length,
          thisp = arguments[1],
          res = [];

      for (; i < len; i += 1) {
        if (i in this) {
          val = this[i]; // In case fun mutates this
          if (fun.call(thisp, val, i, this)) {
            res.push(val);
          }
        }
      }

      return res;
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
      var i, len;
      for (i = (start || 0), len = this.length; i < len; i += 1) {
        if (this[i] === obj) {
          return i;
        }
      }
      return -1;
    };
  }
}

if (!Array.isArray) {
  /**
   * Test Array-ness.
   *
   * NOTE: Type annotation removed due to closure compiler errors
   */
  Array.isArray = function(value) {
    return Object.prototype.toString.apply(/** @type {Object} */(value)) === '[object Array]';
  };
}

/**
 * Convert array-like things to an array
 *
 * @param {*} obj
 * @return {!Array}
 */
treesaver.array.toArray = function(obj) {
  return Array.prototype.slice.call(/** @type {Object} */(obj), 0);
};

/**
 * Remove an index from an array
 * By John Resig (MIT Licensed)
 *
 * @param {!number} from
 * @param {number=} to
 */
treesaver.array.remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};

// IE doesn't let you call slice on a nodelist, so provide a backup
if (SUPPORT_IE && 'attachEvent' in document) {
  treesaver.array.toArray = function(obj) {
    var i, len, arr = [];
    for (i = 0, len = obj.length; i < len; i += 1) {
      arr.push(obj[i]);
    }
    return arr;
  };
}
