// Notre code viendra ici
const margin2 = { top: 50, right: 30, bottom: 30, left: 60 },
  width = 800,
  height = 400 - margin2.top - margin2.bottom;

function main(csv, checks) {
// Création du SVG
var svg = d3
  .select("#graphwindow")
  .append("svg")
  .attr("id", "svg")
  .attr("width", width + margin2.left + margin2.right + 50)
  .attr("height", height + margin2.top + margin2.bottom)
  .append("g")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
// Titre
svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", 0 - margin2.top / 2)
  .attr("text-anchor", "middle")
  .style("fill", "#5a5a5a")
  .style("font-family", "Raleway")
  .style("font-weight", "300")
  .style("font-size", "24px")
  .text("Evolution de la vitesse au cours du trajet");

const parseTime = d3.timeParse("%d/%m/%Y");
const dateFormat = d3.timeFormat("%d/%m/%Y");


d3.csv(csv).then(function (data) {
  data.forEach(function (d) {
    d.duree = +d.duree / 3600;
    d.alt = parseFloat(d.altitude);
    d.dist = parseFloat(d.distance_cum) / 1000;
    d.vit = parseFloat(d.vitesse);
    d.id = +d.identifiant;
    d.date = parseTime(d.date);
  });
  
  var len = data.length;

  var nb_id = data[len - 1].id;
  
  var alt_moy = d3.mean(data, (d) => d.alt);

  var course = [];

  for (let i = 0; i < nb_id; i++) {
    course[i] = data.filter(function (d) {
      return d.id === i + 1;
    });
  }

   var vit_moy = [];

    for (let i = 0; i < nb_id; i++) {
      vit_moy[i] = d3.mean(course[i], (d) => d.vit);
    }

  
  document.getElementById("ca-val").innerHTML = d3.mean(vit_moy).toFixed(2);
  document.getElementById("cn-val").innerHTML = nb_id;
  document.getElementById("cl-val").innerHTML = data[len-1].dist.toFixed(2);
  
                                                         
  const y = d3.scaleLinear().range([height, 0]).domain([5, 15]);

  const x = d3
    .scaleLinear()
    .range([0, width])
    .domain([0, d3.max(data, (d) => d.dist)]);

  const z = d3.scaleLinear().range([height, 0]).domain([alt_moy-200, alt_moy+400]);

  function color(i) {
    if (i === 1) return "#ff0000";
    if (i === 2) return "#ff0055";
    if (i === 3) return "#ff00aa";
    if (i === 4) return "#ff00ff";
    if (i === 5) return "#aa00ff";
    if (i === 6) return "#5500ff";
    if (i === 7) return "#0055ff";
    if (i === 8) return "#00aaff";
    if (i === 9) return "#00ffff";
    if (i === 10) return "#00ffaa";
    if (i === 11) return "#00ff55";
    if (i === 12) return "#00ff00";
    if (i === 12) return "#55ff00";
    else return "#aaff00";
  }

  const area = d3
    .area()
    .x((d) => x(d.dist))
    .y0(height)
    .y1((d) => z(d.alt));

  var areaPath = svg
    .append("path")
    .datum(course[0])
    .style("fill", "#c6ecc6")
    .attr("d", area);

  function movingAverage(array, count) {
    var result = [],
      val;

    for (
      var i = Math.floor(count / 2), len = array.length - count / 2;
      i < len;
      i++
    ) {
      val = d3.mean(array.slice(i - count / 2, i + count / 2), (d) => d.vit);
      result.push({dist: array[i].dist,
                   vit: val.toFixed(2),
                   date: array[0].date,
                   duree: array[array.length - count].duree.toFixed(2),
                   id: array[0].id
                   })
    }

    return result;
  }
  
  function timeToString(time){
    var tmp = time*60;
    var minutes = Math.floor(tmp);
    var seconds = Math.floor((tmp-minutes)*60);
    return minutes + "mn " + seconds + "s";
  }

  function addMovingAverage(data, x, y, N, color) {
    const line = d3
      .line()
      .x((d) => x(d.dist))
      .y((d) => y(d.vit))
      .curve(d3.curveMonotoneX); // Fonction de courbe permettant de l'adoucir

    let moveaverage = movingAverage(data, N); // Moyenne mobile sur 10 jours

    svg
      .append("path")
      .attr("id", "graph")
      .datum(moveaverage)
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("opacity", "0.65")
      .on("mouseover", function (d, i) {
        d3.select(this)
          .attr("opacity", "1")
          .attr("stroke-width", 2.5);
      
document.getElementById("course_id").innerHTML = "Run #" + moveaverage[0].id;
document.getElementById("cod-val").innerHTML = moment(moveaverage[0].date).format('YYYY-MM-DD');
document.getElementById("cot-val").innerHTML = timeToString(moveaverage[0].duree);
document.getElementById("cov-val").innerHTML = d3.mean(moveaverage, (d) => d.vit).toFixed(2);
      document.getElementById("stats-course").style.backgroundColor = color[moveaverage[0].id + 1];
      })
      .on("mouseout", function (d, i) {
        d3.select(this)

          .attr("opacity", "0.65")
          .attr("stroke-width", 1.5);
      });
    return moment(moveaverage[0].date).format('YYYY-MM-DD');
  }
  checks.forEach((check) => {
     updd = addMovingAverage(course[check-1], x, y, 20, color(check));
     document.getElementById("tc" + check).innerHTML = updd + "  "; 
   });
  //for (let i = 0; i < nbcourses; i++) {
    //console.log(typeof i);
    //console.log(typeof start);
    //console.log(i+start-1);
    //console.log(i);
    //console.log(nbcourses);
    //console.log(start);
    //console.log(course[i+start-1]);
    //addMovingAverage(course[i+start-1], x, y, 20, color(i+start));
  //}

  // axe x
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .append("text")
    .attr("fill", "#000")
    .attr("x", width - 50)
    .attr("y", -6)
    .text("Distance (en km)");

  // axe y
  svg
    .append("g")
    .style("fill", "#5500ff")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .style("text-anchor", "end")
    .text("Vitesse (en km/h)");

  // axe q
  svg
    .append("g")
    .attr("transform", "translate(" + width + ", 0)")
    .style("fill", "#c6ecc6")
    .call(d3.axisRight(z))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")
    .attr("dy", "-0.71em")
    .style("text-anchor", "end")
    .text("Altitude (en m)");

  svg
    .selectAll("y axis")
    .data(y.ticks(10))
    .enter()
    .append("line")
    .attr("class", "horizontalGrid")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d));

  function updateViz(w) {
    checks.forEach((check) => {
      d3.select("#graph").remove();
    });
    checks.forEach((check) => {
     addMovingAverage(course[check-1], x, y, w, color(check));
    });
    //for (let i = 0; i < nbcourses; i++) {
    //  d3.select("#graph").remove();
    //}
    //for (let i = 0; i < nbcourses; i++) {
    //addMovingAverage(course[i+start-1], x, y, w, color(i+start));
    //}
  }
  d3.select("#slider").on("input", function () {
    updateViz(+this.value);
  });
});
}

var checks = [];
for (let i = 1; i < 9; i++) {
  document.getElementById("wc" + i).style.display = "inline";
  document.getElementById("cb" + i).checked = true;
  checks.push(i);
}
for (let i = 9; i < 15; i++) {
  document.getElementById("wc" + i).style.display = "none";
}
main("Lyon.csv",checks);

var precSel = "Lyon"
var citySel = "Lyon"

document.getElementById("wrapc-1").addEventListener("click", Lyonviz);
document.getElementById("wrapc-2").addEventListener("click", Niceviz);
document.getElementById("wrapc-3").addEventListener("click", Parisviz);
document.getElementById("wrapc-4").addEventListener("click", Fjestadviz);
for (let i = 1;i < 15; i++){
  document.getElementById("cb" + i).addEventListener("click", changedGraph);
}
document.getElementById("cball").addEventListener("click", selAll);
document.getElementById("cbnone").addEventListener("click", selNone);

function Lyonviz() {
  citySel = "Lyon";
  document.getElementById("place").innerHTML = "Lyon";
  document.getElementById("wrapc-1").style.backgroundColor = "#008080";
  document.getElementById("wrapc-2").style.backgroundColor = "#b2d5ff";
  document.getElementById("wrapc-3").style.backgroundColor = "#b2d5ff";
  document.getElementById("wrapc-4").style.backgroundColor = "#b2d5ff";
  d3.select("#svg").remove();
  svg = null;
  if (citySel == precSel) {
    var checks = [];
    for (let i = 1; i < 9; i++) {
      if (document.getElementById("cb" + i).checked) {
        checks.push(i);
      }
    }
  } else {
    var checks = [];
    for (let i = 1; i < 9; i++) {
      document.getElementById("wc" + i).style.display = "inline";
      document.getElementById("cb" + i).checked = true;
      checks.push(i);
    }
    for (let i = 9; i < 15; i++) {
      document.getElementById("wc" + i).style.display = "none";
    }
  }
  main("Lyon.csv",checks);
  precSel = citySel;
}

function Niceviz() {
  citySel = "Nice";
  document.getElementById("place").innerHTML = "Nice";
  document.getElementById("wrapc-2").style.backgroundColor = "#008080";
  document.getElementById("wrapc-4").style.backgroundColor = "#b2d5ff";
  document.getElementById("wrapc-3").style.backgroundColor = "#b2d5ff";
  document.getElementById("wrapc-1").style.backgroundColor = "#b2d5ff";
  d3.select("#svg").remove();
  svg = null;
  if (citySel == precSel) {
    var checks = [];
    for (let i = 1; i < 15; i++) {
      if (document.getElementById("cb" + i).checked) {
        checks.push(i);
      }
    }
  } else {
    var checks = [];
    for (let i = 1; i < 15; i++) {
      document.getElementById("wc" + i).style.display = "inline";
      document.getElementById("cb" + i).checked = true;
      checks.push(i);
    }
    for (let i = 15; i < 15; i++) {
      document.getElementById("wc" + i).style.display = "none";
    }
  }
  main("Nice.csv",checks);
  precSel = citySel;
}

function Parisviz() {
  citySel = "Paris";
  document.getElementById("place").innerHTML = "Paris";
  document.getElementById("wrapc-3").style.backgroundColor = "#008080";
  document.getElementById("wrapc-2").style.backgroundColor = "#b2d5ff";
  document.getElementById("wrapc-4").style.backgroundColor = "#b2d5ff";
  document.getElementById("wrapc-1").style.backgroundColor = "#b2d5ff";
  d3.select("#svg").remove();
  svg = null;
  if (citySel == precSel) {
    var checks = [];
    for (let i = 1; i < 12; i++) {
      if (document.getElementById("cb" + i).checked) {
        checks.push(i);
      }
    }
  } else {
    var checks = [];
    for (let i = 1; i < 12; i++) {
      document.getElementById("wc" + i).style.display = "inline";
      document.getElementById("cb" + i).checked = true;
      checks.push(i);
    }
    for (let i = 12; i < 15; i++) {
      document.getElementById("wc" + i).style.display = "none";
    }
  }
  main("Paris.csv",checks);
  precSel = citySel;
}

function Fjestadviz() {
  citySel = "Fjestad";
  document.getElementById("place").innerHTML = "Fjestad";
  document.getElementById("wrapc-4").style.backgroundColor = "#008080";
  document.getElementById("wrapc-2").style.backgroundColor = "#b2d5ff";
  document.getElementById("wrapc-3").style.backgroundColor = "#b2d5ff";
  document.getElementById("wrapc-1").style.backgroundColor = "#b2d5ff";
  d3.select("#svg").remove();
  svg = null;
  if (citySel == precSel) {
    var checks = [];
    for (let i = 1; i < 9; i++) {
      if (document.getElementById("cb" + i).checked) {
        checks.push(i);
      }
    }
  } else {
    var checks = [];
    for (let i = 1; i < 9; i++) {
      document.getElementById("wc" + i).style.display = "inline";
      document.getElementById("cb" + i).checked = true;
      checks.push(i);
    }
    for (let i = 9; i < 15; i++) {
      document.getElementById("wc" + i).style.display = "none";
    }
  }
  main("Fjestad.csv",checks);
  precSel = citySel; 
}

function changedGraph() {
  console.log(citySel)
  if (citySel == "Lyon"){Lyonviz();} 
  if (citySel == "Nice"){Niceviz();} 
  if (citySel == "Paris"){Parisviz();} 
  if (citySel == "Fjestad"){Fjestadviz();} 
}

function selAll() {
  for (let i = 1; i < 15; i++) {
      document.getElementById("cb" + i).checked = true;
    }
    changedGraph();
}

function selNone() {
  for (let i = 1; i < 15; i++) {
      document.getElementById("cb" + i).checked = false;
    }
    changedGraph();
}
  
