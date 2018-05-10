'use strict';
var pdftext = require('pdf-textstring');
var path = require('path');
var AbsolutePathToApp = path.dirname(process.mainModule.filename);
var pathToPdftotext = AbsolutePathToApp + "/binaries/pdftotext.exe";
var pathToPdffonts = AbsolutePathToApp + "/binaries/pdffonts.exe";

var promiseCount = 0;
var reticle, counterElement;
let counter = 0, delay = 700;
let pause = false, skip = false, rewind = false;
let fileArray, filteredArray, tempArray = [];

function wait(delay){
  var thisPromiseCount = ++promiseCount;
  //console.log('promiseCount: %d, delay: %d', promiseCount, delay);
  var promise = new Promise(
    function(resolve, reject){
      //console.log('promise function...');
      setTimeout(function(){
        resolve(thisPromiseCount);
      }, delay)
    }
  );
  return promise;
};

module.exports = {
  startReading: function(ret, counterElem) {
    //console.log('startReading()! ret param: %o', ret);
    if(ret) {
      reticle = ret;
    }
    if(counterElem) {
      counterElement = counterElem;
    }
    wait(delay).then(function() {
      // console.log('promise THEN');
      // console.log('reticle: %o', reticle);
      if (pause) {
        return;
      }

      reticle.innerHTML = filteredArray[counter];
      counterElement.innerHTML = counter;

      if (skip) {
        var skipCount = counter++;
        if(skipCount < filteredArray.length)
          counter = skipCount;
      }
      else if (rewind) {
        var rewindCount = counter--;
        if (rewindCount > 0)
          counter = rewindCount;
      } else {
        counter++;
      }
      
      startReading();
    });
  },

  getTextFromPDF: function (path, filename, customFilter, cb) {
    //console.log('callback function: %o', cb);
    var os = process.platform;

    console.log('OS is: %s', os);
    if(os === 'win32') {
      console.log('Win32 OS');
      pdftext.setBinaryPath_PdfToText(pathToPdftotext);
      pdftext.setBinaryPath_PdfFont(pathToPdffonts);
    }
    pdftext.pdftotext(path, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        tempArray = data.split(' ');
        if(customFilter) {
          filteredArray = tempArray.filter(customFilter);
        } else {
          filteredArray = tempArray;
        }
        filteredArray.forEach(function(value, idx) {
          //console.log(value);
          var regExLineBreaks = /\r{1}/g;
          if(value.match(regExLineBreaks)) {
            var arrayOfNewWords = [];
            var match, firstWord, extraWord;
            if((match = regExLineBreaks.exec(value)) != null) {
              //console.log('FOUND MATCH: %s AT INDEX: %d', value, match.index);
              if(match.index > 1) {
                firstWord = value.substr(0, match.index);
                extraWord = value.substr(match.index, value.length);
                filteredArray[idx] = firstWord;
                filteredArray.splice(idx + 1, 0, extraWord);
              }
            }
          }
          // var theWord = filteredArray[idx];
          // var midPoint = getMiddle(theWord);
          // var formatted = '';
          // if(midPoint.index > 0) {
          //   formatted = theWord.substr(0, midPoint.index) + '<b>' + midPoint.val + '</b>' 
          // + theWord.substr(midPoint.index + 1, theWord.length);
          // filteredArray[idx] = formatted;
          // } else {
          //   formatted = midPoint.val;
          // }
        });
  
        //console.log(JSON.stringify(filteredArray));
        console.log('Loaded PDF.');
        cb(filename, filteredArray.length);
      }
    });
  },

  returnPDFFormattedAsText: function(){
    if(fileArray.length > 0){

    }
  },

  handleFile: function(files, customFilter, cb) {
    fileArray = files;
    counter = 0;
    //console.log('handleFile(): filepath = %s', files[0].path);
    //console.log(fileArray);
    //filename = files[0].name;
    filename = getTextFromPDF(files[0].path, files[0].name, customFilter, cb);    //return filename;
  },

  //formula:   60 / ((total_time / 1000) / total_characters) / 5 + .05
  setWPM : function(wpm){
    switch(wpm){
      case '50':
        delay = 1200;
        break;
      case '100':
        delay = 600;
        break;
      case '150':
        delay = 550;
        break;
      case '200':
        delay = 450;
        break;
      case '250':
        delay = 400;
        break;
      case '400':
        delay = 250;
        break;
      case '500':
        delay = 200;
        break;
      case '600':
        delay = 150;
        break;
    }
    var wpmCalc = 60 / ((delay / 1000) / wpm) / 5 + .05;
    console.log('set WPM to: ' + wpm + "wpm - " + delay + "ms");
    console.log('wpm calc: ', wpmCalc / 10);
    return wpmCalc;
  },

  setPause : function(button){
    //console.log('pauseButton (param): ', button);
    //console.log('pauseButton (var): ', pauseButton);
    pause = !pause;
    if(pause) {
      button.innerHTML = "resume";
    } else {
      button.innerHTML = "pause"
      startReading();
    }
  },

  setFF: function(button){
    skip = !skip;
    rewind = !rewind;
    if(counter >= 0) {
      counter++;
      reticle.innerHTML = filteredArray[counter];
      counterElement.innerHTML = counter;
    }
    // if(skip) {
    //   button.innerHTML = "FF";
    // } else {
    //   button.innerHTML = ">>";
    // }
  },

  setRewind: function(button){
    rewind = !rewind;
    skip = !skip;
    if(counter >= 0) {
      counter--;
      reticle.innerHTML = filteredArray[counter];
      counterElement.innerHTML = counter;
    }
    // if(rewind) {
    //   button.innerHTML = "RR";
    // } else {
    //   button.innerHTML = "<<";
    // }
  }
};



