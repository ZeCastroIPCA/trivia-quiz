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

// CONTAINER 3
// Defining the question, the timer and the buttons
const questionElement = document.getElementById('question');
const timerElement = document.getElementById('timer');
const halfButton = document.getElementById('halfButton');
const publicHelpButton = document.getElementById('publicHelpButton');
const trueButton = document.getElementById('trueButton');
const falseButton = document.getElementById('falseButton');
const playerScore = document.getElementById('playerScore');
const playerName = document.getElementById('playerName');
const publicHelpText = document.getElementById('publicHelpText');
var currentQuestion = 0;

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
  // Recomeçar o timer
  clearInterval(timer);
  timerCountdown();
  // Barra que funciona de Timer
  timerElement.classList.remove('time-bar-child');
  //Mostrar os pontos atuais
  playerScore.innerHTML = scoreFinal.pontos;
  playerName.innerHTML = scoreFinal.nome;
  //Repete ate chegar ás 10 perguntas
  if (currentQuestion < 10) {
    if (quiz[currentQuestion].type == 'boolean') {
      trueFalse();
    } else if (quiz[currentQuestion].type == 'multiple') {
      quizMultiple();
    }
  } else {
    //Depois das 10 perguntas chama a funçao fim de jogo
    fimJogo();
    for (var i = 0; i < btnanswer.length; i++) {
      btnanswer[i].disabled = true;
    }
  }
  timerElement.classList.add('time-bar-child');
  publicHelpText.style.display = 'none';
}

//Objeto Jogador , com os seus atribuitos
var scoreFinal = {
  nome: '',
  pontos: 0,
};

var highscore = {
  nome: 'Tiago',
  maxScore: 40,
  category: 'Entertainment: Books',
};

//Funçao de perguntas true ou false
// Baralhamento auto-incrementado sem necessidade de randomizar
function trueFalse() {
  const booleanQuestions = document.querySelectorAll('.boolean');
  booleanQuestions.forEach((question) => {
    question.style.display = 'true';
  });
  const answerQuestions = document.querySelectorAll('.answer');
  answerQuestions.forEach((question) => {
    question.style.display = 'none';
  });
  halfButton.display = 'none';
  //atribuir a pergunta ao respetivo campo
  questionElement.innerHTML = quiz[currentQuestion].question;
  //atribuir a resposta ao respetivo campo, Fazendo com que a opçao true fique sempre na msm posiçao independetemente se é a correta
  if (quiz[currentQuestion].correct_answer == 'True') {
    trueButton.innerHTML = quiz[currentQuestion].correct_answer;
    falseButton.innerHTML = quiz[currentQuestion].incorrect_answers[0];
  } else {
    trueButton.innerHTML = quiz[currentQuestion].incorrect_answers[0];
    falseButton.innerHTML = quiz[currentQuestion].correct_answer;
  }
}
// Caso o jogador escolha true
trueButton.addEventListener('click', trueChoice);

function trueChoice() {
  if (quiz[currentQuestion].correct_answer == 'True') {
    console.log('Acertou Miseravi');
    changeColor(2);
    // Incrementar pontos
    scoreFinal.pontos += 10;
  } else {
    console.log('Errooooou');
    changeColor(1);
  }
  //Avançar para a proxima pergunta
  currentQuestion++;
  nextQuestion();
}
// Caso o jogador escolha False
falseButton.addEventListener('click', falseChoice);

function falseChoice() {
  if (quiz[currentQuestion].correct_answer == 'False') {
    console.log('Acertou');
    scoreFinal.pontos += 10;
    changeColor(2);
  } else {
    console.log('Errooooou');
    changeColor(1);
  }
  currentQuestion++;
  nextQuestion();
}

// VARIAVEL COM TODOS OS BOTOES DE CLASS ANSWER PARA A QUESTAO DE RANDOMIZAR AS RESPOSTAS
var btnanswer = document.getElementsByClassName('answer');
var e = '';
var questionIndex = null;

function quizMultiple() {
  const booleanQuestions = document.querySelectorAll('.boolean');
  booleanQuestions.forEach((question) => {
    question.style.display = 'none';
  });
  const answerQuestions = document.querySelectorAll('.answer');
  answerQuestions.forEach((question) => {
    question.style.display = 'block';
  });
  //atribuir a pergunta ao respetivo campo
  questionElement.innerHTML = quiz[currentQuestion].question;
  // Juntar todas as respostas num array
  var arr = [
    quiz[currentQuestion].correct_answer,
    quiz[currentQuestion].incorrect_answers[0],
    quiz[currentQuestion].incorrect_answers[1],
    quiz[currentQuestion].incorrect_answers[2],
  ];
  // randomizar as respostas
  let random;
  for (var i = 0; i < 4; i++) {
    random = Math.floor(Math.random() * arr.length);
    // atribuir cada resposta a um botao
    // O splice usa o numero random gerado para dar display na informaçao do botao e elimina este numero do array
    btnanswer[i].innerHTML = arr.splice(random, 1);
    if (btnanswer[i].innerText == quiz[currentQuestion].correct_answer) {
      // registar a opçao correta numa variavel global
      questionIndex = i;
    }
  }
}
//Atribuir uma funçao quando cada botao é clickado com uma variavel para guardar qual botao foi clickado
var choiceButton = null;
btnanswer[0].addEventListener('click', () => {
  choiceButton = 0;
  verificaResposta();
});
btnanswer[1].addEventListener('click', () => {
  choiceButton = 1;
  verificaResposta();
});
btnanswer[2].addEventListener('click', () => {
  choiceButton = 2;
  verificaResposta();
});
btnanswer[3].addEventListener('click', () => {
  choiceButton = 3;
  verificaResposta();
});

function verificaResposta() {
  //Vericaçao se a resposta escolhida está correta
  if (btnanswer[choiceButton].innerText == quiz[currentQuestion].correct_answer) {
    console.log('Acertou multiple');
    //A cada resposta o jogador ganha 10 pontos
    scoreFinal.pontos += 10;
    changeColor(2);
  } else {
    console.log('Errou multiple');
    changeColor(1);
  }
  //Estando a resposta correta ou nao avança para a proxima pergunta
  currentQuestion++;
  nextQuestion();
}

function changeColor(num) {
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

// Botao de Ajuda do Publico , randomiza um numero de 50 ate 97 e diz que "x" percentagem de pessoas escolheu a opçao correta
publicHelpButton.addEventListener('click', ajudaPublico);

function ajudaPublico() {
  let ajuda;
  ajuda = Math.floor(Math.random() * 47) + 50;
  publicHelpText.style.display = 'block';
  publicHelpText.innerHTML =
    ajuda + '% do publico respondeu ' + quiz[currentQuestion].correct_answer;
  console.log(ajuda + '% do publico respondeu ' + quiz[currentQuestion].correct_answer);
  publicHelpButton.disabled = true;
}

// Botao para eliminar duas respostas erradas
halfButton.addEventListener('click', ajudaHalf);

function ajudaHalf() {
  var nums = new Set();
  while (nums.size !== 2) {
    let n = Math.floor(Math.random() * 3);
    if (n != questionIndex) {
      nums.add(n);
    }
  }
  for (var elem of nums) {
    btnanswer[elem].style.display = 'none';
  }
  document.getElementById('halfButton').disabled = true;
}

exitButton.addEventListener('click', () => {
  document.querySelector('.container3').style.display = 'none';
  document.querySelector('.container1').style.display = 'flex';
});

highscoresButton.addEventListener('click', () => {
  document.querySelector('.container1').style.display = 'none';
  document.querySelector('.container3').style.display = 'flex';
});

//atualizar a tabela de classificação
function updateTable() {
  window.localStorage.setItem(highscore.nome, JSON.stringify(highscore));
  if (verify == true) {
    var newScore = document.createElement('div');
    newScore.setAttribute('class', 'caps2');
    let nomeNewScore = document.createElement('h2');
    let pontosNewScore = document.createElement('h2');
    let categoryNewScore = document.createElement('h2');
    if (highscore.nome == JSON.parse(window.localStorage.getItem(scoreFinal.nome)).nome) {
      nomeNewScore.innerText = highscore.nome;
      pontosNewScore.innerText = highscore.maxScore;
      categoryNewScore.innerText = highscore.category;
    } else {
      newScore.setAttribute('class', 'caps2');

      nomeNewScore.innerText = highscore.nome;
      console.log(highscore.maxScore);

      pontosNewScore.innerText = highscore.maxScore;

      categoryNewScore.innerText = highscore.category;
    }

    document.querySelector('.classificacao').appendChild(newScore);
    newScore.appendChild(nomeNewScore);
    newScore.appendChild(pontosNewScore);
    newScore.appendChild(categoryNewScore);
  }
}

var verify;
//Funçao para o fim do jogo que entre outros para o timer
function fimJogo() {
  //Debugging ** console.log(scoreFinal.pontos);
  // Condiçao - Se os pontos atuais forem superiores ao maxScore anterior o maxScore fica com os pontos atuais
  if (scoreFinal.pontos > highscore.maxScore || highscore.category != quiz[0].category) {
    highscore.maxScore = scoreFinal.pontos;
    highscore.nome = scoreFinal.nome;
    highscore.category = quiz[0].category;
    window.localStorage.setItem(highscore.nome, JSON.stringify(highscore));
    verify = true;
    updateTable();
  } else {
    verify = false;
  }

  console.log('verify: ', verify);
  console.log('categoria: ', highscore.category);
  console.log('localstorage: ', JSON.parse(window.localStorage.getItem(scoreFinal.nome)).category);

  // Delay de 1 segundo a esconder o container
  setTimeout(() => {
    container2.style.display = 'none';
    container1.style.display = 'flex';
  }, 1000);
  // Para o contador no fim do jogo
  clearInterval(timer);
}
