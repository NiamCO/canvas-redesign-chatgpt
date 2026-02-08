const app = document.querySelector('.app');
const themeSelect = document.getElementById('themeSelect');
const darkModeToggle = document.getElementById('darkModeToggle');
const todoList = document.getElementById('todoList');
const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closePreview = document.getElementById('closePreview');
const gpaForm = document.getElementById('gpaForm');
const gpaCurrent = document.getElementById('gpaCurrent');
const gpaWeighted = document.getElementById('gpaWeighted');
const gpaCumulative = document.getElementById('gpaCumulative');
const gpaReset = document.getElementById('gpaReset');

const gpaCourses = [];

const savedTheme = localStorage.getItem('canvasTheme') || 'midnight';
const savedMode = localStorage.getItem('canvasMode') || 'dark';

app.dataset.theme = savedTheme;
themeSelect.value = savedTheme;
darkModeToggle.checked = savedMode === 'dark';

const updateMode = () => {
  if (darkModeToggle.checked) {
    document.documentElement.style.colorScheme = 'dark';
    localStorage.setItem('canvasMode', 'dark');
  } else {
    document.documentElement.style.colorScheme = 'light';
    localStorage.setItem('canvasMode', 'light');
  }
};

updateMode();

themeSelect.addEventListener('change', (event) => {
  const theme = event.target.value;
  app.dataset.theme = theme;
  localStorage.setItem('canvasTheme', theme);
});

darkModeToggle.addEventListener('change', updateMode);

todoList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const item = event.target.closest('li');
  if (!item) return;
  previewBody.textContent = item.dataset.preview;
  previewModal.classList.add('show');
  previewModal.setAttribute('aria-hidden', 'false');
});

closePreview.addEventListener('click', () => {
  previewModal.classList.remove('show');
  previewModal.setAttribute('aria-hidden', 'true');
});

previewModal.addEventListener('click', (event) => {
  if (event.target === previewModal) {
    previewModal.classList.remove('show');
    previewModal.setAttribute('aria-hidden', 'true');
  }
});

const gradeToPoints = (grade) => {
  if (grade >= 90) return 4.0;
  if (grade >= 80) return 3.0;
  if (grade >= 70) return 2.0;
  if (grade >= 60) return 1.0;
  return 0.0;
};

const updateGpa = () => {
  if (gpaCourses.length === 0) {
    gpaCurrent.textContent = '0.00';
    gpaWeighted.textContent = '0.00';
    gpaCumulative.textContent = '0.00';
    return;
  }
  const totals = gpaCourses.reduce(
    (acc, course) => {
      acc.credits += course.credits;
      acc.points += course.points * course.credits;
      acc.weighted += (course.points + course.weight) * course.credits;
      return acc;
    },
    { credits: 0, points: 0, weighted: 0 }
  );

  const current = totals.points / totals.credits;
  const weighted = totals.weighted / totals.credits;

  gpaCurrent.textContent = current.toFixed(2);
  gpaWeighted.textContent = weighted.toFixed(2);
  gpaCumulative.textContent = ((current + weighted) / 2).toFixed(2);
};

gpaForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputs = Array.from(gpaForm.querySelectorAll('input'));
  const [gradeInput, creditInput, weightInput] = inputs.map((input) =>
    Number.parseFloat(input.value)
  );
  if (Number.isNaN(gradeInput) || Number.isNaN(creditInput)) {
    return;
  }
  gpaCourses.push({
    points: gradeToPoints(gradeInput),
    credits: Math.max(creditInput, 1),
    weight: Number.isNaN(weightInput) ? 0 : weightInput,
  });
  updateGpa();
  gpaForm.reset();
});

gpaReset.addEventListener('click', () => {
  gpaCourses.length = 0;
  updateGpa();
});
