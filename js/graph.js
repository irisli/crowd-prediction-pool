$(function() {

		var data = [{
			label: "Label",
			data: serverData,
			color: "#6ECFF6",
    shadowSize: 0
		}];

		var options = {
			series: {
				lines: {
					show: true,
					fill: true,
					fillColor: 'rgba(110,207,246,0.05)'
				}
			}/*,
			crosshair: {
				mode: "x"
			}*/,
			legend: {
				noColumns: 2,
				margin: 0,
				position: "se"
			},
			xaxis: {
				tickDecimals: 0,
				mode: "time",labelHeight: 0,
    timeformat: "%m/%d %H:00",
    minTickSize: [1, "hour"],  
          timezone: "browser"
			},
			yaxis: {
				min: 0,labelWidth: 0
			},
			selection: {
				mode: "x",
				color:"#6ECFF6"
			},grid : {
				margin: 0,labelMargin: 0,
				axisMargin: 0,
				borderColor:'#d3f0fc',
				borderWidth:0,
				backgroundColor:"#fff"
			}
		};

		var placeholder = $("#placeholder");

		placeholder.bind("plotselected", function (event, ranges) {

			$("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));

			
			var insideRangeArray = new Array();

			for (var i = 0; i < data[0].data.length; i++) {
				if (ranges.xaxis.from < data[0].data[i][0] && data[0].data[i][0] < ranges.xaxis.to) {
					insideRangeArray.push([data[0].data[i][0],data[0].data[i][1]]);
				}
			}
			// Take riemann sum
			var deltaTotal = 0;
			var rangeSum = 0;
			var rangeAverage = 0;
			var instanceHours = 0;
console.log(insideRangeArray.length);
			for (var i = 0; i < insideRangeArray.length; i++) {
				if (insideRangeArray.length == 1) {
					console.log('zero:'+insideRangeArray[0][1]);
					rangeSum = insideRangeArray[0][1];
					deltaTotal = 1;
				} else if (i >= 1) {
					deltaTotal = deltaTotal + insideRangeArray[i][0] - insideRangeArray[i-1][0];
					rangeSum = rangeSum + (insideRangeArray[i][0] - insideRangeArray[i-1][0])*(insideRangeArray[i][1]+insideRangeArray[i-1][1])/2;
				}
			}
			if (deltaTotal != 0) {
				rangeAverage = rangeSum/deltaTotal;
			}
			console.log('delta:'+deltaTotal);
			console.log('sum:'+rangeSum);
			console.log('rangeAvg:'+rangeAverage);
			console.log('range:'+rangeAverage*(ranges.xaxis.to - ranges.xaxis.from));
			instanceHours = rangeAverage*(ranges.xaxis.to - ranges.xaxis.from);
			jQuery('.average').html('Average: ' + Math.round(rangeAverage*10)/10 + ' instances');
			jQuery('.total').html('Total: ' + Math.round(instanceHours/3600000*10)/10 + ' instance/hours');

			//console.log(insideRangeArray);
			//console.log(rangeAverage);
		});

		placeholder.bind("plotunselected", function (event) {
			$("#selection").text("");
		});

		var plot = $.plot(placeholder, data, options);

		$("#clearSelection").click(function () {
			plot.clearSelection();
		});

		// Add the Flot version string to the footer
		// Style some with jQuery
		jQuery('.legendColorBox').remove();
		jQuery('.legend div').remove();
		$('.legendLabel').html('<span class="average">Select range</span><span class="total"></span>');

		// Remove first and last
		$('.flot-x-axis .flot-tick-label:first-of-type, .flot-x-axis .flot-tick-label:last-of-type').remove();
		$('.flot-y-axis .flot-tick-label:first-of-type, .flot-y-axis .flot-tick-label:last-of-type').remove();
		
		$("div.tickLabel").each(function(i,ele) {
			ele = $(ele);
			if (ele.css("text-align") == "center") { //x-axis
			    ele.css("top", ele.position().top - 25); //move them up over graph
			} else {  //y-axis
			    ele.css("left", ele.position().left + 40); //move them right over graph
			}

		});

		placeholder.resize(function () {
			$('.legendLabel').html('<span class="average">Select range</span><span class="total"></span>');
		jQuery('.legendColorBox').remove();
		jQuery('.legend div').remove();
		});

		
	});