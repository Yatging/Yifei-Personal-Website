document.addEventListener("DOMContentLoaded", function () {
  // =========================
  // 数据：访问过的城市
  // =========================
  const visitedPlaces = [
    { name: "Beijing", coords: [116.4074, 39.9042], province: "北京" },
    { name: "Shanghai", coords: [121.4737, 31.2304], province: "上海" },
    { name: "Guangzhou", coords: [113.2644, 23.1291], province: "广东" },
    { name: "Jiaxing", coords: [120.7555, 30.7461], province: "浙江" },
    { name: "Hangzhou", coords: [120.1551, 30.2741], province: "浙江" },
    { name: "Nanjing", coords: [118.7969, 32.0603], province: "江苏" },
    { name: "Yangzhou", coords: [119.4127, 32.3936], province: "江苏" },
    { name: "Suzhou", coords: [120.5853, 31.2989], province: "江苏" },
    { name: "Fuzhou", coords: [119.2965, 26.0745], province: "福建" },
    { name: "Xiamen", coords: [118.0895, 24.4798], province: "福建" },
    { name: "Zhangzhou", coords: [117.6536, 24.5130], province: "福建" },
    { name: "Nanchang", coords: [115.8582, 28.6829], province: "江西" },
    { name: "Ganzhou", coords: [114.9403, 25.8500], province: "江西" },
    { name: "Hong Kong", coords: [114.1694, 22.3193], province: "香港" },
    { name: "Macau", coords: [113.5439, 22.1987], province: "澳门" },
    { name: "Shenzhen", coords: [114.0579, 22.5431], province: "广东" },
    { name: "Zhuhai", coords: [113.5767, 22.2707], province: "广东" },
    { name: "Zhongshan", coords: [113.3926, 22.5176], province: "广东" },
    { name: "Qingyuan", coords: [113.0560, 23.6820], province: "广东" },
    { name: "Huizhou", coords: [114.4126, 23.1115], province: "广东" },
    { name: "Foshan", coords: [113.1214, 23.0215], province: "广东" },
    { name: "Zhaoqing", coords: [112.4651, 23.0469], province: "广东" },
    { name: "Urumqi", coords: [87.6168, 43.8256], province: "新疆" },
    { name: "Turpan", coords: [89.1897, 42.9513], province: "新疆" },
    { name: "Altay (Kanas)", coords: [88.1396, 47.8456], province: "新疆" },
    { name: "Hohhot", coords: [111.7492, 40.8426], province: "内蒙古" },
    { name: "Hulunbuir", coords: [119.7658, 49.2116], province: "内蒙古" },
    { name: "Manzhouli", coords: [117.4436, 49.5978], province: "内蒙古" },
    { name: "Chongqing", coords: [106.5516, 29.5630], province: "重庆" },
    { name: "Kunming", coords: [102.8329, 24.8801], province: "云南" },
    { name: "Lijiang", coords: [100.2330, 26.8721], province: "云南" },
    { name: "Dali", coords: [100.2676, 25.6065], province: "云南" },
    { name: "Changsha", coords: [112.9388, 28.2282], province: "湖南" },
    { name: "Hengyang", coords: [112.5719, 26.8932], province: "湖南" },
    { name: "Wuhan", coords: [114.3054, 30.5931], province: "湖北" },
    { name: "Guilin", coords: [110.2902, 25.2736], province: "广西" },
    { name: "Guiyang", coords: [106.6302, 26.6477], province: "贵州" },
    { name: "Libo (Qiannan)", coords: [107.8816, 25.4222], province: "贵州" },
    { name: "Jilin City", coords: [126.5496, 43.8378], province: "吉林" } // ✅ 新增吉林市
  ];

  const visitedProvinces = new Set(visitedPlaces.map(p => p.province));

  const width = 1000;
  const height = 800;

  const svg = d3
    .select("#dotmap-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g");

  // =========================
  // 投影：修复偏移，居中显示
  // =========================
  const projection = d3.geoMercator()
    .center([105, 38]) // 调整中心点
    .scale(800)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // 图层
  const mapLayer = g.append("g");
  const provinceLabelLayer = g.append("g");
  const pointLayer = g.append("g");
  const labelLayer = g.append("g");

  let points, labels;

  // =========================
  // 缩放与平移
  // =========================
  const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", (event) => {
      const { transform } = event;
      g.attr("transform", transform);

      // 点位半径随缩放调整
      points.attr("r", d => {
        const base = d.hovered ? 12 : 8;
        return base / transform.k;
      });

      labels
        .attr("x", d => projection(d.coords)[0])
        .attr("y", d => projection(d.coords)[1] + 15 / transform.k)
        .attr("font-size", `${12 / transform.k}px`);
    });

  svg.call(zoom);

  // =========================
  // 框选功能
  // =========================
  let selectionRect, startPoint;
  const selectedCities = new Set();

  svg.on("mousedown", (event) => {
    if (!event.shiftKey) return; // 按住 Shift 才能框选
    startPoint = d3.pointer(event, svg.node());
    if (selectionRect) selectionRect.remove();
    selectionRect = svg.append("rect")
      .attr("x", startPoint[0])
      .attr("y", startPoint[1])
      .attr("width", 0)
      .attr("height", 0)
      .attr("fill", "rgba(0,0,255,0.1)")
      .attr("stroke", "blue")
      .attr("stroke-dasharray", "4");
    svg.on("mousemove", mousemove);
    svg.on("mouseup", mouseup);
  });

  function mousemove(event) {
    const p = d3.pointer(event, svg.node());
    const x = Math.min(p[0], startPoint[0]);
    const y = Math.min(p[1], startPoint[1]);
    const w = Math.abs(p[0] - startPoint[0]);
    const h = Math.abs(p[1] - startPoint[1]);
    selectionRect.attr("x", x).attr("y", y).attr("width", w).attr("height", h);
  }

  function mouseup(event) {
    const rect = selectionRect.node().getBBox();
    selectedCities.clear();
    points.each(function(d) {
      const cx = +d3.select(this).attr("cx");
      const cy = +d3.select(this).attr("cy");
      if (cx >= rect.x && cx <= rect.x + rect.width &&
          cy >= rect.y && cy <= rect.y + rect.height) {
        selectedCities.add(d.name);
      }
    });
    updateSelectedList();
    selectionRect.remove();
    svg.on("mousemove", null);
    svg.on("mouseup", null);
  }

  // =========================
  // 更新右侧选中城市列表面板
  // =========================
  function updateSelectedList() {
    // 若不存在列表容器则创建
    let panel = document.getElementById("selected-cities");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "selected-cities";
      panel.style.position = "absolute";
      panel.style.top = "12px";
      panel.style.right = "12px";
      panel.style.width = "240px";
      panel.style.maxHeight = "70vh";
      panel.style.overflowY = "auto";
      panel.style.padding = "10px 12px";
      panel.style.border = "1px solid #ddd";
      panel.style.borderRadius = "8px";
      panel.style.background = "rgba(255,255,255,0.95)";
      panel.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      panel.style.fontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
      panel.style.fontSize = "14px";
      panel.style.lineHeight = "1.4";

      // 让 dotmap 容器成为定位上下文
      const container = document.getElementById("dotmap-container");
      if (container) container.style.position = "relative";
      (container || document.body).appendChild(panel);
    }

    // 标题与按钮区
    panel.innerHTML = "";
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.marginBottom = "8px";

    const title = document.createElement("div");
    title.textContent = "已选中的城市";
    title.style.fontWeight = "600";

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "清空";
    clearBtn.style.fontSize = "12px";
    clearBtn.style.padding = "4px 8px";
    clearBtn.style.border = "1px solid #ddd";
    clearBtn.style.borderRadius = "4px";
    clearBtn.style.background = "#fafafa";
    clearBtn.style.cursor = "pointer";
    clearBtn.addEventListener("click", () => {
      selectedCities.clear();
      updateSelectedList();
    });

    header.appendChild(title);
    header.appendChild(clearBtn);
    panel.appendChild(header);

    // 没有选中提示
    if (selectedCities.size === 0) {
      const hint = document.createElement("div");
      hint.textContent = "按住 Shift 键并拖拽以框选城市。点击列表城市可自动定位。";
      hint.style.color = "#666";
      panel.appendChild(hint);
      return;
    }

    // 城市列表
    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.margin = "0";
    ul.style.padding = "0";
    selectedCities.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      li.style.padding = "6px 8px";
      li.style.marginBottom = "6px";
      li.style.borderRadius = "6px";
      li.style.cursor = "pointer";
      li.style.transition = "background 0.2s ease";
      li.addEventListener("mouseenter", () => li.style.background = "#f5f5f5");
      li.addEventListener("mouseleave", () => li.style.background = "transparent");
      // 点击列表项，地图自动平移缩放至该城市
      li.addEventListener("click", () => focusCity(name));
      ul.appendChild(li);
    });
    panel.appendChild(ul);
  }

  // =========================
  // 平移缩放至指定城市（居中并放大到合适大小）
  // =========================
  function focusCity(cityName) {
    const city = visitedPlaces.find(d => d.name === cityName);
    if (!city) return;

    const [cx, cy] = projection(city.coords);
    const targetK = 4; // 目标缩放级别，可根据需要调整（3~6 常用）
    const tx = width / 2 - targetK * cx;
    const ty = height / 2 - targetK * cy;

    // 平滑过渡到目标视图
    svg.transition()
      .duration(800)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(tx, ty).scale(targetK)
      );
  }

  // =========================
  // 加载地图数据并绘制要素与点位
  // =========================
  d3.json("data/china.json").then(function (china) {
    // 省界面
    mapLayer.selectAll("path")
      .data(china.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => visitedProvinces.has(d.properties.name) ? "rgba(255, 235, 150, 0.6)" : "#f0f0f0")
      .attr("stroke", "#666")
      .attr("stroke-width", 0.6)
      .attr("stroke-linejoin", "round");

    // 访问过的省份标签
    provinceLabelLayer.selectAll("text")
      .data(china.features.filter(d => visitedProvinces.has(d.properties.name)))
      .enter()
      .append("text")
      .attr("transform", d => {
        const centroid = path.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "rgba(0,0,0,0.3)")
      .text(d => d.properties.name);

    // 城市点位
    points = pointLayer.selectAll("circle")
      .data(visitedPlaces)
      .enter()
      .append("circle")
      .attr("cx", d => projection(d.coords)[0])
      .attr("cy", d => projection(d.coords)[1])
      .attr("r", 8) // 基础视觉半径（后续在缩放回调中会按 transform.k 调整）
      .attr("fill", "red")
      .attr("opacity", 0.85)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      // 自定义状态：是否悬停（用于与缩放联动）
      .each(function(d){ d.hovered = false; });

    // 城市标签（默认隐藏）
    labels = labelLayer.selectAll("text")
      .data(visitedPlaces)
      .enter()
      .append("text")
      .attr("x", d => projection(d.coords)[0])
      .attr("y", d => projection(d.coords)[1] + 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#333")
      .style("display", "none")
      .text(d => d.name);

    // 点位交互：修复缩放与悬停半径冲突
    points
      .on("mouseover", function (event, d) {
        d.hovered = true;
        const t = d3.zoomTransform(svg.node());
        // 悬停时的目标视觉半径为 12，实际需要除以缩放系数
        d3.select(this)
          .transition()
          .duration(160)
          .attr("r", 12 / t.k)
          .attr("fill", "orange");

        // 显示标签，并按缩放修正位置与字体大小
        labels
          .filter(l => l.name === d.name)
          .style("display", "block")
          .attr("x", projection(d.coords)[0])
          .attr("y", projection(d.coords)[1] + 15 / t.k)
          .attr("font-size", `${12 / t.k}px`);
      })
      .on("mouseout", function (event, d) {
        d.hovered = false;
        const t = d3.zoomTransform(svg.node());
        d3.select(this)
          .transition()
          .duration(160)
          .attr("r", 8 / t.k) // 恢复基础视觉半径
          .attr("fill", "red");

        labels
          .filter(l => l.name === d.name)
          .style("display", "none");
      })
      .on("click", function (event, d) {
        // 如果有外部链接则跳转，否则定位到该城市
        if (d.url) {
          window.location.href = d.url;
        } else {
          focusCity(d.name);
        }
      });

    // 初始化：同步当前缩放下的点位半径与标签位置
    const t0 = d3.zoomTransform(svg.node());
    points.attr("r", 8 / t0.k);
    labels
      .attr("x", d => projection(d.coords)[0])
      .attr("y", d => projection(d.coords)[1] + 15 / t0.k)
      .attr("font-size", `${12 / t0.k}px`);
  });

  // =========================
  // 取消框选时的事件解绑（避免影响普通拖动缩放）
  // =========================
  function mousemoveCancel() { svg.on("mousemove", null); }
  function mouseupCancel() { svg.on("mouseup", null); }

  // 未按住 Shift 的 mousedown 不触发框选逻辑
  svg.on("mousedown.cancel", (event) => {
    if (event.shiftKey) return; // Shift+拖拽由前面的逻辑处理
    mousemoveCancel();
    mouseupCancel();
  });
});
