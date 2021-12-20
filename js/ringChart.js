async function processData() {
  const originalData = await d3.csv("data/2021-all.csv");

  let hpb = [];
  let sha = [];
  let axn = [];

  originalData.forEach(i => {
    if (i.building == "sha" || i.datetime.slice(14, 19) == "00:00") {
      let current = [];
      current["hour"] = i.datetime.slice(11, 13);
      current["building"] = "sha";
      current["power"] = parseInt(i.power);
      sha.push(current);
    } else if (i.building == "axn" || i.datetime.slice(14, 19) == "00:00") {
      let current = [];
      current["hour"] = i.datetime.slice(11, 13);
      current["building"] = "axn";
      current["power"] = parseInt(i.power);
      axn.push(current); 
    } else if (i.building == "hpb" || i.datetime.slice(14, 19) == "00:00") {
      let current = [];
      current["hour"] = i.datetime.slice(11, 13);
      current["building"] = "hpb";
      current["power"] = parseInt(i.power);
      hpb.push(current); 
    }
  });

  let hpbGroup = d3.group(hpb, entry => entry.hour);
  let hpbSum = [];
  for (const [k,v] of hpbGroup.entries()) {
    let current = v.map(v => v.power);
    hpbSum[k] = parseInt(current.reduce((p,c)=>(p+c)) / current.length);
  }

  let shaGroup = d3.group(sha, entry => entry.hour);
  let shaSum = [];
  for (const [k,v] of shaGroup.entries()) {
    let current = v.map(v => v.power);
    shaSum[k] = parseInt(current.reduce((p,c)=>(p+c)) / current.length);
  }

  let axnGroup = d3.group(axn, entry => entry.hour);
  let axnSum = [];
  for (const [k,v] of axnGroup.entries()) {
    let current = v.map(v => v.power);
    current["hour"] = k;
    current["powerAvg"] = parseInt(current.reduce((p,c)=>(p+c)) / current.length);
    axnSum.push(current);
    console.log(current["powerAvg"]);
  }


  return {"hpb": hpbSum, "sha": shaSum, "axn": axnSum};
}


async function ringChart(svg, data) {
  const innerRadius = 50;
  const outerRadius = 300;

  const x = d3.scaleBand()
    .domain(data.map(d => d.hour))
    .range([0, 2*Math.PI]);
  const y = d3.scaleRadial()
    .domain([0, d3.max(data, d => d.powerAvg)])
    .range([innerRadius, outerRadius]);
  
  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => y(d.powerAvg))
    .startAngle(d => x(d.hour))
    .endAngle(d => x(d.hour) + x.bandwidth())
    .padAngle(0.01)
    .padRadius(innerRadius);
  
  svg.selectAll(".bar")
    .data(data)
    .join("path")
    .attr("class", "bar")
    .attr("d", arc);
}


async function drawCharts() {
  const data = await processData();
  const axn = data["axn"];
  console.log(axn);
  
  const svg = d3.select(".arcs1").append("g");
  ringChart(svg, axn);  
}


drawCharts();