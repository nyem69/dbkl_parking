

var versi;
[].slice.call(document.getElementsByTagName("script"))
	.forEach(function(d){
		var src = d.getAttribute("src");
		if (src.match(/\/app.js/)) versi = src.split('/')[0];
	});

var version = versi,
		reqs='layout,main'.split(',').concat([
			'viz1',
			'viz2',
			'viz3',
			'viz4',
			'viz5',
		]);

var required = reqs.map(function(d){
	return version+'/'+d+'.js'
});

requirejs(required, function() {
	main();
});




