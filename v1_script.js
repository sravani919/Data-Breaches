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
            var c = d3.selectAll("circle")
                        .transition()
                        .duration('50')
                        .attr('opacity', '.2');
            
            var total_r = 0;
            for (let index = 0; index < c._groups[0].length; index++) {
                var element = c._groups[0][index].__data__.category;
                var f = c._groups[0][index]
                switch (element) {
                      case 0:
                        element = "email";
                        break;
                      case 1:
                        element = "SSN";
                        break;
                      case 2:
                        element = "Credit Card";
                        break;
                      case 3:
                        element = "Personal Details";
                        break;
                      case 4:
                        element = "Full Details";
                        break;
                }

                if (element === d) {
                    total_r = total_r + c._groups[0][index].__data__.radius;
                    d3.select(f)
                      .transition()
                      .duration('50')
                      .attr('opacity', '1')
                }
            }

            text.transition().text("Total Accounts Hacked");
            text1.transition().text("via "+ d);
            console.log(total_r);
            text2.transition().text(formatNumber(total_r*8000000, 1));
        })
        .on('mouseout', function(d) {
            d3.selectAll("circle")
              .transition()
              .duration('50')
              .attr('opacity', '1');

            text.transition().text("");
            text1.transition().text("");
            text2.transition().text("");
        })


function formatNumber(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: " K" },
    { value: 1e6, symbol: " M" },
    { value: 1e9, symbol: " B" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

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
              .attr("y", 170)
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("font-family", "monospace")
              .style("fill", "white")

var text2 = svg
              .append('text')
              .attr("id", 'legendbar')
              .attr("x", 20)
              .attr("y", 190)
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("font-family", "monospace")
              .style("fill", "white")

d3.csv("node-data4.csv").then(function (data) {
    var xCenter = [120, 330, 530, 730, 930];

    const g = d3.select("#content").append("svg")
                .attr("width", "100vw")
                .attr("height", 50)
                .append("g")
                .attr("transform", "translate(" + 430 + "," + 10 + ")");

    const min_data = 2018, max_data = 2022;
    let xScale = d3.scaleLinear()
                   .domain([min_data, max_data])
                   .range([0, 800]);

    let xAxisGenerator = d3.axisBottom(xScale).ticks(5).tickSize(15)

    let xaxis = g.append("g")
                 .call(xAxisGenerator);

    var nodes1 = data.map(function(d) {
        /*switch (parseInt(d.year)) {
            case 2018:
                numNodes_dict.eighteen = numNodes_dict.eighteen+1;
                numNodes_arr[0] = numNodes_arr[0] + 1;
                c = 0;
                break;
              case 2019:
                numNodes_dict.nineteen = numNodes_dict.nineteen + 1
                numNodes_arr[1] = numNodes_arr[1] + 1
                c = 1;
                break;
              case 2020:
                numNodes_dict.twenty = numNodes_dict.twenty + 1
                numNodes_arr[2] = numNodes_arr[2] + 1
                c = 2;
                break;
              case 2021:
                numNodes_dict.first = numNodes_dict.first + 1
                numNodes_arr[3] = numNodes_arr[3] + 1
                c = 3;
                break;
              case 2022:
                numNodes_dict.second = numNodes_dict.second + 1
                numNodes_arr[4] = numNodes_arr[4] + 1
                c = 4;
                break;
        }*/
        return {
                radius: d.size/8000000,
                category: d.data_sensitivity,
                name: d.name,
                year: d.year
        }
    });

    const fillColour = d3.scaleOrdinal()
                         .domain(["email", "SSN", "Credit Card","Personal Details", "Full Details"])
                         .range(["#FFBF00", "#FF7F50", "#6495ED", "#008000", "#DE3163"]);

    var simulation = d3.forceSimulation(nodes1)
                       .force('charge', d3.forceManyBody().strength(5))
                       .force('x', d3.forceX().x(function(d) {
                            return xCenter[d.year - 2018];
                        }))
                       .force('collision', d3.forceCollide().radius(function(d) {
                            return d.radius+1;
                        }))
                       .on('tick', ticked);

    function ticked() {
        var u = d3.select('svg g')
                  .selectAll('circle')
                  .data(nodes1)
                  .join('circle')
                  .attr('r', function(d) {
                    return d.radius;
                  })
                  .style('fill', function(d) {
                    return fillColour(d.category)
                  })
                  .attr('cx', function(d) {
                    return d.x - 100;
                  })
                  .attr('cy', function(d) {
                    return d.y - 50;
                  })
                  .on('mouseover', function(d) {
                      /*var c = d3.selectAll("circle")
                            .transition()
                            .duration('50')
                            .attr('opacity', '1');

                        for (let index = 0; index < c._groups[0].length; index++) {
                            var element = c._groups[0][index].__data__.category;
                            var f = c._groups[0][index]

                            if (element === d.category) {
                                d3.select(f)
                                    .transition()
                                    .duration('50')
                                    .attr('opacity', '0.2')
                            }
                        }
                            
                        d3.select(this)
                          .transition()
                          .duration('50')
                          .attr('opacity', '1')*/

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

                      /*text.transition().text("Company: " + d.name);
                      let rv = nodes1.find(o => o.name === d.name);
                      text1.transition().text("Records Lost: " + formatNumber(rv.radius*8000000,  1));
                      text2.transition().text("Year: " + d.year);*/
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
                    text2.transition().text("");
                  })
    }

    d3.selectAll(".tick text").on("click", doclick);
    d3.selectAll(".tick text").style("font-size", "15px");

    function doclick(d) {
      d3.selectAll(".tick text").style("font-size", "10px");
      d3.select(this).style("font-size","25px");

      var svg = d3.select("#viz3");
      svg.selectAll("*").remove();

      var svg1 = d3.select("#viz4");
      svg1.selectAll("*").remove();

      var dataFilter = data.filter(function(el) {
        return el.year === String(d);
      })

      var models = dataFilter.map(function (d) {
        return {model_name: d.name,
                field1: d.size,
                category: d.data_sensitivity}
      })

    models = models.map(i => {
      i.model_name = i.model_name;
        return i;
    });

    const fillColour = d3.scaleOrdinal()
                         .domain(["email", "SSN", "Credit Card","Personal Details", "Full Details"])
                         .range(["#FFBF00", "#FF7F50", "#6495ED", "#008000", "#DE3163"]);
  
    var container = d3.select('#viz3'),
                      width = 900,
                      height = 450,
                      margin = {top: 20, right: 10, bottom: 150, left: 70},
                      barPadding = .5,
                      axisTicks = 15;

    var svg = container
       .append("svg")
       .attr("width", width)
       .attr("height", height)
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`)
    
    var yaxis_data = []
    for (let index = 0; index < models.length; index++) {
      yaxis_data[index] = parseInt(models[index].field1)
    }

    yaxis_data.sort(function (a, b) {
      return a - b
    })

    var xScale0 = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(barPadding);
    var xScale1 = d3.scaleBand();

    var yScale = d3.scaleLinear()
                   .domain([0, d3.max(yaxis_data)])
                   .range([height - margin.top - margin.bottom, 0]);
    
    var xAxis = d3.axisBottom(xScale0)
  
    var yAxis = d3.axisLeft()
                  .scale(yScale)
                  .ticks(axisTicks)
                  .tickFormat(function(d) {
                      var s = formatNumber(d, 1);
                      return s;
                  });
    
    xScale0.domain(models.map(d => d.model_name));
    xScale1.domain(['field1']).range([0, xScale0.bandwidth()]);

    var model_name = svg.selectAll(".model_name")
                        .data(models)
                        .enter().append("g")
                        .attr("class", "model_name")
                        .attr("transform", d => `translate(${xScale0(d.model_name)},0)`);

    var tooltip = d3
                    .select('body')
                    .append('div')
                    .attr('class', 'd3-tooltip')
                    .style('position', 'absolute')
                    .style('z-index', '10')
                    .style('visibility', 'hidden')
                    .style('padding', '10px')
                    .style('background', 'rgba(0,0,0,0.6)')
                    .style('border-radius', '4px')
                    .style('color', '#fff')
                    .text('a simple tooltip');

  
    //Add field1 bars 
    model_name.selectAll(".bar.field1")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar field1")
    .style("fill","#69b3a2")
      .attr("x", d => xScale1('field1'))
      .attr("y", d => yScale(d.field1))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => {
        return height - margin.top - margin.bottom - yScale(d.field1)
      })
      .style("fill", function(d) {
        return fillColour(d.category)
      })
      .on('mouseover', function(d) {
        d3.selectAll(".bar.field1")
          .transition()
          .duration('50')
          .attr('opacity', '.2')
        
        d3.select(this)
          .transition()
          .duration('50')
          .attr('opacity', '1')

        var company_name = d.model_name
        var count = d.field1
        var category = d.category
        tooltip.html(`<div>Company: ${company_name}</div><div>Record Lost: ${count}</div><div>Category: ${category}</div>`)
               .style('visibility', 'visible');
      
        d3.select(this).transition().attr('fill', "#eec42d");
      })
      .on('mousemove', function () {
        tooltip.style('top', d3.event.pageY + 10 + 'px')
               .style('left', d3.event.pageX + 10 + 'px');
      })
      .on('mouseout', function(d) {
        d3.selectAll(".bar.field1")
          .transition()
          .duration('50')
          .attr('opacity', '1')
        
        tooltip.html(``).style('visibility', 'hidden');
        d3.select(this).transition().attr('fill', "#437c90");
      })
    
    // gridlines in y axis function
    function make_y_gridlines() {		
      return d3.axisLeft()
               .scale(yScale)
               .ticks(axisTicks)
               .tickSize(-width)
               .tickFormat("")
    }

    svg.append("g")			
       .attr("class", "grid")
       .call(make_y_gridlines())
      
    // Add the X Axis
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
       .call(xAxis)
       .selectAll("text")                       
          .style("text-anchor", "end")
          .attr("dx", "-1em")
          .attr("dy", "-.6em")
          .attr("transform", "rotate(-90)")
   
    svg.append("text")
       .attr("text-anchor", "end")
       .attr("x", 700)
       .attr("y", 360)
       .attr("fill", "#eae6eb")
       .text("Company name");

    svg.append("text")
       .attr("text-anchor", "end")
       .attr("transform", "rotate(-90)")
       .attr("y", -margin.left+20)
       .attr("x", -margin.top+20)
       .attr("fill", "#eae6eb")
       .text("Record Lost Count");
    
    // Add the Y Axis
    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)

       var c_dict = {email: 0, SSN: 0, CreditCard: 0, PersonalDetails: 0, FullDetails: 0}

       for (let index = 0; index < models.length; index++) {
         switch (models[index].category) {
           case "email":
             c_dict.email = c_dict.email+1
             break;
           case "SSN":
             c_dict.SSN = c_dict.SSN + 1
             break;
           case "Credit Card":
             c_dict.CreditCard = c_dict.CreditCard + 1
             break;
           case "Personal Details":
             c_dict.PersonalDetails = c_dict.PersonalDetails + 1
             break;
           case "Full Details":
             c_dict.FullDetails = c_dict.FullDetails + 1
             break;
         }
       }
   
       var pie_data = [{name: "email", value: c_dict.email},
                       {name: "SSN", value: c_dict.SSN},
                       {name: "Credit Card", value: c_dict.CreditCard},
                       {name: "Personal Details", value: c_dict.PersonalDetails},
                       {name: "Full Details", value: c_dict.FullDetails}
                      ]

       var text = "";
   
       var width = 360;
       var height = 360;
       var thickness = 60;
   
       var radius = Math.min(width, height) / 2;
       var color = d3.scaleOrdinal()
                     .domain(["email", "SSN", "Credit Card","Personal Details", "Full Details"])
                     .range(["#FFBF00", "#FF7F50", "#6495ED", "#008000", "#DE3163"]);

   
       var svg = d3.select("#viz4")
                   .append('svg')
                   .attr('class', 'pie')
                   .attr('width', width)
                   .attr('height', height);
   
       var g = svg.append('g')
                  .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

       var arc = d3.arc()
                   .innerRadius(radius - thickness)
                   .outerRadius(radius);
   
       var pie = d3.pie()
                   .value(function(d) { return d.value; })
                   .sort(null);
    
       var path = g.selectAll('path')
                   .data(pie(pie_data))
                   .enter()
                   .append("g")
                   .on("mouseover", function(d) {
                      let g = d3.select(this)
                                .style("cursor", "pointer")
                                .attr("opacity", '1')
                                .append("g")
                                .attr("class", "text-group");

                          g.append("text")
                            .attr("class", "name-text")
                            .text(`${d.data.name}`)
                            .attr('text-anchor', 'middle')
                            .attr('dy', '-1.2em')
                      
                          g.append("text")
                            .attr("class", "value-text")
                            .text(`${d.data.value}`)
                            .attr('text-anchor', 'middle')
                            .attr('dy', '.6em');

                        let t = d3.selectAll(".bar.field1")
                                  .transition()
                                  .duration('50')
                                  .attr('opacity', '.1')
      
                        for (let index = 0; index < t._groups[0].length; index++) {
                          const element = t._groups[0][index].__data__.category;
                          const f = t._groups[0][index]
                          if (element === d.data.name) {
                            d3.select(f)
                              .transition()
                              .duration('50')
                              .attr('opacity', '1')
                          }
                        }
                    })
                   .on("mouseout", function(d) {
                        d3.select(this)
                          .style("cursor", "none")  
                          .style("fill", color(this._current))
                          .attr("opacity", '1')
                          .select(".text-group").remove();
                        
                        d3.selectAll(".bar.field1")
                          .transition()
                          .duration('50')
                          .attr('opacity', '1')
                    })
                    .append('path')
                    .attr('d', arc)
                    .attr('fill', (d,i) => color(i))
                    .on("mouseover", function(d) {
                        d3.select(this)     
                          .style("cursor", "pointer")
                          .attr("opacity", '0.7')
                    })
                    .on("mouseout", function(d) {
                        d3.select(this)
                          .style("cursor", "none")  
                          .style("fill", color(this._current))
                          .attr("opacity", '1')
                    })
                    .each(function(d, i) { this._current = i; });

      g.append('text')
       .attr('text-anchor', 'middle')
       .attr('dy', '.35em')
       .text(text);
    }
});