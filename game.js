const athletes = [
  { last_name: "Тадей ПОГАЧАР", country_ru: "Словения", flag: "flags/flag_slovenia.png", field_icon: "fields/cycling.png" },
  { last_name: "Йонас ВИНЕГОР", country_ru: "Дания", flag: "flags/flag_denmark.png", field_icon: "fields/cycling.png" },
  { last_name: "Бен ХИЛИ", country_ru: "Ирландия", flag: "flags/flag_ireland.png", field_icon: "fields/cycling.png" },
  { last_name: "Карлос АЛЬКАРАС", country_ru: "Испания", flag: "flags/flag_spain.png", field_icon: "fields/tennis.png" },
  { last_name: "Янник СИННЕР", country_ru: "Италия", flag: "flags/flag_italy.png", field_icon: "fields/tennis.png" },
  { last_name: "Новак ДЖОКОВИЧ", country_ru: "Сербия", flag: "flags/flag_serbia.png", field_icon: "fields/tennis.png" },
  { last_name: "Самер МАКИНТОШ", country_ru: "Канада", flag: "flags/flag_canada.png", field_icon: "fields/swimming.png" },
  { last_name: "Лео МЕССИ", country_ru: "Аргентина", flag: "flags/flag_argentina.png", field_icon: "fields/football.png" },
  { last_name: "Криштиану РОНАЛДУ", country_ru: "Португалия", flag: "flags/flag_portugal.png", field_icon: "fields/football.png" },
  { last_name: "Килиан МБАППЕ", country_ru: "Франция", flag: "flags/flag_france.png", field_icon: "fields/football.png" },
  { last_name: "ШЭЙ Гилгиус-Александер", country_ru: "Канада", flag: "flags/flag_canada.png", field_icon: "fields/basketball.png" },
  { last_name: "МЕЙТАР", country_ru: "Израиль", flag: "flags/flag_israel.png", field_icon: "fields/football.png" },
];


let score = 0;
let time = 0;
let startTime = null;
let currentSet = [];

const pools = {
  names: document.getElementById('pool-names'),
  countries: document.getElementById('pool-countries'),
  flags: document.getElementById('pool-flags'),
  fields: document.getElementById('pool-fields'),
};

const solution = document.getElementById('solution-space');
const scoreDisplay = document.getElementById('score');

function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function renderPool(id, items, isImage = false) {
  const pool = pools[id];
  items.forEach(athlete => {
    const div = document.createElement('div');
    div.className = 'draggable';
    div.draggable = true;
    div.dataset.pool = id;

    let value;
    if (id === 'names') value = athlete.last_name;
    else if (id === 'countries') value = athlete.country_ru;
    else if (id === 'flags') value = athlete.flag.split('/').pop();
    else if (id === 'fields') value = athlete.field_icon.split('/').pop();

    div.dataset.value = value;

    let imgPath = '';
    if (id === 'flags') imgPath = `images/flags/${value}`;
    else if (id === 'fields') imgPath = `images/fields/${value}`;

    div.innerHTML = isImage ? `<img src="${imgPath}" alt="">` : value;
    div.addEventListener('dragstart', dragStart);
    enableTouchSupport(div);  // ✅ Add this line
    pool.appendChild(div);
  });
}

function init() {
  startTime = Date.now();

  const selectedAthletes = athletes.length <= 5
    ? [...athletes]
    : shuffle(athletes).slice(0, 5);  // Select random 5

  currentSet = selectedAthletes

  const shuffled = shuffle(selectedAthletes);
  renderPool('names', shuffled);
  renderPool('countries', shuffle(shuffled));
  renderPool('flags', shuffle(shuffled), true);
  renderPool('fields', shuffle(shuffled), true);

  //enableTouchSupport();
  //addTouchListeners(div);

  setTimeout(enableTouchSupport, 0);
}

let dragged = null;

function dragStart(e) {
  const category = e.target.dataset.pool;
  const column = solution.querySelector(`.solution-column[data-pool="${category}"]`);
  const alreadyIn = column.querySelector('.draggable');
  const totalItems = solution.querySelectorAll('.draggable').length;

  if (alreadyIn || totalItems >= 4) {
    e.preventDefault();
    return false;
  }

  dragged = e.target;
}

solution.addEventListener('dragover', e => e.preventDefault());

solution.addEventListener('drop', e => {
  e.preventDefault();
  if (!dragged) return;

  const category = dragged.dataset.pool;
  const column = solution.querySelector(`.solution-column[data-pool="${category}"]`);
  if (!column || column.querySelector('.draggable')) return;

  column.appendChild(dragged);

  const totalPlaced = solution.querySelectorAll('.draggable').length;
  if (totalPlaced === 4) {
    checkSolution();
  }
});


// Double-click to return to original pool
solution.addEventListener('dblclick', e => {
  const el = e.target.closest('.draggable');
  if (!el) return;
  const poolId = el.dataset.pool;
  if (pools[poolId]) {
    pools[poolId].appendChild(el);
    solution.classList.remove('wrong');
  }
});

function checkSolution() {
  const selected = {
    names: solution.querySelector('[data-pool="names"] .draggable')?.dataset.value,
    countries: solution.querySelector('[data-pool="countries"] .draggable')?.dataset.value,
    flags: solution.querySelector('[data-pool="flags"] .draggable')?.dataset.value,
    fields: solution.querySelector('[data-pool="fields"] .draggable')?.dataset.value,
  };

  const match = athletes.find(a =>
    a.last_name === selected.names &&
    a.country_ru === selected.countries &&
    a.flag.split('/').pop() === selected.flags &&
    a.field_icon.split('/').pop() === selected.fields
  );

  if (match) {
    score = score + 10;
    scoreDisplay.textContent = `Очки: ${score}`;
    scoreDisplay.classList.add('flash');
    setTimeout(() => scoreDisplay.classList.remove('flash'), 1000);

    // Flash green on correct match
    solution.classList.add('correct');
    setTimeout(() => {
      solution.classList.remove('correct');
      
      // Remove items from solution and add to completed panel
      moveToCompleted(match);
    }, 1000);
  } else {
    score = score - 3;
    if (score < 0) {
      score = 0;
    }
    scoreDisplay.textContent = `Очки: ${score}`;
    scoreDisplay.classList.add('flash');
    solution.classList.add('wrong');
    setTimeout(() => {
      solution.classList.remove('wrong');
    }, 1000);
  }
}

function moveToCompleted(match) {
  const row = document.getElementById('completed-row');
  document.getElementById('completed-pools').style.display = 'block';

  const nameDiv = `<div class="draggable">${match.last_name}</div>`;
  const countryDiv = `<div class="draggable">${match.country_ru}</div>`;
  const flagDiv = `<div class="draggable"><img src="images/flags/${match.flag.split('/').pop()}" alt=""></div>`;
  const fieldDiv = `<div class="draggable"><img src="images/fields/${match.field_icon.split('/').pop()}" alt=""></div>`;

  //row.innerHTML += `<div class="completed-entry">${nameDiv}${countryDiv}${flagDiv}${fieldDiv}</div>`;
  row.innerHTML = `<div class="completed-entry">${nameDiv}${countryDiv}${flagDiv}${fieldDiv}</div>` + row.innerHTML;

  // Clear current selections
  solution.querySelectorAll('.draggable').forEach(el => el.remove());

  // ✅ Check if all athletes have been matched
  const completed = row.querySelectorAll('.completed-entry').length;
  if (completed === currentSet.length) {
    showStatsPopup();
  }
}

function showStatsPopup() {
  const popup = document.getElementById('stats-popup');
  time = Math.round((Date.now() - startTime) / 1000);
  document.getElementById('time-taken').textContent = `Ты справился за ${time} секунд.`;
  document.getElementById('score-for-stats').textContent = `${score} очков`;
  popup.classList.remove('hidden');

  document.getElementById('play-again').onclick = () => {
    location.reload(); // Reload the page for a new game
  };

  document.getElementById('close-popup').onclick = () => {
    popup.classList.add('hidden');
  };
}

function submitScore() {
  const name = document.getElementById('player-name').value.trim();
  if (!name) {
    alert('Пожалуйста, введите имя!');
    return;
  }

  //const time = getElapsedTime();
  const entry = { name, score, time };

  let scores = JSON.parse(localStorage.getItem('topScores') || '[]');
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score || a.time - b.time);
  scores = scores.slice(0, 10);

  localStorage.setItem('topScores', JSON.stringify(scores));

  showTopScores();
}

function showTopScores() {
  const scores = JSON.parse(localStorage.getItem('topScores') || '[]');

  const tableRows = scores.map((s, i) =>
    `<tr>
      <td>${i + 1}</td>
      <td>${s.name}</td>
      <td>${s.score}</td>
      <td>${s.time} сек</td>
    </tr>`
  ).join('');

  const container = document.getElementById('top-scores');
  if (container) {
    container.innerHTML = `
      <h3>🏆 Лучшие результаты</h3>
      <table class="score-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Имя</th>
            <th>Очки</th>
            <th>Время</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
  }
}


function getElapsedTime() {
  const now = Date.now();
  return Math.floor((now - startTime) / 1000); // in seconds
}

// Add touch support for draggable elements
//function enableTouchSupport() {
//  let touchDragged = null;
//
//  document.querySelectorAll('.draggable').forEach(el => {
//    el.addEventListener('touchstart', function (e) {
//      const touch = e.touches[0];
//      touchDragged = this.cloneNode(true);
//      touchDragged.style.position = 'absolute';
//      touchDragged.style.left = touch.pageX + 'px';
//      touchDragged.style.top = touch.pageY + 'px';
//      touchDragged.style.pointerEvents = 'none';
//      touchDragged.style.opacity = '0.7';
//      touchDragged.classList.add('dragging');
//      document.body.appendChild(touchDragged);
//      this.classList.add('being-dragged');
//      this.dataset.touchOrigin = this.parentNode.id;
//      e.preventDefault();
//    });
//
//    el.addEventListener('touchmove', function (e) {
//      if (!touchDragged) return;
//      const touch = e.touches[0];
//      touchDragged.style.left = touch.pageX + 'px';
//      touchDragged.style.top = touch.pageY + 'px';
//      e.preventDefault();
//    });
//
//    el.addEventListener('touchend', function (e) {
//      if (!touchDragged) return;
//      const origin = document.querySelector('.being-dragged');
//      const touch = e.changedTouches[0];
//      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
//
//      if (dropTarget) {
//        const dropColumn = dropTarget.closest('.solution-column');
//        if (dropColumn && dropColumn.dataset.pool === origin.dataset.pool && !dropColumn.querySelector('.draggable')) {
//          dropColumn.appendChild(origin);
//
//          const totalPlaced = solution.querySelectorAll('.draggable').length;
//          if (totalPlaced === 4) checkSolution();
//        }
//      }
//
//      origin.classList.remove('being-dragged');
//      if (touchDragged) {
//        document.body.removeChild(touchDragged);
//        touchDragged = null;
//      }
//      e.preventDefault();
//    });
//  });
//}

function enableTouchSupport(el) {
  let touchDragged = null;

  el.addEventListener('touchstart', function (e) {
    const touch = e.touches[0];
    touchDragged = el.cloneNode(true);
    touchDragged.style.position = 'absolute';
    touchDragged.style.left = touch.pageX + 'px';
    touchDragged.style.top = touch.pageY + 'px';
    touchDragged.style.pointerEvents = 'none';
    touchDragged.style.opacity = '0.7';
    touchDragged.classList.add('dragging');
    document.body.appendChild(touchDragged);
    el.classList.add('being-dragged');
    e.preventDefault();
  });

  el.addEventListener('touchmove', function (e) {
    if (!touchDragged) return;
    const touch = e.touches[0];
    touchDragged.style.left = touch.pageX + 'px';
    touchDragged.style.top = touch.pageY + 'px';
    e.preventDefault();
  });

  el.addEventListener('touchend', function (e) {
    if (!touchDragged) return;
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    const origin = el;

    const dropColumn = dropTarget?.closest('.solution-column');
    if (dropColumn &&
        dropColumn.dataset.pool === origin.dataset.pool &&
        !dropColumn.querySelector('.draggable')) {
      dropColumn.appendChild(origin);

      const totalPlaced = solution.querySelectorAll('.draggable').length;
      if (totalPlaced === 4) checkSolution();
    }

    origin.classList.remove('being-dragged');
    document.body.removeChild(touchDragged);
    touchDragged = null;
    e.preventDefault();
  });
}

// Allow tapping on item in solution space to return it
solution.addEventListener('touchstart', function (e) {
  const el = e.target.closest('.draggable');
  if (!el || !el.classList.contains('draggable')) return;

  const poolId = el.dataset.pool;
  if (pools[poolId]) {
    pools[poolId].appendChild(el);
    solution.classList.remove('wrong');
    e.preventDefault(); // Prevent double triggering
  }
}, { passive: false });

init();

document.getElementById('show-top-scores-button').addEventListener('click', () => {
  const popup = document.getElementById('leaderboard-popup');
  const container = document.getElementById('leaderboard-list');

  const scores = JSON.parse(localStorage.getItem('topScores') || '[]');

  const tableRows = scores.map((s, i) =>
    `<tr>
      <td>${i + 1}</td>
      <td>${s.name}</td>
      <td>${s.score}</td>
      <td>${s.time} сек</td>
    </tr>`
  ).join('');

  container.innerHTML = `
    <table class="score-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Имя</th>
          <th>Очки</th>
          <th>Время</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;

  popup.classList.remove('hidden');
});


document.getElementById('close-leaderboard').addEventListener('click', () => {
  document.getElementById('leaderboard-popup').classList.add('hidden');
});
