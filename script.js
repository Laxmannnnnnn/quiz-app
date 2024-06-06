const landingPage = document.querySelector(".landing-page");
const gameCategory = document.querySelector(".game-category");
const quizSection = document.querySelector(".quiz");
const questionElement = document.getElementById("question");
const optionsContainer = document.getElementById("options-container");
const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const mistakesElement = document.getElementById("mistakes");

let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let mistakes = 0;
let timer;
const questionTime = 10; // Time per question in seconds
const maxMistakes = 5; // Maximum number of mistakes allowed

// Function to show the landing page and hide other sections
function showLandingPage() {
    landingPage.style.display = "";
    gameCategory.style.display = "none";
    quizSection.style.display = "none";
    scoreElement.style.display = "none";
    mistakesElement.style.display = "none";
}

// Function to show the game category selection and hide other sections
function showGameCategory() {
    landingPage.style.display = "none";
    gameCategory.style.display = "";
    quizSection.style.display = "none";
    scoreElement.style.display = "none";
    mistakesElement.style.display = "none";
}

// Function to show the quiz and hide other sections
function showQuiz(category) {
    landingPage.style.display = "none";
    gameCategory.style.display = "none";
    quizSection.style.display = "";
    scoreElement.style.display = "";
    mistakesElement.style.display = "";
    // Reset score and mistakes when starting a new quiz
    score = 0;
    mistakes = 0;
    scoreElement.textContent = `Score: ${score}`;
    mistakesElement.textContent = `Mistakes: ${mistakes}`;
    // Load questions when quiz section is shown
    getQuestions(category);
}

// Function to fetch questions from the Open Trivia Database API
async function getQuestions(category) {
    const API_URL = `https://opentdb.com/api.php?amount=20&type=multiple&category=${encodeURIComponent(category)}`;
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // Check if the question property exists
        if (data.results && data.results.length > 0 && data.results[0].question) {
            questions = data.results;
            displayQuestion();
        } else {
            console.error("Invalid data format:", data);
        }
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

// Function to display the current question
function displayQuestion() {
    if (timer) {
        clearInterval(timer);
    }

    const currentQuestion = questions[currentQuestionIndex];

    // Check if the currentQuestion object and its question property exist
    if (currentQuestion && currentQuestion.question) {
        questionElement.textContent = currentQuestion.question;

        optionsContainer.innerHTML = "";
        currentQuestion.incorrect_answers.forEach((option) => {
            addOption(option, false);
        });

        addOption(currentQuestion.correct_answer, true);

        // Show options container
        optionsContainer.style.display = '';

        startTimer();
    } else {
        console.error("Invalid question format:", currentQuestion);
    }
}

// Function to start the timer
function startTimer() {
    let timeLeft = questionTime;
    timerElement.textContent = `Time left: ${timeLeft} seconds`;

    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time left: ${timeLeft} seconds`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

// Function to handle what happens when the time runs out
function handleTimeout() {
    questionElement.textContent = "Time's up!";
    optionsContainer.style.display = 'none';

    mistakes++;
    mistakesElement.textContent = `Mistakes: ${mistakes}`;

    if (mistakes >= maxMistakes) {
        showScore();
        return;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        setTimeout(displayQuestion, 500);
    } else {
        setTimeout(showScore, 500);
    }
}

function addOption(text, isCorrect) {
    const optionElement = document.createElement("button");
    optionElement.textContent = text;
    optionElement.classList.add("option");
    optionElement.dataset.correct = isCorrect;
    optionElement.addEventListener("click", selectOption);
    optionsContainer.appendChild(optionElement);
}

async function selectOption(event) {
    clearInterval(timer);

    const selectedOption = event.target;
    const isCorrect = selectedOption.dataset.correct === "true";

    if (isCorrect) {
        questionElement.textContent = "Correct!";
        score++;
        scoreElement.textContent = `Score: ${score}`;
    } else {
        questionElement.textContent = "Incorrect!";
        mistakes++;
        mistakesElement.textContent = `Mistakes: ${mistakes}`;
    }

    optionsContainer.style.display = 'none';

    if (mistakes >= maxMistakes) {
        showScore();
        return;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        // Wait for 0.5 seconds before showing the next question
        await new Promise(resolve => setTimeout(resolve, 500));
        displayQuestion();
    } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        showScore();
    }
}

function showScore() {
    questionElement.textContent = "Quiz Completed!";
    scoreElement.textContent = `Final Score: ${score} / ${questions.length}`;
    mistakesElement.textContent = `Final Mistakes: ${mistakes}`;
    scoreElement.style.display = "";
    mistakesElement.style.display = "";
    optionsContainer.style.display = 'none';

    setTimeout(() => {
        currentQuestionIndex = 0;
        showLandingPage();
    }, 2000);
}

showLandingPage();
