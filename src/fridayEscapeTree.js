(function () {
  const escapeData = {
    name: "CityU CMC",
    children: [
      {
        name: "Route 1",
        children: [
          {
            name: "MTR Kowloon Tong Station",
            children: [
              {
                name: "MTR Lok Wu Station", // East Rail 已移除
                children: [
                  {
                    name: "Shenzhen Railway Station",
                    children: [
                      {
                        name: "Guangzhou East Railway Station",
                        recommended: true,
                        note: "Catch 20:00 Intercity Train"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Route 2",
        children: [
          {
            name: "MTR Kowloon Tong Station",
            children: [
              {
                name: "MTR Prince Edward Station",
                children: [
                  {
                    name: "CTG Bus Mong Kok Station",
                    children: [
                      {
                        name: "Shenzhen Bay Checkpoint",
                        children: [
                          {
                            name: "Guangzhou City"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Route 3",
        children: [
          {
            name: "MTR Kowloon Tong Station",
            children: [
              {
                name: "MTR Austin Station",
                children: [
                  {
                    name: "HK West Kowloon Station",
                    children: [
                      {
                        name: "Shenzhen North Railway Station",
                        children: [
                          {
                            name: "Guangzhou South Railway Station"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  const width = 1200;
  const height = 800;

  const svg = d3.select("#vis-fridayescape")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

  const treeLayout = d3.tree().nodeSize([180, 100]);
  const root = d3.hierarchy(escapeData);
  treeLayout(root);

  const xExtent = d3.extent(root.descendants(), d => d.x);
  const xOffset = (width - (xExtent[1] - xExtent[0])) / 2 - xExtent[0];
  svg.attr("transform", `translate(${xOffset}, 50)`);

  // 绘制连接线
  svg.selectAll("path.link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", d => d.target.data.recommended ? "#ff4500" : "#aaa")
    .attr("stroke-width", d => d.target.data.recommended ? 3 : 2)
    .attr("stroke-dasharray", d => d.target.data.recommended ? "0" : "4,2")
    .attr("d", d3.linkHorizontal()
      .x(d => d.x)
      .y(d => d.y));

  // 在连接线上标注 "East Rail"
  svg.selectAll("text.link-label")
    .data(root.links())
    .enter()
    .append("text")
    .attr("class", "link-label")
    .attr("x", d => (d.source.x + d.target.x) / 2)
    .attr("y", d => (d.source.y + d.target.y) / 2 - 10)
    .attr("text-anchor", "middle")
    .text(d => {
      if (
        d.source.data.name === "MTR Kowloon Tong Station" &&
        d.target.data.name === "MTR Lok Wu Station"
      ) {
        return "East Rail Line";
      }
      if (
        d.source.data.name === "MTR Kowloon Tong Station" &&
        d.target.data.name === "MTR Prince Edward Station"
      ) {
        return "Tsuen Wan Line";
      }
      if (
        d.source.data.name === "MTR Kowloon Tong Station" &&
        d.target.data.name === "MTR Austin Station"
      ) {
        return "East Rail Line&Tuen Ma Line";
      }
      return "";
    })
    .style("font-size", "12px")
    .style("fill", "#888")
    .style("font-family", "Segoe UI, sans-serif")
    .style("font-style", "italic");

  // 绘制节点
  const node = svg.selectAll("g.node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("circle")
    .attr("r", 6)
    .attr("fill", d => d.data.recommended ? "#ff4500" : "#4682b4")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  node.append("text")
    .attr("dy", 12)
    .attr("text-anchor", "middle")
    .text(d => d.data.name)
    .style("font-size", "13px")
    .style("fill", "#333")
    .style("font-family", "Segoe UI, sans-serif")
    .call(wrapText, 160);

  node.filter(d => d.data.note)
    .append("text")
    .attr("dy", 38)
    .attr("text-anchor", "middle")
    .text(d => d.data.note)
    .style("font-size", "12px")
    .style("fill", "#ff4500")
    .style("font-style", "italic");

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
      const x = textEl.attr("x") || 0;
      const anchor = textEl.attr("text-anchor") || "middle";
      textEl.text(null);
      let tspan = textEl.append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", "1em")
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
            .attr("dy", `${++lineNumber * lineHeight + 1}em`)
            .attr("text-anchor", anchor)
            .text(word);
        }
      }
    });
  }
})();
