document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("visitor-dotmap");
  const width = container.clientWidth || 1000;
  const height = 600;

  const svg = d3.select("#visitor-dotmap")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g");

  // World projection
  const projection = d3.geoNaturalEarth1()
    .scale(width / 6.5)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const mapLayer = g.append("g");
  const pointLayer = g.append("g");

  // Expanded visitor dataset
  let visitors = [
    { city: "Beijing", coords: [116.4074, 39.9042], traffic: 50 },
    { city: "Shanghai", coords: [121.4737, 31.2304], traffic: 40 },
    { city: "Tokyo", coords: [139.6917, 35.6895], traffic: 60 },
    { city: "Seoul", coords: [126.9780, 37.5665], traffic: 35 },
    { city: "New York", coords: [-74.006, 40.7128], traffic: 80 },
    { city: "Los Angeles", coords: [-118.2437, 34.0522], traffic: 55 },
    { city: "London", coords: [-0.1276, 51.5072], traffic: 45 },
    { city: "Paris", coords: [2.3522, 48.8566], traffic: 30 },
    { city: "Berlin", coords: [13.4050, 52.5200], traffic: 25 },
    { city: "Moscow", coords: [37.6173, 55.7558], traffic: 20 },
    { city: "Sydney", coords: [151.2093, -33.8688], traffic: 20 },
    { city: "São Paulo", coords: [-46.6333, -23.5505], traffic: 35 },
    { city: "Mexico City", coords: [-99.1332, 19.4326], traffic: 25 },
    { city: "Cairo", coords: [31.2357, 30.0444], traffic: 15 },
    { city: "Johannesburg", coords: [28.0473, -26.2041], traffic: 10 },
    { city: "Toronto", coords: [-79.3832, 43.6532], traffic: 28 },
    { city: "Delhi", coords: [77.1025, 28.7041], traffic: 50 },
    { city: "Singapore", coords: [103.8198, 1.3521], traffic: 22 },
    { city: "Dubai", coords: [55.2708, 25.2048], traffic: 18 }
  ];

  // Load world map
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
    const countries = topojson.feature(world, world.objects.countries);

    // Draw map
    mapLayer.selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#e0e0e0")
      .attr("stroke", "#999")
      .attr("stroke-width", 0.5);

    // Draw points
    const points = pointLayer.selectAll("circle")
      .data(visitors)
      .enter()
      .append("circle")
      .attr("cx", d => projection(d.coords)[0])
      .attr("cy", d => projection(d.coords)[1])
      .attr("r", d => Math.sqrt(d.traffic))
      .attr("fill", "rgba(255,0,0,0.6)")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // Title
    const title = svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("fill", "#222")
      .text("Live Website Visitors Around the World");

    // Info text (time + total traffic), centered below title
    const infoText = svg.append("text")
      .attr("x", width / 2)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", "#333");

    // Update function
    function updateData() {
      // Stronger fluctuations
      visitors.forEach(v => {
        const change = (Math.random() - 0.5) * 180; // -30 to +30
        v.traffic = Math.max(5, v.traffic + change);
      });

      // Update circles
      points
        .data(visitors)
        .transition()
        .duration(1000)
        .attr("r", d => Math.sqrt(d.traffic));

      // Update info text
      const totalTraffic = visitors.reduce((sum, v) => sum + v.traffic, 0);
      const now = new Date().toLocaleString("en-US");
      infoText.text(`Time: ${now} | Total Visitors: ${Math.round(totalTraffic)}`);
    }

    // Update every econd
    setInterval(updateData, 1000);
    updateData();
  });
});

