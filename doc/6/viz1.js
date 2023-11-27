


var timeOut;

//==================================================================
//
//==================================================================
function viz1(cb)	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	var url = '/api/viz/parking/?' + [
		'callback=?'
	].join('&');


	$.getJSON(url, function(res){

		M.data = res.result.filter(function(d){ return d3.sum(d.timeline, function(d){ return d[1] }) > 0 });

//		console.log('M.data', JSON.stringify(M.data,null,2));

		timeOut = window.setTimeout(function(){
			refreshChart();
		},100);


		window.setInterval(function(){
			updateTime();
		},1000);

	});




	function loadUpdates()	{

//		console.log('M.data', M.data);

		d3.json('/api/viz/parking/', function(err,res)	{
			console.log('res', res);
			res.result.filter(function(d){ return d3.sum(d.timeline, function(d){ return d[1] }) > 0 })
			.forEach(function(msg)	{
				updateChart(msg);
			});
		});
	}



	//---------------------------------------------------------------------------------
	// update data from pubnub msg
	//---------------------------------------------------------------------------------

	function updateChart(msg)	{


//		console.log('msg', msg);

		M.data.filter(function(d){ return d.id==msg.id}).forEach(function(d){


			d.occupied = +msg.occupied;
			d.available = +msg.available;

			var t = new Date(msg.time);
			//d.time = parseInt(+t/1000); // mysql unix second

			d.timeline.push([ d.time, +msg.available,+msg.available, +msg.available ]);

			var timeline=[];
			d3.nest().key(function(d){ return d[0] }).entries(d.timeline)
			.forEach(function(k){
				timeline.push(k.values[0]);
			});

			d.timeline = timeline;
			//d.timeline.sort( d3.comparator().order( d3.ascending, function(d){ return d.time}) );

		});


		timeOut = window.setTimeout(function(){
			refreshChart();
		},100);

	}




	//---------------------------------------------------------------------------------
	// update Time
	//---------------------------------------------------------------------------------
	function updateTime()	{

		if (M.piechart)	{

			var chart =  M.piechart.highcharts();
	    chart.setTitle(null, { text: 'as of '+ moment(M.latestTime*1000).format('HH:mm')+', '+moment(M.latestTime*1000).fromNow() });

		}

	}

	//---------------------------------------------------------------------------------
	// refresh
	//---------------------------------------------------------------------------------

	function refreshChart()	{

		M.latestTime = d3.max(M.data, function(d){ return +d.time });
		M.oldestTime = d3.min(M.data, function(d){ return +d.time });


		//console.log('refreshChart() timeOut',timeOut);

		if (timeOut) {

			window.clearTimeout(timeOut);
			pieChart(M.data);
			lineChart(M.data);
		}

		timeOut = null;

	}


	//---------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------
	function pieChart(res)	{


	  var mallData = [],
	      statusData = [],
	      i,
	      j,
	      drillDataLen,
	      brightness;


		var data2=[], cat2=[];


//		dbg&&console.log('colors', colors);

		res.sort(
			d3.comparator()
				.order(d3.descending, function(d){ return +d.max_available })
		).forEach(function(d,i){

			cat2.push(d.id);
			data2.push({
				y: +d.max_available,
				color: colors[i],
				drilldown: {
					name: d.id+' Status',
					categories:[
						'Available',
						'Occupied',
					],
					data:[
						+d.available,
						+d.occupied,
					],
					color: colors[i]
				}
			});

		});


		var categories = cat2;
		var data = data2;
		var dataLen = data.length;

		//console.log('data',data);

		var ttl = d3.sum( data, function(d){ return d.y });

	  // Build the data arrays
	  for (i = 0; i < dataLen; i += 1) {
	//  	if (data[i].y)	{


		      // add browser data
		      mallData.push({
		          name: categories[i],
		          y: data[i].y,
		          color: chroma(data[i].color).darker().darker().hex()
		      });

		      // add version data
		      drillDataLen = data[i].drilldown.data.length;
		      for (j = 0; j < drillDataLen; j += 1) {
		          brightness = 0.2 - (j / drillDataLen) / 5;
		          statusData.push({

									parentid: categories[i],
									parentTotal: data[i].y,
									parentColor: chroma(data[i].color).darker().darker().hex(),
									parentPerc: (data[i].y/ttl)*100,

		              name: data[i].drilldown.categories[j],
		              y: data[i].drilldown.data[j],
		              color: j%2==0
		              	? 'lime' //data[i].color
		              	: chroma(data[i].color).darker().darker().hex()

		          });
		      }
	//	    }
	  }


		if (M.piechart)	{

			var chart =  M.piechart.highcharts();
			chart.series[1].setData(statusData);

		}else	{


	    // Create the chart
	    M.piechart = $('#container1').highcharts({
	        chart: {
	          type: 'pie',
	          backgroundColor:'rgba(0,0,0,0)',
	          plotBackgroundColor:'rgba(0,0,0,0)'
	        },
	        credits: {
	        	enabled: false
	        },
	        title: {
	          text: 'Available Parking Spots',
	          style:{
	          	color: bgLuminance >.4 ? '#000' : '#fff'
	          }
	        },
	        subtitle: {
	          text: 'as of '+ moment(M.latestTime*1000).format('HH:mm')+', '+moment(M.latestTime*1000).fromNow(),
	          style:{
	          	color: bgLuminance >.4 ? '#000' : '#fff'
	          }
	        },
	        yAxis: {
	            title: {
	                text: 'Total spots'
	            }
	        },
	        plotOptions: {
	            pie: {
	                shadow: false,
	                center: ['50%', '50%'],
	                borderWidth:0,
	            }
	        },
	        tooltip: {
	            //valueSuffix: '%'
	        },
	        series: [{
	          name: 'Max Spots',
	          data: mallData,
	          //size: '70%',
	          dataLabels: {
	            formatter: function () {
	                return this.y > 5 ? this.point.name : null;
	            },
	            color: 'white',
	            distance: -80
	          }
	        }, {
	            name: 'Spots',
	            data: statusData,
	            size: '95%',
	            innerSize: '70%',
	            dataLabels: {
	              distance: -20,
	              useHTML:true,
	              formatter: function () {
	              	//console.log(this);
	                return this.key == 'Available'
	                	? '<b>'+ comma(this.y) + '<b>'
	                	: this.point.parentPerc > .5 && this.y/this.point.parentTotal > .5
		                	?	[
		                			'<div style="line-height:10px;color:'+(chroma(this.point.parentColor).luminance()>.4 ? '#000' : '#fff')+'">',
			                			f1((this.y/this.point.parentTotal)*100),
			                			'%<br>FULL',
		                			'</div>'
		                		].join('')
		                	: null
	              },
	              color:'black'
	            }
	        }]
	    });

		}

	}

	//---------------------------------------------------------------------------------
	// timeline
	//---------------------------------------------------------------------------------

	function lineChart(res)	{

		//console.log('lineChart()');

		var series=[];

		var yLeft=[],
				yRight=[];


		res.forEach(function(d,i){

			var k={
				name: d.id,
				data:[],
				color:chroma(colors[i]).darker().hex(),
				marker:{
	//				symbol: symbols[d.id] ? symbols[d.id] : 'circle'
					symbol: 'circle'
				}
			};

			var t={};

			d.timeline.sort(
				d3.comparator()
					.order(d3.ascending, function(d){ return +d[0] })
			).forEach(function(d){

				if (!t[d[0]])	{

					k.data.push({
						x:+moment(+d[0]*1000).add(8,'h').format('x'),
						y:+d[1]
					});

				}

				t[d[0]] = +d[1];

			});


			// avoid overlap dataLabels
			var showLabelLeft=true,
					showLabelRight=true,
					offset = 50;

			yLeft.forEach(function(d){
				if (k.data[ 0 ].y >= +d-offset && k.data[ 0 ].y <= +d+offset) showLabelLeft=false;
			});

			yRight.forEach(function(d){
				if (k.data[ k.data.length-1 ].y >= +d-offset && k.data[ k.data.length-1 ].y <= +d+offset) showLabelRight=false;
			});


			//----------------------------------------
			// first point dataLabels
			//----------------------------------------
			k.data[ 0 ].dataLabels = {
	      enabled: showLabelLeft,

	      align: 'right',
	      crop: false,
	      overflow: 'none',
	      verticalAlign:'middle',

	      formatter: function () {
	        return this.series.name;
	      },
	      style:{
	      	fontSize:'15px',
	      	color: bgLuminance > .4 ? chroma(colors[i]).darker().darker().hex() : colors[i]
	      }
			};


			//----------------------------------------
			// last point dataLabels
			//----------------------------------------
			k.data[ k.data.length-1 ].dataLabels = {
	      enabled: showLabelRight,
	      allowOverlap: false,
	      align: 'left',
	      crop: false,
	      overflow: 'none',
	      verticalAlign:'middle',

	//      color:'#000',
	      formatter: function () {
	        return comma(d.available);
	        //+' '+moment(d.time*1000).fromNow();
	      },
	      style:{
	      	fontSize:'20px',
	      	color: bgLuminance > .4 ? chroma(colors[i]).darker().darker().hex() : colors[i]
	      }
			};

			yLeft.push(k.data[0].y);
			yRight.push(k.data[k.data.length-1].y);

			series.push(k);

		});


		series = series.reverse();
		//console.info('series',series);

		//----------------------------------------
		// chart settings
		//----------------------------------------
		var conf = {

	    chart: {
	      type: 'spline',
	      marginLeft: 100,
	      marginRight: 100,
	      backgroundColor:'rgba(0,0,0,0)',
	      plotBackgroundColor:'rgba(0,0,0,0)'
	    },
	    credits:{
	    	enabled:false
	    },

	    title: {
	      text: 'Availability Over Time',
	      style:{
	      	color: bgLuminance >.4 ? '#000' : '#fff'
	      }
	    },
	    subtitle: {
	      text: moment(M.oldestTime*1000).format('dddd D MMM YYYY'),
	      style:{
	      	color: bgLuminance >.4 ? '#000' : '#fff'
	      }
	    },

	    legend:{
	    	enabled:false
	    },
	    xAxis: {

	      type: 'datetime',

	      //min: series[0].data[0],
	      //max: moment().add(1,'h').format('x'),

	      dateTimeLabelFormats:{
	      	minute: '%H:%M',
	      	hour: '%H:%M',
	      },

	      title: {
	      	enabled:false,
	        text: 'Time'
	      },

	      opposite: true,

	      alternateGridColor: bgLuminance > .4 ? 'rgba(50,50,50,.1)' : 'rgba(200,200,200,.1)',

	      gridLineWidth:0,
	      tickWidth:0,
	      lineWidth:0,
	      gridLineColor:'#f5f5f5',
	      tickColor:'#f5f5f5',
	      lineColor:colors[0],
	    },
	    yAxis: {
	      title: {
	      	enabled:false,
	        text: 'No of Available Spots'
	      },
	      type: 'logarithmic',
	      //min: 0,
	      labels:{
	      	enabled:false
	      },
	      gridLineWidth:0,
	    },
	    tooltip: {
	//      headerFormat: '<b>{series.name}</b><br>',
	//      pointFormat: '{point.x:%H:%M}: <b>{point.y}</b>'
	      headerFormat: '<div>as of <b>{point.x:%H:%M}</b><div><br>',
	      pointFormat: '<div><b>{series.name}</b> : <b>{point.y}</b></div><br>',

	      shared: true,
	      crosshairs: true
	    },

	    plotOptions: {

	      spline : {
	      	lineWidth:4,
	      	stacking:null,
	        marker: {
	          enabled: false
	        },
	        dataLabels : {
	          enabled : false,
	        }
	      }

	    }
	  };




		if (M.linechart)	{

			var chart =  M.linechart.highcharts();

			chart.series.forEach(function(d,i)	{

	//			console.info('chart.series', chart.series[i], series[i] );

				chart.series[i].update({
	//			  pointStart: series[0].pointStart,
				  data: series[i].data
				}, true);

			});


		}else	{

			conf.series = series;
	    M.linechart = $('#container2').highcharts(conf);

		}


	}

	//---------------------------------------------------------------------------------
	// load logo
	//---------------------------------------------------------------------------------
	var symbols={};
	for (var i in M.logo)	{
		convertImg2Base64(i, M.logo[i], function(id, dataURL){
			symbols[id] = 'url('+dataURL+')';
		});
	}


	function convertImg2Base64(id, url, callback, outputFormat)	{
		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = function(){
		    var canvas = document.createElement('CANVAS'),
		    ctx = canvas.getContext('2d'), dataURL;
		    canvas.height = this.height;
		    canvas.width = this.width;
		    ctx.drawImage(this, 0, 0);
		    dataURL = canvas.toDataURL(outputFormat);
		    dURL = dataURL;
		    callback(id, dataURL);
		    canvas = null;
		};
		img.src = url;
	}



	fEnd();
}

