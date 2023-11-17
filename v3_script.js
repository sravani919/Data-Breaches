/*var slider = document.querySelector('#slider');
var result = document.querySelector('#result');
var temp = document.getElementById("result");*/

/*window.addEventListener('load', function(event) {
  event.target.value = String(2018);
  final_fun_two(event);
});*/

/*slider.addEventListener('input', function(event) {
  final_fun_two(event);
});*/

//function final_fun_two(event) {
  var sliderValue = String(2018);

  d3.csv("node-data4.csv").then(function (data) {
    var svg = d3.select("#viz3");
    svg.selectAll("*").remove();

    var svg1 = d3.select("#viz4");
    svg1.selectAll("*").remove();

    var dataFilter = data.filter(function(el) {
      console.log("from", sliderValue)
      return el.year === sliderValue
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
  });
//}