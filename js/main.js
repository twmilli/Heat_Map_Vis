var outerWidth = 1200;
var outerHeight = 800;
var margin = {
    left: 200,
    top: 150,
    right: 100,
    bottom: 150
};

var innerWidth = outerWidth - margin.left - margin.right;
var innerHeight = outerHeight - margin.top - margin.bottom;

var yLabel = 'Month';
var xLabel = 'Year';
var title = 'Monthly Global Land-Surface Temperature 1753-2015';
var subheading = 'Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average.';

var svg = d3.select('body').append('svg')
    .attr('width', outerWidth)
    .attr('height', outerHeight);

var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var xScale = d3.scale.ordinal().rangeBands([0, innerWidth]);
var yScale = d3.scale.ordinal().rangeBands([innerHeight, 0]);

var xAxisG = g.append('g')
    .attr('class', 'axis xaxis')
    .attr('transform', "translate(" + 0 + ',' + innerHeight + ")");
var yAxisG = g.append('g')
    .attr('class', 'axis');

var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
var yAxis = d3.svg.axis().scale(yScale).orient('left');

var url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

d3.json(url, function(error, json) {
            if (error) {
                throw error;
            }
            var data = json.monthlyVariance;
            var baseTemp = json.baseTemperature;
            var tip = d3.tip()
                .attr('class', 'tip')
                .html(function(d) {
                    return (
                      '<div id=date>' + getMonthName(d.month) + ', ' + d.year + '</div>\
                      <div id=temp>' + (baseTemp + d.variance).toFixed(2) + '&degC</div>'
                    );
                });

            xScale.domain(data.map(function(d) {
                return (d.year);
            }));
            yScale.domain(d3.range(1, 13).reverse());


            yAxis.tickFormat(function(d) {
                return (getMonthName(d));
            });

            var xTicks = xScale.domain().filter(function(d, n) {
                return !((n - 2) % 10);
            });

            xAxis.tickValues(xTicks);

            var extent = d3.extent(data, function(d) {
                return (baseTemp + d.variance);
            });

            var mean = d3.mean(data, function(d) {
                return (baseTemp + d.variance);
            });

            var colorScale = d3.scale.linear()
                .domain([extent[0], mean, extent[1]])
                .range(["#1e7fd7", "#f6ff91", "#de0808"]);

            g.call(tip);

            var bars = g.selectAll('rect').data(data);
            bars.enter().append('rect')
                .attr('width', xScale.rangeBand())
                .attr('height', yScale.rangeBand());
            bars
                .attr('x', function(d) {
                    return (xScale(d.year));
                })
                .attr('y', function(d) {
                    return (yScale(d.month))
                })
                .attr('fill', function(d) {
                    return (colorScale(d.variance + baseTemp));
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);


            yAxisG.call(yAxis);
            xAxisG.call(xAxis);

            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate(' + (outerWidth / 2) + ',' + (margin.top / 2) + ')')
                .attr('class', 'title')
                .text(title);

            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate(' + (outerWidth / 2) + ',' + (margin.top - 30) + ')')
                .attr('class', 'sub')
                .text(subheading);

            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate(' + (outerWidth / 2) + ',' + (outerHeight - margin.bottom / 2) + ')')
                .text(xLabel)
                .attr('class', 'axis-label');

            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate(' + (margin.left / 2) + ',' + (outerHeight / 2) + ')rotate(-90)')
                .text(yLabel)
                .attr('class', 'axis-label');

            var steps = 10;
            var stepSize = (extent[1] - extent[0]) / steps;
            var tempsForLegend = d3.range(extent[0], (extent[1] + stepSize), stepSize);
            var legend = g.selectAll('.legend').data(tempsForLegend)
                .enter().append('g')
                .attr('class', 'legend');
            var legendY = (innerHeight + margin.bottom / 1.5);
            var textOffset = 10;
            var legScale = d3.scale.ordinal().rangeBands([innerWidth / 2 + 100, innerWidth + 100]);
            legScale.domain(d3.range(0, 11));

            legend.append('rect')
                .attr('width', legScale.rangeBand())
                .attr('height', '40')
                .attr('y', legendY)
                .attr('x', function(d, n) {
                    return legScale(n);
                })
                .attr('fill', function(d) {
                    return (colorScale(d));
                });

            legend.append('text')
                .attr('x', function(d, n) {
                    return legScale(n) + 8;
                })
                .attr('y', legendY - textOffset)
                .text(function(d) {
                    return (d.toFixed(1));
                })
                .attr('text-anchor', 'center');

            bars.exit().remove();
        });

        function getMonthName(month) {
            var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            return MONTHS[month - 1];
        }
