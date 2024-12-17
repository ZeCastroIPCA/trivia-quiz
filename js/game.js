// On load
document.addEventListener('DOMContentLoaded', function () {
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

// Defining the different containers
const container1 = document.getElementById('container');
const container2 = document.getElementById('container2');
const container3 = document.getElementById('container3');
const container4 = document.getElementById('container4');

// CONTAINER 1
// Defining the start button and the player name input
const startButton = document.getElementById('startButton');
const startName = document.getElementById('startName');

// Adding an event listener to the start button
startButton.addEventListener('click', () => {
  // Get the player name
  const name = startName.value;

  // If the player name is not empty
  if (name) {
    // Store the player name in local storage
    localStorage.setItem('playerName', name);
    // Change to the next container
    container1.style.display = 'none';
    container2.style.display = 'flex';
  } else {
    alert('Please enter a valid name!');
  }
});

// Hide Naming Container and Show Highscores Container
highscoresLink.addEventListener('click', () => {
  container1.style.display = 'none';
  container2.style.display = 'none';
  container3.style.display = 'none';
  container4.style.display = 'flex';
});

// CONTAINER 2
// Defining the categories container and the quiz object
const categories = document.querySelector('.categories');
var quiz = null;

// Wait for click on one of the categories
categories.addEventListener('click', async (event) => {
  // Get the category id
  const category = event.target.value;

  // If the category id is not empty
  if (category) {
    // Fetch the questions from the API
    const response = await fetch('https://opentdb.com/api.php?amount=10&category=' + category);

    // Update the quiz object
    quiz = await response.json();
    quiz = quiz.results;
    console.log(quiz);

    // Change to the next container
    container2.style.display = 'none';
    container3.style.display = 'flex';
    nextQuestion();
  }
});

// Hide Categories Container and Show Highscores Container
highscoresButton.addEventListener('click', () => {
  container1.style.display = 'none';
  container2.style.display = 'none';
  container3.style.display = 'none';
  container4.style.display = 'flex';
});

// CONTAINER 3
// Defining the question element and timer element
const questionElement = document.getElementById('question');
const timerElement = document.getElementById('timer');

// Defining the help buttons and help text
const halfButton = document.getElementById('halfButton');
const publicHelpButton = document.getElementById('publicHelpButton');
const publicHelpText = document.getElementById('publicHelpText');

// Defining the true and false buttons
const trueButton = document.getElementById('trueButton');
const falseButton = document.getElementById('falseButton');

// Defining the answer buttons
var answerButtons = document.getElementsByClassName('answer');

// Player Object
var playerData = {
  name: '',
  score: 0,
};

// Highscore Object
var highscore = {
  name: '',
  score: 0,
  category: '',
};

// Player Score and Name Elements
const playerScore = document.getElementById('playerScore');
const playerName = document.getElementById('playerName');

// Current Question being displayed
var currentQuestion = 0;

// Index of the correct answer
var correctAnswerIndex = null;

// Hide Question Container and Show Naming Container
backButton.addEventListener('click', () => {
  container1.style.display = 'flex';
  container2.style.display = 'none';
  container3.style.display = 'none';
  container4.style.display = 'none';
});

// Timer
var timer;
function timerCountdown() {
  // Timer Settings
  let timeleft = 20;

  // Clear the timer when time is up and go to the next question
  timer = setInterval(function () {
    if (timeleft <= 0) {
      clearInterval(timer);
      currentQuestion++;
      nextQuestion();
    }
    // Update the timer every second
    timeleft--;
  }, 1000);
}

// Check if the question is true or false or multiple choice
function nextQuestion() {
  // Clear and Start the timer
  clearInterval(timer);
  timerCountdown();

  // Clear the Time Bar that displays the countdown
  timerElement.classList.remove('time-bar-child');

  // Update the player data
  playerScore.innerHTML = playerData.score;
  playerName.innerHTML = playerData.name;

  // Check the type of question
  if (currentQuestion < 10) {
    if (quiz[currentQuestion].type == 'boolean') {
      trueFalseQuestion();
    } else if (quiz[currentQuestion].type == 'multiple') {
      multipleQuestion();
    }
  } else {
    // After the last question, end the game
    endGame();
    for (var i = 0; i < answerButtons.length; i++) {
      answerButtons[i].disabled = true;
    }
  }

  // Reset the timer bar
  timerElement.classList.add('time-bar-child');

  // Clear the public help text
  publicHelpText.style.display = 'none';
}

// True or False Question
function trueFalseQuestion() {
  // Show the true and false buttons
  const booleanAnswers = document.querySelectorAll('.boolean');
  booleanAnswers.forEach((question) => {
    question.style.display = 'block';
  });
  // Hide the multiple choice buttons
  const multipleAnswers = document.querySelectorAll('.answer');
  multipleAnswers.forEach((question) => {
    question.style.display = 'none';
  });

  // Hide the half button
  halfButton.display = 'none';

  // Display the question
  questionElement.innerHTML = quiz[currentQuestion].question;

  // Display the correct answer in the correct button
  if (quiz[currentQuestion].correct_answer == 'True') {
    trueButton.innerHTML = quiz[currentQuestion].correct_answer;
    falseButton.innerHTML = quiz[currentQuestion].incorrect_answers[0];
  } else {
    trueButton.innerHTML = quiz[currentQuestion].incorrect_answers[0];
    falseButton.innerHTML = quiz[currentQuestion].correct_answer;
  }
}

// When the player chooses true
trueButton.addEventListener('click', trueChoice);

// True Choice Function
function trueChoice() {
  // Compare the answer with the correct
  if (quiz[currentQuestion].correct_answer == 'True') {
    console.log('✅ True');
    // Increment score if the answer is correct
    playerData.score += 10;
    // Display correct answer bar
    changeTimeBarColor(2);
  } else {
    console.log('❌ True');
    // Display incorrect answer bar
    changeTimeBarColor(1);
  }

  // Go to the next question
  currentQuestion++;
  nextQuestion();
}

// When the player chooses false
falseButton.addEventListener('click', falseChoice);

// False Choice Function
function falseChoice() {
  // Compare the answer with the correct
  if (quiz[currentQuestion].correct_answer == 'False') {
    console.log('✅ False');
    // Increment score if the answer is correct
    playerData.score += 10;
    // Display correct answer bar
    changeTimeBarColor(2);
  } else {
    console.log('❌ False');
    // Display incorrect answer bar
    changeTimeBarColor(1);
  }

  // Go to the next question
  currentQuestion++;
  nextQuestion();
}

// Multiple Choice Question
function multipleQuestion() {
  // Hide the true and false buttons
  const booleanAnswers = document.querySelectorAll('.boolean');
  booleanAnswers.forEach((question) => {
    question.style.display = 'none';
  });
  // Show the multiple choice buttons
  const multipleAnswers = document.querySelectorAll('.answer');
  multipleAnswers.forEach((question) => {
    question.style.display = 'block';
  });

  // Display the question
  questionElement.innerHTML = quiz[currentQuestion].question;

  // Create an array with all the answers
  var arr = [
    quiz[currentQuestion].correct_answer,
    quiz[currentQuestion].incorrect_answers[0],
    quiz[currentQuestion].incorrect_answers[1],
    quiz[currentQuestion].incorrect_answers[2],
  ];

  // Randomize the answers
  let random;
  for (var i = 0; i < 4; i++) {
    random = Math.floor(Math.random() * arr.length);
    answerButtons[i].innerHTML = arr.splice(random, 1);
    if (answerButtons[i].innerText == quiz[currentQuestion].correct_answer) {
      correctAnswerIndex = i;
    }
  }
}

// Check Multiple Answer
var choiceButton = null;
Array.from(answerButtons).forEach((answer, index) => {
  answer.addEventListener('click', () => {
    choiceButton = index;
    checkMultipleAnswer();
  });
});

// Check Multiple Answer Function
function checkMultipleAnswer() {
  // Compare the answer with the correct answer
  if (answerButtons[choiceButton].innerText == quiz[currentQuestion].correct_answer) {
    console.log('✅ Multiple');
    // Increment score if the answer is correct
    playerData.score += 10;
    // Display correct answer bar
    changeTimeBarColor(2);
  } else {
    console.log('❌ Multiple');
    // Display incorrect answer bar
    changeTimeBarColor(1);
  }
  //Estando a resposta correta ou nao avança para a proxima pergunta
  currentQuestion++;
  nextQuestion();
}

// Change the color of the time bar depending on the answer (correct or incorrect)
function changeTimeBarColor(num) {
  var num;
  var timeBar = document.querySelector('.time-bar-child');
  if (num == 1) {
    timeBar.style.backgroundColor = 'lightcoral';
  } else if (num == 2) {
    timeBar.style.backgroundColor = 'palegreen';
  }
  setTimeout(() => {
    timeBar.style.backgroundColor = 'rgba(0, 128, 128, 0.486)';
  }, 250);
}

// Public Help Button Click
publicHelpButton.addEventListener('click', publicHelp);

// Public Help Function
function publicHelp() {
  // Get a random number between 50 and 97
  let help;
  help = Math.floor(Math.random() * 47) + 50;

  // Display the public help text
  publicHelpText.style.display = 'block';
  publicHelpText.innerHTML =
    help + '% do publico respondeu ' + quiz[currentQuestion].correct_answer;

  // Disable the public help button
  publicHelpButton.disabled = true;
}

// Half Help Button Click
halfButton.addEventListener('click', halfHelp);

// Half Help Function
function halfHelp() {
  // Hide two random buttons
  var nums = new Set();
  while (nums.size !== 2) {
    let n = Math.floor(Math.random() * 3);
    if (n != correctAnswerIndex) {
      nums.add(n);
    }
  }
  for (var elem of nums) {
    answerButtons[elem].style.display = 'none';
  }
  halfButton.disabled = true;
}

// Player has set a new highscore
var newRecord = false;

// Check if the player has the highest score
function endGame() {
  // Update the player data if the score is higher than the highscore
  if (playerData.score > highscore.score || highscore.category != quiz[0].category) {
    // Update the highscore object
    highscore.score = playerData.score;
    highscore.name = playerData.name;
    highscore.category = quiz[0].category;

    // Store the highscore in local storage
    localStorage.setItem('highscores', JSON.stringify(highscore));

    // Player has set a new highscore
    newRecord = true;

    // Update the highscore table
    updateHighscoreTable();
  }

  // Hide the question container
  setTimeout(() => {
    container3.style.display = 'none';
    container1.style.display = 'flex';
  }, 1000);

  // Clear the timer
  clearInterval(timer);
}

// CONTAINER 4
// Hide Highscores Container and Show Categories Container
backButton.addEventListener('click', () => {
  container1.style.display = 'none';
  container2.style.display = 'flex';
  container3.style.display = 'none';
  container4.style.display = 'none';
});

// Update the highscore table
function updateHighscoreTable() {
  if (newRecord == true) {
    var newScore = document.createElement('div');
    newScore.setAttribute('class', 'caps2');
    let nameRecord = document.createElement('h2');
    let scoreRecord = document.createElement('h2');
    let categoryRecord = document.createElement('h2');

    // Get the highscores from local storage
    let storedHighscores = localStorage.getItem('highscores');
    storedHighscores = JSON.parse(storedHighscores);

    // Check if the player is the same as the highscore
    if (highscore.name != storedHighscores.name) {
      newScore.setAttribute('class', 'caps2');
    }

    // Update the highscore table
    nameRecord.innerText = highscore.name;
    scoreRecord.innerText = highscore.score;
    categoryRecord.innerText = highscore.category;

    const highscoresTable = document.querySelector('.highscoresTable');
    highscoresTable.appendChild(newScore);
    newScore.appendChild(nameRecord);
    newScore.appendChild(scoreRecord);
    newScore.appendChild(categoryRecord);

    // Reset the newRecord variable
    newRecord = false;
  }
}
