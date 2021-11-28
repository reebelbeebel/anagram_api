'use strict';

const wordMain = [
  "чебурашка", "каток", "лоток",
  "поток", "предводитель", "распространитель",
  "человек", "работа", "вопрос", "сторона", "ребёнок", "голова", "система", "отношение",
  "проблема", "возможность", "компания", "результат", "развитие",
  "государство", "президент", "организация", "качество", "общество", "деятельность",
  "правительство", "предприятие", "состояние", "информация", "производство", "квартира",
  "положение", "управление", "материал"
];

const startButton = document.querySelector(".btn_enter");
const listEl = document.querySelector(".list_part");
const formEl = document.querySelector(".form");
const word = document.querySelector(".main_word");
const inputWords = document.querySelector(".words");
const inputButton = document.querySelector(".btn_input");
const answerToUser = document.querySelector(".answer");
const nextWord = document.querySelector(".next_word");
const listPart = document.querySelector(".list_part");
const loadingPart = document.querySelector(".three");

// Пишем функцию показа кнопки следующего слова
function nextWordButtonFunc(visibility) {
  nextWord.style.visibility = visibility;
}

// Функция ответа юзеру
function emptyWar(string) {
  answerToUser.textContent = string;
}

// Функция изменения видимости и цвета оповещения
function loadingAndAnswer(visibility, color) {
  loadingPart.style.visibility = visibility;
  answerToUser.style.color = color;
}

nextWordButtonFunc("hidden"); // прячем кнопку след слова
loadingPart.style.visibility = "hidden";

let countWord = 0; // счетчик главных слов
let levelAnswers = []; // массив с введенными ответами, очищать после левела

startButton.onclick = e => {
  e.preventDefault();
  word.textContent = wordMain[countWord];
  inputWords.focus();
  startButton.style.visibility = "hidden";
  localStorage.setItem('word', wordMain[countWord]);
}

// Работа с кнопкой 'Next'
nextWord.onclick = e => {
  e.preventDefault();
  countWord++;
  localStorage.setItem('word', wordMain[countWord]);
  word.textContent = wordMain[countWord];
  levelAnswers = []; // Очищаем массив для следующего слова
  nextWordButtonFunc("hidden")
  listEl.textContent = "";
  inputWords.focus();
};

if (typeof localStorage.getItem('word') === 'string') {
  word.textContent = localStorage.getItem('word');
  countWord = wordMain.indexOf(localStorage.getItem('word'));
  startButton.style.visibility = "hidden";
  inputWords.focus();
}

// Рабта с кнопкой 'Принять'
inputButton.onclick = e => {
  e.preventDefault();
  const input = inputWords.value.toLowerCase();
  const doubleWord = levelAnswers.includes(input); // проверяем дубликаты
  formEl.reset();

  loadingPart.style.visibility = "visible";

  // Отправляем слово на проверку на существование. Если существует, то проверяем символы
  fetch(`https://speller.yandex.net/services/spellservice.json/checkText?text=${input}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data[0]);

      if (data[0] === undefined && typeof localStorage.getItem('word') === 'string') {
        const wordSet = new Set(localStorage.getItem('word'));
        const answerSet = new Set(input);

        function checkForMatches(set, subset) {
          for (let elem of subset) {
            if (!set.has(elem)) {
              return false;
            }
          }
          return true;
        }

        const resFunc = checkForMatches(wordSet, answerSet);

        if (resFunc && !doubleWord && input.length >= 3) {
          levelAnswers.push(input);

          let list = document.createElement("li") // создаем элементы списка
          listEl.append(list);
          list.setAttribute('class', 'mr-8 mt-8 text-xl text-white');
          list.textContent = `${input}`; // добавляем слово в список, прошедшее проверку
          loadingAndAnswer("hidden", "#00FF00"); // вызов функции изменения цвета и видимости оповещения
          emptyWar("Верно!");

          if (levelAnswers.length >= 3) {
            nextWordButtonFunc("visible") //показываем кнопку если угадано 3 и более слов
          }
          inputWords.focus();
          setTimeout(emptyWar, 1500, "");
        }
        else {
          loadingAndAnswer("hidden", "#FF0000");
          emptyWar("Неверно!");
          setTimeout(emptyWar, 1500, "");
        };
      }
      else {
        loadingAndAnswer("hidden", "#FF0000");
        nextWordButtonFunc("hidden");
        emptyWar("Неверно!");
        setTimeout(emptyWar, 1500, "");
      }

      // проверяем слово на наличие в массиве 
      if (doubleWord) {
        emptyWar("Такое слово уже есть!")
      }

      if (input.length < 3) {
        emptyWar("Не менее трёх букв!")
      }
    });

  if (levelAnswers.length >= 3) {
    nextWordButtonFunc("visible") //показываем кнопку если угадано 3 и более слов
  };

  inputWords.focus();
};
