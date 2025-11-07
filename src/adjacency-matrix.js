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

function initFilterControls() {
  const groupContainer = document.getElementById("filter-controls");
  const groups = [...new Set(courses.map(c => c.group))];

  // 类别复选框
  groups.forEach(group => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = group;
    checkbox.checked = true;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedGroups.add(group);
      else selectedGroups.delete(group);
      renderAll();
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + group));
    groupContainer.appendChild(label);
    selectedGroups.add(group);
  });

  // 全选/全不选按钮（类别）
  const groupSelectAllBtn = document.createElement("button");
  groupSelectAllBtn.textContent = "Groups All (Un)Select";
  groupSelectAllBtn.style.marginLeft = "12px";
  groupSelectAllBtn.addEventListener("click", () => {
    if (selectedGroups.size === groups.length) {
      // 全部选中 → 全部取消
      selectedGroups.clear();
      groupContainer.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
    } else {
      // 部分或全不选 → 全选
      selectedGroups = new Set(groups);
      groupContainer.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = true);
    }
    renderAll();
  });
  groupContainer.appendChild(groupSelectAllBtn);

  const yearContainer = document.getElementById("year-controls");
  const years = [...new Set(courses.map(c => c.year))].sort();

  // 年份复选框
  years.forEach(year => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = year;
    checkbox.checked = true;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedYears.add(year);
      else selectedYears.delete(year);
      renderAll();
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + year));
    yearContainer.appendChild(label);
    selectedYears.add(year);
  });

  // 全选/全不选按钮（年份）
  const yearSelectAllBtn = document.createElement("button");
  yearSelectAllBtn.textContent = "Years All (Un)Select";
  yearSelectAllBtn.style.marginLeft = "12px";
  yearSelectAllBtn.addEventListener("click", () => {
    if (selectedYears.size === years.length) {
      selectedYears.clear();
      yearContainer.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
    } else {
      selectedYears = new Set(years);
      yearContainer.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = true);
    }
    renderAll();
  });
  yearContainer.appendChild(yearSelectAllBtn);
}

function renderAll() {
  const container = document.getElementById("adjacency-matrix");
  container.innerHTML = "";
  renderCourseReferenceTable();
  generateAdjacencyMatrix();
}

function renderCourseReferenceTable() {
  const container = document.getElementById("adjacency-matrix");
  if (!container) return;

  const filteredCourses = courses.filter(
    c => selectedGroups.has(c.group) && selectedYears.has(c.year)
  );

  const referenceTable = document.createElement("table");
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
