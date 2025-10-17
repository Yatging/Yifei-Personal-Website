(function () {
  const radialData = {
    name: "Peter HUANG Yifei",
    children: [
      {
        name: "Education",
        children: [
          {
            name: "Guangzhou No.7 Middle School (Pooi To High School)",
            url: "https://zh.wikipedia.org/wiki/%E5%B9%BF%E5%B7%9E%E5%B8%82%E7%AC%AC%E4%B8%83%E4%B8%AD%E5%AD%A6"
          },
          { name: "New Media, CityUHK", url: "https://www.cityu.edu.hk" }
        ]
      },
      {
        name: "Experience",
        children: [
          {
            name: "Marketing Intern-ShakeToWin",
            url: "https://www.shaketowin.net"
          },
          {
            name: "News Intern-TKWW",
            url: "https://www.tkww.hk"
          }
        ]
      },
      {
        name: "Skills",
        children: [
          { name: "Photography" },
          { name: "Graphic Design" },
          { name: "Data Visualization" },
          { name: "Media Content Creation and Edition" }
        ]
      },
      {
        name: "Social",
        children: [
          {
            name: "Instagram",
            url: "https://www.instagram.com/yatging_"
          },
          {
            name: "LinkedIn",
            url: "https://www.linkedin.com/in/yifei-huang-a8295a2ba?utm_"
          }
        ]
      }
    ]
  };

  const width = 800;
  const radius = width / 2;

  const svg = d3.select("#vis-radialtree")
    .append("svg")
    .attr("width", width)
    .attr("height", radius + 400)
    .append("g")
    .attr("transform", `translate(${radius},${radius + 50})`);

  const tree = d3.tree().size([Math.PI, radius - 120]);
  const root = d3.hierarchy(radialData);
  tree(root);

  const colorScale = d3.scaleOrdinal()
    .domain(["Education", "Experience", "Skills", "Social"])
    .range(["#6a5acd", "#20b2aa", "#ff8c00", "#4682b4"]);

  svg.append("g")
    .selectAll("path")
    .data(root.links())
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1.5)
    .attr("d", d3.linkRadial()
      .angle(d => d.x)
      .radius(d => d.y));

  const node = svg.append("g")
    .selectAll("g")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("transform", d => `
      rotate(${(d.x * 180 / Math.PI - 90)})
      translate(${d.y},0)
    `);

  node.append("circle")
    .attr("r", 5)
    .attr("fill", d => colorScale(d.parent?.data.name || "root"))
    .on("mouseover", function () {
      d3.select(this).transition().duration(200).attr("r", 8).attr("fill", "orange");
    })
    .on("mouseout", function (event, d) {
      d3.select(this).transition().duration(200).attr("r", 5).attr("fill", colorScale(d.parent?.data.name || "root"));
    })
    .on("click", function (event, d) {
      if (d.data.url) {
        window.open(d.data.url, "_blank");
      }
    });

  node.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.x < Math.PI === !d.children ? 8 : -8)
    .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
    .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
    .text(d => d.data.name)
    .style("font-size", "13px")
    .style("fill", "#333")
    .style("font-family", "Segoe UI, sans-serif")
    .style("cursor", d => d.data.url ? "pointer" : "default")
    .on("click", function (event, d) {
      if (d.data.url) {
        window.open(d.data.url, "_blank");
      }
    })
    .call(wrapText, 120); // 自动换行函数调用

  // 自动换行函数
  function wrapText(text, width) {
    text.each(function () {
      const textEl = d3.select(this);
      const words = textEl.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1;
      const y = textEl.attr("y") || 0;
      const x = textEl.attr("x");
      const anchor = textEl.attr("text-anchor");
      textEl.text(null);
      let tspan = textEl.append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", "0em")
        .attr("text-anchor", anchor);
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = textEl.append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", `${++lineNumber * lineHeight}em`)
            .attr("text-anchor", anchor)
            .text(word);
        }
      }
    });
  }
  // 图例数据
const legendData = [
  { label: "Education", color: "#6a5acd" },
  { label: "Experience", color: "#20b2aa" },
  { label: "Skills", color: "#ff8c00" },
  { label: "Social", color: "#4682b4" }
];

// 创建图例容器
const legend = d3.select("#radialtree-legend")
  .append("svg")
  .attr("width", width)
  .attr("height", 50);

const legendItemSize = 150;
const legendGroup = legend.selectAll("g")
  .data(legendData)
  .enter()
  .append("g")
  .attr("transform", (d, i) => `translate(${i * legendItemSize + 50}, 10)`);

// 图例圆点
legendGroup.append("circle")
  .attr("r", 6)
  .attr("fill", d => d.color);

// 图例文字
legendGroup.append("text")
  .attr("x", 12)
  .attr("y", 5)
  .text(d => d.label)
  .style("font-size", "14px")
  .style("font-family", "Segoe UI, sans-serif")
  .style("fill", "#333");

})();
