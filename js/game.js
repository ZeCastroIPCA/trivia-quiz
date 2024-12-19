class QuizGame {
  constructor() {
    this.DOM = {
      containers: {
        start: document.getElementById('container'),
        categories: document.getElementById('container2'),
        quiz: document.getElementById('container3'),
        highscores: document.getElementById('container4'),
      },
      elements: {
        loading: document.getElementById('loading'),
        startButton: document.getElementById('startButton'),
        startName: document.getElementById('startName'),
        categories: document.querySelector('.categories'),
        questionElement: document.getElementById('question'),
        timerElement: document.getElementById('timer'),
        playerScore: document.getElementById('playerScore'),
        playerName: document.getElementById('playerName'),
        trueButton: document.getElementById('trueButton'),
        falseButton: document.getElementById('falseButton'),
        answerButtons: document.getElementsByClassName('answer'),
        halfButton: document.getElementById('halfButton'),
        publicHelpButton: document.getElementById('publicHelpButton'),
        publicHelpText: document.getElementById('publicHelpText'),
        highscoresLink: document.getElementById('highscoresLink'),
        highscoresButton: document.getElementById('highscoresButton'),
        backButton: document.getElementById('backButton'),
        backgroundMusic: document.getElementById('backgroundMusic'),
        highscoresTable: document.querySelector('.highscoresTable'),
      },
    };

    this.state = {
      playerData: { name: '', score: 0 },
      highscore: { name: '', score: 0, category: '' },
      scores: [],
      quiz: null,
      currentQuestion: 0,
      correctAnswerIndex: null,
      timer: null,
      newRecord: false,
      help: {
        public: false,
        half: false,
      },
    };

    this.initializeGame();
  }

  initializeGame() {
    this.setupInitialState();
    this.bindEventListeners();
  }

  setupInitialState() {
    // Set background music volume
    this.DOM.elements.backgroundMusic.volume = 0.5;

    // Show highscores link conditionally
    const highscores = JSON.parse(localStorage.getItem('highscores'));
    if (highscores) {
      this.DOM.elements.highscoresLink.style.display = 'block';
      this.DOM.elements.highscoresButton.style.display = 'block';
    }
  }

  bindEventListeners() {
    // Start screen events
    this.DOM.elements.startButton.addEventListener('click', () => this.handleStartGame());
    this.DOM.elements.categories.addEventListener('click', (event) =>
      this.handleCategorySelection(event)
    );

    // Navigation events
    this.DOM.elements.highscoresLink.addEventListener('click', () => this.showHighscores());
    this.DOM.elements.highscoresButton.addEventListener('click', () => this.showHighscores());
    this.DOM.elements.backButton.addEventListener('click', () => this.resetToMainScreen());

    // Answer buttons
    this.DOM.elements.trueButton.addEventListener('click', () => this.handleBooleanAnswer(true));
    this.DOM.elements.falseButton.addEventListener('click', () => this.handleBooleanAnswer(false));

    Array.from(this.DOM.elements.answerButtons).forEach((answer, index) => {
      answer.addEventListener('click', () => this.handleMultipleChoice(index));
    });

    // Help buttons
    this.DOM.elements.publicHelpButton.addEventListener('click', () => this.publicHelp());
    this.DOM.elements.halfButton.addEventListener('click', () => this.halfHelp());
  }

  handleStartGame() {
    const name = this.DOM.elements.startName.value.trim();
    if (name) {
      this.state.playerData.name = name;
      this.switchContainer(this.DOM.containers.categories);
    } else {
      alert('Please enter a valid name!');
    }
  }

  async handleCategorySelection(event) {
    const category = event.target.value;
    if (category) {
      try {
        // Show loading spinner
        this.DOM.elements.loading.style.display = 'flex';

        // Fetch quiz questions based on selected category
        const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}`);
        const data = await response.json();
        this.state.quiz = data.results;
        console.log(data.results[0].category);
        this.switchContainer(this.DOM.containers.quiz);
        this.resetGameState();
        this.nextQuestion();

        // Hide loading spinner
        this.DOM.elements.loading.style.display = 'none';
      } catch (error) {
        console.error('Failed to fetch quiz questions:', error);
        alert('Unable to load quiz. Please try again.');
        this.resetToMainScreen();
      }
    }
  }

  resetGameState() {
    this.state.currentQuestion = 0;
    this.state.playerData.score = 0;
    this.updatePlayerDisplay();
  }

  startTimer() {
    let timeLeft = 20;
    this.clearPreviousTimer();

    this.state.timer = setInterval(() => {
      timeLeft--;

      if (timeLeft <= 0) {
        this.clearPreviousTimer();
        this.handleTimeOut();
      }
    }, 1000);
  }

  handleTimeOut() {
    // Change time bar color to indicate time-out
    this.changeTimeBarColor('timeout');

    // Move to next question
    this.moveToNextQuestion();
  }

  clearPreviousTimer() {
    if (this.state.timer) {
      clearInterval(this.state.timer);
      this.state.timer = null;
    }
    this.resetTimerBar();
  }

  createTimerBar() {
    const timerBar = this.DOM.elements.timerElement;
    const timeBarChild = document.createElement('div');
    timeBarChild.classList.add('time-bar-child');
    timerBar.appendChild(timeBarChild);
  }

  resetTimerBar() {
    const timeBarChild = document.querySelector('.time-bar-child');

    // If exists remove it
    if (timeBarChild) {
      timeBarChild.remove();
    }

    // Then create a new one
    this.createTimerBar();
  }

  switchContainer(showContainer) {
    // Hide all containers
    Object.values(this.DOM.containers).forEach((container) => {
      container.style.display = 'none';
    });

    // Show the container we want to display
    showContainer.style.display = 'flex';
  }

  showHighscores() {
    // Load highscores and scores from local storage
    const highscores = JSON.parse(localStorage.getItem('highscores'));
    const scores = JSON.parse(localStorage.getItem('scores'));
    if (highscores || scores) {
      this.state.highscore = highscores;
      this.state.scores = scores;
      this.updateHighscoreTable();
    }
    this.switchContainer(this.DOM.containers.highscores);
  }

  resetToMainScreen() {
    this.switchContainer(this.DOM.containers.start);
  }

  updatePlayerDisplay() {
    this.DOM.elements.playerScore.innerHTML = this.state.playerData.score;
    this.DOM.elements.playerName.innerHTML = this.state.playerData.name;
  }

  nextQuestion() {
    this.updatePlayerDisplay();
    this.startTimer();

    if (this.state.currentQuestion < 10) {
      const currentQuizQuestion = this.state.quiz[this.state.currentQuestion];

      this.resetQuestionDisplay();

      if (currentQuizQuestion.type === 'boolean') {
        this.setupBooleanQuestion(currentQuizQuestion);
      } else if (currentQuizQuestion.type === 'multiple') {
        this.setupMultipleChoiceQuestion(currentQuizQuestion);
      }
    }
  }

  setupBooleanQuestion(question) {
    const booleanAnswers = document.querySelectorAll('.boolean');
    booleanAnswers.forEach((btn) => (btn.style.display = 'block'));

    const multipleAnswers = document.querySelectorAll('.answer');
    multipleAnswers.forEach((btn) => (btn.style.display = 'none'));

    this.DOM.elements.questionElement.innerHTML = question.question;

    if (question.correct_answer === 'True') {
      this.DOM.elements.trueButton.innerHTML = 'True';
      this.DOM.elements.falseButton.innerHTML = 'False';
    } else {
      this.DOM.elements.trueButton.innerHTML = 'False';
      this.DOM.elements.falseButton.innerHTML = 'True';
    }
  }

  setupMultipleChoiceQuestion(question) {
    const multipleAnswers = document.querySelectorAll('.answer');
    multipleAnswers.forEach((btn) => (btn.style.display = 'block'));

    const booleanAnswers = document.querySelectorAll('.boolean');
    booleanAnswers.forEach((btn) => (btn.style.display = 'none'));

    this.DOM.elements.questionElement.innerHTML = question.question;

    const allAnswers = [question.correct_answer, ...question.incorrect_answers];

    // Shuffle answers
    const shuffledAnswers = this.shuffleArray(allAnswers);

    shuffledAnswers.forEach((answer, index) => {
      multipleAnswers[index].innerHTML = answer;
      if (answer === question.correct_answer) {
        this.state.correctAnswerIndex = index;
      }
    });
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  handleBooleanAnswer(isTrue) {
    const currentQuestion = this.state.quiz[this.state.currentQuestion];
    const isCorrect =
      (isTrue && currentQuestion.correct_answer === 'True') ||
      (!isTrue && currentQuestion.correct_answer === 'False');

    this.processAnswer(isCorrect);
  }

  handleMultipleChoice(chosenIndex) {
    const currentQuestion = this.state.quiz[this.state.currentQuestion];
    const isCorrect =
      this.DOM.elements.answerButtons[chosenIndex].innerHTML === currentQuestion.correct_answer;

    this.processAnswer(isCorrect);
  }

  processAnswer(isCorrect) {
    if (isCorrect) {
      this.state.playerData.score += 10;
      this.changeTimeBarColor('correct');
    } else {
      this.changeTimeBarColor('incorrect');
    }

    this.moveToNextQuestion();
  }

  moveToNextQuestion() {
    // Increment question counter
    this.state.currentQuestion++;

    // Check if we've reached the end of questions
    if (this.state.currentQuestion < 10) {
      this.nextQuestion();
    } else {
      this.endGame();
    }
  }

  resetQuestionDisplay() {
    // Show/hide appropriate answer buttons
    const booleanAnswers = document.querySelectorAll('.boolean');
    const multipleAnswers = document.querySelectorAll('.answer');

    booleanAnswers.forEach((btn) => (btn.style.display = 'none'));
    multipleAnswers.forEach((btn) => {
      btn.style.display = 'block';
      btn.disabled = false;
    });

    this.DOM.elements.publicHelpText.style.display = 'none';
    this.DOM.elements.publicHelpButton.disabled = false;
    this.DOM.elements.halfButton.disabled = false;
  }

  changeTimeBarColor(type) {
    const timeBar = this.DOM.elements.timerElement;

    // Different color for timeout
    switch (type) {
      case 'correct':
        timeBar.style.backgroundColor = 'palegreen';
        break;
      case 'incorrect':
        timeBar.style.backgroundColor = 'red';
        break;
      case 'timeout':
        timeBar.style.backgroundColor = 'orange';
        break;
    }

    setTimeout(() => {
      timeBar.style.backgroundColor = '';
    }, 250);
  }

  publicHelp() {
    const helpPercentage = Math.floor(Math.random() * 47) + 50;
    const currentQuestion = this.state.quiz[this.state.currentQuestion];

    this.DOM.elements.publicHelpText.style.display = 'block';
    this.DOM.elements.publicHelpText.innerHTML = `${helpPercentage}% do público respondeu ${currentQuestion.correct_answer}`;

    this.DOM.elements.publicHelpButton.disabled = true;
  }

  halfHelp() {
    const multipleAnswers = document.querySelectorAll('.answer');
    const correctAnswer = this.state.correctAnswerIndex;

    const incorrectIndexes = Array.from({ length: 4 }, (_, i) => i)
      .filter((i) => i !== correctAnswer)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    incorrectIndexes.forEach((index) => {
      multipleAnswers[index].style.display = 'none';
    });

    this.DOM.elements.halfButton.disabled = true;
  }

  endGame() {
    this.checkAndUpdateHighscore();
    this.clearPreviousTimer();

    // Show loading spinner
    this.DOM.elements.loading.style.display = 'flex';

    setTimeout(() => {
      this.switchContainer(this.DOM.containers.start);

      // Hide loading spinner
      this.DOM.elements.loading.style.display = 'none';
    }, 1000);
  }

  checkAndUpdateHighscore() {
    let currentCategory = this.state.quiz[0].category;
    // Category can have "Science: Art" or "Entertainment: Video Games", if so, remove the part before the colon
    const sanitizedCategory = currentCategory.includes(':');
    if (sanitizedCategory) {
      currentCategory = currentCategory.split(': ')[1];
    }
    const isNewHighscore =
      this.state.playerData.score > this.state.highscore.score ||
      this.state.highscore.category !== currentCategory;

    if (isNewHighscore) {
      this.state.highscore = {
        name: this.state.playerData.name,
        score: this.state.playerData.score,
        category: currentCategory,
      };

      localStorage.setItem('highscores', JSON.stringify(this.state.highscore));
      this.state.scores.push(this.state.highscore);
      localStorage.setItem('scores', JSON.stringify(this.state.scores));
      this.updateHighscoreTable();
    }
  }

  updateHighscoreTable() {
    // Update scores state from local storage
    const scores = JSON.parse(localStorage.getItem('scores'));
    // Create new score rows
    const highscoresTable = this.DOM.elements.highscoresTable;

    // For each score, create a new row
    scores.forEach((score) => {
      const tableRow = document.createElement('div');
      tableRow.classList.add('table-row');
      const h2 = document.createElement('h2');
      h2.innerHTML = `${score.name} - ${score.score} - ${score.category}`;
      tableRow.appendChild(h2);
      highscoresTable.appendChild(tableRow);
    });
  }
}

// Initialize the game on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new QuizGame();
});
