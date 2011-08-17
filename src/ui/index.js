goog.provide('treesaver.ui.Index');

goog.require('treesaver.json');
goog.require('treesaver.uri');
goog.require('treesaver.object');
goog.require('treesaver.network');
goog.require('treesaver.storage');
goog.require('treesaver.ui.TreeNode');
goog.require('treesaver.ui.Document');

/**
 * Class representing the index (i.e. the table of contents for documents.)
 * @constructor
 * @extends {treesaver.ui.TreeNode}
 */
treesaver.ui.Index = function () {
  /**
   * @type {!Array.<treesaver.ui.Document>}
   */
  this.children = [];

  /**
   * @type {!Object}
   */
  this.documentMap = {};

  /**
   * @type {!Object}
   */
  this.documentPositions = {};

  /**
   * Linear list of documents. This is used as a cache. You can invalidate and repopulate the cache by calling update().
   * @type {!Array.<treesaver.ui.Document>}
   */
  this.documents = [];
};

treesaver.ui.Index.prototype = new treesaver.ui.TreeNode();

treesaver.ui.Index.events = {
  UPDATED: 'treesaver.index.updated'
};

/**
 * Parses an index entry and returns a new Document instance.
 * @private
 * @param {!Object} entry
 * @return {?treesaver.ui.Document}
 */
treesaver.ui.Index.prototype.parseEntry = function(entry) {
  var url = entry['url'],
      children = entry['children'],
      meta = {},
      doc = null;
  
  if (!url) {
    treesaver.debug.warn('Ignored document index entry without URL');
    return null;
  }

  // Resolve this URL, and strip the hash if necessary
  url = treesaver.uri.stripHash(treesaver.network.absoluteURL(url));

  // Copy all meta fields into a new object
  Object.keys(entry).forEach(function (key) {
    meta[key] = entry[key];
  });

  // Create a new document
  doc = new treesaver.ui.Document(url, meta);

  // Depth first traversal of any children, and add them
  if (children && Array.isArray(children)) {
    children.forEach(function (child) {
      doc.appendChild(this.parseEntry(child));
    }, this);
  }

  return doc;
};

/**
 * Updates the document cache and repopulates it. This
 * should be called after manually modifying the index.
 */
treesaver.ui.Index.prototype.update = function () {
  var index = 0;
  
  this.documents = [];
  this.documentMap = {};
  this.documentPositions = {};

  this.walk(this.children, function (doc) {
    if (this.documentMap[doc.url]) {
      this.documentMap[doc.url].push(doc);
    } else {
      this.documentMap[doc.url] = [doc];
    }
    this.documents.push(doc);

    if (this.documentPositions[doc.url]) {
      this.documentPositions[doc.url].push(index);
    } else {
      this.documentPositions[doc.url] = [index];
    }
    index += 1;
  }, this);

  treesaver.events.fireEvent(document, treesaver.ui.Index.events.UPDATED, {
    'index': this
  });
};

/**
 * Depth first walk through the index.
 *
 * @private
 * @param {Array.<treesaver.ui.TreeNode>} children
 * @param {!function(!treesaver.ui.TreeNode)} fn Callback to call for each node. Return false to exit the traversal early.
 * @param {Object=} scope Scope bound to the callback.
 */
treesaver.ui.Index.prototype.walk = function (children, fn, scope) {
  return children.every(function (entry) {
    return fn.call(scope, entry) !== false && this.walk(entry.children, fn, scope);
  }, this);
};

/**
 * Return the document at `index`.
 * @param {!number} index
 * @return {?treesaver.ui.Document}
 */
treesaver.ui.Index.prototype.getDocumentByIndex = function (index) {
  return this.documents[index];
};

/**
 * Returns the total number of documents in this index.
 * @return {!number}
 */
treesaver.ui.Index.prototype.getNumberOfDocuments = function () {
  return this.documents.length;
};

/**
 * Returns the document index of the given document (the position in a depth first traversal of the document hierarchy.)
 * @param {!treesaver.ui.Document} doc
 * @return {!number}
 */
treesaver.ui.Index.prototype.getDocumentIndex = function (doc) {
  var result = -1,
      i = 0;

  this.walk(this.children, function (d) {
    if (d.equals(doc)) {
      result = i;
    }
    i += 1;
  }, this);

  return result;
};

/**
 * Returns the linear ordering of documents as extracted from a depth first traversal of the document hierarchy.
 * @return {!Array.<treesaver.ui.Document>}
 */
treesaver.ui.Index.prototype.getDocuments = function () {
  return this.documents;
};

/**
 * Returns all documents matching the given URL in the live index.
 * @param {!string} url
 * @return {Array.<treesaver.ui.Document>}
 */
treesaver.ui.Index.prototype.get = function (url) {
  var result = [];

  this.walk(this.children, function (doc) {
    if (doc.equals(url)) {
      result.push(doc);
    }
  }, this);
  return result;
};

/**
 * Parses a string or array as the document index.
 * @param {!string|!Array} index
 */
treesaver.ui.Index.prototype.parse = function (index) {
  var result = [];

  if (!index) {
    return [];
  }

  if (typeof index === 'string') {
    try {
      index = /** @type {!Array} */ (treesaver.json.parse(index));
    } catch (e) {
      treesaver.debug.warn('Tried to parse TOC index file, but failed: ' + e);
      return [];
    }
  }

  if (!Array.isArray(/** @type {!Object} */ (index))) {
    treesaver.debug.warn('Document index should be an array of objects.');
    return [];
  }

  result = index.map(function (entry) {
    return this.parseEntry(entry);
  }, this);

  result = result.filter(function (entry) {
    return entry !== null;
  });

  return result.map(function (entry) {
    return this.appendChild(entry);
  }, this);
};
