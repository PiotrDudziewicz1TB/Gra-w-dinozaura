function checkGameOver() {
    if (gracz1.lifeAmount === 0 || gracz2.lifeAmount === 0) {
        console.log("koniec");
        drawPause();
        //isGamePaused = true;
    }
}