

//==================================================================
//
//==================================================================
function viz4(cb)	{

	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	var dsl = {
		size:0,
		query:{
			bool:{
				must_not:[
					{
						query_string:{
							query:'premis:"MAJU JUNCTION" OR premis:"SEMUA HOUSE"'
						}
					}
				]
			}
		},
		aggs:{
			AGG:{
				terms:{
					field:'bulan.keyword',
					size:50
				},
				aggs:{

					ALL:{
						stats:{
							field:'lot',
						}
					},

					AGG:{
						date_histogram:{
							field:'masa',
							interval:'1h'
						},
						aggs:{
							AGG:{
								stats:{
									field:'lot'
								}
							}
						}
					}
				}
			}
		}
	};




	d3.request('/_es/121/parking_dbklpgis/_search')
		.header("Content-Type", "application/json")
		.post(JSON.stringify(dsl), function(err, raw){
			if (err) throw(err);
			var res = JSON.parse(raw.responseText);
			dbg&&console.log("res", res);


			var key = 'bulan';

			M.data[key] = [];
			M.data[key+'_hourly']=[];

			res.aggregations.AGG.buckets.forEach(function(d){

				var all = d.ALL;
				all[key] = d.key;

				M.data[key].push(all)


				d.AGG.buckets.forEach(function(k)	{
					var time = k.key_as_string.match(/^(\d+):/)[1];
					var stats = k.AGG;
					stats[key] = d.key;
					stats.masa = time;
					M.data[key+'_hourly'].push(stats);
				});
			});


			dbg&&console.log('M.data['+key+']', M.data[key]);
			dbg&&console.log('M.data['+key+'_hourly]', M.data[key+'_hourly']);

			viz4_render(fEnd, key, '#container5');
		});


}



//==================================================================
//
//==================================================================
function viz4_render(cb, key, elid)	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };



	var nest = d3.nest()
		.key(function(d){ return d[key] })
		.key(function(d){ return d.masa })
		.entries( M.data[ key+'_hourly' ] )


	dbg&&console.log('nest', nest);


	var sel = d3.select(elid);
	dbg&&console.log('width',  sel.style('width') );
	dbg&&console.log('height',  sel.style('height') );

	var width = 1000;
	var w = Math.floor((width - 100)/24),
			h = 25;


//	var scales={};

	nest.forEach(function(d){
		d.max = d3.max(d.values, function(d){ return d.values[0].avg });
		d.min = d3.min(d.values.filter(function(d){ return d.values[0].avg>0 }), function(d){ return d.values[0].avg });

//		scales[d.key] = d3.scaleLinear().domain([d.min,d.max]).range(['black','cyan']);
//		scales[d.key] = d3.scaleSqrt().domain([d.min,d.max]).range([colors[0],'lime']);

	});

	var min = d3.min(nest, function(d){ return d.min });
	var max = d3.min(nest, function(d){ return d.max });
	var scales=d3.scaleLinear().domain([min,max]).range(['crimson','cyan']);


	nest.sort(d3.comparator().order(d3.ascending,
		function(d){ return [
				'JANUARY','FEBRUARY','MARCH','APRIL',
				'MAY','JUNE','JULY','AUGUST',
				'SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'
			].indexOf(d.key) })
	);


	sel.append('h3')
		.styles({
			color:'#fff',
			'text-align':'center',
		})
		.html('Collective Available Parking Spots by MONTH');

	sel.append('h5')
		.styles({
			color:'#fff',
			'text-align':'center',
		})
		.html('Average No of Vacant Spots Per Hour');


	sel.append('svg')
		.attrs({
			class:'g-grid',
			viewBox:[
				0,0,
				width,
				h * (nest.length + 3)
			].join(' '),
		})
//		.styles({
//			'max-width': width+'px'
//		})
		.append('g')
			.call(function(sel)	{


				sel.append('g')
					.attr('transform','translate(100,0)')
					.selectAll('.g-time').data(d3.range(0,24))
						.enter()
							.append('text')
								.attrs({
									x:w/2,
									y:h-5,
									fill:'#fff',
									'text-anchor':'middle',
									'transform':function(d,i){ return 'translate('+(i*w)+',0)' },
								})
								.text(function(d){
										return d==0 ? '12AM'
//											: d<12 ? d+'AM'
//											: d>12 ? d-12+'PM'
											: d<12 ? d+''
											: d>12 ? d-12+''
											: d+'PM'
								})


				sel.selectAll('.g-premis').data(nest, function(d){ return d.key })
					.enter()
						.append('g')
							.attrs({
								class:'g-premis',
								transform:function(d,i){ return 'translate(0,'+((i+1)*h)+')' },
							})
							.call(function(sel)	{

								sel.append('text')
									.attrs({
										fill:'#fff',
										x:10,
										y:h-5,
										'font-size':'12px',
									})
									.text(function(d){ return d.key });


								sel
									.append('g').attr('transform','translate(100,0)')
									.selectAll('.g-time').data(function(d){ return d.values })
									.enter()
										.append('g')
											.attrs({
												class:'g-time',
												transform:function(d,i){ return 'translate('+(i*w)+',0)' },
											})
											.call(function(sel)	{

												sel.append('rect')
													.attrs({
														width:w,
														height:h,
														fill:function(d){ return scales(d.values[0].avg) }
													});

												sel.append('text')
													.attrs({
														fill:function(d){ return chroma(scales(d.values[0].avg)).luminance() > .4 ? '#000' : '#fff' },
														//'font-weight':function(d){ return chroma(scales[d.values[0].premis](d.values[0].avg)).luminance() > .4 ? 700 : 300 },
														'font-weight':700,
														x:w/2,
														y:h/2+5,
														'text-anchor':'middle',
														'font-size':'12px',
													})
													.text(function(d){ return Math.floor(d.values[0].avg)==0 ? '' : Math.floor(d.values[0].avg) });


											});

							});


			});


	fEnd();
}
