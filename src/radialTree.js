(function () {
  const radialData = {
    name: "Peter HUANG Yifei",
    children: [
      {
        name: "Education",
        children: [
          { name: "Guangzhou No.7 Middle School", url: "https://zh.wikipedia.org" },
          { name: "New Media, CityUHK", url: "https://www.cityu.edu.hk" }
        ]
      },
      {
        name: "Experience",
        children: [
          { name: "Marketing Intern - ShakeToWin", url: "https://www.shaketowin.net" },
          { name: "News Intern - TKWW", url: "https://www.tkww.hk" }
        ]
      },
      {
        name: "Skills",
        children: [
          { name: "Photography" },
          { name: "Graphic Design" },
          { name: "Data Visualization" },
          // 强制在 "Media Content" 与 "Creation" 之间换行
          { name: "Media Content\nCreation" }
        ]
      },
      {
        name: "Social",
        children: [
          { name: "Instagram", url: "https://www.instagram.com" },
          { name: "LinkedIn", url: "https://www.linkedin.com" }
        ]
      }
    ]
  };

  // tightened canvas for centered, smaller chart
  const width = 820;
  const height = 640;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 60; // safe margin

  // host: prefer section .container -> section -> body
  let host = d3.select("#vis-radialtree .container");
  if (!host.node()) host = d3.select("#vis-radialtree");
  if (!host.node()) host = d3.select("body");

  // remove previous renders
  d3.select(host.node()).selectAll("svg.radial-tree-svg").remove();
  d3.select(host.node()).selectAll("svg.radial-legend").remove();

  // responsive svg with centered viewBox
  const svg = d3.select(host.node())
    .append("svg")
    .classed("radial-tree-svg", true)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("display", "block")
    .style("max-width", "100%")
    .style("height", "auto");

  // main group centered
  const g = svg.append("g")
    .attr("transform", `translate(${centerX},${centerY})`);

  // radial tree layout (full circle)
  const tree = d3.tree().size([2 * Math.PI, maxRadius - 20]);

  const root = d3.hierarchy(radialData);
  tree(root);

  const colorScale = d3.scaleOrdinal()
    .domain(["Education", "Experience", "Skills", "Social"])
    .range(["#6a5acd", "#20b2aa", "#ff8c00", "#4682b4"]);

  // links (radial)
  g.append("g")
    .attr("class", "links")
    .selectAll("path")
    .data(root.links())
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#dcdcdc")
    .attr("stroke-width", 1.2)
    .attr("d", d3.linkRadial().angle(d => d.x).radius(d => d.y));

  // compute cartesian coords and attach
  const nodesData = root.descendants().map(d => {
    const angle = d.x - Math.PI / 2;
    return Object.assign(d, {
      cx: Math.cos(angle) * d.y,
      cy: Math.sin(angle) * d.y,
      angleRad: d.x
    });
  });

  function getSectionName(d) {
    if (d.depth === 1) return d.data.name;
    let cur = d;
    while (cur && cur.depth > 1) cur = cur.parent;
    return cur ? cur.data.name : d.data.name;
  }

  const nodes = g.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodesData)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.cx},${d.cy})`);

  // circles
  nodes.append("circle")
    .attr("r", d => d.depth === 0 ? 8 : 5)
    .attr("fill", d => colorScale(getSectionName(d)) || "#999")
    .attr("stroke", "#444")
    .attr("stroke-width", 0.8)
    .on("mouseover", function () { d3.select(this).transition().duration(120).attr("r", 8).attr("fill", "orange"); })
    .on("mouseout", function (event, d) { d3.select(this).transition().duration(120).attr("r", d.depth === 0 ? 8 : 5).attr("fill", colorScale(getSectionName(d)) || "#999"); })
    .on("click", (event, d) => { if (d.data.url) window.open(d.data.url, "_blank"); });

  // grandchild image placeholders (depth === 2)
  nodes.filter(d => d.depth === 2).each(function (d) {
    const gNode = d3.select(this);
    const isRight = Math.cos(d.angleRad - Math.PI / 2) > 0;
    const imgW = 40, imgH = 40;
    const rectX = isRight ? 10 : -imgW - 10;
    const rectY = -imgH / 2;
    gNode.append("rect")
      .attr("x", rectX)
      .attr("y", rectY)
      .attr("width", imgW)
      .attr("height", imgH)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "transparent")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1);
  });

  // labels (horizontal)
  nodes.append("text")
    .filter(d => d.depth >= 0)
    .attr("dy", d => d.depth === 0 ? "10em" : "35em") // 调整根节点文本位置
    .attr("x", d => {
      const isRight = Math.cos(d.angleRad - Math.PI / 2) > 0;
      if (d.depth === 2) return isRight ? 10 + 40 + 6 : -10 - 40 - 6;
      return isRight ? 8 : -8;
    })
    .attr("text-anchor", d => {
      const isRight = Math.cos(d.angleRad - Math.PI / 2) > 0;
      return (d.depth === 0) ? "middle" : (isRight ? "start" : "end");
    })
    .text(d => d.data.name)
    .style("font-size", d => d.depth === 0 ? "14px" : "12px")
    .style("font-family", "Inter, system-ui, 'Segoe UI', sans-serif")
    .style("fill", "#111")
    .style("cursor", d => d.data.url ? "pointer" : "default")
    .on("click", (event, d) => { if (d.data.url) window.open(d.data.url, "_blank"); })
    .call(wrapText, 160);

  // wrap helper (支持显式换行 '\n')
  function wrapText(selection, width) {
    selection.each(function () {
      const textEl = d3.select(this);
      const raw = textEl.text();
      const paragraphs = raw.split('\n'); // 支持显式换行
      textEl.text(null);
      let lineNumber = 0;
      const lineHeight = 1.1;
      const x = textEl.attr("x") || 0;
      const anchor = textEl.attr("text-anchor") || "start";
      const y = textEl.attr("y") || 0;

      paragraphs.forEach((para, pIndex) => {
        const words = para.trim().split(/\s+/).reverse();
        let line = [];
        let tspan = null;
        while (true) {
          const word = words.pop();
          if (word === undefined) break;
          if (!tspan) {
            tspan = textEl.append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", pIndex === 0 && lineNumber === 0 ? "0em" : `${++lineNumber * lineHeight}em`)
              .attr("text-anchor", anchor);
            line = [];
          }
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width && line.length > 1) {
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
        // after paragraph, ensure next paragraph starts new tspan on next line
        if (pIndex < paragraphs.length - 1) {
          lineNumber++;
        }
      });
    });
  }

  // legend (centered under svg)
  const legendData = [
    { label: "Education", color: "#6a5acd" },
    { label: "Experience", color: "#20b2aa" },
    { label: "Skills", color: "#ff8c00" },
    { label: "Social", color: "#4682b4" }
  ];

  const legendY = height - 48;
  const legendGroup = svg.append("g")
    .attr("transform", `translate(0, ${legendY})`);

  const spacing = width / (legendData.length + 1);
  legendGroup.selectAll("g")
    .data(legendData)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${spacing * (i + 1)}, 0)`)
    .call(function (sel) {
      sel.append("circle").attr("r", 6).attr("fill", d => d.color);
      sel.append("text").attr("x", 12).attr("y", 4).text(d => d.label)
        .style("font-size", "12px")
        .style("font-family", "Inter, system-ui, 'Segoe UI', sans-serif")
        .style("fill", "#333");
    });

})();