const test = require('tape');

const Markov = require('./index');

test("generator tests", function(t) {
  const markov = new Markov({prefixSize: 1});

  markov.buildModel(["The quick brown fox jumped over the lazy dog."]);

  // expected model
  t.deepEqual(markov._model.model, {
    The: [ 'quick' ],
    quick: [ 'brown' ],
    brown: [ 'fox' ],
    fox: [ 'jumped' ],
    jumped: [ 'over' ],
    over: [ 'the' ],
    the: [ 'lazy' ],
    lazy: [ 'dog.' ],
    'dog.': [ '\n' ] },
    "generate model");

  // serialize/deserialize
  const jsonModel = markov.toJSON();
  const hydratedMarkov = new Markov();
  hydratedMarkov.fromJSON(jsonModel);

  t.deepEqual(hydratedMarkov._model, markov._model, "serialization");

  // generate sentences
  t.equal(
    hydratedMarkov.generateSentence(),
    markov.generateSentence(),
    "generate sentence")

  t.equal(
    (function() {
      try {
        markov.generateSentence({validator: function() { return false; }});
      } catch (e) {
        return e.toString();
      }
    })(),
    "EXCEEDED_MAX_TRIES",
    "generate sentence - maxTries exception");

  t.end();
});
