// adjacency-matrix.js — complete modified file
// - suppressRender to ensure (De)Select works when already all-selected/all-deselected
// - robust renderAll with error capture & logging

window.selectedGroups = window.selectedGroups || new Set();
window.selectedYears = window.selectedYears || new Set();

function splitCourseId(id) {
  const match = id && id.toString().match(/^([A-Za-z]+)(\d+)$/);
  if (match) return `${match[1]}<br>${match[2]}`;
  return id;
}

function renderCourseReferenceTable(container) {
  if (!container) return;
  const allCourses = typeof courses !== 'undefined' ? courses : [];
  const filteredCourses = allCourses.filter(
    c => (window.selectedGroups.size ? window.selectedGroups.has(c.group) : true) &&
         (window.selectedYears.size ? window.selectedYears.has(c.year) : true)
  );

  const referenceTable = document.createElement('table');
  referenceTable.className = 'reference-table';
  referenceTable.style.borderCollapse = 'collapse';
  referenceTable.style.width = '100%';
  referenceTable.style.fontSize = '12px';
  referenceTable.style.marginBottom = '12px';

  const header = document.createElement('tr');
  ['Course ID', 'Course Name', 'Course ID', 'Course Name'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.padding = '6px';
    th.style.border = '1px solid rgba(11,18,32,0.06)';
    th.style.backgroundColor = '#f7f7f7';
    th.style.textAlign = 'left';
    header.appendChild(th);
  });
  referenceTable.appendChild(header);

  if (filteredCourses.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'No courses match the current filters.';
    td.style.padding = '10px';
    td.style.textAlign = 'center';
    td.style.color = '#6B7280';
    tr.appendChild(td);
    referenceTable.appendChild(tr);
  } else {
    for (let i = 0; i < filteredCourses.length; i += 2) {
      const tr = document.createElement('tr');
      for (let j = 0; j < 2; j++) {
        const course = filteredCourses[i + j];
        if (course) {
          const bg = (typeof colorScale === 'function') ? colorScale(course.group) : '#999';
          const tdId = document.createElement('td');
          tdId.innerHTML = splitCourseId(course.id);
          tdId.className = 'ref-id';
          tdId.style.padding = '6px';
          tdId.style.border = '1px solid rgba(11,18,32,0.06)';
          tdId.style.backgroundColor = bg;
          tdId.style.color = '#fff';
          tdId.style.textAlign = 'center';

          const tdName = document.createElement('td');
          tdName.textContent = course.name;
          tdName.className = 'ref-name';
          tdName.style.padding = '6px';
          tdName.style.border = '1px solid rgba(11,18,32,0.06)';
          tdName.style.backgroundColor = bg;
          tdName.style.color = '#fff';
          tdName.style.textAlign = 'left';

          tr.appendChild(tdId);
          tr.appendChild(tdName);
        } else {
          tr.appendChild(document.createElement('td'));
          tr.appendChild(document.createElement('td'));
        }
      }
      referenceTable.appendChild(tr);
    }
  }

  container.appendChild(referenceTable);
}

function generateAdjacencyMatrix(container) {
  if (!container) return;
  const allCourses = typeof courses !== 'undefined' ? courses : [];
  const filteredCourses = allCourses.filter(
    c => (window.selectedGroups.size ? window.selectedGroups.has(c.group) : true) &&
         (window.selectedYears.size ? window.selectedYears.has(c.year) : true)
  );

  const courseIds = filteredCourses.map(c => c.id);
  const idToIndex = Object.fromEntries(courseIds.map((id, i) => [id, i]));
  const size = courseIds.length;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  if (typeof links !== 'undefined') {
    links.forEach(({ source, target }) => {
      const i = idToIndex[source];
      const j = idToIndex[target];
      if (i !== undefined && j !== undefined) {
        matrix[i][j] = 1;
        matrix[j][i] = 1;
      }
    });
  }

  if (size === 0) {
    const notice = document.createElement('div');
    notice.textContent = 'No adjacency matrix to display for current filters.';
    notice.style.padding = '12px';
    notice.style.color = '#6B7280';
    container.appendChild(notice);
    return;
  }

  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';
  table.style.fontSize = '11px';
  table.style.tableLayout = 'fixed';

  const headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th'));

  courseIds.forEach(id => {
    const th = document.createElement('th');
    th.innerHTML = splitCourseId(id);
    const node = filteredCourses.find(c => c.id === id);
    th.style.padding = '4px';
    th.style.backgroundColor = (typeof colorScale === 'function' && node) ? colorScale(node.group) : '#999';
    th.style.color = '#fff';
    th.style.border = '1px solid rgba(11,18,32,0.06)';
    th.style.wordBreak = 'break-word';
    th.style.textAlign = 'center';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  matrix.forEach((row, i) => {
    const tr = document.createElement('tr');

    const rowLabel = document.createElement('th');
    rowLabel.innerHTML = splitCourseId(courseIds[i]);
    const node = filteredCourses.find(c => c.id === courseIds[i]);
    rowLabel.style.padding = '4px';
    rowLabel.style.backgroundColor = (typeof colorScale === 'function' && node) ? colorScale(node.group) : '#999';
    rowLabel.style.color = '#fff';
    rowLabel.style.border = '1px solid rgba(11,18,32,0.06)';
    rowLabel.style.wordBreak = 'break-word';
    rowLabel.style.textAlign = 'center';
    tr.appendChild(rowLabel);

    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell ? '•' : '';
      td.style.textAlign = 'center';
      td.style.padding = '6px';
      td.style.border = '1px solid rgba(11,18,32,0.04)';
      td.className = cell === 1 ? 'matrix-connected' : 'matrix-empty';
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  container.appendChild(table);
}

function initFilterControls() {
  const groupContainer = document.getElementById('filter-controls');
  const yearContainer = document.getElementById('year-controls');
  if (!groupContainer || !yearContainer) return;

  const allCourses = typeof courses !== 'undefined' ? courses : [];
  const groups = [...new Set(allCourses.map(c => c.group))];
  const years = [...new Set(allCourses.map(c => c.year))].sort();

  // Default to select-all when no prior selection
  if (!window.selectedGroups || window.selectedGroups.size === 0) {
    window.selectedGroups = new Set(groups);
  }
  if (!window.selectedYears || window.selectedYears.size === 0) {
    window.selectedYears = new Set(years);
  }

  groupContainer.innerHTML = '';
  yearContainer.innerHTML = '';

  // flag to suppress individual checkbox handlers during programmatic updates
  let suppressRender = false;

  // create group checkboxes
  groups.forEach(group => {
    const label = document.createElement('label');
    label.className = 'group-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = group;
    checkbox.checked = window.selectedGroups.has(group);

    const swatch = document.createElement('span');
    swatch.className = 'group-swatch';
    if (typeof colorScale === 'function') swatch.style.backgroundColor = colorScale(group);

    checkbox.addEventListener('change', () => {
      if (suppressRender) return;
      if (checkbox.checked) window.selectedGroups.add(group);
      else window.selectedGroups.delete(group);
      updateGroupSelectAllBtn();
      try { renderAll(); } catch (err) { console.error('[adj-matrix] renderAll error', err); }
    });

    label.appendChild(checkbox);
    label.appendChild(swatch);
    label.appendChild(document.createTextNode(' ' + group));
    groupContainer.appendChild(label);
  });

  // group select-all button
  const groupSelectAllBtn = document.createElement('button');
  groupSelectAllBtn.textContent = 'Groups All (De)Select';
  groupSelectAllBtn.className = 'group-select-all';
  groupSelectAllBtn.setAttribute('aria-pressed', 'false');

  function updateGroupSelectAllBtn() {
    const inputs = Array.from(groupContainer.querySelectorAll('input[type=checkbox]'));
    const allChecked = inputs.length > 0 && inputs.every(cb => cb.checked);
    if (allChecked) {
      groupSelectAllBtn.classList.add('active');
      groupSelectAllBtn.setAttribute('aria-pressed', 'true');
    } else {
      groupSelectAllBtn.classList.remove('active');
      groupSelectAllBtn.setAttribute('aria-pressed', 'false');
    }
  }

  groupSelectAllBtn.addEventListener('click', () => {
    const inputs = Array.from(groupContainer.querySelectorAll('input[type=checkbox]'));
    const anyUnchecked = inputs.some(cb => !cb.checked);
    suppressRender = true;
    inputs.forEach(cb => cb.checked = anyUnchecked);
    window.selectedGroups = anyUnchecked ? new Set(groups) : new Set();
    suppressRender = false;
    updateGroupSelectAllBtn();
    try { renderAll(); } catch (err) { console.error('[adj-matrix] renderAll error', err); }
  });

  groupContainer.appendChild(groupSelectAllBtn);
  updateGroupSelectAllBtn();

  // create year checkboxes
  years.forEach(year => {
    const label = document.createElement('label');
    label.className = 'year-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = year;
    checkbox.checked = window.selectedYears.has(year);

    checkbox.addEventListener('change', () => {
      if (suppressRender) return;
      if (checkbox.checked) window.selectedYears.add(year);
      else window.selectedYears.delete(year);
      updateYearSelectAllBtn();
      try { renderAll(); } catch (err) { console.error('[adj-matrix] renderAll error', err); }
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + year));
    yearContainer.appendChild(label);
  });

  // year select-all button
  const yearSelectAllBtn = document.createElement('button');
  yearSelectAllBtn.textContent = 'Years All (De)Select';
  yearSelectAllBtn.className = 'year-select-all';
  yearSelectAllBtn.setAttribute('aria-pressed', 'false');

  function updateYearSelectAllBtn() {
    const inputs = Array.from(yearContainer.querySelectorAll('input[type=checkbox]'));
    const allChecked = inputs.length > 0 && inputs.every(cb => cb.checked);
    if (allChecked) {
      yearSelectAllBtn.classList.add('active');
      yearSelectAllBtn.setAttribute('aria-pressed', 'true');
    } else {
      yearSelectAllBtn.classList.remove('active');
      yearSelectAllBtn.setAttribute('aria-pressed', 'false');
    }
  }

  yearSelectAllBtn.addEventListener('click', () => {
    const inputs = Array.from(yearContainer.querySelectorAll('input[type=checkbox]'));
    const anyUnchecked = inputs.some(cb => !cb.checked);
    suppressRender = true;
    inputs.forEach(cb => cb.checked = anyUnchecked);
    window.selectedYears = anyUnchecked ? new Set(years) : new Set();
    suppressRender = false;
    updateYearSelectAllBtn();
    try { renderAll(); } catch (err) { console.error('[adj-matrix] renderAll error', err); }
  });

  yearContainer.appendChild(yearSelectAllBtn);
  updateYearSelectAllBtn();
}

function renderAll() {
  const container = document.getElementById('adjacency-matrix');
  if (!container) {
    console.warn('[adj-matrix] #adjacency-matrix container missing');
    return;
  }
  container.innerHTML = '';
  console.log('[adj-matrix] renderAll', { groups: Array.from(window.selectedGroups), years: Array.from(window.selectedYears) });

  try {
    renderCourseReferenceTable(container);
  } catch (err) {
    console.error('[adj-matrix] renderCourseReferenceTable error', err);
    const errNotice = document.createElement('div');
    errNotice.textContent = 'Error rendering reference table (see console).';
    errNotice.style.color = '#b91c1c';
    container.appendChild(errNotice);
  }

  try {
    generateAdjacencyMatrix(container);
  } catch (err) {
    console.error('[adj-matrix] generateAdjacencyMatrix error', err);
    const errNotice = document.createElement('div');
    errNotice.textContent = 'Error rendering matrix (see console).';
    errNotice.style.color = '#b91c1c';
    container.appendChild(errNotice);
  }

  const ev = new CustomEvent('adjacencyFiltersChanged', {
    detail: {
      groups: Array.from(window.selectedGroups),
      years: Array.from(window.selectedYears)
    }
  });
  document.dispatchEvent(ev);
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initFilterControls();
    renderAll();
  } catch (err) {
    console.error('[adj-matrix] init error', err);
  }
});