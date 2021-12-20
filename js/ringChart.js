async function processData() {
  const originalData = await d3.csv("data/2021-all.csv");

  let hpb = [];
  let hdy = [];

  originalData.forEach(i => {
    if (i.building == "hpb" || i.datetime.slice(14, 19) == "00:00") {
      let current = [];
      current["hour"] = i.datetime.slice(11, 13);
      current["building"] = "hpb";
      current["power"] = parseInt(i.power);
      hpb.push(current);
    } else if (i.building == "hdy" || i.datetime.slice(14, 19) == "00:00") {
      let current = [];
      current["hour"] = i.datetime.slice(11, 13);
      current["building"] = "hdy";
      current["power"] = parseInt(i.power);
      hdy.push(current);
    }
  });

  let hpbGroup = d3.group(hpb, entry => entry.hour);
  let hpbSum = [];
  for (const [k,v] of hpbGroup.entries()) {
    
    v.reduce(function(p,c) {return p+c})
    hpbSum[k] = v;
  }
  console.log(hpbSum);
  return {"hpb": hpb, "hdy": hdy};
}


async function ringChart() {

}


processData()