// Full file — replace entire file with this content

const courses = [
  { id: "SM1702", name: "Creative Media Studio I", group: "Basic", year:2023 },
  { id: "SM2704", name: "Creative Media Studio II", group: "Basic", year:2024 },
  { id: "SM2702", name: "Interdisciplinary Practices", group: "Theory", year:2024 },
  { id: "SM2276", name: "Music Production", group: "Workshop", year:2025 },
  { id: "SM2706", name: "Critical Theory & Soc Engag Prac", group: "Theory", year:2025 },
  { id: "SM2715", name: "Creative Coding", group: "Coding", year:2024 },
  { id: "SM3804", name: "Materials & Fabrication Studio", group: "Workshop", year:2025 },
  { id: "GE1401", name: "University English", group: "Culture", year:2023 },
  { id: "GE2413", name: "Writing for Creative Media", group: "Culture", year:2024 },
  { id: "SM2716", name: "Physical Computing & Tangible Media", group: "Coding", year:2025 },
  { id: "SDSC2004", name: "Data Visualization", group: "Coding", year:2024 },
  { id: "CS1103", name: "Media Computing", group: "Coding", year:2023 },
  { id: "GE1501", name: "Chinese Civilisation - History&Philosophy", group: "Culture", year:2023 },
  { id: "GE2132", name: "Dynamics of Chinese Cities&Architecture", group: "Culture", year:2025 },
  { id: "SM1701", name: "New Media Art", group: "Theory", year:2023 },
  { id: "SM2277", name: "Life Drawing", group: "Workshop", year:2025 },
  { id: "SM1013", name: "Introduction to Photography", group: "Workshop", year:2025 },
  { id: "SM2805", name: "Imaging Science Studio", group: "Workshop", year:2025 },
  { id: "SM3749", name: "Information Visualization", group: "Coding", year:2025 },
  { id: "SM3801", name: "Understanding Data", group: "Coding", year:2024 }
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

const colorScale = d3.scaleOrdinal()
  .domain(["Basic", "Theory", "Coding", "Culture", "Workshop"])
  .range(["#6baed6", "#9ecae1", "#f78fb3", "#31a354", "#fdae6b"]);

// container
const wrapper = document.getElementById('network-graph');
if (!wrapper) {
  console.warn('courses-network: container #network-graph not found — aborting network render.');
} else {

  // wait for container to have a usable size (width > threshold)
  function waitForSize(threshold = 60, maxRetries = 12, interval = 80) {
    return new Promise((resolve) => {
      let tries = 0;
      const check = () => {
        const r = wrapper.getBoundingClientRect();
        const w = Math.floor(r.width);
        const h = Math.floor(r.height);
        if (w >= threshold && h >= 80) {
          resolve({ width: w, height: Math.max(h, 420) });
        } else {
          tries++;
          if (tries >= maxRetries) {
            const parentW = wrapper.parentElement ? wrapper.parentElement.getBoundingClientRect().width : window.innerWidth;
            const fallbackW = Math.max(600, Math.floor(parentW) || 800);
            const fallbackH = Math.max(420, Math.floor(fallbackW * 0.6));
            console.warn('courses-network: container size small after retries, using fallback', {w, h, fallbackW, fallbackH});
            resolve({ width: fallbackW, height: fallbackH });
          } else {
            setTimeout(check, interval);
          }
        }
      };
      check();
    });
  }

  // main async init
  (async function init() {
    const size = await waitForSize();
    let width = size.width;
    let height = size.height;
    let centerX = width / 2;
    let centerY = height / 2;
    let radius = Math.min(width, height) / 2 - 80;
    const lineHeight = 0.8;
    const textWidth = 160;

    // ensure wrapper has a minimum height so layout doesn't collapse
    if (!wrapper.style.minHeight) wrapper.style.minHeight = Math.max(420, height) + 'px';

    // remove any previous svg to avoid duplicates
    d3.select(wrapper).selectAll('svg').remove();

    const svg = d3.select(wrapper)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('width', '100%')
      .attr('height', height)
      .style('display', 'block');

    const defs = svg.append('defs');
    const containerG = svg.append('g');

    // initial polar layout positions
    courses.forEach((d, i) => {
      d.angle = (i / courses.length) * 2 * Math.PI;
      d.radius = radius;
      d.x = centerX + d.radius * Math.cos(d.angle);
      d.y = centerY + d.radius * Math.sin(d.angle);
    });

    function getNode(id) { return typeof id === "string" ? courses.find(d => d.id === id) : id; }

    function createGradient(id, color1, color2) {
      // simple radial gradient fallback (positions updated during updatePositions)
      if (defs.select(`#${id}`).size()) return;
      const g = defs.append('linearGradient').attr('id', id).attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','0%');
      g.append('stop').attr('offset','0%').attr('stop-color', color1);
      g.append('stop').attr('offset','100%').attr('stop-color', color2);
    }

    function wrapText(textEl, text, width) {
      // minimal wrapping: split into words and fit into up to 2 lines
      const words = text.split(/\s+/);
      let line = [], lineNumber = 0, lineHeight = 1.1;
      let tspan = textEl.append('tspan').attr('x', 0).attr('dy', 0);
      for (let i=0;i<words.length;i++){
        line.push(words[i]);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width && line.length>1) {
          line.pop();
          tspan.text(line.join(' '));
          line = [words[i]];
          tspan = textEl.append('tspan').attr('x', 0).attr('dy', `${lineHeight}em`).text(words[i]);
          lineNumber++;
          if (lineNumber >= 2) break;
        }
      }
    }

    const link = containerG.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round")
      .style("opacity", 1);

    const node = containerG.append("g")
      .selectAll("circle")
      .data(courses)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", d => colorScale(d.group))
      .attr("stroke", "#444")
      .attr("stroke-width", 1.2)
      .style("opacity", 1);

    const label = containerG.append("g")
      .selectAll("text")
      .data(courses)
      .enter().append("text")
      .attr("font-size", "12px")
      .attr("font-family", "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif")
      .attr("fill", "#0B1220")
      .style("opacity", 1)
      .each(function(d) { wrapText(d3.select(this), d.name, textWidth); });

    function updatePositions() {
      const r = wrapper.getBoundingClientRect();
      width = Math.max(600, Math.floor(r.width) || width);
      height = Math.max(420, Math.floor(r.height) || height);
      centerX = width / 2;
      centerY = height / 2;
      radius = Math.min(width, height) / 2 - 80;

      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('height', height);

      courses.forEach(d => {
        const rr = d.radius || radius;
        d.x = centerX + rr * Math.cos(d.angle);
        d.y = centerY + rr * Math.sin(d.angle);
      });

      defs.selectAll("*").remove();

      node.attr("cx", d => d.x).attr("cy", d => d.y);

      label.attr("transform", d => {
        const offsetX = Math.cos(d.angle) * 20;
        const offsetY = Math.sin(d.angle) * 20;
        return `translate(${d.x + offsetX},${d.y + offsetY})`;
      }).attr("text-anchor", d => {
        const deg = (d.angle * 180) / Math.PI;
        return deg > 90 && deg < 270 ? "end" : "start";
      });

      link.attr("x1", d => getNode(d.source).x)
          .attr("y1", d => getNode(d.source).y)
          .attr("x2", d => getNode(d.target).x)
          .attr("y2", d => getNode(d.target).y)
          .attr("stroke", d => {
            const source = getNode(d.source), target = getNode(d.target);
            if (source.group === target.group) return colorScale(source.group);
            const gradId = `gradient-${source.id}-${target.id}`;
            createGradient(gradId, colorScale(source.group), colorScale(target.group));
            return `url(#${gradId})`;
          });
    }

    let lastX = null;
    svg.call(d3.drag()
      .on("start", event => { lastX = event.x; })
      .on("drag", event => {
        if (lastX == null) lastX = event.x;
        const dx = event.x - lastX;
        const deltaAngle = dx * 0.005;
        courses.forEach(d => d.angle += deltaAngle);
        updatePositions();
        lastX = event.x;
      })
      .on("end", () => { lastX = null; })
    );

    let currentYear = +d3.select("#year-slider").node()?.value || new Date().getFullYear();
    if (d3.select("#year-label").node()) d3.select("#year-label").text(currentYear);
    if (d3.select("#year-slider").node()) {
      d3.select("#year-slider").on("input", function() {
        currentYear = +this.value;
        if (d3.select("#year-label").node()) d3.select("#year-label").text(currentYear);
        updateVisibility();
      });
    }

    function updateVisibility(extraFilterGroups = null, extraFilterYears = null) {
      node.each(function(d) {
        const circle = d3.select(this);
        const inGroup = !extraFilterGroups || extraFilterGroups.size === 0 ? true : extraFilterGroups.has(d.group);
        const inYearFilter = !extraFilterYears || extraFilterYears.size === 0 ? true : extraFilterYears.has(d.year);
        const visibleByFilters = inGroup && inYearFilter;
        const visibleBySlider = d.year <= currentYear;
        const shouldShow = visibleByFilters && visibleBySlider;
        if (shouldShow) {
          circle.transition().duration(600).style("opacity", 1).attr("cx", d.x).attr("cy", d.y).attr("r", 10);
        } else {
          circle.transition().duration(600).style("opacity", 0).on('end', () => circle.attr("data-visible", "false"));
        }
      });

      label.each(function(d) {
        const text = d3.select(this);
        const inGroup = !extraFilterGroups || extraFilterGroups.size === 0 ? true : extraFilterGroups.has(d.group);
        const inYearFilter = !extraFilterYears || extraFilterYears.size === 0 ? true : extraFilterYears.has(d.year);
        const visibleByFilters = inGroup && inYearFilter;
        const visibleBySlider = d.year <= currentYear;
        const shouldShow = visibleByFilters && visibleBySlider;
        if (shouldShow) {
          text.transition().duration(600).style("opacity", 1).attr("transform", `translate(${d.x + Math.cos(d.angle)*20},${d.y + Math.sin(d.angle)*20})`);
        } else {
          text.transition().duration(600).style("opacity", 0);
        }
      });

      link.transition().duration(600)
        .style("opacity", d => {
          const s = getNode(d.source);
          const t = getNode(d.target);
          const groupsOK = (!extraFilterGroups || extraFilterGroups.size === 0) ? true : (extraFilterGroups.has(s.group) && extraFilterGroups.has(t.group));
          const yearsOK = (!extraFilterYears || extraFilterYears.size === 0) ? true : (extraFilterYears.has(s.year) && extraFilterYears.has(t.year));
          const sliderOK = (s.year <= currentYear && t.year <= currentYear);
          return (groupsOK && yearsOK && sliderOK) ? 1 : 0;
        });
    }

    updatePositions();
    updateVisibility();

    // Listen for adjacency filter changes and update network accordingly
    document.addEventListener('adjacencyFiltersChanged', (e) => {
      const groups = new Set(e.detail.groups || []);
      const years = new Set(e.detail.years || []);
      updateVisibility(groups, years);
    });

    let resizeTimeout = null;
    window.addEventListener('resize', () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const r = wrapper.getBoundingClientRect();
        if (r.height < 200) wrapper.style.minHeight = Math.max(420, r.height) + 'px';
        updatePositions();
        updateVisibility();
      }, 120);
    });

    console.log('courses-network: initialized', { width, height });
  })();
}