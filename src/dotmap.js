document.addEventListener("DOMContentLoaded", function () {
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
  { name: "Libo (Qiannan)", coords: [107.8816, 25.4222], province: "贵州" }
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

  // ✅ 地图整体右移 50px
  const projection = d3.geoMercator()
    .center([110, 35]) // 向东偏移一点，确保东部省份显示完整
    .scale(800)
    .translate([width / 2 , height / 2]);

  const path = d3.geoPath().projection(projection);

  // 图层顺序：地图 → 省名 → 点位 → 城市标签
  const mapLayer = g.append("g");
  const provinceLabelLayer = g.append("g");
  const pointLayer = g.append("g");
  const labelLayer = g.append("g");

  let points, labels;

  const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", (event) => {
      const { transform } = event;
      g.attr("transform", transform);

      const newRadius = 8 / transform.k; // ✅ 点位大小反向缩放
      points.attr("r", newRadius);

      labels
        .attr("x", d => projection(d.coords)[0])
        .attr("y", d => projection(d.coords)[1] + 15 / transform.k)
        .attr("font-size", `${12 / transform.k}px`);
    });

  svg.call(zoom);

  // ✅ 使用完整版中国地图数据，显示所有省界
  d3.json("https://geo.datav.aliyun.com/areas/bound/100000.json").then(function (china) {
    // ✅ 绘制地图边界
    mapLayer.selectAll("path")
      .data(china.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => visitedProvinces.has(d.properties.name) ? "rgba(255, 235, 150, 0.6)" : "#f0f0f0")
      .attr("stroke", "#666")
      .attr("stroke-width", 0.6)
      .attr("stroke-linejoin", "round");

    // ✅ 添加省份名称（仅访问过的）
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

    // ✅ 添加点位
    points = pointLayer.selectAll("circle")
      .data(visitedPlaces)
      .enter()
      .append("circle")
      .attr("cx", d => projection(d.coords)[0])
      .attr("cy", d => projection(d.coords)[1])
      .attr("r", 8) // ✅ 默认点位大小放大
      .attr("fill", "red")
      .attr("opacity", 0.8)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer");

    // ✅ 添加城市标签（初始隐藏）
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

    // ✅ 点位交互
    points
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "orange")
          .attr("r", 12); // 悬停时放大

        labels
          .filter(l => l.name === d.name)
          .style("display", "block");
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "red")
          .attr("r", 8); // 恢复默认大小

        labels
          .filter(l => l.name === d.name)
          .style("display", "none");
      })
      .on("click", function (event, d) {
        if (d.url) {
          window.location.href = d.url; // ✅ 跳转链接接口
        }
      });
  });
});