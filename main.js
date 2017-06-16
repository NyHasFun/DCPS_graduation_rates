/*
	svg
	parseTime
	process data
	- file
	- row
	- get
	line generator
	x and y scales

*/

var svg = d3.select("svg"),
		margin = {top: 20, right: 150, bottom: 30, left: 50},
  	width = svg.attr("width") - margin.left - margin.right,
  	height = svg.attr("height") - margin.top - margin.bottom,
  	chartGroup = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y")

d3.csv("Schools.csv")
	.row(function(d,_,columns){ 
		d.date = parseTime(d.date); 
		for (var i = 1; i < columns.length; ++i){
			d[columns[i]] ? d[columns[i]] = Number(d[columns[i]].slice(0,-1)) : d[columns[i]] = null
		}
		return d; 
	})
	.get(function(error, data) {
		if(error) throw error;

		var wards = data.columns.slice(1).map(function(id){
			return{
				id: id,
				values: data.map( function(d) { return {date: d.date, rate: d[id] }; })
			}
		})

		var xScale = d3.scaleTime()
				.range([0,width])
				.domain(d3.extent(data, function(d) { return d.date; }));
		var yScale = d3.scaleLinear()
				.range([height,0])
				.domain([0,100])
		var zColor = d3.scaleOrdinal(d3.schemeCategory10)
				.domain(wards.map(function(c) { return c.id; }));

	    var line = d3.line()
	    .defined(function(d) { return d.rate != null; })
			.x(function(d) { return xScale(d.date); })
			.y(function(d) { return yScale(d.rate); });

	    var ward = chartGroup.selectAll(".ward")
	    	.data(wards)
	    	.enter().append("g")
	      	.attr("class", "ward");

	    ward.append("path")
	      .attr("class", "line")
	      .attr("d", function(d) { return line(d.values); })
	      .style("stroke", "#d3d3d3")
	      .on("mouseover", mousemove )
	      .on("mouseout", mouseout);

	    ward.append("text")
	      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
	      .attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.rate) + ")"; })
	      .attr("x", 3)
	      .attr("dy", "0.35em")
	      .attr('class', 'lable' )
	      .attr('display', 'inline' )
	      .style("font", "10px sans-serif")
	      .text(function(d) { return d.id; });

	    chartGroup.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(xScale).ticks(5));

	    chartGroup.append("g")
	      .attr("class", "axis axis--y")
	      .call(d3.axisLeft(yScale));

	     function mousemove(e) {
	     	d3.select(this).style("stroke-width","3px").style("stroke", "blue");
	     }

	     function mouseout(){
	    	d3.select(this).style("stroke-width","1.5px").style("stroke", "#d3d3d3");
	     }
	});
