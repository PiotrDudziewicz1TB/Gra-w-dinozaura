var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// Ładowanie obrazów
var objectGracz1 = new Image();
var objectGracz2 = new Image();
var objectTumbleweed = new Image();
var objectCoin = new Image();

// Ścieżki do plików z obrazami (upewnij się, że ścieżki są poprawne)
objectGracz1.src = "dinozaul_blue.png"; // Obrazek 1 (Gracz 1)
objectGracz2.src = "dinozaul_red.png"; // Obrazek 2 (Gracz 2)
objectTumbleweed.src = "Tumbleweed.png"; // Obrazek 3 (Tumbleweed)
objectCoin.src = "coin.png"; // Obrazek 4 (Moneta)

// Inicjalizacja obiektów graczy i tumbleweed
var gracz1 = {
    x: canvas.width / 4,
    y: canvas.height * 1 / 4,
    width: 50,
    height: 50,
    speed: 2,
    lastDirection: null,
    coinsAmount: 0,
    lifeAmount: 3,
    invincibleUntil: 0, // Czas nieśmiertelności
    invincibleBlinkTime: 0, // Czas migotania po utracie życia
    blinkInterval: 200 // Czas migotania (w ms)
};

var gracz2 = {
    x: canvas.width / 4,
    y: canvas.height * 2 / 4,
    width: 50,
    height: 50,
    speed: 2,
    lastDirection: null,
    coinsAmount: 0,
    lifeAmount: 3,
    invincibleUntil: 0, // Czas nieśmiertelności
    invincibleBlinkTime: 0, // Czas migotania po utracie życia
    blinkInterval: 200 // Czas migotania (w ms)
};

var coins = []; // Tablica, która przechowuje wszystkie monety

var tumbleweeds = []; // Tablica, która przechowuje wszystkie tumbleweeds

let maxTumbleweeds = 0;
let countTumbleweeds = 0;
let tumbleweedx = 0;
let tumbleweedy = 0;

generateTumbleweed();
countTumbleweeds++;

function randomPosition(){
    tumbleweedx= Math.random() * (canvas.width - 30); // Losowa pozycja X w obrębie canvas
    tumbleweedy = Math.random() * (canvas.height - 30); // Losowa pozycja Y w obrębie canvas
}

function generateCoin() {
    // Tworzymy nowy obiekt coin i dodajemy go do tablicy
    var newCoin = {
        x: Math.random() * (canvas.width - 30), // Losowa pozycja X w obrębie canvas
        y: Math.random() * (canvas.width - 30), // Losowa pozycja Y w obrębie canvas
        width: 30, // Szerokość monety
        height: 30, // Wysokość monety
    };

    coins.push(newCoin); // Dodajemy nowy obiekt do tablicy
}

function generateTumbleweed() {
    randomPosition();
    // Tworzymy nowy obiekt tumbleweed i dodajemy go do tablicy
    var newTumbleweed = {
        x: tumbleweedx, // Losowa pozycja X w obrębie canvas
        y: tumbleweedy, // Losowa pozycja Y w obrębie canvas
        width: 30, // Szerokość tumbleweed
        height: 30, // Wysokość tumbleweed
        speed: 1, // Prędkość ruchu tumbleweed
        lastDirection: null // Ostatni kierunek ruchu tumbleweed
    };
    if(oneOnAnother(gracz1, newTumbleweed)){
        randomPosition();
        newTumbleweed.x = tumbleweedx;
        newTumbleweed.y = tumbleweedy;
    }
    if(oneOnAnother(gracz2, newTumbleweed)){
        randomPosition();
        newTumbleweed.x = tumbleweedx;
        newTumbleweed.y = tumbleweedy;
    }
    tumbleweeds.push(newTumbleweed); // Dodajemy nowy obiekt do tablicy
}

// Funkcja losująca Tumbleweed
function generateRandomTumbleweed(){
    if (!isGamePaused) { // Sprawdzamy, czy gra nie jest zatrzymana
        if (countTumbleweeds < maxTumbleweeds) {
            countTumbleweeds++;
            generateTumbleweed();
            scheduleSmoothMoveForAllTumbleweeds(tumbleweeds); // Wywołujemy płynny ruch dla wszystkich tumbleweeds
        }
    }
}

// Funkcja, która losowo generuje obiekty co 5-10 sekund
function startTumbleweedGeneration() {
    setInterval(() => {
        generateRandomTumbleweed(); // Generujemy nowy tumbleweed
    }, Math.floor(getRandomTime()*5)); // Ustalamy czas pomiędzy generowaniem w zakresie 5-10 sekund
}

// Funkcja, która losowo generuje obiekty co 5-10 sekund
function startCoinGeneration() {
    setInterval(() => {
        generateCoin(); // Generujemy nową monete
    }, Math.floor(getRandomTime()*5)); // Ustalamy czas pomiędzy generowaniem w zakresie 5-10 sekund
}

// Obiekt do śledzenia wciśniętych klawiszy
var keys = {};
var timeElapsed = 0; // Czas w sekundach
var lastTime = Date.now(); // Czas ostatniej aktualizacji (w milisekundach)
var end;

let minutes = 0;
let seconds = 0;
let timer;

function startTimer() {
    // Jeśli timer już działa, nie uruchamiamy go ponownie
    if (timer) return;

    // Co sekundę aktualizujemy licznik
    timer = setInterval(function () {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
    }, 1000);
}

function stopTimer() {
    // Zatrzymanie timera
    clearInterval(timer);
    timer = null;
}

function resetTimer() {
    // Resetowanie czasu
    clearInterval(timer);
    timer = null;
    minutes = 0;
    seconds = 0;
}



// Funkcja do obsługi wciśnięcia klawisza
window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true; // 
});

// Funkcja do obsługi puszczenia klawisza
window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Funkcja losująca klawisz z różnicą kierunku (żeby nie powtarzać kierunku)
function getRandomKey(object) {
    var possibleKeys = ["w", "a", "s", "d"];
    var newDirection;

    do {
        var randomIndex = Math.floor(Math.random() * possibleKeys.length);
        newDirection = possibleKeys[randomIndex];
    } while (newDirection === object.lastDirection);

    object.lastDirection = newDirection; // Aktualizujemy ostatni kierunek
    return newDirection;
}

// Funkcja losująca czas w zakresie od 1 do 2 sekund
function getRandomTime() {
    let min = 1000; // Minimalny czas w milisekundach (1 sekunda)
    let max = 2000; // Maksymalny czas w milisekundach (2 sekund)
    return Math.random() * (max - min + 1) + min;
}

// Funkcja losująca odległość
function getRandomDistance() {
    var minDistance = 50; // Minimalna odległość (w pikselach)
    var maxDistance = 200; // Maksymalna odległość (w pikselach)
    return Math.floor(Math.random() * (maxDistance - minDistance + 1)) + minDistance;
}

function performSmoothAction(object) {
    var randomKey = getRandomKey(object);
    var randomDistance = getRandomDistance();
    var currentStep = 0;

    // Obliczamy liczbę kroków na podstawie całkowitej odległości i prędkości
    var steps = Math.max(1, Math.ceil(randomDistance / object.speed));

    // Wyliczamy przesunięcie w każdym kroku na podstawie prędkości
    var stepX = (randomKey === "a" ? -randomDistance : randomKey === "d" ? randomDistance : 0) / steps;
    var stepY = (randomKey === "w" ? -randomDistance : randomKey === "s" ? randomDistance : 0) / steps;

    function moveStep() {
        if (!isGamePaused) { // Sprawdzamy, czy gra nie jest zatrzymana
            if (currentStep < steps) {
                object.x = Math.max(0, Math.min(canvas.width - object.width, object.x + stepX));
                object.y = Math.max(0, Math.min(canvas.height - object.height, object.y + stepY));
                currentStep++;

                // Rysowanie nowej pozycji
                draw();

                // Kontynuujemy ruch
                requestAnimationFrame(moveStep);
            } else {
                console.log(`Ruch zakończony: ${randomKey}, Odległość: ${randomDistance}px`);
            }
        }
    }

    moveStep();
}

// Funkcja planująca losowy ruch dla obu obiektów
function scheduleSmoothMove(object) {
    var randomTime =  Math.floor(getRandomTime());
    setTimeout(() => {
        performSmoothAction(object); // Wykonanie płynnego ruchu
        scheduleSmoothMove(object); // Zaplanowanie kolejnego ruchu
    }, randomTime);
}

function colectAllCoins(){
    coins.forEach(function(coin){
        coinColector(gracz1, coin)
        coinColector(gracz2, coin);
    })
}

// Funkcja sprawdzająca dotknięcie ściany i kolizje dla wszystkich tumbleweed w tablicy
function checkTumbleweedCollisions() {
    tumbleweeds.forEach(function(tumbleweed) {
        // Sprawdzamy dotknięcie ściany
        if (tumbleweed.x <= 0) {
            console.log("Tumbleweed dotknął lewej ściany!");
            tumbleweed.x = canvas.width - tumbleweed.width - 1; // Przenosimy go na prawą stronę
        }
        if (tumbleweed.x + tumbleweed.width >= canvas.width) {
            console.log("Tumbleweed dotknął prawej ściany!");
            tumbleweed.x = 0; // Przenosimy go na lewą stronę
        }
        if (tumbleweed.y <= 0) {
            console.log("Tumbleweed dotknął górnej ściany!");
            tumbleweed.y = canvas.height - tumbleweed.height - 1; // Przenosimy go na dolną stronę
        }
        if (tumbleweed.y + tumbleweed.height >= canvas.height) {
            console.log("Tumbleweed dotknął dolnej ściany!");
            tumbleweed.y = 0; // Przenosimy go na górną stronę
        }

        // Sprawdzamy kolizję z graczem 1
        if (checkCollision(gracz1, tumbleweed)) {
            console.log("Kolizja z graczem 1! Obiekty się zderzyły!");
            checkGameOver();
        }

        // Sprawdzamy kolizję z graczem 2
        if (checkCollision(gracz2, tumbleweed)) {
            console.log("Kolizja z graczem 2! Obiekty się zderzyły!");
            checkGameOver();
        }
    });
}

function oneOnAnother(object1, object2) {
    if(object1.x < object2.x + object2.width && object1.x + object1.width > object2.x && object1.y < object2.y + object2.height && object1.y + object1.height > object2.y){
            return true;
        }
    else{
        return false;
    }
}

// Funkcja aktualizująca stan gry po kolizji
function checkCollision(object1, object2) {
    var currentTime = Date.now();

    // Sprawdzamy, czy gracz jest nieśmiertelny (czy jego czas nieśmiertelności nie wygasł)
    if (currentTime < object1.invincibleUntil) {
        return false; // Gracz jest nieśmiertelny, nie liczymy kolizji
    }

    // Sprawdzamy, czy prostokąty się nakładają
    if (oneOnAnother(object1, object2)) {
        object1.lifeAmount--; // Zmniejszamy liczbę żyć gracza
        object1.invincibleUntil = currentTime + 3000; // Ustawiamy czas nieśmiertelności na 1 sekundę
        object1.invincibleBlinkTime = currentTime + 3000; // Rozpoczynamy migotanie na 200ms
        return true; // Kolizja
    }

    return false; // Brak kolizji
}

// Funkcja aktualizująca stan gry po kolizji
function coinColector(object1, object2) {
    // Sprawdzamy, czy prostokąty się nakładają
    if (oneOnAnother(object1, object2)) {
        object1.coinsAmount++;
        if(object1.coinsAmount === 5){
            object1.lifeAmount++;
            object1.coinsAmount = 0;
        }
        // Usuwamy monetę z tablicy
        const index = coins.indexOf(object2);
        if (index !== -1) {
            coins.splice(index, 1); // Usuń element o danym indeksie
        }
    }
}

function moveGracz1() {
    const diagonalFactor = Math.sqrt(2);

    // Ruch na skos
    if ((keys["w"] || keys["s"]) && (keys["a"] || keys["d"])) {
        if (keys["w"]) gracz1.y -= gracz1.speed / diagonalFactor;
        if (keys["s"]) gracz1.y += gracz1.speed / diagonalFactor;
        if (keys["a"]) gracz1.x -= gracz1.speed / diagonalFactor;
        if (keys["d"]) gracz1.x += gracz1.speed / diagonalFactor;
    }

    // Ruch w pojedynczym kierunku
    switch (true) {
        case keys["w"] && gracz1.y > 0:
            gracz1.y -= gracz1.speed;
            break;
        case keys["s"] && gracz1.y + gracz1.height < canvas.height:
            gracz1.y += gracz1.speed;
            break;
        case keys["a"] && gracz1.x > 0:
            gracz1.x -= gracz1.speed;
            gracz1.lastDirection = "a";
            break;
        case keys["d"] && gracz1.x + gracz1.width < canvas.width:
            gracz1.x += gracz1.speed;
            gracz1.lastDirection = "d";
            break;
    }

    // Sprawdzanie dotknięcia ścian
    if (gracz1.x <= 0) {
        console.log("Gracz 1 dotknął lewej ściany!");
        gracz1.x = canvas.width - gracz1.width - 1;
    }
    if (gracz1.x + gracz1.width >= canvas.width) {
        console.log("Gracz 1 dotknął prawej ściany!");
        gracz1.x = 0;
    }
    if (gracz1.y <= 0) {
        console.log("Gracz 1 dotknął górnej ściany!");
        gracz1.y = canvas.height - gracz1.height - 1;
    }
    if (gracz1.y + gracz1.height >= canvas.height) {
        console.log("Gracz 1 dotknął dolnej ściany!");
        gracz1.y = 0;
    }
}

function moveGracz2() {
    const diagonalFactor = Math.sqrt(2);

    // Ruch na skos
    if ((keys["arrowup"] || keys["arrowdown"]) && (keys["arrowleft"] || keys["arrowright"])) {
        if (keys["arrowup"]) gracz2.y -= gracz2.speed / diagonalFactor;
        if (keys["arrowdown"]) gracz2.y += gracz2.speed / diagonalFactor;
        if (keys["arrowleft"]) gracz2.x -= gracz2.speed / diagonalFactor;
        if (keys["arrowright"]) gracz2.x += gracz2.speed / diagonalFactor;
    }

    // Ruch w pojedynczym kierunku
    switch (true) {
        case keys["arrowup"] && gracz2.y > 0:
            gracz2.y -= gracz2.speed;
            break;
        case keys["arrowdown"] && gracz2.y + gracz2.height < canvas.height:
            gracz2.y += gracz2.speed;
            break;
        case keys["arrowleft"] && gracz2.x > 0:
            gracz2.x -= gracz2.speed;
            gracz2.lastDirection = "a";
            break;
        case keys["arrowright"] && gracz2.x + gracz2.width < canvas.width:
            gracz2.x += gracz2.speed;
            gracz2.lastDirection = "d";
            break;
    }

    // Sprawdzanie dotknięcia ścian
    if (gracz2.x <= 0) {
        console.log("Gracz 2 dotknął lewej ściany!");
        gracz2.x = canvas.width - gracz2.width - 1;
    }
    if (gracz2.x + gracz2.width >= canvas.width) {
        console.log("Gracz 2 dotknął prawej ściany!");
        gracz2.x = 0;
    }
    if (gracz2.y <= 0) {
        console.log("Gracz 2 dotknął górnej ściany!");
        gracz2.y = canvas.height - gracz2.height - 1;
    }
    if (gracz2.y + gracz2.height >= canvas.height) {
        console.log("Gracz 2 dotknął dolnej ściany!");
        gracz2.y = 0;
    }
}


// Funkcja aktualizująca pozycję obiektów na podstawie wciśniętych klawiszy
function update() {
    moveGracz1();
    moveGracz2();
    colectAllCoins();
    checkTumbleweedCollisions();
    document.querySelector("#lifeAmountLeft").textContent = `${gracz1.lifeAmount}`;// Wyświetlanie żyć gracza 1
    document.querySelector("#coinsAmountLeft").textContent = `${gracz1.coinsAmount}`;// Wyświetlanie monet gracza 1
    document.querySelector("#lifeAmountRight").textContent = `${gracz2.lifeAmount}`;// Wyświetlanie żyć gracza 2
    document.querySelector("#coinsAmountRight").textContent = `${gracz2.coinsAmount}`;// Wyświetlanie monet gracza 2
}

// Funkcja rysująca tumbleweed na canvasie
function drawTumbleweed(tumbleweed) {
    ctx.drawImage(objectTumbleweed, tumbleweed.x, tumbleweed.y, tumbleweed.width, tumbleweed.height);
}

// Funkcja rysująca monete na canvasie
function drawCoin(coin) {
    ctx.drawImage(objectCoin, coin.x, coin.y, coin.width, coin.height);
}

// Funkcja rysująca wszystkie monety
function drawAllCoins() {
    coins.forEach(function(coin) {
        drawCoin(coin); // Rysuj każdą monete
    });
}


// Funkcja rysująca wszystkich tumbleweeds
function drawAllTumbleweeds() {
    tumbleweeds.forEach(function(tumbleweed) {
        drawTumbleweed(tumbleweed); // Rysuj każdy tumbleweed
    });
}

// Funkcja rysująca oba obiekty na canvasie
function draw() {

	// Migotanie (po utracie życia)
    var currentTime = Date.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Czyszczenie obszaru
    // Gracz 1 - sprawdzamy, czy jest migotanie
    if(gracz1.lifeAmount > 0) {
        if (gracz1.invincibleBlinkTime > currentTime) {
            // Efekt migotania - zmiana przezroczystości co kilka milisekund
            var blinkPhase = Math.floor((currentTime - gracz1.invincibleBlinkTime) / gracz1.blinkInterval) % 2;
            ctx.globalAlpha = blinkPhase === 0 ? 0.5 : 1; // Migotanie: zmniejszenie przezroczystości
        } else {
            ctx.globalAlpha = 1; // Przywrócenie pełnej przezroczystości
        }

        // Rysowanie pierwszego obiektu z uwzględnieniem odwrócenia w poziomie
        if (gracz1.lastDirection === "a") {
            ctx.save();
            ctx.translate(gracz1.x + gracz1.width / 2, gracz1.y + gracz1.height / 2);
            ctx.scale(-1, 1); // Odwracanie w poziomie
            ctx.drawImage(objectGracz1, -gracz1.width / 2, -gracz1.height / 2, gracz1.width, gracz1.height);
            ctx.restore();
        } else {
            ctx.drawImage(objectGracz1, gracz1.x, gracz1.y, gracz1.width, gracz1.height);
        }
    }

    // Gracz 2 - sprawdzamy, czy jest migotanie
    if(gracz2.lifeAmount > 0) {
        if (gracz2.invincibleBlinkTime > currentTime) {
            // Efekt migotania - zmiana przezroczystości co kilka milisekund
            var blinkPhase = Math.floor((currentTime - gracz2.invincibleBlinkTime) / gracz2.blinkInterval) % 2;
            ctx.globalAlpha = blinkPhase === 0 ? 0.5 : 1; // Migotanie: zmniejszenie przezroczystości
        } else {
            ctx.globalAlpha = 1; // Przywrócenie pełnej przezroczystości
        }

        // Rysowanie pierwszego obiektu z uwzględnieniem odwrócenia w poziomie
        if (gracz2.lastDirection === "a") {
            ctx.save();
            ctx.translate(gracz2.x + gracz2.width / 2, gracz2.y + gracz2.height / 2);
            ctx.scale(-1, 1); // Odwracanie w poziomie
            ctx.drawImage(objectGracz2, -gracz2.width / 2, -gracz2.height / 2, gracz2.width, gracz2.height);
            ctx.restore();
        } else {
            ctx.drawImage(objectGracz2, gracz2.x, gracz2.y, gracz2.width, gracz2.height);
        }

    }
    // Przywrócenie domyślnej przezroczystości po zakończeniu rysowania
    ctx.globalAlpha = 1;
    drawAllCoins();
    drawAllTumbleweeds();
    // Rysowanie licznika czasu
    document.querySelector("#time").textContent = `Czas: ${minutes} : ${seconds} `;// Wyświetlanie czasu
}

var levelInfo = 2;

function level1(){
    levelInfo = 1;
    console.log("Poziom trudności ustawiony na łatwy.");
    maxTumbleweeds = 1;
}

function level2(){
    levelInfo = 2;
    console.log("Poziom trudności ustawiony na średni.");
    maxTumbleweeds = 3;
}

function level3(){
    levelInfo = 3;
    console.log("Poziom trudności ustawiony na trudny.");
    maxTumbleweeds = 5;
}


function drawCountdown(count) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Czyszczenie canvas
    ctx.font = "50px Arial";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(count, canvas.width / 2, canvas.height / 2);
}

function drawPause() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Czyszczenie canvas
    ctx.font = "50px Arial";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Gra zatrzymana", canvas.width / 2, canvas.height / 2);
}

function drawEnd() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Czyszczenie canvas
    ctx.font = "50px Arial";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Gra skończona", canvas.width / 2, canvas.height *2 / 6);
    ctx.font = "30px Arial";
    ctx.fillText(`Czas gry: ${minutes} : ${seconds} `, canvas.width / 2, canvas.height * 3 / 6);
    ctx.fillText(`Wygrał ${winner}!`, canvas.width / 2, canvas.height * 4 / 6);
}

// Funkcja, która uruchamia płynny ruch dla każdego tumbleweed
function scheduleSmoothMoveForAllTumbleweeds(tumbleweeds) {
    tumbleweeds.forEach(tumbleweed => {
        scheduleSmoothMove(tumbleweed); // Uruchamiamy płynny ruch dla każdego obiektu tumbleweed
    });
}


function startCountdown() {
    var countdown = 3;
    
    var countdownInterval = setInterval(() => {
        drawCountdown(countdown); // Rysujemy liczbę na ekranie
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval); // Zatrzymujemy odliczanie po osiągnięciu 0
            drawCountdown('Start!'); // Wyświetlamy napis 'Start!' po zakończeniu odliczania
            setTimeout(() => {
                document.querySelector("#counter").textContent = `Gra rozpoczęta`
                document.querySelector("#time").style.display = 'block';
                document.querySelector("#lifeLeft").style.display = 'flex';;// Wyświetlanie żyć gracza 1
                document.querySelector("#coinsLeft").style.display = 'flex';// Wyświetlanie monet gracza 1
                document.querySelector("#lifeRight").style.display = 'flex';// Wyświetlanie żyć gracza 2
                document.querySelector("#coinsRight").style.display = 'flex';// Wyświetlanie monet gracza 2
                startTimer();
                startCoinGeneration();
                startTumbleweedGeneration();
                scheduleSmoothMoveForAllTumbleweeds(tumbleweeds);
                gameLoop(); // Rozpoczynamy grę po sekundzie
            }, 1000); // Odczekaj sekundę przed rozpoczęciem gry
        }
    }, 1000); // 1 sekunda między kolejnymi liczbami
}

let winner;

function checkGameOver() {
    if (gracz1.lifeAmount === 0 || gracz2.lifeAmount === 0) {
        if (gracz1.lifeAmount === 0) {
            winner = "gracz 2"
        }
        else{
            winner = "gracz1"
        }
        console.log("koniec");
        drawEnd();
        isGamePaused = true;
        end = true;
    }
}

var isGamePaused = false; // Flaga do kontroli, czy gra jest zatrzymana
// Funkcja zatrzymująca grę
function pauseGame() {
    stopTimer();
    isGamePaused = true;
    console.log("Gra zatrzymana.");
    drawPause();
}

// Funkcja wznawiająca grę
function resumeGame() {
    startTimer();
    isGamePaused = false;
    console.log("Gra wznowiona.");
    gameLoop(); // Wznowienie pętli gry
}

function reset(){
    location.reload();
}

// Główna pętla gry
function gameLoop() {
    if (!isGamePaused) { // Jeśli gra jest zatrzymana, nic nie rób
        update(); // Aktualizowanie stanu obiektów
        if (!end) {
            draw(); // Rysowanie obiektów
        }
        requestAnimationFrame(gameLoop); // Kontynuowanie pętli gry
    }
}

function toggleButton() {
    const button = document.getElementById('pauseButton');
    if (button.classList.contains('stop')) {
        pauseGame();
        button.classList.remove('stop');
        button.classList.add('start');
        button.textContent = 'Start';
    } else {
        resumeGame();
        button.classList.remove('start');
        button.classList.add('stop');
        button.textContent = 'Stop';
    }
}

function startGame() {
    // Ukrywamy przycisk Start
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('rulesButton').style.display = 'none';
    document.getElementById('level').style.display = 'none';
    // Pokazujemy obszar gry
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('resetButton').style.display = 'block';
    document.getElementById('pauseButton').style.display = 'block';
    startCountdown();// Start gry

    // Tutaj możesz dodać kod uruchamiający grę
    console.log("Gra rozpoczęta!");
}

// Nasłuchujemy kliknięcia przycisku Start
document.getElementById('startButton').addEventListener('click', startGame);
// Nasłuchujemy kliknięcia przycisku Reset
document.getElementById('resetButton').addEventListener('click', reset);

// Function to start the game
function startLevel() {
    // Hide the level buttons
    document.getElementById('easy').style.display = 'none';
    document.getElementById('medium').style.display = 'none';
    document.getElementById('hard').style.display = 'none';


    
    // Show the start button
    document.getElementById('startButton').style.display = 'block';
}

// Add event listeners to all buttons with the "level" class
var levelButtons = document.querySelectorAll('.level');
levelButtons.forEach(button => {
    button.addEventListener('click', startLevel);
});

document.getElementById('rulesButton').addEventListener('click', function() {
    // Definicja zasad
    const rules = [
        "1. Zasada pierwsza: Gracz1 porusza się WSAD, a Gracz2 strzałkami.",
        "2. Zasada druga: Każdy gracz ma po trzy życia.",
        "3. Zasada trzecia: Dotknięcie krzaka odejmuje jedno życie.",
	    "4. Zasada czwarta: Po dotknięciu krzaka gracz jest niewrażliwy na 3 sekundy.",
	    "5. Zasada piąta: Po straceniu wszystkich żyć przez jednego gracza, drugi wygrywa.",
	    "6. Zasada szósta: Baw się dobrze!",
    ];

    // Wyświetlanie zasad w alertach
    for (let i = 0; i < rules.length; i++) {
        alert(rules[i]);
    }
});