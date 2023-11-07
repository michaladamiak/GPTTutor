// enter your KEY
// const API_KEY = 

const scenarioOne = document.querySelector("#scenario-one")
const scenarioTwo = document.querySelector("#scenario-two")
const landing = document.querySelector(".landing")
const main = document.querySelector(".main")
const messages = document.querySelectorAll(".message")
const newMessage = document.querySelector("#new-message")

let prePrompt = "";
let opening = "";
let finalMessage = "";
let history = [];

scenarioOne.addEventListener("click", () => {
    prePrompt = "[Keep in mind that your response should use 30 completion_tokens or less] You are Mark, a 23 years old student at a party of your friend Monica. You've met last year at the university as both of you are studying geography. Since then you have become very fond of each other. You're meeting a lot of people at the party and are willing to make conversation with them. You can see that someone that you don't know approaches you. Try to talk to them. You already introduced yourself and asked how did they meet Monica. They say as follows: ";
    opening = "Hi, I'm Mark, and you? How do you know Monica?";
    finalMessage = "You know what, I have to go right now. It was nice talking to you!";
    history = [{role: "system", content: prePrompt}, {role: "assistant", content: opening}];

    landing.style.display = "none";
    main.style.display = "flex";
    newMessage.style.display = "flex";
    setTimeout(openingMessage, 500);
})

scenarioTwo.addEventListener("click", () => {
    prePrompt = "[Keep in mind that your response should use 30 completion_tokens or less] You are a shop assistant at the clothing store. You help customers point to products that they are looking for and assist with decision what to buy. You can see that there is new customer, try to help them.";
    opening = "Hello, how can I help you?";
    finalMessage = "Excuse me, I have to take care of something, have a good day!";
    history = [{role: "system", content: prePrompt}, {role: "assistant", content: opening}];

    landing.style.display = "none";
    main.style.display = "flex";
    newMessage.style.display = "flex";
    setTimeout(openingMessage, 500);
})

// function - add new user message box to dom 
const userMessages = []
function newUserMessage(){
    userMessages.push(document.createElement('div'));
    userMessages[userMessages.length-1].classList.add("message");
    userMessages[userMessages.length-1].appendChild(document.createElement('p'));
    main.appendChild(userMessages[userMessages.length-1])

    //after
    // userMessages[userMessages.length-1].setAttribute('data-after', 'anything');
}

// function - add new chat message box to dom
const chatMessages = []
function newChatMessage(){
    chatMessages.push(document.createElement('div'));
    chatMessages[chatMessages.length-1].classList.add("message");
    chatMessages[chatMessages.length-1].appendChild(document.createElement('p'));
    main.appendChild(chatMessages[chatMessages.length-1])
}

// function - fill message box with text
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new window.SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = true;

recognition.addEventListener('result', (e) => {
    const text = Array.from(e.results).map(result => result[0]).map(result => result.transcript).join('');
    userMessages[userMessages.length-1].firstElementChild.innerHTML = text;
})

// text to speech
const tts = window.speechSynthesis;
let voices = []; 
function getVoices() {
    voices = tts.getVoices();
}
getVoices();
if (tts.onvoiceschanged !== undefined) {
    tts.onvoiceschanged = getVoices;
}
function speak(text) {
    const toSpeak = new SpeechSynthesisUtterance(text)
    toSpeak.voice = voices[51];
    toSpeak.rate = 1.1;
    tts.speak(toSpeak);
}

//typing animation
function typeText(element, text) {
    new TypeIt(element, {
        strings: text,
        speed: 40,
        waitUntilVisible: true,
      }).go();
}

//get response from API
async function getMessage() {
    history.push({role: "user", content: userMessages[userMessages.length-1].firstElementChild.innerHTML})
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: history,
            max_tokens: 60
        })
    }
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options)
        const data = await response.json()

        newChatMessage()

        // typing animation
        typeText(chatMessages[chatMessages.length-1].firstElementChild, data.choices[0].message.content);
        // chatMessages[chatMessages.length-1].firstElementChild.innerHTML = data.choices[0].message.content;

        window.scrollTo(0, document.body.scrollHeight);
        history.push({role: "assistant", content: data.choices[0].message.content});

        speak(data.choices[0].message.content);
    }
    catch (error) {
        console.error(error)
    }
}

//check grammar with chat API
const grammarPrePrompt = "Improve grammar, return just  improved version without any additional content, do not pay attention to punctuation and capitalization, check only grammar (if nothing wrong return 'Nice!'): "

async function checkGrammar() {
    // console.log([userMessages.length-1].firstElementChild.innerHTML)
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{role: "system", content: grammarPrePrompt}, {role: "user", content: userMessages[userMessages.length-1].firstElementChild.innerHTML}],
            max_tokens: 60
        })
    }
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options)
        const data = await response.json()

        //apply after element
        userMessages[userMessages.length-1].setAttribute('data-after', data.choices[0].message.content);
        console.log(data.choices[0].message.content);

        //adjusting bg color
        // if(data.choices[0].message.content == "Nice!") {
        //     userMessages[userMessages.length-1].setAttribute('color-check', 'green');
        // } else {
        //     userMessages[userMessages.length-1].setAttribute('color-check', 'rgb(203, 10, 10)');
        // }
    }
    catch (error) {
        console.error(error)
    }
}

// new message call
newMessage.addEventListener("click", ()=>{
    if(main.childElementCount%2 == 1){
        newUserMessage()
        window.scrollTo(0, document.body.scrollHeight);
        recognition.start()
    }
});

recognition.addEventListener('end', () => {
    checkGrammar()
    if(userMessages.length < 6) {
        getMessage()
    } else {
        newMessage.style.display = "none";
        newChatMessage()
        
        // typing animation
        typeText(chatMessages[chatMessages.length-1].firstElementChild, finalMessage);

        speak(finalMessage);
    }
})

//opening message
function openingMessage() {
    newChatMessage();
    // typing animation
    typeText(chatMessages[chatMessages.length-1].firstElementChild, opening);
    speak(opening);
}