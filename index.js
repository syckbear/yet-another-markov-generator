"use strict";

const _ = require("underscore");

/*
 * Return a markov model.
 *
 * Args:
 * - options: optional object with configurations supports:
 *   - maxTries: number of ties to attempt to generate a valid sentence, see
 *               generateSentence()
 *   - prefixSize: number indicating the length of prefix to use when building
 *                 model; defaults 3
 * - model: optional markov model containing a computed model from a
 *          corpus and options, see toJSON() and fromJSON() for information on
 *          serialization/deserialization
 */
const generator = function (options={}, model=null) {
  const defaultOptions = {
    maxTries: 1000,
    prefixSize: 3
  };

  this._model = (! model) ? {model: {}, options: options} : model;
  _.defaults(this._model.options, defaultOptions);

  return this;
};

generator.prototype.toJSON = function() {
  return JSON.stringify(this._model);
};

generator.prototype.fromJSON = function(m) {
  // TODO validate has prefixSize options and is hash?
  this._model = JSON.parse(m);
};


// Append sentences to Markov model
generator.prototype.buildModel = function(sentences) {
  const self = this;
  sentences.forEach(function(s) {
    _addSentenceToModel(self._model.model, s, self._model.options);
  });
  return this;
};

/*
 * Return sentence based on object's markov chain, throws EXCEEDED_MAX_TRIES
 * exception when unable to generate sentance within options.maxTries
 * iterations.
 *
 * Args:
 * - options: configuration object supporting:
 *   - maxLength: max length of generated sentence.
 *   - validator: function used to define valid sentence. Function should
 *                accept a string and return a boolean.
 */
generator.prototype.generateSentence = function(options={}) {
  const maxTries = this._model.options.maxTries;
  const defaultOptions = {
    maxLength: null,
    validator: function() { return true; }
  };
  _.defaults(options, defaultOptions);

  let s = [];
  for (let i=0; i<maxTries; i++) {
    s = _generateSentence(this._model);
    if ((options.maxLength && (options.maxLength < s.length))
      || (! options.validator(s)))
    {
      continue;
    }
    return s;
  }
  throw 'EXCEEDED_MAX_TRIES';
};


// Assign a value to a nested object structure,
// returns reference to the deepest structure.
function _deepObjectDefaultAssign(obj, keys, value) {
  let objRef = obj;
  for (let i=0; i<keys.length; i++) {
    const k = keys[i];
    if (i === keys.length-1) {  // last index
      if (! _.has(objRef, k)) objRef[k] = value;
      return objRef[k];
    } else if (! _.has(objRef, k)) {
      objRef[k] = {};
    }
    objRef = objRef[k];
  }
}

// Returns a reference to a deeply nested structure
function _deepObjectFetch(obj, keys) {
  let objRef = obj;
  for (let i=0; i<keys.length; i++) {
    let k = keys[i];
    objRef = objRef[k];
  }
  return objRef;
}

// Parse sentence and update passed in model
function _addSentenceToModel(model, sentence, options) {
  const tokens = sentence.split(/\s+/);
  tokens.push("\n");  // end of line marker
  const prefixes = [];
  for (let i=0; i < options.prefixSize; i++) prefixes.push(tokens.shift());

  while (tokens.length !== 0) {
    let nextWord = tokens.shift();
    _deepObjectDefaultAssign(model, prefixes, []).push(nextWord);
    prefixes.shift();
    prefixes.push(nextWord);
  }

  return model;
}

function _getFirstWords (model) {
  return _.filter(_.keys(model), function(w) { return w.match(/^[A-Z]/); });
}

function _getRandomElementFromArray(a) {
  return a[Math.floor(Math.random() * a.length)];
}

function _popPrefixes(model, firstWords, prefixSize) {
  const prefixes = [_getRandomElementFromArray(firstWords)];
  while (prefixes.length < prefixSize) {
    let modelRef = _deepObjectFetch(model, prefixes);
    prefixes.push(_getRandomElementFromArray(_.keys(modelRef)));
  }
  return prefixes;
}

function _generateSentence(m) {
  const prefixSize = m.options.prefixSize;
  const model = m.model;

  const firstWords = _getFirstWords(model);

  let sentence = [];
  let prefixes = _popPrefixes(model, firstWords, prefixSize);
  while (true) {
    let nextWord = _getRandomElementFromArray(
      _deepObjectFetch(model, prefixes));

    if (nextWord === "\n") {
       for (let i=0; i<prefixes.length; i++) sentence.push(prefixes.shift());
       break;
    }
    sentence.push(prefixes.shift());
    prefixes.push(nextWord);
  }

  return sentence.join(" ");
};

module.exports = generator;
