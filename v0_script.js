var svg = d3.select("#legend")

var keys = ["email", "SSN", "Credit Card", "Personal Details", "Full Details"]

var color = d3.scaleOrdinal()
              .domain(keys)
              .range(["#FFBF00", "#FF7F50", "#6495ED", "#008000", "#DE3163"]);

svg.selectAll("dots")
    .data(keys).enter()
    .append("rect")
        .attr("x", 10)
        .attr("y", function(d,i){ return 0 + i*(20+5)}) // 10 is where the first dot appears. 25 is the distance between dots
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function(d){ return color(d)})

svg.selectAll("mylabels")
    .data(keys).enter()
    .append("text")
        .attr("x", 40)
        .attr("y", function(d,i){ return 10 + i*25})
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on('mouseover', function(d) {
            let t = d3.selectAll(".bar.field1")
                      .transition()
                      .duration('50')
                      .attr('opacity', '.2');
            
            let c =  d3.selectAll("circle")
                       .transition()
                       .duration('50')
                       .attr('opacity', '.2');

            for (let index = 0; index < t._groups[0].length; index++) {
                const element = t._groups[0][index].__data__.category;
                const f = t._groups[0][index]
                if (element === d) {
                    d3.select(f)
                      .transition()
                      .duration('50')
                      .attr('opacity', '1')
                }
            }

            for (let index = 0; index < c._groups[0].length; index++) {
                const element = c._groups[0][index].__data__.category;
                const f = c._groups[0][index]
                if (element === d) {
                    d3.select(f)
                      .transition()
                      .duration('50')
                      .attr('opacity', '1')
                }
            }
        })
        .on('mouseout', function(d) {
          d3.selectAll(".bar.field1")
            .transition()
            .duration('50')
            .attr('opacity', '1')
        
          d3.selectAll("circle")
            .transition()
            .duration('50')
            .attr('opacity', '1')
        })

var slider = document.querySelector('#slider');
var result = document.querySelector('#result');
var temp = document.getElementById("result");

window.addEventListener('load', function(event) {
    event.target.value = String(temp.value);
    final_fun_one(event);
})

slider.addEventListener('input', function(event) {
    final_fun_one(event);
});

function final_fun_one(event) {
    var sliderValue = event.target.value;
    result.value = sliderValue;

    d3.csv("node-data4.csv").then(function(data) {
        var dataFilter = data.filter(function(el) {
            return el.year === result.value
        })
    
        var width = 450, height = 450
    
        var nodes = dataFilter.map(function(d) {
            return {radius: d.size,
                    category: d.data_sensitivity,
                    name: d.name,
                    year: d.year}
        })

        sorted_array = structuredClone(nodes);

        sorted_array = sorted_array.sort(function (a, b) {
            return a.radius - b.radius
        })

        for (let index = 0; index < sorted_array.length; index++) {
            sorted_array[index].radius = parseInt(sorted_array[index].radius) / 5000000;

        }

        /*let a = 1;
        for (let index = 0; index < sorted_array.length; index++) {
            sorted_array[index].radius = a;
            a = a + 1;
        }*/

        const fillColour = d3.scaleOrdinal()
            .domain(["email", "SSN", "Credit Card","Personal Details", "Full Details"])
            .range(["#FFBF00", "#FF7F50", "#6495ED", "#008000", "#DE3163"]);
    
        var simulation = d3.forceSimulation(sorted_array)
            .force('charge', d3.forceManyBody().strength(2))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(function(d) {
                return d.radius + 2
            }))
            .on('tick', ticked);
        
        var text = svg
                    .append('text')
                    .attr("id", 'legendbar')
                    .attr("x", 20)
                    .attr("y", 150)
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("font-family", "monospace")
                    .text("")
                    .style("fill", "white")
        
        var text1 = svg
                    .append('text')
                    .attr("id", 'legendbar')
                    .attr("x", 20)
                    .attr("y", 180)
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("font-family", "monospace")
                    .style("fill", "white")
        
        function formatNumber(num) {
            if(num > 999 && num < 1000000){
                return (num/1000).toFixed(0) + 'K'; // convert to K for number from > 1000 < 1 million 
            }else if(num > 1000000){
                return (num/1000000).toFixed(0) + 'M'; // convert to M for number from > 1 million 
            }else if(num > 1000000000){
                return (num/1000000000).toFixed(0) + 'B'; // convert to M for number from > 1 million 
            }else if(num < 900){
                return num; // if value < 1000, nothing to do
            }
        }
            
        function ticked() {
            var u = d3.select('svg')
                .selectAll('circle')
                .data(sorted_array)
                .join('circle')
                .style('fill', function(d) {
                    return fillColour(d.category)
                })
                .attr('r', function(d) {
                    return d.radius
                })
                .attr('cx', function(d) {
                    return d.x
                })
                .attr('cy', function(d) {
                    return d.y
                })
                .on('mouseover', function(d) {
                    d3.select(this)
                      .transition()
                      .duration('50')
                      .attr('opacity', '.5')
                    
                    let t = d3.selectAll(".bar.field1")
                              .transition()
                              .duration('50')
                              .attr('opacity', '.2')
            
                    for (let index = 0; index < t._groups[0].length; index++) {
                        const element = t._groups[0][index].__data__.model_name;
                        const f = t._groups[0][index]
                        if (element === d.name) {
                            d3.select(f)
                            .transition()
                            .duration('50')
                            .attr('opacity', '1')
                        }
                    }

                    text.transition().text("Company: " + d.name);
                    let rv = nodes.find(o => o.name === d.name);
                    text1.transition().text("Records Lost: " + formatNumber(rv.radius));
                })
                .on('mouseout', function(d) {
                    d3.select(this)
                      .transition()
                      .duration('50')
                      .attr('opacity', '1')
                    
                    d3.selectAll(".bar.field1")
                      .transition()
                      .duration('50')
                      .attr('opacity', '1')

                    text.transition().text("");
                    text1.transition().text("");
                })
        }
    });
}
