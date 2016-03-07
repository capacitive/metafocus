module.exports = {
  startReading: function() {
    wait(delay).then(function () {
      reader.replaceWith("<div id='reader' class='metafocus showBorder'>" + filteredArray[counter] + "</div>");
      counter++;
      if (pause) {
        return;
      }
      startReading();
    });
  },

  handleFile: function(files) {
    console.log('handleFile()!');
    fileName.replaceWith("<div id='fileName' class='fileUpload showBorder'>" + files[0].name + "</div>");
    getTextFromPDF(files[0].path);
  },

  //formula:   60 / ((total_time / 1000) / total_characters) / 5 + .05
  setWPM : function(wpm){
    switch(wpm){
      case '50':
        delay = 1200;
        break;
      case '100':
        delay = 1195;
        break;
      case '150':
        delay = 1190;
        break;
      case '200':
        delay = 400;
        break;
      case '250':
        delay = 350;
        break;
      case '400':
        delay = 200;
        break;
    }
    var wpmCalc = 60 / ((delay / 1000) / wpm) / 5 + .05;
    console.log('set WPM to: ' + wpm + "wpm - " + delay + "ms");
    console.log('wpm calc: ', wpmCalc / 10);
  },

  setPause : function(){
    pause = !pause;
    //console.log('pause: ', pause);
    if(pause) {
      pauseButton.innerHTML = "resume";
    } else {
      pauseButton.innerHTML = "pause"
      startReading();
    }
  }
};

var pdftext = require('pdf-textstring');
var path = require('path');

var AbsolutePathToApp = path.dirname(process.mainModule.filename);
var pathToPdftotext = AbsolutePathToApp + "/binaries/pdftotext.exe";
var pathToPdffonts = AbsolutePathToApp + "/binaries/pdffonts.exe";
var tempArray = [];
var filteredArray = [];
var counter = 0;
var promiseCount = 0;
var delay = 700;
var pause = false;
var pauseButton = document.getElementById('pause');
var reader = document.getElementById('reticle');
var fileName = document.getElementById('fileName');

function createReticle(){
  var reticleTemplate = document.querySelector('#reticle-template');
  var template = reticleTemplate.import.querySelector('#reticle');
  var clone = document.importNode(template.content, true);
  //var reticlePlaceholder = document.querySelector('#reticlePlaceholder');
  //clone.querySelector('#reader').textContent = 'reticle';
  return clone;
},

//init:
var reticle = createReticle();
var reticlePlaceholder = document.querySelector('#reticlePlaceholder');
reticlePlaceholder.appendChild(reticle);



function simpleFilter(value){
  var matchesFilter = false;
  switch(value){
    case '':
      matchesFilter = true;
      break;
    case 'Mark':
      matchesFilter = true;
      break;
    case 'Mar':
      matchesFilter = true;
      break;
    case '1':
      matchesFilter = true;
      break;
    case '14':
      matchesFilter = true;
      break;
    case '2,':
      matchesFilter = true;
      break;
    case 'Cafazzo':
      matchesFilter = true;
      break;
  }

  if(value.includes("paizo.com")
    || value.includes("mark.cafazzo@gmail.com")
    || value.includes("6677096")
    || value.includes("1121093")
    || value.includes("1121094")
    || value.includes("2016")
    || value.includes("455")){
    matchesFilter = true;
  }

  var regexNumbers = "/^\d+$/";
  if(value.match(regexNumbers)){
    matchesFilter = true;
  }

  return !matchesFilter;
}

function getTextFromPDF(path) {
  counter = 0;
  pdftext.setBinaryPath_PdfToText(pathToPdftotext);
  pdftext.setBinaryPath_PdfFont(pathToPdffonts);
  pdftext.pdftotext(path, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      tempArray = data.split(' ');
      filteredArray = tempArray.filter(simpleFilter);
      console.log(JSON.stringify(filteredArray));
    }
  });
}

function wait(delay){
  var thisPromiseCount = ++promiseCount;
  var promise = new Promise(
    function(resolve, reject){
      setTimeout(function(){
        resolve(thisPromiseCount);
      }, delay)
    }
  );
  return promise;
}

var div = document.getElementsByClassName('pause')[0];
div.addEventListener('click', function (event) {
  setPause();
});



