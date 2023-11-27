

//==================================================================
//
//==================================================================
function layout(cb)	{
	var f = arguments.callee.toString().replace(/function\s+/,'').split('(')[0],
			dbg=1, fEnd=function(){ dbg&&console.timeEnd(f); console.groupEnd(f); if (typeof cb=='function') cb() };
	if (dbg){ console.group(f); console.time(f) };


	//----------------
	// MAIN
	//----------------

	d3.select('body')
	.call(function(sel)	{

		var el=[];
		if (M.style.alert		&&	M.style.alert.enabled) el.push({ el:'div', class:'alert alert-app-level'});
		if (M.style.header	&&	M.style.header.enabled) el.push({ el:'header', class:'header header-6'});
		if (M.style.subnav	&&	M.style.subnav.enabled) el.push({ el:'nav', class:'subnav'});
		el.push({ el:'div', class:'content-container'});
		if (M.style.footer	&&	M.style.footer.enabled) el.push({ el:'nav', class:'footer'});


		sel.append('div').attr('class','main-container')
		.call(function(sel)	{

			el.forEach(function(k)	{
				sel.append(k.el).attr('class',k.class);
			});


		});
	});



	//--------------
	// content-container > content-area
	//--------------
	var elContent=[];
	if (M.style.sidenav		&&	M.style.sidenav.enabled) elContent.push({ el:'nav', class:'sidenav'});
	elContent.push({ el:'div', class:'content-area' });

	d3.select('.content-container')
	.call(function(sel)	{
		elContent.forEach(function(k)	{
			sel.append(k.el).attr('class',k.class);
		});
	});


	//--------------
	// content-container > content-area > sidenav
	//--------------
	if (M.style.sidenav		&&	M.style.sidenav.enabled)	{
		d3.select('.sidenav')
			.styles({
				top:'23px',
				left:'0px',
				width:'400px',
				transform: M.style.sidenav.collapsed ? 'translateX(-400px)' : 'translateX(px)',
			});
	}



	fEnd();
}
