// 示例数据（Article 类型加了 url 字段）
(function(){
const data = [
    { year: 2019, type: "Article", count: 5, url: "https://epaper.tkww.hk/a/202507/20/AP687bfbc0e4b0e169b1368fc8.html" },
    { year: 2019, type: "Drawing", count: 3 },
    { year: 2020, type: "Article", count: 8, url: "https://epaper.tkww.hk/a/202508/02/AP688d1f46e4b0f2e74393ad64.html" },
    { year: 2020, type: "Video", count: 2 },
    { year: 2023, type: "Drawing", count: 7 },
    { year: 2021, type: "Article", count: 12, url: "https://epaper.tkww.hk/a/202508/08/AP68950862e4b0f2e74393e5b4.html" },
    { year: 2021, type: "Video", count: 5 },
    { year: 2021, type: "Music", count: 1 },
    { year: 2022, type: "Article", count: 6, url: "https://epaper.tkww.hk/a/202508/09/AP689659bee4b0f2e74393f057.html" },
    { year: 2022, type: "Video", count: 9 },
    { year: 2022, type: "Music", count: 4 },
    { year: 2023, type: "Article", count: 10, url: "https://epaper.tkww.hk/a/202508/09/AP689659d5e4b0f2e74393f05b.html" },
    { year: 2023, type: "Video", count: 7 },
    { year: 2023, type: "Music", count: 3 },
    { year: 2024, type: "Article", count: 15, url: "https://www.tkww.hk/a/202507/22/AP687ededce4b0e169b136a962.html" },
    { year: 2024, type: "Video", count: 12, url:"https://www.tkww.hk/a/202508/05/AP6891bc2ee4b0f2e74393ceac.html" },
    { year: 2024, type: "Music", count: 6 },
    { year: 2025, type: "Article", count: 9, url: "https://www.tkww.hk/a/202507/13/AP6872fdade4b0e169b1365535.html" },
    { year: 2025, type: "Video", count: 8 ,url:"https://youth.tkww.hk/a/202507/27/AP6885f1a4e4b0f2e7439376fc.html" },
    { year: 2025, type: "Music", count: 2 },
    { year: 2025, type: "Drawing", count: 30 }
];

// 图表尺寸
const margin = { top: 80, right: 180, bottom: 60, left: 80 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// 创建 SVG
const host = d3.select("#vis-scatterplot .container").node() ? d3.select("#vis-scatterplot .container") : d3.select("#vis-scatterplot");
const svg = host.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

// 标题
svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Creative Work Distribution Over Years");

// 副标题
svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 55)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#555")
    .text("Dot size = number of works; Color = work type; Try to click dots to read");

// 主绘图区
const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 横轴
const years = [...new Set(data.map(d => d.year))];
const xScale = d3.scalePoint()
    .domain(years)
    .range([0, width])
    .padding(0.5);

const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

// 纵轴
const types = [...new Set(data.map(d => d.type))];
const yScale = d3.scalePoint()
    .domain(types)
    .range([0, height])
    .padding(0.5);

// 半径比例尺
const rScale = d3.scaleSqrt()
    .domain(d3.extent(data, d => d.count))
    .range([3, 20]);

// ===============================
// ⭐ 统一色板（与 matrix & network 完全一致）
// ===============================
const colorScale = d3.scaleOrdinal()
  .domain(types)
  .range([
    "#E1306C",
    "#10B981",
    "#F59E0B",
    "#6366F1"
  ]);

// X 轴
g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

g.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .style("text-anchor", "middle")
    .text("Year");

// Y 轴
g.append("g").call(d3.axisLeft(yScale));

g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -70)
    .style("text-anchor", "middle")
    .text("Work Type");

// tooltip
const tooltip = d3.select("body").append("div").attr("class", "tooltip");

// 绘制散点（Article 点加链接）
g.selectAll(".dot")
  .data(data)
  .enter()
  .append("a")
  .attr("xlink:href", d => d.url ? d.url : null)
  .attr("target", "_blank")
  .append("circle")
  .attr("class", "dot")
  .attr("cx", d => xScale(d.year))
  .attr("cy", d => yScale(d.type))
  .attr("r", d => rScale(d.count))
  .attr("fill", d => colorScale(d.type))
  .attr("stroke", "#fff")
  .attr("stroke-width", 1);

// 图例
const legend = svg.append("g")
    .attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`);

types.forEach((t, i) => {
    const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);

    legendRow.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", colorScale(t));

    legendRow.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .text(t)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
});
})();
