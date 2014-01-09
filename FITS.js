/*
 * FITS
 *
 * A NodeJS module that FITS astronomical files
 * http://fits.gsfc.nasa.gov/
 *
 * Copyright (c) 2014 Joe Rosa <joe.rosa@itpmngt.co.uk>
 * MIT License, see LICENSE.txt, see http://www.opensource.org/licenses/mit-license.php
 */

var path = require('path'),
    fs = require('fs'),
    zlib = require('zlib'),
    events = require('events'), util = require('util'), // Events
    mmmagic = require('mmmagic').Magic,
    magic = new mmmagic(), filetype = ''; // Detects file types (.gz, FITS)

var FITS = function(filepath, options){
  this.HDU = { "primary": {}, "extensions": [] }; this.images = []; this.tables = []; //FITS object
  this._encoding = options && options.encoding || 'utf8';
  self = this;

  filepath = path.normalize(filepath);
  fs.readFile(filepath, function (err, buffer) {
    if(err) return console.error(err);

    magic.detectFile(filepath, function(err, result) {
      if(err) return console.error(err);

      var readers = { // Accoding to file type and compressions
        'gzip': function(callback){
          zlib.gunzip(buffer, function(err, result) { // If gzip
            if(err){ return console.error(err) } else { return callback(result) } }) },
        'FITS': function(callback){ return callback(buffer) } }

      filetype = result.substr(0, result.indexOf(' '));
      if(!(filetype in readers)){ return console.error('Unknown file type: '+filetype) }
      readers[filetype](self.getFITSdata);
  }) }) }

util.inherits(FITS, events.EventEmitter); // Events

FITS.prototype.getFITSdata = function(data){ // Parse multiple headers
  var raw = data;
  data = data.toString(); // Needs to extract images and tables according
  var headerFlag = true, headerBlock = {}, dataBlock = [], line = '', primary = true;

  var saveHeader = function(headerBlock, dataBlock){
    if(primary){self.HDU.primary = headerBlock; primary = false;}
    else{ self.HDU.extensions.push(headerBlock) }
    self.images.push(dataBlock.join('')); } // Needs to save image according

  for (var i=0; i<(data.length/80); i++) {
    line = data.substring(i*80, (i*80)+80);

    if(!headerFlag){
      if(line.substring(0,8)=='XTENSION'){ // Check if starts a new header (XTENSION)
        saveHeader(headerBlock, dataBlock);
        headerFlag = true; headerBlock = {}; dataBlock = [];}}
    else{dataBlock.push(line)}
    
    if(headerFlag){
      if(line.substring(0,8)=='END     '){headerFlag = false}
      else{
        if(line.indexOf("=") != -1){
          main = line.split('/'); prop = main[0].split('=');
          // console.log(prop[0].trim() + ' = ' + prop[1].trim()); // data
          // console.log(prop[0].trim() + ' = ' + main[1].trim()); // metadata
          headerBlock[prop[0].trim()] = prop[1].trim(); }
        else { return console.error('FITS HDU is faulty: '+line); } } } }

  saveHeader(headerBlock, dataBlock);
  self.emit('loaded');
}

module.exports = FITS;