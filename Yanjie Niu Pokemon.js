'use strict';

(function () {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope


  const colors = {

    "Bug": "#4E79A7",

    "Dark": "#A0CBE8",

    "Electric": "#F28E2B",

    "Fairy": "#FFBE&D",

    "Fighting": "#59A14F",

    "Fire": "#8CD17D",

    "Ghost": "#B6992D",

    "Grass": "#499894",

    "Ground": "#86BCB6",

    "Ice": "#86BCB6",

    "Normal": "#E15759",

    "Poison": "#FF9D9A",

    "Psychic": "#79706E",

    "Steel": "#BAB0AC",

    "Water": "#D37295"

  }

  // load data and make scatter plot after window loads
  window.onload = function () {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 1000);


    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
      .then((data) => makeScatterPlot(data))
  }


  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable

    // get arrays of Sp. Def data and Total data
    let Sp_Def_Data = data.map((row) => parseFloat(row["Sp. Def"]));
    let Total_Data = data.map((row) => parseFloat(row["Total"]));


    // find data limits
    let axesLimits = findMinMax(Sp_Def_Data, Total_Data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

    // legend
    Legend(data)

    // dropbox lists
    dropdown(data)
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 200)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Sp. Def');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 250)rotate(-90)')
      .style('font-size', '10pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
    // make tooltip
    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('r', 6)
      .style("fill", (d) => colors[d["Type 1"]])
      .attr('fill-opacity', 0.6)
      // add tooltip functionality to points
      .on("mouseover", (d) => {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(d.Name + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"] + "<br/>")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }




  // add legend
  function Legend(data) {
    let size = 10
    var dots = svgContainer.selectAll(".dots")
      .data(d3.map(data, function (d) { return d["Type 1"] }).keys())
      .enter()
      .append("rect")
      .attr("x", 450)
      .attr("y", function (d, i) { return 80 + i * (size + 5) })
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) { return colors[d] })
      .attr("fill-opacity", 0.5)

    // legend label
    svgContainer.selectAll(".labels")
      .data(d3.map(data, function (d) { return d["Type 1"] }).keys())
      .enter()
      .append("text")
      .attr("x", 450 + size * 1.5)
      .attr("y", function (d, i) { return 80 + i * (size + 5) + (size / 2) })
      .style("fill", function (d) { return colors[d] })
      .style("font-size", "10pt")
      .text(function (d) { return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
  }

  //dropdown lists
  function dropdown(data) {
    var opt1 = 'select'
    var opt2 = 'select'
    // generation filter
    var dropDown = d3.select("#filterGeneration").append("select")
      .attr("Generation", "Generation-list");
    var defaultOption1 = dropDown.append("option")
      .data(data)
      .text("All")
      .attr("value", "select")
      .classed("default", true)
      .enter();
    var options = dropDown.selectAll("option.generation")
      .data(d3.map(data, function (d) { return d.Generation; }).keys())
      .enter()
      .append("option")
      .classed('generation', true);
    options.text(function (d) { return d; })
      .attr("value", function (d) { return d; });

    // legendary filter            
    var dropDown2 = d3.select("#filterLegendary").append("select")
      .attr("Legendary", "Legendary-list");




    var defaultOption2 = dropDown2.append("option")
      .data(data)
      .text("All")
      .attr("value", "select")
      .classed("default", true)
      .enter();


    var options2 = dropDown2.selectAll("option.legendary")
      .data(d3.map(data, function (d) { return d.Legendary; }).keys())
      .enter()
      .append("option")
      .classed('legendary', true);


    options2.text(function (d) { return d; })
      .attr("value", function (d) { return d; });

    // crossfiltering    
    dropDown.on("change", function () {
      var selected = this.value;
      opt1 = d3.select(this).property("value");
      let displayOthers = this.checked ? "inline" : "none";
      let display = this.checked ? "none" : "inline";


      svgContainer.selectAll('circle').filter(function (d) {
        if (selected == 'select') { return d.Generation != d.Generation }
        return (selected != d.Generation);
      })
        .attr("display", displayOthers);

      svgContainer.selectAll('circle').filter(function (d) {
        if (selected == 'select' && opt2 == 'select') { return d.Generation == d.Generation }
        if (selected == 'select' && opt2 != 'select') { return opt2 == d.Legendary }
        if (selected != 'select' && opt2 == 'select') { return selected == d.Generation }
        return (selected == d.Generation && opt2 == d.Legendary);
      })
        .attr("display", display);
    });

    dropDown2.on("change", function () {
      var selected = this.value;
      opt2 = d3.select(this).property("value");
      let displayOthers = this.checked ? "inline" : "none";
      let display = this.checked ? "none" : "inline";


      svgContainer.selectAll('circle')
        .filter(function (d) {
          if (selected == 'select') { return d.Legendary != d.Legendary }
          return (selected != d.Legendary);
        })
        .attr("display", displayOthers);

      svgContainer.selectAll('circle')
        .filter(function (d) {
          if (selected == 'select' && opt1 == 'select') { return d.Legendary == d.Legendary }
          if (selected == 'select' && opt1 != 'select') { return opt1 == d.Generation }
          if (selected != 'select' && opt1 == 'select') { return selected == d.Legendary }
          return (selected == d.Legendary && opt1 == d.Generation);
        })
        .attr("display", display)
    });
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function (d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 5, limits.xMax + 5]) // give domain buffer room
      .range([50, 400]);

    // xMap returns a scaled x value from a row of data
    let xMap = function (d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function (d) { return +d[y] }

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 100, limits.yMin - 100]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);


    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax
    }
  }


})();
