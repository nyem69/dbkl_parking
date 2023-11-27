

M.title = 'DBKL Parking';
M.timer={};
M.style={
	header:{
		enabled:false,
	},
	subnav:{
		enabled:false,
		bg:'#171717',
		color:'#ddd',
	},
	sidenav:{
		enabled:false,
		collapsed:false,
		bg:'#999',
		color:'#ddd',
	}
};

M.logo = {
	LOT10:'img/Lot10.png',
	SGWANG:'img/sungeiwanglogo.png',
	STARHILL:'img/starhill.png',
	PAVILION:'img/pavilion.png',
	LOWYAT:'img/lowyat.png',
	KLCC:'img/klcc.png',
	FAHRENHEIT:'img/fahrenheit.png',
};

M.data={};

var comma = d3.format(",")
		f1 = d3.format(".1f");



var brewer=[];
for (var i in chroma.brewer)	{
	brewer.push(i);
}
//console.log('brewer', brewer);

if (!M.current.theme||!chroma.brewer[M.current.theme]) M.current.theme = d3.shuffle(brewer)[0];

var colors = chroma.brewer[M.current.theme],
		bgColor = d3.select('body').style('background'),
		bgLuminance = chroma(bgColor).luminance();



dbg=1;
dbg&&console.log('M.current.theme', M.current.theme);
dbg&&console.log('colors', colors);


function main()	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };

	document.title = M.title;


	if (!M.current.bg) M.current.bg = 'dark';

	var style = {
		background:'#fff',
		color:'#000'
	};

	if (M.current.bg == 'dark')	{
		style.background='#000';
		style.color='#fff';
	}

	d3.select('html').style(style);
	d3.select('body').style(style);



//
//	d3.select('body')
//		.append('div').attr('class','container')
//			.append('div').attr('class','row').call(function(sel)	{
//
//				sel.append('div').attr('class','col-xs-12 col-sm-6')
//					.attr('id','container1');
//
//				sel.append('div').attr('class','col-xs-12 col-sm-6')
//					.attr('id','container2');
//
//			});

//	var w = d3.min([ 400, d3.max([ ((innerWidth-200)/2), 640 ]) ]);
	var w = d3.min([ 800, d3.max([ ((innerWidth-200)/2), 640 ]) ]);
	dbg&&console.log('w',w);


	d3.select('body')
		.append('div').attr('class','container')
		.call(function(sel)	{

			sel.append('h1')
				.styles({
					'text-align':'center',
					margin:'12px',
				})
				.html('DBKL Parking Guidance Information System (PGIS)')

			sel
				.append('div')
				.attr('class','row')
				.styles({
					display:'flex',
					'flex-wrap':'nowrap',
					'justify-content':'center',
					'align-items':'center',
					margin:0,
					padding:0,
				})
				.call(function(sel)	{



					sel
						//.append('div')
						.selectAll('.div-img').data( d3.shuffle('D1,D2,D3,D6,D7,D8,D9'.split(',')).slice(0, 3 ))
							.enter()
								.append('div').attr('class','div-img')
								.styles({
									flex:'1 1 250px',
									'text-align':'center',
								})
								.append('img')
									.attr('src', function(d){ return 'img/'+d+'.png'})
										.styles({
											'max-width':'230px',
											'max-height':'230px',
										});


//					var boards=[
//						'http://www.dbklpgis.my/dbklpgisd5.xml',
//						'http://www.dbklpgis.my/dbklpgisd2.xml',
//						'http://www.dbklpgis.my/dbklpgisd3.xml',
//						'http://www.dbklpgis.my/dbklpgisd6.xml',
//						'http://www.dbklpgis.my/dbklpgisd7.xml',
//						'http://www.dbklpgis.my/dbklpgisd8.xml',
//						'http://www.dbklpgis.my/dbklpgisd9.xml',
//
//						'http://www.dbklpgis2.my/dbklpgisd5.xml',
//						'http://www.dbklpgis2.my/dbklpgisd2.xml',
//						'http://www.dbklpgis2.my/dbklpgisd3.xml',
//						'http://www.dbklpgis2.my/dbklpgisd6.xml',
//						'http://www.dbklpgis2.my/dbklpgisd7.xml',
//						'http://www.dbklpgis2.my/dbklpgisd8.xml',
//						'http://www.dbklpgis2.my/dbklpgisd9.xml',
//					];
//
//					sel.append('div')
//						.styles({
//							flex:'1 1 640px',
//						})
//						.selectAll('iframe').data([ d3.shuffle(boards)[0] ])
//							.enter()
//								.append('iframe')
//									.attr('src', function(d){ return d })
//									.styles({
//										'width':'640px',
//										'height':'640px',
//									});



				});



			//==================================================================
			//
			//==================================================================


			sel
				.append('div')
				.attr('class','row')
				.styles({
						display:'flex',
				})
				.call(function(sel)	{


					sel.append('div')
						//.attr('class','col-xs-12 col-sm-6')
						.styles({
							flex:'1 1 50%',
						})
						.attr('id','container1');

					sel.append('div')
						//.attr('class','col-xs-12 col-sm-6')
						.styles({
							flex:'1 1 50%',
						})
						.attr('id','container2');


				});


			//==================================================================
			//
			//==================================================================


			sel
				.append('div')
				.attr('class','row')
				.styles({
						display:'flex',
						'text-align':'center'
				})
				.call(function(sel)	{

					sel.append('div')
						.styles({
							flex:'1 1 auto',
							background:'#666',
							padding:'6px 12px',
							cursor:'pointer',
						})
						.on('click', function(d){
							var w = +d3.select('.g-grid').style('width').replace('px','');
							d3.selectAll('.g-grid').transition().style('width',(w-400)+'px')
						})
						.html('-');


					sel.append('div')
						.styles({
							flex:'1 1 auto',
							background:'#999',
							padding:'6px 12px',
							cursor:'pointer',
						})
						.on('click', function(d){
							var w = +d3.select('.g-grid').style('width').replace('px','');
							d3.selectAll('.g-grid').transition().style('width',(w+400)+'px')
						})
						.html('+');



//					sel.append('div')
//						.styles({
//							'text-align':'center'
//						})
//						.call(function(sel)	{

/*
							sel.append('span')
								.on('click', function(d){
									var w = +d3.select('.g-grid').style('width').replace('px','');
									d3.selectAll('.g-grid').transition().style('width',(w-400)+'px')
								})
								.styles({
									'width' :w+'px',
									background:'#666',
									padding:'6px 12px',
									cursor:'pointer',
								})
								.html('-');

							sel.append('span')
								.on('click', function(d){
									var w = +d3.select('.g-grid').style('width').replace('px','');
									d3.selectAll('.g-grid').transition().style('width',(w+400)+'px')
								})
								.styles({
									'width': w+'px',
									background:'#999',
									padding:'6px 12px',
									cursor:'pointer',
								})
								.html('+');
*/

//						});




				});

			//==================================================================
			//
			//==================================================================

			sel
				.append('div')
				.attr('class','row')
				.styles({
						display:'flex',
				})
				.call(function(sel)	{

/*
					sel.append('div')
						.style('flex','1 1 '+(w)+'px')
						.style('justify-content','space-evenly')
						.attr('id','container3');

					sel.append('div')
						.style('flex','1 1 '+(w)+'px')
						.style('justify-content','space-evenly')
						.attr('id','container4');

					sel.append('div')
						.style('flex','1 1 '+(w)+'px')
						.style('justify-content','space-evenly')
						.attr('id','container5');

					sel.append('div')
						.style('flex','1 1 '+(w)+'px')
						.style('justify-content','space-evenly')
						.attr('id','container6');
*/

					sel.append('div')
						.style('flex','1 1 100%')
						.style('justify-content','space-evenly')
						.attr('id','container3');

					sel.append('div')
						.style('flex','1 1 100%')
						.style('justify-content','space-evenly')
						.attr('id','container4');

					sel.append('div')
						.style('flex','1 1 100%')
						.style('justify-content','space-evenly')
						.attr('id','container5');

					sel.append('div')
						.style('flex','1 1 100%')
						.style('justify-content','space-evenly')
						.attr('id','container6');


				});


		});





//	layout();

//	load(function(){
//		prep(function(){
//			viz(fEnd);
//		});
//	});


	viz1(fEnd);
	viz2();
	viz3();
	viz4();
	viz5();

}

