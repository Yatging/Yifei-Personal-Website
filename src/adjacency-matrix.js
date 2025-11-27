// adjacency-matrix.js — fully fixed select-all logic, original styling preserved

window.selectedGroups = window.selectedGroups || new Set();
window.selectedYears = window.selectedYears || new Set();
window.suppressRender = false;

function splitCourseId(id) {
  const m = id.match(/^([A-Za-z]+)(\d+)$/);
  return m ? `${m[1]}<br>${m[2]}` : id;
}

function renderCourseReferenceTable(container) {
  const allCourses = typeof courses !== 'undefined' ? courses : [];
  const filtered = allCourses.filter(
    c => (!window.selectedGroups.size || window.selectedGroups.has(c.group)) &&
         (!window.selectedYears.size || window.selectedYears.has(c.year))
  );

  const table = document.createElement('table');
  table.className = 'reference-table';

  // restore original table style
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';

  const header = document.createElement('tr');
  [
    'Course ID', 'Course Name',
    'Course ID', 'Course Name'
  ].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    th.style.background = '#eee';
    th.style.padding = '4px';
    th.style.border = '1px solid #ccc';
    header.appendChild(th);
  });
  table.appendChild(header);

  for (let i = 0; i < filtered.length; i += 2) {
    const tr = document.createElement('tr');

    for (let j = 0; j < 2; j++) {
      const c = filtered[i + j];
      if (c) {
        const tdId = document.createElement('td');
        tdId.innerHTML = splitCourseId(c.id);
        tdId.style.padding = '4px';
        tdId.style.border = '1px solid #ccc';
        tdId.style.background = colorScale(c.group);
        tdId.style.color = 'white';
        tdId.style.textAlign = 'center';

        const tdName = document.createElement('td');
        tdName.textContent = c.name;
        tdName.style.padding = '4px';
        tdName.style.border = '1px solid #ccc';
        tdName.style.background = colorScale(c.group);
        tdName.style.color = 'white';

        tr.appendChild(tdId);
        tr.appendChild(tdName);
      } else {
        tr.appendChild(document.createElement('td'));
        tr.appendChild(document.createElement('td'));
      }
    }

    table.appendChild(tr);
  }

  container.appendChild(table);
}

function generateAdjacencyMatrix(container) {
  const allCourses = typeof courses !== 'undefined' ? courses : [];
  const filtered = allCourses.filter(
    c => (!window.selectedGroups.size || window.selectedGroups.has(c.group)) &&
         (!window.selectedYears.size || window.selectedYears.has(c.year))
  );

  const ids = filtered.map(c => c.id);
  const idx = Object.fromEntries(ids.map((id, i) => [id, i]));
  const N = ids.length;

  if (N === 0) {
    const p = document.createElement('p');
    p.textContent = "No data";
    container.appendChild(p);
    return;
  }

  const matrix = Array.from({ length: N }, () => Array(N).fill(0));
  links.forEach(l => {
    const i = idx[l.source];
    const j = idx[l.target];
    if (i != null && j != null) {
      matrix[i][j] = 1;
      matrix[j][i] = 1;
    }
  });

  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';

  // header row
  const header = document.createElement('tr');
  header.appendChild(document.createElement('th'));

  ids.forEach(id => {
    const c = filtered.find(x => x.id === id);
    const th = document.createElement('th');
    th.innerHTML = splitCourseId(id);
    th.style.padding = '4px';
    th.style.border = '1px solid #ccc';
    th.style.color = 'white';
    th.style.background = colorScale(c.group);
    header.appendChild(th);
  });

  table.appendChild(header);

  matrix.forEach((row, i) => {
    const tr = document.createElement('tr');

    const rowLabel = document.createElement('th');
    const c = filtered.find(x => x.id === ids[i]);
    rowLabel.innerHTML = splitCourseId(ids[i]);
    rowLabel.style.padding = '4px';
    rowLabel.style.border = '1px solid #ccc';
    rowLabel.style.color = 'white';
    rowLabel.style.background = colorScale(c.group);
    tr.appendChild(rowLabel);

    row.forEach(v => {
      const td = document.createElement('td');
      td.style.textAlign = 'center';
      td.style.border = '1px solid #ccc';
      td.style.padding = '3px';
      td.textContent = v ? "•" : "";
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  container.appendChild(table);
}

function initFilterControls() {
  const groupEl = document.getElementById("filter-controls");
  const yearEl = document.getElementById("year-controls");

  const allCourses = typeof courses !== 'undefined' ? courses : [];
  const groups = [...new Set(allCourses.map(c => c.group))];
  const years = [...new Set(allCourses.map(c => c.year))].sort();

  groupEl.innerHTML = "";
  yearEl.innerHTML = "";

  // ========== GROUP CHECKBOXES ==========
  groups.forEach(g => {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = g;

    // true initial state = from window.selectedGroups
    cb.checked = window.selectedGroups.size === 0 || window.selectedGroups.has(g);

    cb.addEventListener("change", () => {
      if (window.suppressRender) return;
      cb.checked ? window.selectedGroups.add(g) : window.selectedGroups.delete(g);
      updateGroupBtn();
      renderAll();
    });

    const swatch = document.createElement("span");
    swatch.style.display = "inline-block";
    swatch.style.width = "12px";
    swatch.style.height = "12px";
    swatch.style.background = colorScale(g);
    swatch.style.marginLeft = "4px";

    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + g + " "));
    label.appendChild(swatch);
    groupEl.appendChild(label);
  });

  const groupBtn = document.createElement("button");
  groupBtn.textContent = "Groups All (De)Select";
  groupEl.appendChild(groupBtn);

  function updateGroupBtn() {
    const boxes = [...groupEl.querySelectorAll("input[type=checkbox]")];
    const allChecked = boxes.every(b => b.checked);
    groupBtn.classList.toggle("active", allChecked);
  }

  groupBtn.addEventListener("click", () => {
    const boxes = [...groupEl.querySelectorAll("input[type=checkbox]")];
    const allChecked = boxes.every(b => b.checked);
    const newState = !allChecked;

    window.suppressRender = true;
    boxes.forEach(b => (b.checked = newState));
    window.selectedGroups = newState ? new Set(groups) : new Set();
    window.suppressRender = false;

    updateGroupBtn();
    renderAll();
  });

  updateGroupBtn();

  // ========== YEAR CHECKBOXES ==========
  years.forEach(y => {
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = y;
    cb.checked = window.selectedYears.size === 0 || window.selectedYears.has(y);

    cb.addEventListener("change", () => {
      if (window.suppressRender) return;
      cb.checked ? window.selectedYears.add(y) : window.selectedYears.delete(y);
      updateYearBtn();
      renderAll();
    });

    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + y));
    yearEl.appendChild(label);
  });

  const yearBtn = document.createElement("button");
  yearBtn.textContent = "Years All (De)Select";
  yearEl.appendChild(yearBtn);

  function updateYearBtn() {
    const boxes = [...yearEl.querySelectorAll("input[type=checkbox]")];
    const allChecked = boxes.every(b => b.checked);
    yearBtn.classList.toggle("active", allChecked);
  }

  yearBtn.addEventListener("click", () => {
    const boxes = [...yearEl.querySelectorAll("input[type=checkbox]")];
    const allChecked = boxes.every(b => b.checked);
    const newState = !allChecked;

    window.suppressRender = true;
    boxes.forEach(b => (b.checked = newState));
    window.selectedYears = newState ? new Set(years) : new Set();
    window.suppressRender = false;

    updateYearBtn();
    renderAll();
  });

  updateYearBtn();
}

function renderAll() {
  const c = document.getElementById("adjacency-matrix");
  c.innerHTML = "";
  renderCourseReferenceTable(c);
  generateAdjacencyMatrix(c);

  document.dispatchEvent(
    new CustomEvent("adjacencyFiltersChanged", {
      detail: {
        groups: [...window.selectedGroups],
        years: [...window.selectedYears],
      },
    })
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initFilterControls();
  renderAll();
});
