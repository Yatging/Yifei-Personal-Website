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
