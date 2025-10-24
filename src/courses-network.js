// js/courses-network.js

const courses = [
  { id: "CS1102", name: "Introduction to Computer Science", group: "基础课程" },
  { id: "MA1201", name: "Calculus I", group: "数学基础" },
  { id: "CS2204", name: "Web Programming", group: "应用开发" },
  { id: "CS3301", name: "Data Structures", group: "核心课程" },
  { id: "SM3749", name: "Supply Chain Management", group: "管理课程" }
];

const links = [
  { source: "CS1102", target: "CS2204" },
  { source: "CS2204", target: "CS3301" },
  { source: "MA1201", target: "CS3301" },
  { source: "SM3749", target: "CS2204" }
];

const width = 800;
const height = 500;

const colorScale = d3.scaleOrdinal()
  .domain(["基础课程", "数学基础", "应用开发", "核心课程", "管理课程"])
  .range(["#6baed6", "#9ecae1", "#74c476", "#31a354", "#fdae6b"]);

const svg = d3.select("#network-graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const simulation = d3.forceSimulation(courses)
  .force("link", d3.forceLink(links).id(d => d.id).distance(120))
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(width / 2, height / 2));

const link = svg.append("g")
  .attr("stroke", "#aaa")
  .attr("stroke-width", 1.5)
  .selectAll("line")
  .data(links)
  .enter().append("line");

const node = svg.append("g")
  .selectAll("circle")
  .data(courses)
  .enter().append("circle")
  .attr("r", 12)
  .attr("fill", d => colorScale(d.group))
  .attr("stroke", "#333")
  .attr("stroke-width", 1.5)
  .call(d3.drag()
    .on("start", dragStart)
    .on("drag", dragging)
    .on("end", dragEnd));

const label = svg.append("g")
  .selectAll("text")
  .data(courses)
  .enter().append("text")
  .text(d => d.name)
  .attr("font-size", "14px")
  .attr("font-family", "Arial, sans-serif")
  .attr("fill", "#333")
  .attr("dx", 16)
  .attr("dy", ".35em");

simulation.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  label
    .attr("x", d => d.x)
    .attr("y", d => d.y);
});

function dragStart(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragging(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragEnd(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
