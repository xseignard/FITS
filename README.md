# FITS
JavaScript library for handling FITS astronomical format (http://fits.gsfc.nasa.gov/).

Installation:

    npm install fits

## Usage:

To read and get the FITS headers (HDU):

	var fits = require('FITS');

	fits.readFile(file, function(err, FITS){
		if(err) return console.error(err);
		console.log(FITS.HDU.primary);
	});



## License:
The MIT License (MIT)

Copyright � 2014 Joe Rosa