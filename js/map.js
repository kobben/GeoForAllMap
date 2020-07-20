//GLOBALS:
var svg, curProj, projections, geoPath, mapScale;
var mapLayers = []; // wil be an array of maplayer objects
var DEBUG;

function init() {

// get width and height from mapDiv width
  var w = parseInt(d3.select("#mapDiv").style("width"));
  var h = parseInt(d3.select("#mapDiv").style("height"));
  initMessages(this.mapDiv, true);
  initMenus(this.mapDiv, false);

//set startpoint random:
// startlon = (Math.random() * 360) - 180 ;
// startlat = (Math.random() * 180) - 90;
//set startpoint at specific lon/lat:
  startlon = 0;
  startlat = 0;

// map projections
// max zoom out and zoom in (mapScaleStart x times):
  var zoomMin = 1;
  var zoomMax = 10;
  mapScale = 150; //to fit width in Div
  //factored by scaleFactor per projection...
  projections = [
    {
      'name': 'Orthographic',
      'fullworld': false,
      'scaleFactor': 2,
      'proj': d3.geoOrthographic()
        .scale(mapScale * 2)
        .precision(.1)
        .translate([w / 2, h / 2])
        .rotate([startlon, startlat])
    },
    {
      'name': 'Natural Earth II',
      'fullworld': true,
      'scaleFactor': 1.2,
      'proj': d3.geoNaturalEarth2()
        .scale(mapScale * 1.2)
        .precision(.1)
        .translate([w / 2, h / 2])
        .rotate([startlon, startlat])
    },
    {
      'name': 'Mollweide',
      'fullworld': true,
      'scaleFactor': 1.13,
      'proj': d3.geoMollweide()
        .scale(mapScale * 1.13)
        .precision(.1)
        .translate([w / 2, h / 2])
        .rotate([startlon, startlat])
    },
    {
      'name': 'Robinson',
      'fullworld': true,
      'scaleFactor': 1,
      'proj': d3.geoRobinson()
        .scale(mapScale * 1)
        .precision(.1)
        .translate([w / 2, h / 2])
        .rotate([startlon, startlat])
    },
    {
      'name': 'Conic Equal Area',
      'fullworld': true,
      'scaleFactor': 1,
      'proj': d3.geoConicEqualArea()
        .scale(mapScale * 1)
        .precision(.1)
        .translate([w / 2, h / 2])
        .rotate([startlon, startlat])
    },
    {
      'name': 'Bonne',
      'fullworld': true,
      'scaleFactor': 1.08,
      'proj': d3.geoBonne()
        .scale(mapScale * 1.08)
        .precision(.1)
        .translate([w / 2, h / 2])
        .rotate([startlon, startlat])
    },
    {
      'name': 'Plate Carré',
      'fullworld': true,
      'scaleFactor': 1,
      'proj': d3.geoEquirectangular()
        .scale(mapScale * 1)
        .precision(.1)
        .translate([w / 2, h / 2])
        .rotate([startlon, startlat])
    },
    {
      'name': 'Goode interupted homolosine',
      'fullworld': true,
      'scaleFactor': 1,
      'proj': d3.geoInterruptedHomolosine()
        .scale(mapScale * 1)
        .precision(.1)
        .translate([w / 2, h / 2])
        .rotate([startlon, startlat])
    }
  ];

  curProj = projections[0];
  addSelectMenu("Projection", reproject, projections.map(function (d) {
    return d.name
  }), 0);
  addButtonMenu("Reset Projection", resetProjection);

// geoPath generator
  geoPath = d3.geoPath().projection(curProj.proj);

// create SVG element
  svg = d3.select("#mapDiv")
    .append("svg")
    .attr("id","mapsvg")
    .attr("width", w)
    .attr("height", h)
  ;

  //properties used to join geometry with attribute data:
  var attribData, mapKeyObj = "iso_a2", attribKeyObj = "ISO2";

  /**
   * joinAttribData(d): joins attributes in csvData with topojson
   * returns: mapKey (e.g. to be used as ID)
   */
  function joinAttribData(mapData) {
    // get Map Key & Map Name
    var mapKey = mapData.properties[mapKeyObj];
    var mapName = mapData.properties["name"];
    var joined = false;
    attribData.forEach(function (attribData) {
      //find matching data using keys
      if (mapKey == attribData[attribKeyObj]) {
        joined = true;
        // overwrite map data with joined attribs:
        mapData.properties = attribData;
        // and restore key and name:
        mapData.properties.mapkey = mapKey;
        mapData.properties.mapname = mapName;
      }
    });
    if (!joined) { // no join: restore original attribs
      mapData.properties.mapkey = mapKey;
      mapData.properties.mapname = mapName;
      setMessage('no join found! [' + mapKey + '] ' + mapName, debugMsg);
    }
    return mapKey;
  }

// load  data
  setMessage('Loading...', showMsg);
  d3.csv("data/opengeolabs.csv", function (error, csvData) {
    if (error) throw error;
    attribData = csvData;

    d3.json("data/world-110m.topojson", function (error, json) {
      if (error) throw error;

      var globe = {type: "Sphere"};
      var graticule = d3.geoGraticule()();
      var coastline = topojson.merge(json, json.objects.countries.geometries);
      var countries = topojson.feature(json, json.objects.countries);
      var borders = topojson.mesh(json, json.objects.countries, function (a, b) {
        return a !== b;
      });

      addSimplePathLayer("globe", globe, "ocean");

      addSimplePathLayer("graticule", graticule, "graticule");

      addFeaturePathLayer("countries", countries, "countries", mapKeyObj);

      addSimplePathLayer("borders", borders, "borders");

      addSimplePathLayer("coastline", coastline, "coastline");

      //addGeoCirclesLayer("geoForAllLabs", attribData, "geoCircle", 1);

      //// create proportional circles
      //   where lat-lon comes from the basemap centroids
      //   and attributes from joined AttribData:
      //mapLayerTypes[5] = "propCircles";
      //mapLayers[5] = svg.append("g").attr("id", "propCircles");
      //mapLayers[5].selectAll("circle")
      //  .data(countries.features)
      //  .enter()
      //  .append("circle")
      //  .attr("id", joinAttribData)
      //  .attr("class", "propCircle")
      //  .attr("cx", function (d) {
      //    return getCentroid(d)[0]
      //  })
      //  .attr("cy", function (d) {
      //    return getCentroid(d)[1]
      //  })
      //  .attr("r", function (d) {
      //    if (d.properties.stud_1950_2006 >= 0) { //circle radius = attrib/25
      //      return d.properties.stud_1950_2006 / 25
      //    } else { // undefined or -99 = noData
      //      return 0;
      //    }
      //  })
      //  .on("click", function (d) {
      //    d3.event.stopPropagation();
      //    clickedOnData("land", this);
      //  })
      //  .on("mousemove", function (d) {
      //    toolTipMove(d3.event)
      //  })
      //  .on("mouseleave", function (d) {
      //    toolTipHide()
      //  })
      //  .on("mouseenter", function (d) {
      //    var txt;
      //    if (d.properties.stud_1950_2006 >= 0) { //circle radius = attrib/25
      //      txt = d.properties.mapname + ": " + d.properties.stud_1950_2006 + " students"
      //    } else { // undefined or -99 = noData
      //      txt = d.properties.mapname + ": [no data]"
      //    }
      //      toolTipShow(txt);
      //  })
      //;

    });
    setMessage('Loaded.', hideMsg);
  });

  function addSimplePathLayer(id, data, cssClass) {
    var maplayer = {}; // maplayer object
    maplayer.type = "path";
    maplayer.d3Obj = svg.append("g").attr("id", id);
    maplayer.d3Obj.append("path")
      .datum(data)
      .attr("class", cssClass)
      .attr("d", geoPath)
    ;
    mapLayers.push(maplayer);
  }

  function addFeaturePathLayer(id, data, cssClass, mapKeyObj) {
    var maplayer = {}; // maplayer object
    maplayer.type = "path";
    maplayer.d3Obj = svg.append("g").attr("id", id);
    maplayer.d3Obj.selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
      // ONLY JOIN data if attrinbData can be joined with base map
      // AND only do it once for 1 layer only!
      //.attr("id", joinAttribData)
      .attr("class", cssClass)
      .attr("id", function (d) {
        return id + "_" + d.properties[mapKeyObj];
      })
      .attr("d", geoPath)
      .on("click", function (d) {
        d3.event.stopPropagation();
        clickedOnData(maplayer.type, this);
      })
    //.on("mousemove", function (d) {
    //  toolTipMove(d3.event)
    //})
    //.on("mouseleave", function (d) {
    //  toolTipHide()
    //})
    //.on("mouseenter", function (d) {
    //  var txt;
    //  if (d.properties.stud_1950_2006 >= 0) {
    //    txt = d.properties.mapname + ": " + d.properties.stud_1950_2006 + " students"
    //  } else { // undefined or -99 = noData
    //    txt = d.properties.mapname + ": [no data]"
    //  }
    //  toolTipShow(txt);
    //})
    ;
    mapLayers.push(maplayer);
  }

  function addGeoCirclesLayer(id, data, cssClass, circleSize) {
    // create geoCircles,
    // where lat-lon as well as attributes
    // come from attribData:
    var maplayer = {}; // maplayer object
    gCircle = d3.geoCircle();
    maplayer.type = "geoCircles";
    maplayer.circleSize = circleSize;
    maplayer.d3Obj = svg.append("g").attr("id", id);
    maplayer.d3Obj.selectAll("path")
      .data(data)
      .enter().append("path")
      .attr("class", cssClass)
      .attr("id", function (d) {
        return id + "_" + d.id;
      })
      .attr("d", function (d) {
        return geoPath(gCircle.center([d.lon, d.lat]).radius( circleSize / d3.zoomTransform(svg.node()).k)());
      })
      .on("click", function (d) {
        d3.event.stopPropagation()
        clickedOnData(maplayer.type, d);
      })
      .on("mousemove", function (d) {
        toolTipMove(d3.event)
      })
      .on("mouseleave", function (d) {
        toolTipHide()
      })
      .on("mouseenter", function (d) {
        var txt;
        txt = d.name + " (" + d.city + ")";
        toolTipShow(txt);
      })
    ;
    mapLayers.push(maplayer);
  }

// enable drag
  var drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged);
  var gpos0, o0, gpos1, o1;
  svg.call(drag);
  var zoom = d3.zoom()
      .scaleExtent([zoomMin, zoomMax])
      .on("zoom", zoomed)
    ;
  svg.call(zoom);

} // END init()

// DRAG FUNCTIONS //
function dragstarted() {
  gpos0 = curProj.proj.invert(d3.mouse(this));
  o0 = curProj.proj.rotate();
}
function dragged() {
  gpos1 = curProj.proj.invert(d3.mouse(this));
  o0 = curProj.proj.rotate();
  o1 = eulerAngles(gpos0, gpos1, o0);
  if (o1 !== null && o1 !== undefined) { //not sure why this happens, but it does :-(
    curProj.proj.rotate(o1);
    redraw();
  }
}

// ZOOM FUNCTIONS //
function zoomed() {
  curProj.proj.scale(d3.event.transform.translate(curProj.proj).k * (mapScale * curProj.scaleFactor))
  redraw();
}

/* ----------------
 Set of projection facilities:
 reproject, reset projection, and rotateTo
 all followed by redraw()
 ----------------
 */
function reproject(projIndex) {
  curProj = projections[projIndex];
  geoPath = d3.geoPath().projection(curProj.proj);
  resetProjection();
}
function resetProjection() {
  curProj.proj.scale(mapScale * curProj.scaleFactor);
  rotateTo(startlon, startlat);
}
function rotateTo(lon, lat) {
  svg.transition()
    .duration(1000)
    .tween("rotate", function () {
      var r = d3.interpolate(curProj.proj.rotate(), [-lon, -lat, 0]);
      return function (t) {
        curProj.proj.rotate(r(t));
        redraw();
      }
    });
}
function redraw() {
  for (i = 0; i < mapLayers.length; i++) {
    if (mapLayers[i].type == "path") {
      mapLayers[i].d3Obj.selectAll("path")
        .attr("d", geoPath)
      ;
    } else if (mapLayers[i].type == "geoCircles") {
      mapLayers[i].d3Obj.selectAll("path")
        .attr("d", function (d) {
          return geoPath(gCircle.center([d.lon, d.lat])
            .radius(mapLayers[i].circleSize / d3.zoomTransform(svg.node()).k)());
        });
    } else if (mapLayers[i].type == "propCircles") {
      mapLayers[i].d3Obj.selectAll("circle")
        .attr("cx", function (d) {
          return getCentroid(d)[0]
        })
        .attr("cy", function (d) {
          return getCentroid(d)[1]
        })
      ;
    } else {
      setMessage("Unknown layer type [" + mapLayers[i].type + "]!", errorMsg)
    }
  }
}


/* ----------------
 * utility functions */

function getCentroid(d) {
  var x, y;
  if (curProj.fullworld) {
    // in case of full-world projection (eg Mercator)
    // use the centroid of the spherical (world) geometry:
    x = Math.round(curProj.proj(d3.geoCentroid(d)) [0]);
    y = Math.round(curProj.proj(d3.geoCentroid(d)) [1]);
  } else {
    // in case of back-culling projection (eg OrthoGraphic)
    // use the centroid of the planar (screen) geometry:
    x = Math.round(geoPath.centroid(d)[0]);
    y = Math.round(geoPath.centroid(d)[1]);
    // plot out of window if NaN (eg when backface of globe)
    if (isNaN(x) || isNaN(y)) {
      x = -999;
      y = -999;
    }
  }
  return [x, y];
}

/* ---------------- */

function clickedOnData(type, d) {
  // function determines what to do when the user selects from the drop down or clicks data on the map

  switch (type) {
    case 'geoCircles' :
      //d in this case is the geoCircle d, which has a d.lon and d.lat object
      d3.select(".pinselected").classed("pinselected", false);
      rotateTo(d.lon, d.lat);
      d3.select("#pin" + d.id).classed("pinselected", true);
      //showInfo([d])
      break;
    case 'path' :
      //d in this case is 'this' = the SVG/HTML container,
      // of which the mouseclick location can be found
      var lonlat = curProj.proj.invert(d3.mouse(d));
      rotateTo(lonlat[0], lonlat[1]);
      break;
    //case 'dropdown' :
    //  //d in this case is the ...
    //  d3.select(".pinselected").classed("pinselected", false);
    //  rotateTo(d.lon, d.lat);
    //  d3.select("#pin" + d.id).classed("pinselected", true);
    //  showInfo([d]);
    //  break;
  }
}

// SIZE CHANGE //
function sizeChange() {
  // check if window smaller than 768px (that's when the map size starts changing)
  // if (window.innerWidth <= 768) {
  // 	var wh = Math.min(parseInt(d3.select("#mapDiv").style("width"),10), parseInt(d3.select("#mapDiv").style("height"),10));
  //
  // 	// map projection
  // 	projection.scale(wh/2.1).translate([ wh/2, wh/2 ])
  //
  // 	// update size SVG element
  // 	svg.attr("width", w).attr("height", h)
  //
  // 	// update land masses, background circle and dots
  // 	map.selectAll("path").attr("d", path);
  // 	geoCircles.selectAll("path").attr("d", function(d) { return path(circle.center([d.lon, d.lat]).radius(1.5)()); });
  // }
  // // else do nothing
}


function mean(x) {
  // calculates mean of an array while ignoring NaN values
  var sum = 0;
  var len = 0
  while (x.length > 0) {
    y = x.pop()
    if (!(isNaN(y) || y == 0)) {
      sum += y;
      len++
    }
  }
  return sum / len
}

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

// initialise resize function
d3.select(window)
  .on("resize", sizeChange);

function showInfo(data) {

  var len = data.length;
  var infoDiv = d3.select("#expWrapper");

  // reset the dropdown
  document.getElementById("selectData").selectedIndex = 0

  // remove existing info divs from wrapper
  infoDiv.selectAll("*").remove();

  if (len == 0) { // no data: show welcome message
    infoDiv.html("<h3>Welcome!</h3> \
			<p>Click on a data point in the map or use 'Find Data' - Dragging will rotate the globe, \
			using the mouse-wheel will let you zoom in and out. </p>");
  }
  else {
    var row0 = "" // name of uni
    var row1 = "" // country, city + url
    var row2 = "" // description
    var row3 = "" // contact
    var row4 = "" // date
    data.forEach(function (lab, index) {
      row0 += "<h3>" + lab.name + "</h3>";
      if (lab.url != null && lab.url != '' && lab.url != undefined) {
        row0 += "<a href=" + lab.url + " target='_blank' class='weblink'>" + lab.url + "</a>"
      }
      row1 += "<h4>" + lab.city + ", " + lab.country + "</h4>";
      row2 += lab.contact_name + " (" + lab.contact_email + ") <br>";
      row3 += lab.date + "<hr>";
      row4 += lab.notes;
    });

    infoDiv.html(row0 + row1 + row2 + row3 + row4);

  }
}

