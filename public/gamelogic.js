console.log('script linked!');

// make socket connection
var socket = io.connect();
   
// define components
var entry = document.getElementById('wordGuess');
var submit = document.getElementById('submitGuess');
var skip = document.getElementById('skipGuess');
var prog1 = document.getElementById('progressBar1');
var prog2 = document.getElementById('progressBar2');

//not the best variable names, but these show a zero percentage in absence of a visible progress bar
 var zero1 = document.getElementById('prog1zero');
 var zero2 = document.getElementById('prog2zero');


var subject = document.getElementById('subject');
var question = document.getElementById('question');
var responseSection = document.getElementById('response');

//adds a message section... 
var msg = document.getElementById('feedback');

// emit events
submit.addEventListener('click', function(){
   socket.emit('answer', {
       user: socket.id,
      //some kind of card id ? 
       word: submit.value
   });
   
   checkAnswer(entry);
   
   //console.log('"ENTER" BUTTON CLICKED!');
});

skip.addEventListener('click', function(){
   socket.emit('skip', {
       //user: socket.id,
       //word: submit.value
   }) 
   
   //console.log('"SKIP" BUTTON CLICKED!');
   
   //from tiffany's script
   skipCard();
   
});

// listen for server feedback + UPDATE PROGRESS
socket.on('answer', function(data){
    
    // try changing the HTML of a div to see if it works...
    // need to get the user values to update the proper info
    
    console.log('someone submitted an answer');
    
    
    incrementProgress('user1', 10); 
    
    
    
});

// skip event emitted (not really necessary, just testing)
socket.on('skip', function(data){
    
    // try changing the HTML of a div to see if it works...
    // need to get the user values to update the proper info
    
    console.log('someone skipped a flashcard!!!!11!!!');
    

});


// OTHER SOCKET EVENTS (USER FUNCTIONALITY)

// Whenever the server emits 'user joined', log it in the chat body
socket.on('user joined', function (data) {
    
    //check for how many users have joined
    if (data.numUsers == 1) {
        
        setUserTitle('name1', data.username);
        setUserTitle('progTitle1', data.username);
        
    } else if (data.numUsers == 2){
        
        setUserTitle('name2', data.username);
        setUserTitle('progTitle2', data.username);
        
        //start game button appears after both users in
        startUp.style.display = 'block';
        
        
    } else { //users is at 3+
        
        alert('Two users have already joined.');
        
    }
    
    
});


// Whenever the server emits 'user left', update game area
socket.on('user left', function (data) {
    
    //check for how many users have joined
    if (data.userNumber == 1) {
        
        setUserTitle('name1', data.username);
        
    } else if (data.userNumber == 2){
        
        setUserTitle('name2', data.username);
        
    } else { //game full
        
        //alert('Two users have already joined. You can spectate, or reload and try again.');
        
    }
    
    
});


// game created
socket.on('gameCreated', function(data){
   
   
   document.getElementById('startButton').style.display = 'none';
   
   
   
   
   
   
    
});




//
//modular functions
//

function setUserTitle(user, content){
    document.getElementById(user).innerHTML = content;
    
}


// make a game
var startUp = document.getElementById('startButton');

//hide start button
startUp.style.display = 'none';


startUp.addEventListener('click', createGame);


function createGame() {
    socket.emit('makeGame');
    //console.log('Game created via button');
    
    
    
    
}
    



/******************************************************************
 *     Retrieve subject data from the server
******************************************************************/

//
// CARD DECK SERVER LOGIC
//

//Holds card deck retrieved from server
var cardDeck;
var currentCard = 0;
var deckLength;


// getCards() - sends AJAX request to get card deck (in this case, biology) and add to DOM
function getCards(requestURL){
    //Call XMLHttpRequest constructor to make a new request object
    var req = new XMLHttpRequest();
    
    //Open asynchronous request
    req.open('GET', requestURL , true);
    req.setRequestHeader('Content-Type', 'application/json');
    
    req.addEventListener('load', function(){
        //If successful
        if(req.status >= 200 && req.status < 400){
            //Server will return JSON containing the table and all rows as objects in an array. 
            var response = JSON.parse(req.responseText);
            //console.log('response is ' + response);
            //console.log('response.cards is ' + response.cards);
            cardDeck = response.cards;
            //console.log('the cardDeck is ' + cardDeck);
            deckLength = cardDeck.length;
            //Update the DOM
            addCardToDOM(response);
        }else{
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send();
};

//  addCardToDOM() -- gets card deck, puts the first card's values into the Card Area
function addCardToDOM(response){
    //Get DOM elements
    subject.textContent = response.cards[0].subject;
    question.textContent = response.cards[0].question;
}

// skipCard() -- 
function skipCard(){
    if(currentCard < deckLength){
    currentCard++;
    
    //manip DOM elements
    subject.textContent = cardDeck[currentCard].subject;
    question.textContent = cardDeck[currentCard].question;
    
    } else {
        console.log("No more cards left in deck.")
    }

}

// checkAnswer () - takes user's answer, checks it against current card answer
function checkAnswer(entry){
    if(entry.value.toUpperCase() == cardDeck[currentCard].answer.toUpperCase()){
       
       showFeedback(true, cardDeck[currentCard].answer);

    }
    else{
        
        showFeedback(false, cardDeck[currentCard].answer);
        
    }
       
}

function showFeedback(result, correctAnswer){
    if (result){ //they got it right
        msg.textContent = "Congrats! The correct answer is: " + correctAnswer;
        hideFeedback(2000); //hides after 2 sec
        
    } else // they got it wrong
    {
        msg.textContent = "Sorry, that's not correct."; //removed for multiple guesses  The correct answer was: " + correctAnswer;
        hideFeedback(2000); //hides after 2 sec
    }
}

function hideFeedback(afterSeconds){
    setTimeout(function(){msg.innerHTML = '<br>';}, afterSeconds);
}

////////////////////////// end of flashcard code ////////////////////////////////////////



//function to get progress bar values
function getProgressValue(user){
    
    if(user === 'user1'){
        let value = prog1.getAttribute('aria-valuenow');
        return value;
    }

    if(user === 'user2'){
        let value = prog2.getAttribute('aria-valuenow');
        return value;
    }
    
}

//game winning variable
var gameOver = false;

//increment progress
function incrementProgress(user, cardPercentage){
        
    let incrementer = cardPercentage;    //we will pass percentage based on card / total cards value
    let currentValue = getProgressValue(user);
    let newValue = +currentValue + +incrementer; //converts to numbers (unary operator)
    if (newValue <= 100) {
        setProgressValue(user, newValue);
    }

        
}






// SEND USERNAME via ENTER KEY
var usernameInput = document.getElementById('usernameInput');
var username;

usernameInput.addEventListener('keyup', function (e) {
    if (e.keyCode == 13) {
        if (!usernameInput.value){
            alert('please enter a username');
        } else {
            
            //testing
            console.log(usernameInput.value + ' sending their details via socket');
            
            //send to socket
            setUsername();
            
            
        }
    }
});


// Sets the client's username
function setUsername () {
    var username = usernameInput.value;

    // If the username is valid
    if (username) {
      
      //get rid of the input box
      usernameInput.style.display = 'none';
      
      // Tell the server your username
      socket.emit('add user', username);
 
    }
  }


//function to set progress bar values
function setProgressValue(user, value){
    
    if(user === 'user1' && value === 0){    //show a zero percent for user1 bar
        prog1.setAttribute('style', 'width:' + value + '%;' + 'height: 15px;');
        prog1.setAttribute('aria-valuenow', value);
        prog1.textContent ='';
        
    
    } else if(user === 'user1'){
        prog1.setAttribute('style', 'width:' + value + '%;' + 'height: 15px;');
        prog1.setAttribute('aria-valuenow', value);
        setTimeout(function() { prog1.textContent = value + '%'; }, 300);
        
    
    }
    
    if (user === 'user2' && value === 0) { //show a zero percent for user2 bar
        prog2.setAttribute('style', 'width:' + value + '%;' + 'height: 15px;');
        prog2.setAttribute('aria-valuenow', value);
        prog2.textContent = '';
        
    
    } else if(user === 'user2'){
        prog2.setAttribute('style', 'width:' + value + '%;' + 'height: 15px;');
        prog2.setAttribute('aria-valuenow', value);
        setTimeout(function() { prog2.textContent = value + '%'; }, 300);
        
    } 

}

// Start Game with 0% progress for both users
setProgressValue('user1', 0);
setProgressValue('user2', 0);
    



