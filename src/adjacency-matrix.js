(function renderCourseReferenceTable() {
  const container = document.getElementById("adjacency-matrix");
  if (!container) return;

  const referenceTable = document.createElement("table");
  referenceTable.style.borderCollapse = "collapse";
  referenceTable.style.width = "100%";
  referenceTable.style.fontSize = "12px";
  referenceTable.style.marginBottom = "16px";

  // 表头：两组课程
  const header = document.createElement("tr");
  ["Course ID", "Course Name", "Course ID", "Course Name"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    th.style.padding = "6px";
    th.style.border = "1px solid #ccc";
    th.style.backgroundColor = "#f0f0f0";
    header.appendChild(th);
  });
  referenceTable.appendChild(header);

  // 每行显示两个课程
  for (let i = 0; i < courses.length; i += 2) {
    const tr = document.createElement("tr");

    for (let j = 0; j < 2; j++) {
      const course = courses[i + j];
      if (course) {
        const bgColor = colorScale(course.group);
        const textColor = "#fff";

        const tdId = document.createElement("td");
        tdId.textContent = course.id;
        tdId.style.padding = "4px";
        tdId.style.border = "1px solid #ccc";
        tdId.style.backgroundColor = bgColor;
        tdId.style.color = textColor;
        tdId.style.textAlign = "center";

        const tdName = document.createElement("td");
        tdName.textContent = course.name;
        tdName.style.padding = "4px";
        tdName.style.border = "1px solid #ccc";
        tdName.style.backgroundColor = bgColor;
        tdName.style.color = textColor;

        tr.appendChild(tdId);
        tr.appendChild(tdName);
      } else {
        // 如果课程数量是奇数，补空单元格
        tr.appendChild(document.createElement("td"));
        tr.appendChild(document.createElement("td"));
      }
    }

    referenceTable.appendChild(tr);
  }

  container.appendChild(referenceTable);
})();


(function generateAdjacencyMatrix() {
  const courseIds = courses.map(course => course.id);
  const idToIndex = Object.fromEntries(courseIds.map((id, i) => [id, i]));

  const size = courseIds.length;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  links.forEach(({ source, target }) => {
  const i = idToIndex[source];
  const j = idToIndex[target];
  if (i !== undefined && j !== undefined) {
    matrix[i][j] = 1;
    matrix[j][i] = 1; // Add this line to make the graph undirected
  }
});


  const container = document.getElementById("adjacency-matrix");
  if (!container) return;

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.fontSize = "11px";
  table.style.tableLayout = "fixed";

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));

  courseIds.forEach(id => {
    const th = document.createElement("th");
    th.innerHTML = splitCourseId(id); // 使用换行
    th.style.padding = "2px 4px";
    th.style.backgroundColor = colorScale(getNode(id).group);
    th.style.color = "#fff";
    th.style.border = "1px solid #ccc";
    th.style.wordBreak = "break-word";
    th.style.textAlign = "center";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  matrix.forEach((row, i) => {
    const tr = document.createElement("tr");

    const rowLabel = document.createElement("th");
    rowLabel.innerHTML = splitCourseId(courseIds[i]); // 使用换行
    rowLabel.style.padding = "2px 4px";
    rowLabel.style.backgroundColor = colorScale(getNode(courseIds[i]).group);
    rowLabel.style.color = "#fff";
    rowLabel.style.border = "1px solid #ccc";
    rowLabel.style.wordBreak = "break-word";
    rowLabel.style.textAlign = "center";
    tr.appendChild(rowLabel);

    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      td.style.textAlign = "center";
      td.style.padding = "2px";
      td.style.border = "1px solid #ccc";
      td.style.backgroundColor = cell === 1 ? "#ffeb3b" : "#fff";
      td.style.fontWeight = cell === 1 ? "bold" : "normal";
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  container.appendChild(table);

  function getNode(id) {
    return courses.find(course => course.id === id);
  }
})();

// 插入换行符：将课程编号中的字母和数字分开
function splitCourseId(id) {
  const match = id.match(/^([A-Za-z]+)(\d+)$/);
  if (match) {
    return `${match[1]}<br>${match[2]}`;
  }
  return id;
}
//筛选区
// 全局变量：当前选择的类别 
let selectedGroups = new Set();
let selectedYears = new Set();

// 修复后的 initFilterControls / renderAll / renderCourseReferenceTable

function initFilterControls() {
  const groupContainer = document.getElementById("filter-controls");
  const yearContainer = document.getElementById("year-controls");
  if (!groupContainer || !yearContainer) return; // 安全退出

  // 计算类别与年份
  const groups = [...new Set(courses.map(c => c.group))];
  const years = [...new Set(courses.map(c => c.year))].sort();

  // 全局选择集合（若已存在则复用）
  window.selectedGroups = window.selectedGroups || new Set();
  window.selectedYears = window.selectedYears || new Set();

  // 清空容器（避免重复渲染）
  groupContainer.innerHTML = "";
  yearContainer.innerHTML = "";

  // 创建类别复选框
  groups.forEach(group => {
    const label = document.createElement("label");
    label.className = 'group-label group-' + group.toLowerCase();

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = group;
    checkbox.checked = true;

    // 小色块（可用于样式）
    const swatch = document.createElement("span");
    swatch.className = "group-swatch";

    // 变更处理：更新集合、按钮状态并重渲染
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) window.selectedGroups.add(group);
      else window.selectedGroups.delete(group);
      updateGroupSelectAllBtn();
      renderAll();
    });

    label.appendChild(checkbox);
    label.appendChild(swatch);
    label.appendChild(document.createTextNode(" " + group));
    groupContainer.appendChild(label);

    // 初始加入集合
    window.selectedGroups.add(group);
  });

  // 创建 Groups 全选/全不选 按钮（并插入容器）
  const groupSelectAllBtn = document.createElement("button");
  groupSelectAllBtn.textContent = "Groups All (De)Select";
  groupSelectAllBtn.className = 'group-select-all';
  groupSelectAllBtn.setAttribute('aria-pressed', 'false');

  groupSelectAllBtn.addEventListener("click", () => {
    const allSelected = window.selectedGroups.size === groups.length;
    if (allSelected) {
      // 取消所有
      window.selectedGroups.clear();
      groupContainer.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
      groupSelectAllBtn.classList.remove('active');
      groupSelectAllBtn.setAttribute('aria-pressed', 'false');
    } else {
      // 全选
      window.selectedGroups = new Set(groups);
      groupContainer.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = true);
      groupSelectAllBtn.classList.add('active');
      groupSelectAllBtn.setAttribute('aria-pressed', 'true');
    }
    renderAll();
  });

  groupContainer.appendChild(groupSelectAllBtn);

  // 更新 Groups 全选按钮状态的辅助函数
  function updateGroupSelectAllBtn() {
    if (window.selectedGroups.size === groups.length) {
      groupSelectAllBtn.classList.add('active');
      groupSelectAllBtn.setAttribute('aria-pressed', 'true');
    } else {
      groupSelectAllBtn.classList.remove('active');
      groupSelectAllBtn.setAttribute('aria-pressed', 'false');
    }
  }
  // 初始化按钮状态
  updateGroupSelectAllBtn();

  // 年份复选框（渲染到 yearContainer）
  years.forEach(year => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = year;
    checkbox.checked = true;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) window.selectedYears.add(year);
      else window.selectedYears.delete(year);
      updateYearSelectAllBtn();
      renderAll();
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + year));
    yearContainer.appendChild(label);

    // 初始加入集合
    window.selectedYears.add(year);
  });

  // 年份 全选/全不选 按钮
  const yearSelectAllBtn = document.createElement("button");
  yearSelectAllBtn.textContent = "Years All (De)Select";
  yearSelectAllBtn.className = 'year-select-all';
  yearSelectAllBtn.setAttribute('aria-pressed', 'true');

  yearSelectAllBtn.addEventListener("click", () => {
    const allSelected = window.selectedYears.size === years.length;
    if (allSelected) {
      window.selectedYears.clear();
      yearContainer.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
      yearSelectAllBtn.classList.remove('active');
      yearSelectAllBtn.setAttribute('aria-pressed', 'false');
    } else {
      window.selectedYears = new Set(years);
      yearContainer.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = true);
      yearSelectAllBtn.classList.add('active');
      yearSelectAllBtn.setAttribute('aria-pressed', 'true');
    }
    renderAll();
  });

  yearContainer.appendChild(yearSelectAllBtn);

  // 更新年份全选按钮状态
  function updateYearSelectAllBtn() {
    if (window.selectedYears.size === years.length) {
      yearSelectAllBtn.classList.add('active');
      yearSelectAllBtn.setAttribute('aria-pressed', 'true');
    } else {
      yearSelectAllBtn.classList.remove('active');
      yearSelectAllBtn.setAttribute('aria-pressed', 'false');
    }
  }
  // 初始化年份按钮状态
  updateYearSelectAllBtn();
}

// renderAll 保持原逻辑（清空并重渲染）
function renderAll() {
  const container = document.getElementById("adjacency-matrix");
  if (!container) return;
  container.innerHTML = "";
  renderCourseReferenceTable();
  generateAdjacencyMatrix();
}

// renderCourseReferenceTable 保持原有功能，但使用 class-friendly attributes
function renderCourseReferenceTable() {
  const container = document.getElementById("adjacency-matrix");
  if (!container) return;

  const filteredCourses = courses.filter(
    c => (window.selectedGroups ? window.selectedGroups.has(c.group) : true) &&
         (window.selectedYears ? window.selectedYears.has(c.year) : true)
  );

  const referenceTable = document.createElement("table");
  referenceTable.className = "reference-table";
  referenceTable.style.borderCollapse = "collapse";
  referenceTable.style.width = "100%";
  referenceTable.style.fontSize = "12px";
  referenceTable.style.marginBottom = "16px";

  const header = document.createElement("tr");
  ["Course ID", "Course Name", "Course ID", "Course Name"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    th.style.padding = "6px";
    th.style.border = "1px solid #ccc";
    th.style.backgroundColor = "#f0f0f0";
    header.appendChild(th);
  });
  referenceTable.appendChild(header);

  for (let i = 0; i < filteredCourses.length; i += 2) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 2; j++) {
      const course = filteredCourses[i + j];
      if (course) {
        const bgColor = colorScale(course.group);
        const textColor = "#fff";

        const tdId = document.createElement("td");
        tdId.textContent = course.id;
        tdId.className = "ref-id";
        tdId.style.padding = "4px";
        tdId.style.border = "1px solid #ccc";
        tdId.style.backgroundColor = bgColor;
        tdId.style.color = textColor;
        tdId.style.textAlign = "center";

        const tdName = document.createElement("td");
        tdName.textContent = course.name;
        tdName.className = "ref-name";
        tdName.style.padding = "4px";
        tdName.style.border = "1px solid #ccc";
        tdName.style.backgroundColor = bgColor;
        tdName.style.color = textColor;

        tr.appendChild(tdId);
        tr.appendChild(tdName);
      } else {
        tr.appendChild(document.createElement("td"));
        tr.appendChild(document.createElement("td"));
      }
    }
    referenceTable.appendChild(tr);
  }

  container.appendChild(referenceTable);
}


function generateAdjacencyMatrix() {
  const filteredCourses = courses.filter(
    c => selectedGroups.has(c.group) && selectedYears.has(c.year)
  );
  const courseIds = filteredCourses.map(c => c.id);
  const idToIndex = Object.fromEntries(courseIds.map((id, i) => [id, i]));

  const size = courseIds.length;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  links.forEach(({ source, target }) => {
    const i = idToIndex[source];
    const j = idToIndex[target];
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = 1;
      matrix[j][i] = 1;
    }
  });

  const container = document.getElementById("adjacency-matrix");
  if (!container) return;

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.fontSize = "11px";
  table.style.tableLayout = "fixed";

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));

  courseIds.forEach(id => {
    const th = document.createElement("th");
    th.innerHTML = splitCourseId(id);
    th.style.padding = "2px 4px";
    th.style.backgroundColor = colorScale(getNode(id).group);
    th.style.color = "#fff";
    th.style.border = "1px solid #ccc";
    th.style.wordBreak = "break-word";
    th.style.textAlign = "center";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  matrix.forEach((row, i) => {
    const tr = document.createElement("tr");
    const rowLabel = document.createElement("th");
    rowLabel.innerHTML = splitCourseId(courseIds[i]);
    rowLabel.style.padding = "2px 4px";
    rowLabel.style.backgroundColor = colorScale(getNode(courseIds[i]).group);
    rowLabel.style.color = "#fff";
    rowLabel.style.border = "1px solid #ccc";
    rowLabel.style.wordBreak = "break-word";
    rowLabel.style.textAlign = "center";
    tr.appendChild(rowLabel);

    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      td.style.textAlign = "center";
      td.style.padding = "2px";
      td.style.border = "1px solid #ccc";
      td.style.backgroundColor = cell === 1 ? "#ffeb3b" : "#fff";
      td.style.fontWeight = cell === 1 ? "bold" : "normal";
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  container.appendChild(table);

  function getNode(id) {
    return filteredCourses.find(course => course.id === id);
  }
}

// 初始化
initFilterControls();
renderAll();
