// MULTILANG
const translations = {
    es: {
        title: "Zen-T-Block",
        start: "Iniciar",
        pause: "Pausar",
        resume: "Reanudar",
        score: "Puntuación",
        instructions: `Usa las flechas del teclado o desliza el dedo sobre la pantalla para mover y rotar las piezas.<br>
        También puedes usar <strong>espacio, enter o doble toque</strong> para cambiar la pieza.<br>
        ¡Llena filas para ganar puntos!`
    },
    en: {
        title: "Zen-T-Block",
        start: "Start",
        pause: "Pause",
        resume: "Resume",
        score: "Score",
        instructions: `Use the arrow keys or swipe on the screen to move and rotate pieces.<br>
        You can also use <strong>space, enter or double tap the screen</strong> to change pieces.<br>
        Fill lines to score points!`
    }
};

let lang = 'en';

// TETRIS LOGIC
const COLORS = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const minSwipeDistance = 30; // píxeles
const maxSwipeTime = 500; // ms

let arena = createMatrix(12, 20);
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let paused = false;
let animationFrame;
let gameStarted = false;
let score = 0;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchStartTime = 0;
let lastTapTime = 0;

function setLang(newLang) {
    lang = newLang;
    document.getElementById('game-title').textContent = translations[lang].title;
    document.getElementById('startBtn').textContent = translations[lang].start;
    document.getElementById('pauseBtn').textContent = translations[lang].pause;
    document.getElementById('instructions').innerHTML = translations[lang].instructions;
    document.title = translations[lang].title;

    document.getElementById('lang-es').classList.toggle('selected', lang === 'es');
    document.getElementById('lang-en').classList.toggle('selected', lang === 'en');

    updateScore(); // Actualizar puntuación al cambiar idioma
}

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
};

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function createPiece(type) {
    if (type === 'T') return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
    if (type === 'O') return [[2, 2], [2, 2]];
    if (type === 'L') return [[0, 0, 3], [3, 3, 3], [0, 0, 0]];
    if (type === 'J') return [[4, 0, 0], [4, 4, 4], [0, 0, 0]];
    if (type === 'I') return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
}

function drawMatrix(matrix, offset) {
    if (!matrix) return; // <- Protección extra

    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = COLORS[value] || '#000';
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            const px = x + player.pos.x;
            const py = y + player.pos.y;
            if (value !== 0 && py >= 0 && py < arena.length && px >= 0 && px < arena[0].length) {
                arena[py][px] = value;
            }
        });
    });
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        alert("Game Over!"); // Mensaje de fin de juego
        score = 0; // Reiniciar puntuación
        updateScore();
    }
}

function playerRotate() {
    const m = player.matrix;
    const pos = player.pos.x;
    let offset = 1;

    // Transponer la matriz
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
    }

    // Invertir horizontalmente para rotar en sentido horario
    m.forEach(row => row.reverse());

    // Intentar ajustar posición para evitar colisión
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (Math.abs(offset) > m[0].length) {
            // No se pudo rotar sin colisión, revertir
            for (let y = 0; y < m.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
                }
            }
            m.forEach(row => row.reverse()); // Revertir rotación
            player.pos.x = pos;
            return;
        }
    }
}

function arenaSweep() {
    let rowCount = 1;

    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;

        score += rowCount * 10;  // o 100 si prefieres puntajes más altos
        rowCount *= 2;

        updateScore();  // ← actualizar pantalla
    }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;
    if (!paused) {
        dropCounter += delta;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        draw();
    }
    animationFrame = requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').textContent = `${translations[lang].score}: ${score}`;
}

function init() {
    document.getElementById('lang-es').addEventListener('click', () => setLang('es'));
    document.getElementById('lang-en').addEventListener('click', () => setLang('en'));
    setLang(lang);

    context.scale(20, 20);

    // Controles
    document.addEventListener('keydown', e => {
        e.preventDefault(); // Evitar scroll en móviles

        if (e.keyCode === 37) playerMove(-1);
        else if (e.keyCode === 39) playerMove(1);
        else if (e.keyCode === 40) playerDrop();
        else if (e.keyCode === 38) playerRotate();
        else if (e.keyCode === 32 || e.keyCode === 13) playerReset();
    });


    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        if (tapLength < 300 && tapLength > 0) {
            //Doble tap detectado
            //console.log("Double tap!");
            playerReset(); // Reiniciar pieza
        }

        lastTapTime = currentTime;

    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (touchStartX === null || touchStartY === null) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        const threshold = 20; // px mínimos para que cuente como gesto

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Movimiento horizontal
            if (deltaX > threshold) {
                playerMove(1); // Derecha
                touchStartX = touch.clientX; // Reinicia punto de comparación
            } else if (deltaX < -threshold) {
                playerMove(-1); // Izquierda
                touchStartX = touch.clientX;
            }
        } else {
            // Movimiento vertical
            if (deltaY < -threshold * 3) {
                playerRotate(1); // Movimiento hacia arriba = rotar
                touchStartY = touch.clientY;
            } else if (deltaY > threshold * 1) {
                playerDrop(); // Movimiento hacia abajo = caer
                touchStartY = touch.clientY;
            }
            // (Podrías usar deltaY > threshold para caída rápida)
        }

        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        touchStartX = null;
        touchStartY = null;
    });


    // Botones
    document.getElementById('startBtn').addEventListener('click', () => {
        if (!arena) {
            arena = createMatrix(12, 20); // En caso no esté inicializado
        } else {
            arena.forEach(row => row.fill(0)); // Limpiar tablero
        }

        playerReset();                       // Crea nueva pieza
        paused = false;                      // Asegura que no esté pausado
        dropCounter = 0;                     // Reinicia caída
        lastTime = 0;
        score = 0; // Reiniciar puntuación
        updateScore();

        if (!gameStarted) {
            update();                          // Solo lo llamamos la primera vez
            gameStarted = true;
        }

        document.getElementById('pauseBtn').textContent = translations[lang].pause;
        document.getElementById('startBtn').blur();
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? translations[lang].resume : translations[lang].pause;
    });
}

/*
//Este codigo no funciona como debe :(, ptobare despues
function resizeCanvas() {
  //let sizeW = Math.min(window.innerWidth * 0.98, 240);
  //let sizeH = Math.min(window.innerHeight * 0.98, 560);

  let sizeW = Math.min(Math.ceil(window.innerWidth * 0.35), 460);
  let sizeH = Math.ceil((gameContainer.style.height.replace('px', '') * 1) * .60);
  canvas.style.width = sizeW + 'px';
  canvas.style.height = sizeH + 'px';

  console.log('resizeCanvas', window.innerWidth, window.innerHeight, sizeW, sizeH, canvas.style.width, canvas.style.height);
}

function resizeMainContainer() {
  //let sizeW = Math.min(window.innerWidth * 0.98, 240);
  //let sizeH = Math.min(window.innerHeight * 0.98, 560);

  let sizeW = Math.min(Math.ceil(window.innerWidth * 0.40), 460 + 40);
  let sizeH = Math.min(Math.ceil(window.innerHeight * 0.90), 720 + 40);

  gameContainer.style.width = sizeW + 'px';
  gameContainer.style.height = sizeH + 'px';

  console.log('resizeMainContainer', window.innerWidth, window.innerHeight, sizeW, sizeH, gameContainer.style.width, gameContainer.style.height);

  resizeCanvas(); // Ajustar el canvas al nuevo tamaño del contenedor
}

window.addEventListener('resize', resizeMainContainer);
resizeMainContainer(); // Ajustar tamaño del canvas al cargar
*/


// Touch controls
/*
document.getElementById('leftBtn').addEventListener('touchstart', e => { e.preventDefault(); playerMove(-1); });
document.getElementById('rightBtn').addEventListener('touchstart', e => { e.preventDefault(); playerMove(1); });
document.getElementById('downBtn').addEventListener('touchstart', e => { e.preventDefault(); playerDrop(); });
document.getElementById('rotateBtn').addEventListener('touchstart', e => { e.preventDefault(); playerRotate(); });
document.getElementById('changeBtn').addEventListener('touchstart', e => { e.preventDefault(); playerReset(); });
*/

//playerReset();
//update();