/**
 * Node-only utils
 */
var FormData = require('form-data');

var utility = module.exports = {};

utility.request = require('./request-node');


/**
 * Create or complete FormData object for attachements
 * @param id {String} id of the element to add (may be 'attachment0')
 * @param data {Data} the data to send
 * @param options {Object}
 * @param options.filename {String}
 * @param options.type {String}
 */
utility.forgeFormData = function (id, data, options, appendTo) {
  var formData = appendTo || new FormData();
  formData.append(id, data, options);
  return formData;
};