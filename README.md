# Flashcard-Challenge OSU Winter Hackathon Project
Flashcard Challenge was initially created during the [OSU Club's Winter 2018 Hackathon event](https://sites.google.com/oregonstate.edu/osuhackathonclub).
It is an application that allows users to sign in and challenge another user to a round of flashcards.
There are 4 decks to choose from: Biology, Physics, American History, and Computer Science.
The player chooses a deck and then will be matched with someone. Once a match is made, they can start the game.
Socket.io is used for player interactions. Once a game is started, progress bars show how many answers the other player
has gotten correct. The first player to 100% wins the game. 

## Website
* Most Up-to-Date Version: [Flashcard Challenge Revamped](https://flashcard-challenge.herokuapp.com/)
* Version submitted to Hackathon: [Flashcard Challenge](https://flashcards-osu.herokuapp.com/)

## Technologies used

* MongoDB/Mongoose
* Express
* Node.js
* Socket.io
* Passport
* Handlebars
* Bootstrap

## Team

* [@Tiffany Warner](https://github.com/Tiffany-Warner)
* [@Adrian Towery](https://github.com/actowery)
* [@Cameron Church](https://github.com/CameronScottBrown)
* Alanna Mozzetti


## Known Issues 
Currently only test demo is functional but buggy
### Game logic bugs
* No winner is ever declared/decided
* Incorrect answers increment percentage
* Users don't always match after entering name
* When one user enters their name, the other player's "Start Game" button disappears - can still hit enter to submit name

## Features to be Added
* User login system
* User profiles
* Matching logged in users for a game
* Badge system/Awards
* Message or comment system 
* UI improvements
