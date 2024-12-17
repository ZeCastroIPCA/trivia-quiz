// On load
document.addEventListener('DOMContentLoaded', function() {
    // Set the background music volume lower
    const audio = document.getElementById('backgroundMusic');
    audio.volume = 0.5;

    // Only show Highscores link if there are highscores
    const highscores = JSON.parse(localStorage.getItem('highscores'));
    const highscoresLink = document.getElementById('highscoresLink');
    const highscoresButton = document.getElementById('highscoresButton');
    if (highscores) {
        highscoresLink.style.display = 'block';
        highscoresButton.style.display = 'block';
    }
});
