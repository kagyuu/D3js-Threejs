/**
 * Crealte time series chart.
 * @param title title
 * @param dataset data
 * @param w width
 * @param h height
 * @param linetype linear, step-before, step-after, basis, basis-open, basis-closed
 * , bundle, cardinal, cardinal-open, cardinal-closed, monotone
 * @return svg dom element
 */
function plot(title, dataset, w, h, linetype, color) {
	var margin = {x:50, y:20};

//    var svg = d3.select("body").append("svg").attr({width: w, height: h}).style("padding","5px");
	// to create SVG, HTML and XUL elements needs namespace
	var dom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var svg = d3.select(dom).attr({width: w, height: h}).style("padding","5px");
    svg.attr({width: w, height: h}).style("padding","5px");

	// svg.append("rect").attr({x:0, y:0, width:w, height:h, stroke:"black", fill:"snow"});

	// min value
	var minX = d3.min(dataset, function(d) {
	    return d.date;
	});
	
	// max value
	var maxX = d3.max(dataset, function(d) {
	    return d.date;
	});
	
	var scaleX = d3.scale.linear()
	    .domain([minX - 86400000, maxX + 86400000])
	    .rangeRound([margin.x, w - margin.x])
	    .clamp(true);
	
	var formatX = function(time){
	    var formatter = d3.time.format("%b%d");
	    return formatter(new Date(time));
	};
	var axisX = d3.svg.axis()
	    .scale(scaleX)
	    .orient("bottom")
	    .ticks(5) // That's only hint, d3.js will overwrite concise number !
	    .tickFormat(formatX)
	    .tickSubdivide(true)
	    .tickSize(-(h - margin.y * 2), -(h - margin.y * 2), 0);
	
	// min value
	var minY = d3.min(dataset, function(d) {
	    return d.value;
	});
	
	// max value
	var maxY = d3.max(dataset, function(d) {
	    return d.value;
	});
	
	var scaleY = d3.scale.linear()
	    .domain([minY - 100, maxY + 100])
	    .nice()
	    .rangeRound([h - margin.y, margin.y])
	    .clamp(true);
	
	var axisY = d3.svg.axis()
	    .scale(scaleY)
	    .orient("left")
	    .ticks(5)
	    .tickSubdivide(true)
	    .tickSize(-(w - margin.x * 2), 3, 0);

    var line = d3.svg.line()
        .x(function(d) { return scaleX(d.date); })
        .y(function(d) { return scaleY(d.value); })
        .interpolate(linetype);

    var area = d3.svg.area()
        .x(function(d) { return scaleX(d.date); })
        .y0(function(d) { return scaleY(0); })
        .y1(function(d) { return scaleY(d.value); })
        .interpolate(linetype);

    svg.append("path")
        .attr("d", line(dataset))
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("fill", "none");

/*
    svg.append("path")
        .attr("d", area(dataset))
        .attr("fill", "pink")
        .attr("opacity", 0.2);
*/

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d){ return scaleX(d.date); })
        .attr("cy", function(d){ return scaleY(d.value); })
        .attr("r", "2")
        .attr("fill", color);

/*
    svg.append("g").selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .attr({
            "font-size" : 8,
			'stroke': 'white',
            "x" : function(d){ return scaleX(d.date); },
            "y" : function(d){ return scaleY(d.value) + 10; }
        })
        .text(function(d){
            return d.value;
        });
*/

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - margin.y) + ")")
        .call(axisX);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.x + ",0)")
        .call(axisY);

    svg.append("text")
        .attr({
            "font-size" : 15,
			'stroke': color,
            "text-anchor" : "start",
            "x" : w/2,
            "y" : 15})
        .text(title);

	// append css to axis
	// we need append style attributes on the svg-tags, because canvas renderer don't refer css
	svg.selectAll('.axis').selectAll('text').attr({
		'font-family': 'sans-serif',
		'font-size': '8px',
	    'stroke': color,
	});

	svg.selectAll('.axis').selectAll('path').attr({
	    'fill': 'none',
	    'stroke': color,
	    'shape-rendering': 'crispEdges'	
	});
	
	svg.selectAll('.axis').selectAll('line').attr({
	    'fill': 'none',
	    'stroke': color,
	    'shape-rendering': 'crispEdges'	
	});
	
	return dom;
}

/**
 * Render svg to new canvas
 * @param svg svg
 * @return canvas
 */
function svg2canvas(svg) {
	var $svg = $(svg);
	var canvas = document.createElement('canvas');
	canvas.width = $svg.attr('width');
	canvas.height = $svg.attr('height');
	
	context = canvas.getContext("2d");
	var image = new Image();
	image.src = "data:image/svg+xml;charset=utf-8;base64,"
	                       + btoa(unescape(encodeURIComponent((new XMLSerializer()).serializeToString(svg))));
	context.drawImage(image, 0, 0);

	return canvas;
}

function canvas2png(canvas) {
	return canvas.toDataURL();
}