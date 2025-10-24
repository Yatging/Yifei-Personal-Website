const courses = [
  { id: "SM1702", name: "Creative Media Studio I", group: "Basic" },
  { id: "SM2704", name: "Creative Media Studio II", group: "Basic" },
  { id: "SM2702", name: "Interdisciplinary Practices", group: "Theory" },
  { id: "SM2276", name: "Music Production", group: "Workshop" },
  { id: "SM2706", name: "Critical Theory & Soc Engag Prac", group: "Theory" },
  { id: "SM2715", name: "Creative Coding", group: "Coding" },
  { id: "SM3804", name: "Materials & Fabrication Studio", group: "Workshop" },
  { id: "GE1401", name: "University English", group: "Culture" },
  { id: "GE2413", name: "Writing for Creative Media", group: "Culture" },
  { id: "SM2716", name: "Physical Computing & Tangible Media", group: "Coding" },
  { id: "SDSC2004", name: "Data Visualization", group: "Coding" },
  { id: "CS1103", name: "Media Computing", group: "Coding" },
  { id: "GE1501", name: "Chinese Civilisation - History&Philosophy", group: "Culture" },
  { id: "GE2132", name: "Dynamics of Chinese Cities&Architecture", group: "Culture" },
  { id: "SM1701", name: "New Media Art", group: "Theory" },
  { id: "SM2277", name: "Life Drawing", group: "Workshop" },
  { id: "SM1013", name: "Introduction to Photography", group: "Workshop" },
  { id: "SM2805", name: "Imaging Science Studio", group: "Workshop" },
  { id: "SM3749", name: "Information Visualization", group: "Coding" },
  { id: "SM3801", name: "Understanding Data", group: "Coding" }
];

const links = [
  { source: "SM1702", target: "SM2704" },
  { source: "SM1702", target: "SM2276" },
  { source: "SM1702", target: "SM3804" },
  { source: "CS1103", target: "SM2715" },
  { source: "SM2715", target: "SM2716" },
  { source: "SDSC2004", target: "SM3801" },
  { source: "SM3801", target: "SM3749" },
  { source: "SM1702", target: "SM2277" },
  { source: "GE1401", target: "GE2413" },
  { source: "GE1501", target: "GE2132" },
  { source: "SM2704", target: "SM1013" },
  { source: "SM2704", target: "SM2805" },
  { source: "SM1701", target: "SM2702" },
  { source: "SM2702", target: "SM2706" }
];

const width = 800;
const height = 600;
const centerX = width / 2;
const centerY = height / 2;
const radius = 200;
const lineHeight = 0.8;
const textWidth = 160;

const colorScale = d3.scaleOrdinal()
  .domain(["Basic", "Theory", "Coding", "Culture", "Workshop"])
  .range(["#6baed6", "#9ecae1", "#f78fb3", "#31a354", "#fdae6b"]);

const svg = d3.select("#network-graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const defs = svg.append("defs");
const container = svg.append("g");

// 初始化节点位置（极坐标）
courses.forEach((d, i) => {
  d.angle = (i / courses.length) * 2 * Math.PI;
  d.radius = radius;
  d.x = centerX + d.radius * Math.cos(d.angle);
  d.y = centerY + d.radius * Math.sin(d.angle);
});

// 获取节点对象
function getNode(id) {
  return typeof id === "string" ? courses.find(d => d.id === id) : id;
}

// 创建渐变色（动态方向）
function createGradient(id, color1, color2, x1, y1, x2, y2) {
  const gradient = defs.append("linearGradient")
    .attr("id", id)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2);
  gradient.append("stop").attr("offset", "0%").attr("stop-color", color1);
  gradient.append("stop").attr("offset", "100%").attr("stop-color", color2);
}

// 自动换行函数
function wrapText(textEl, text, width) {
  const words = text.split(" ");
  let line = [];
  let lineNumber = 0;
  textEl.text(null);
  let tspan = textEl.append("tspan").attr("x", 0).attr("dy", "0em");
  for (let word of words) {
    line.push(word);
    tspan.text(line.join(" "));
    if (tspan.node().getComputedTextLength() > width) {
      line.pop();
      tspan.text(line.join(" "));
      line = [word];
      tspan = textEl.append("tspan")
        .attr("x", 0)
        .attr("dy", ++lineNumber * lineHeight + "em")
        .text(word);
    }
  }
}

// 绘制边线
const link = container.append("g")
  .selectAll("line")
  .data(links)
  .enter().append("line")
  .attr("stroke-width", 2.5);

// 绘制节点
const node = container.append("g")
  .selectAll("circle")
  .data(courses)
  .enter().append("circle")
  .attr("r", 10)
  .attr("fill", d => colorScale(d.group))
  .attr("stroke", "#444")
  .attr("stroke-width", 1.2);

// 绘制标签
const label = container.append("g")
  .selectAll("text")
  .data(courses)
  .enter().append("text")
  .attr("font-size", "12px")
  .attr("font-family", "Georgia, serif")
  .attr("fill", "#333")
  .each(function(d) {
    wrapText(d3.select(this), d.name, textWidth);
  });

// 更新位置
function updatePositions() {
  courses.forEach(d => {
    d.x = centerX + d.radius * Math.cos(d.angle);
    d.y = centerY + d.radius * Math.sin(d.angle);
  });

  defs.selectAll("*").remove(); // 清除旧渐变

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  label
    .attr("transform", d => {
      const offsetX = Math.cos(d.angle) * 20;
      const offsetY = Math.sin(d.angle) * 20;
      return `translate(${d.x + offsetX},${d.y + offsetY})`;
    })
    .attr("text-anchor", d => {
      const deg = (d.angle * 180) / Math.PI;
      return deg > 90 && deg < 270 ? "end" : "start";
    });

  link
    .attr("x1", d => getNode(d.source).x)
    .attr("y1", d => getNode(d.source).y)
    .attr("x2", d => getNode(d.target).x)
    .attr("y2", d => getNode(d.target).y)
    .attr("stroke", d => {
      const source = getNode(d.source);
      const target = getNode(d.target);
      const sGroup = source.group;
      const tGroup = target.group;
      if (sGroup === tGroup) {
        return colorScale(sGroup);
      } else {
        const gradId = `gradient-${source.id}-${target.id}`;
        createGradient(gradId, colorScale(sGroup), colorScale(tGroup), source.x, source.y, target.x, target.y);
        return `url(#${gradId})`;
      }
    });
}

// 拖动旋转
let lastX = null;
svg.call(d3.drag()
  .on("start", event => { lastX = event.x; })
  .on("drag", event => {
    const dx = event.x - lastX;
    const deltaAngle = dx * 0.005;
    courses.forEach(d => d.angle += deltaAngle);
    updatePositions();
    lastX = event.x;
  }));

// 初始渲染
updatePositions();
