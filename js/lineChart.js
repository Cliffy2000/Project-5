async function processData(keys) {
  const originalData = await d3.csv("data/2021-all.csv");
  // This dataset has 1202900 entires with 3 columns: building, power and #datetime
  let data = [];

  originalData.forEach(entry => {
    if (entry.datetime.slice(17, 19) == "00" && parseInt(entry.datetime.slice(14, 16)) % 6 == 0) {
      if (entry.datetime.slice(5, 7) == "12") {
        if (keys.includes(entry.building)) {
          let updatedEntry = [];
          updatedEntry["datetime"] = new Date(entry.datetime);
          updatedEntry["hour"] = entry.datetime.slice(11, 13);
          updatedEntry["building"] = entry.building;
          updatedEntry["power"] = parseInt(entry.power);
          data.push(updatedEntry);
        }
      }
    }
  });
  return data;
}


async function animatedLineChart() {
  const width = 1800;
  const height = 400;
  const margins = {top: 40, bottom: 40, left: 40, right: 40};

  const colors = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#999999','#a65628', "#f781bf"];
  let keys = ["mbh", "75s", "axn", "hpb", "hdy", "lib", "fic", "jhn"];

  let selected = []
  for (k of keys) {
    if (document.getElementById(k).checked) {
      selected.push(k);
    }
  }

  d3.select("svg").remove();
  d3.select("svg").remove();

  const svg = d3.select(".lines").append("svg")
    .style("height", `${height}px`)
    .style("width", `${width}px`)
    .style("border", "1px lightgrey solid");

  const data = await processData(selected);
  
  const xScale = d3.scaleTime()
    .range([margins.left, width-margins.right])
    .domain(d3.extent(data, entry => entry.datetime));

  const yScale = d3.scaleLinear()
    .range([height-margins.top, margins.bottom])
    .domain([0, d3.max(data, entry => entry.power)]);
  
  const colorScale = d3.scaleOrdinal()
    .range(colors)
    .domain(selected);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("transform", `translate(0, ${height-margins.bottom})`)
    .call(xAxis);
  svg.append("g")
    .attr("transform", `translate(${margins.left}, 0)`)
    .call(yAxis);

  let line = d3.line()
    .x(entry => xScale(entry.datetime))
    .y(entry => yScale(entry.power));   

  const transitionPath = d3.transition()
    .ease(d3.easeSin)
    .duration(4000);

  var nested = d3.group(data, entry => entry.building);

  for (const [k,v] of nested.entries()) {
    let path = svg.append("path")
      .attr("fill", "none")
      .attr("class", "line")
      .style("stroke", function() {
        return colorScale(k);
      })
      .attr("stroke-width", 1.5)
      .attr("d", line(v));
    
    const pathLength = path.node().getTotalLength();
    
    path
      .attr("stroke-dashoffset", pathLength)
      .attr("stroke-dasharray", pathLength)
      .transition(transitionPath)
      .attr("stroke-dashoffset", 0);
  }


  const legend = d3.select(".legend").append("svg")
    .style("height", "400px")
    .style("width", "120px")
    .style("border", "1px lightgrey solid");
    
  legend.selectAll("dots")
    .data(selected)
    .enter()
    .append("circle")
      .attr("cx", 35)
      .attr("cy", function(d,i) {return 60 + i*40})
      .attr("r", 7)
      .style("fill", function(d) {return colorScale(d)})
  
  legend.selectAll("tags")
    .data(selected)
    .enter()
    .append("text")
      .attr("x", 50)
      .attr("y", function(d,i) {return 61 + i*40})
      .style("fill", function(d) {return colorScale(d)})
      .text(function(d) {return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
}



animatedLineChart();
