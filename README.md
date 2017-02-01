# yet-another-markov-generator
Another markov generator :-/

### Install
```shell
$ npm install
```

### Run Tests
```shell
$ npm run test
```

### Usage
```javascript
const Markov = require("yet-another-markov-generator")

// options
// - maxTries: number of ties to attempt to generate a valid sentence, see
//               generateSentence()
// - prefixSize: number indicating the length of prefix to use when building
//               model; defaults to 3
const markov = new Markov(options);

// buildModel() can be called multiple times and it will append corpus
// to the current model
// corpus is an array of strings
markov.buildModel(corpus);

const s = markov.generateSentence();

// validate emitted sentences
const smallWords = markov.generateSentence({validator: function(s) {
  // only accept sentence where all words are four letters or less
  const maxWordLength = 4;
  const words = s.split(" ");
  for (let i=0; i<words.length; i++) {
    if (maxWordLength < words[i].length) return false;
  }
  return true;
});

// serialize model; useful for caching
const jsonModel = markov.toJSON();

// deserialize model
const hydratedMarkov = new Markov(options, jsonModel)
// OR
const hydratedMarkov2 = new Markov();
hydratedMarkov2.fromJSON(jsonModel);
```



