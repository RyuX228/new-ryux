//Key API


var key = 'AIzaSyCPQEPxbW_jv6N_XSOUMBIThX3DlAjqddY';
var cx = '50873707364714151';

//Variabel
var AiName = 'RyuX';

//Variabel button

var button ={
    submit: document.querySelector('#submit'),
    regenerate: document.querySelector('#new'),
    reset: document.querySelector('#reset'),
    recognition: document.querySelector('#recognition'),
    closebutton: document.querySelector('#close-button')
}

// path image
var sendImagePath = button.submit.querySelector('img').src;
var deleteImagePath = button.reset.querySelector('img').src;
var regenerateImagePath = button.regenerate.querySelector('img').src;
var recognitionImagePath = button.recognition.querySelector('img').src;

//other
var loading = document.querySelector('#loading');
const AiAnswer = document.querySelector("#answer");
let typingAnimation = null;

button.recognition.addEventListener('click', RecognitionQuestion)

button.reset.addEventListener('click', ResetAll)

button.closebutton.addEventListener('click', hidePopup)

button.submit.addEventListener("click", () =>{
    ResetAll();
    var question = document.getElementById("question").value.trim();
    var query = question.toLowerCase();
    var stopWords = ["the", "is", "and", "of", "to", "who", "what", "where"];
    var tokens = query.split(" ");
    var keywords = [];
    
    // Call ResetPicture() function
    ResetPicture();
    
    switch(query){
        case '':{
            SendMessage('Warning', 'RyuX cant answer if the question empty');
            return;
        }
        case 'quake':{
            EarthQuake();
            return;
        }
    }

    // get question keyword
    for (var i = 0; i < tokens.length; i++) {
        if (!stopWords.includes(tokens[i])) {
            keywords.push(tokens[i]);
        }
    }
    
    // get forbind word in keyword
    if(!BadWord(keywords)){
        var format = keywords.join("_");
        Answer(format); //Call Answer function according to format
    }
})

button.regenerate.addEventListener('click', () =>{
    ResetAll();
    var question = document.getElementById('question').value.trim();
    GetAnotherData(question);
})

// Function

function Answer(question){
    fetch(`/main?question=${question}`)
    .then(response => response.text())
    .then(data =>{
        if(data === '500 Internal Server Error'){
            GetInternalData(question)
            return
        }
        Typing(`${AiName}: ${data}`)
    })
    .catch(error =>{
        console.log(error)
    })
}


function GetAnotherData(question){
    fetch(`/data?question=${question}`).then(response => response.text())
    .then(data =>{
        Typing(data)
    })
}

function GetInternalData(question){
    fetch('../data/internal.json').then(response => response.json())
    .then(data =>{
        var IsData = data.find(item => item.code.includes(question))
        if(IsData){
            Typing(`${AiName}: ${IsData.data}`)
        }
        else{GetAnotherData(question)}
    })
    .catch(error => console.log(error));
}

function EarthQuake() {
  fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json')
    .then(response => response.json())
    .then(data => {
      AiAnswer.style.display = 'flex';
      AiAnswer.innerText = JSON.stringify(data, null, 2);
      reset.style.display = 'flex';  
    })
    .catch(error => console.log(error));
}

function Typing(text) {
  let index = 0;
  const speed = 10; // typing speed(milisecond)
  AiAnswer.style.display = 'flex';  
    
  function type() {
    if (index < text.length) {
      AiAnswer.innerHTML += text.charAt(index);
      index++;
      button.submit.style.display = "none";
      loading.style.display = 'inline-block';
      typingAnimation = setTimeout(type, speed);
    }
    else{
        button.regenerate.style.display = 'flex';
        button.reset.style.display = 'flex';
        button.recognition.style.display = 'flex';
        button.submit.style.display = "inline-block";
        loading.style.display = 'none';
    }  
  }

  type();
}

function RecognitionQuestion(){
    var question = document.getElementById('question').value.trim();
    
    fetch(`https://www.googleapis.com/customsearch/v1?cx=${cx}&q=${question}&key=${key}&searchType=image`)
    .then(response => response.json())
    .then(data =>{
        var items = data.items;
        var pictureClass = document.getElementById('body-image');
        
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            
            if(item && item.length < 1 ){
                SendMessage('warning', 'There is no any image')
            }

            // Find image/get image url
            var imageUrl = item.link;
            
            // Create element for the image
            var imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            
            // image style
            imageElement.style.display = 'flex';
            imageElement.style.width = '100px';
            imageElement.style.height = 'auto';
            
            // Add the image
            pictureClass.appendChild(imageElement);
        }
    })
}

function ResetPicture(){
    var images = document.getElementsByTagName('img');
    for (var i = 0; i < images.length; i++) {
        images[i].src = '';
        images[i].styles = 'none';
    }
    
    button.submit.querySelector('img').src = sendImagePath;
    button.reset.querySelector('img').src = deleteImagePath;
    button.regenerate.querySelector('img').src = regenerateImagePath;
    button.recognition.querySelector('img').src = recognitionImagePath;
}

function ResetAll(){
    clearTimeout(typingAnimation);
    AiAnswer.innerText = '';
    AiAnswer.style.display = 'none';
    button.regenerate.style.display = 'none';
    button.reset.style.display = 'none';
    button.recognition.style.display = 'none';
    ResetPicture();
}

function SendMessage(title, message) {
    var titleMessage = document.getElementById('title-message');
    var messageAbout = document.getElementById('message-about');
    var popup = document.getElementById('popup');
    titleMessage.innerText = title;
    messageAbout.innerText = message;
    popup.style.display = 'block';
}

function hidePopup() {
    document.getElementById('responsive-menu').checked = false;
    var popup = document.getElementById('popup');
    popup.style.display = 'none';
}

function BadWord(text) {
    var forbind = ["fuck", "18+", "sex", "ass"];
    for (var i = 0; i < forbind.length; i++) {
        if (text.includes(forbind[i])) {
            SendMessage('Warning', 'RyuX is not answer that kind of question');
            return true;
        }
    }
    return false;
}