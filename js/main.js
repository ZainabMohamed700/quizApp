const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextButton = document.getElementById('next-btn');
const scoreElement = document.getElementById('score');
const timerElement = document.createElement('p'); // Timer element
timerElement.id = 'timer';
questionContainer.appendChild(timerElement);

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let timerInterval;
const questionTime = 15; // Time limit for each question (in seconds)
let timeLeft = questionTime;

// Fetch questions from API
async function fetchQuestions() {
  const response = await fetch('https://opentdb.com/api.php?amount=5&type=multiple');
  const data = await response.json();
  questions = data.results;
  showQuestion();
}

// Start timer for the question
function startTimer() {
  timeLeft = questionTime;
  timerElement.textContent = `Time left: ${timeLeft}s`;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Time left: ${timeLeft}s`;

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      handleTimeOut();
    }
  }, 1000);
}

// Handle time out for a question
function handleTimeOut() {
  disableOptions();
  nextButton.disabled = false;
  timerElement.textContent = 'Time is up!';
}

// Show a question
function showQuestion() {
  clearInterval(timerInterval);
  startTimer();

  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerHTML = currentQuestion.question;

  // Clear previous options
  optionsElement.innerHTML = '';

  // Shuffle and display options
  const options = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
  options.sort(() => Math.random() - 0.5);
  options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => selectAnswer(option, currentQuestion.correct_answer);
    optionsElement.appendChild(button);
  });
}

// Handle answer selection
function selectAnswer(selectedOption, correctAnswer) {
  clearInterval(timerInterval);
  disableOptions();

  const buttons = optionsElement.querySelectorAll('button');
  buttons.forEach(button => {
    button.disabled = true;
    if (button.textContent === correctAnswer) {
      button.style.backgroundColor = 'green';
    } else if (button.textContent === selectedOption) {
      button.style.backgroundColor = 'red';
    }
  });

  if (selectedOption === correctAnswer) {
    score++;
  }
  nextButton.disabled = false;
}

// Disable all options
function disableOptions() {
  const buttons = optionsElement.querySelectorAll('button');
  buttons.forEach(button => (button.disabled = true));
}

// Move to the next question
nextButton.onclick = () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
    nextButton.disabled = true;
  } else {
    showScore();
  }
};

// Show the final score
function showScore() {
  clearInterval(timerInterval);
  questionContainer.classList.add('hidden');
  scoreElement.innerHTML = `
    <h2>Your score: ${score}/${questions.length}</h2>
    <button id="restart-btn">Restart Quiz</button>
  `;
  scoreElement.classList.remove('hidden');
  saveScore();
  document.getElementById('restart-btn').onclick = restartQuiz;
}

// Save score to Local Storage
function saveScore() {
  const previousScore = localStorage.getItem('quizScore');
  scoreElement.innerHTML += `<p>Previous Score: ${previousScore ? previousScore : 'No previous score'}</p>`;
  localStorage.setItem('quizScore', `${score}/${questions.length}`);
}

// Restart the quiz
function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  scoreElement.classList.add('hidden');
  questionContainer.classList.remove('hidden');
  fetchQuestions();
}

// Initialize quiz
fetchQuestions();




