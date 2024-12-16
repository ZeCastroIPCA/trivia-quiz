// Defining the different containers
const container1 = document.getElementById('container');
const container2 = document.getElementById('container2');
const container3 = document.getElementById('container3');
const container4 = document.getElementById('container4');

// CONTAINER 1
const startButton = document.getElementById('startButton');
const playerName = document.getElementById('playerName');

startButton.addEventListener('click', () => {
    const name = playerName.value;
    console.log(name);
    if (name) {
        localStorage.setItem('player', name);
        container1.style.display = 'none';
        container2.style.display = 'flex';
    } else {
        alert('Please enter a valid name!');
    }
});