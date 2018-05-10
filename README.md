metafocus
=========

A highly configurable rsvp reader with new reticle types.

## Installation

    npm install metafocus --save

## Getting Started

First, load the metafocus module:

```javascript
var metafocus = require('metafocus');
```

To conveniently use metafocus in your code, you'll need to set up a reference for each method in the module.  An example of how to do this:
```javascript
    var handleFile =  metafocus.handleFile,
    startReading = metafocus.startReading,
    getTextFromPDF = metafocus.getTextFromPDF,
    setWPM = metafocus.setWPM,
    setPause = metafocus.setPause;
    setFF = metafocus.setFF;
    setRewind = metafocus.setRewind;
```
#### Linux
Metafocus requires **pdftext** and **pdffonts**, which requires **poppler-utils** to be installed:

Debian/Ubuntu:
```bash
apt-get install poppler-utils
```

Fedora/CentOS:
```bash
yum install poppler-utils
```

The methods below are expecting references to the UI controls you are using to interface with the metafocus library (events, UI rendering, etc.) as their parameters:

#### startReading(ret, counterElem)

1. Create a reference in the DOM (for browser UIs) to the element you want to use to trigger the metafocus reader to begin cycling through the document.

    ```javascript 
    var startButton = document.getElementById('start'); 
    var counterDiv = document.getElementById('counter'); //for displaying the current word index
    ```

2. Create a UI element to act as the 'reticle' that metafocus will update with the current word.  In the example below, we're using webcomponents:

In the app/components directory:
   ```html
   <template id="reticle">
  	<div id="reticle" class="metafocus showBorder"></div>
   </template>
   ```
On the page:
   ```html
   <link rel="import" id="reticle-template" href="app/components/reticle.html">
   ```
Script to create the reticle and reference it:
   ```javascript
   function createReticle(){
    var template = document.querySelector('#reticle-template');
    var importedReticle = template.import.querySelector('#reticle');
    var clone = document.importNode(importedReticle.content, true);
    return clone;
   }

   //reticle init:
   var reticleTemplate = createReticle();
   var reticlePlaceholder = document.querySelector('#reticlePlaceholder');
   reticlePlaceholder.appendChild(reticleTemplate);
   var reticle = document.getElementById('reticle');
   ```
Pass the reticle reference as a parameter on the startButton click event:
   ```javascript
   startButton.addEventListener('click', function (event) {
    ///the reticle above will be updated with the currrent word, counterDiv is passed in so it can be updated with the index of the current word:
    startReading(reticle, counterDiv);
   });
   ```

#### setPause(button), setFF(button), setRewind(button)

Pass the target of the click event to each of these methods, so it can be updated with the status of each control 'command': 
```javascript
pauseButton.addEventListener('click', function (event) {
  setPause(event.target);
});

ffButton.addEventListener('click', function (event) {
  setFF(event.target);
});

rewindButton.addEventListener('click', function (event) {
  setRewind(event.target);
});
```

#### readFile(files, pathToPdftotext, pathToPdffonts, customFilter, cb)
Pass the pdftotext paths you createdf earlier, along with a filter and a callback that will update the UI when the file read is completed:

```javascript
var readFile = function(files){
    var filename = handleFile(files, pathToPdftotext, pathToPdffonts, simpleFilter, function(filename, wordCount){
        fileNamePlaceholder.innerHTML = "<div id='fileName' class='fileUpload showBorder'>" + filename + "</div>";
        wordCountDiv.innerHTML = wordCount;
    });
}
```
The filter is a function you create and pass in as a parameter to the readFile() function.  The example below will remove an email and name from the text, along with a regex that matches unwanted numbers:

```javascript

function simpleFilter(value){
  var matchesFilter = false;
  switch(value){
    case '<me@gmail.com>,':
      matchesFilter = true;
      break;
    case '':
      matchesFilter = true;
      break;
    case '.':
      matchesFilter = true;
      break;
    case 'My Name':
      matchesFilter = true;
      break;
  }

  var regexNumbers = /(\d)\W+/g;
  if(value.match(regexNumbers)){
    matchesFilter = true;
  }

  return !matchesFilter;
}