# FITS
JavaScript library for handling FITS astronomical format (http://fits.gsfc.nasa.gov/).

Installation:

    npm install fits


## Usage:

Synchronous processing of lines:

	var fits = require('FITS');


	var FITS = new fits('fits/samples/2dF-361520.fits');
  	FITS.on('loaded', function(){
		console.log(FITS.HDU.primary);
  	});



## License:
The MIT License (MIT)

Copyright � 2014 Joe Rosa