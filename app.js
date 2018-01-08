const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');

const bodyParser  = require("body-parser");


const app = express();
app.use(bodyParser.urlencoded({extended: true}));

const socket = require('socket.io');


// connect to mongoose
mongoose.connect('mongodb://localhost/card_deck')
    .then(()=> console.log('MongoDB connected...'))
    .catch(err => console.log(err));
    
//mlab for heroku
mongoose.connect("mongodb://flash:flash@ds241737.mlab.com:41737/osu-flashcards");


/* load flash card model
require('./models/Cards');
const Cards = mongoose.model('cards');
*/

// express handlebars middleware
app.engine('handlebars', handlebars({
    defaultLayout: 'main'   //main.handlebars
}));

app.set('view engine', 'handlebars');


// public folder
app.use('/public', express.static(__dirname + '/public/'));


// index route
app.get('/', (req, res) => {
   res.render('index');
});

app.get('/selector', (req, res) => {
   res.render('selector');
});




// game route
app.get('/game', (req, res) => {
   res.render('game', { //game.handlebars 
       classroom: 'Biology', //test values
       user1: 'Billy Madison',// we need to get user details from account
       user2: 'Happy Gilmore',//
       definition: 'an organism whose cells contain a nucleus and organelles'
   });      
});

// badges route
app.get('/badges', (req, res) => {
   res.render('badges', { //badges.handlebars 
       username: 'Billy Madison', //test values
       count: 0
   });      
});


const port = process.env.PORT || 3000; //cloud9 defaults to 8080 

const server = app.listen(port, () => {
   console.log(`Server started on port ${port}`); //es6 styling 
});

/*******************************************************************************
 *                      Selector GET routes
*******************************************************************************/
// selector route
app.get('/selector', (req, res) => {
   res.render('selector');      
});

app.get('/biology', function(req,res){
    console.log("Request for biology recieved");
    //res.render('game', {subject: 'biology'});
    res.render('biology');
});

app.get('/physics', function(req,res){
    //res.render('game', {subject: 'physics'});
    res.render('physics');
});

app.get('/history', function(req,res){
    //res.render('game', {subject: 'history'});
    res.render('history');
});

app.get('/computerScience', function(req,res){
    //res.render('game', {subject: 'computerScience'});
    res.render('cs');
});


/*
    SOCKET EVENTS
*/


// socket setup
const io = socket(server);

//set user
var numUsers = 0;

io.on('connection', function(socket){
    console.log('socket created at port', socket.id);

    var addedUser = false;
    
    var userNumber;
    
    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;
    
        // we store the username in the socket session for this client
        console.log(username + ' added to session');
        
        if(numUsers == 0) {
            userNumber = 1;
        } else if (numUsers == 1){
            userNumber = 2;
        } else {
            //do nothing
        }
        
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
          numUsers: numUsers,
          userNumber: userNumber
        });
        // echo globally (all clients) that a person has connected
        io.sockets.emit('user joined', {
          username: socket.username,
          numUsers: numUsers,
          userNumber: userNumber
        });
    });

  
    //when the client  requests to make a Game
    socket.on('makeGame', function () {

        var gameId = (Math.random()+1).toString(36).slice(2, 18);
        console.log("Game Created by "+ socket.username + " w/ " + gameId);
        gameId.playerOne = socket.username;
        gameId.open = true;


        io.sockets.emit('gameCreated', {
            username: socket.username,
            gameId: gameId
        });
    
    });
    
    
    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;
            
            // echo globally that this client has left
            io.sockets.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
    
    
    //get submitted response
    socket.on('answer', function(username){
        
        console.log(socket.username + 'submitted an answer');
        
        //update shared area for progress bar
        io.sockets.emit('answer');
            
    });
});

// DB STUFF


//Get biology cards
app.get('/biologydeck', function(req,res){
    console.log("Sending Biology deck to client...")
    BiologyDeck.find({}, function(err, allBiologyCards){
        if(err){
            console.log(err);
        } else {
            res.send({cards: allBiologyCards})
        }
    });
});

//Get physics cards
app.get('/physicsdeck', function(req,res){
    console.log("Sending Physics deck to client...")
    PhysicsDeck.find({}, function(err, allPhysicsCards){
        if(err){
            console.log(err);
        } else {
            res.send({cards: allPhysicsCards})
        }
    });
});

//get history cards
app.get('/historydeck', function(req,res){
    console.log("Sending History deck to client...")
    HistoryDeck.find({}, function(err, allHistoryCards){
        if(err){
            console.log(err);
        } else {
            res.send({cards: allHistoryCards})
        }
    });
});

//get cs deck
app.get('/csdeck', function(req,res){
    console.log("Sending Computer Science deck to client...")
    CSDeck.find({}, function(err, allCSCards){
        if(err){
            console.log(err);
        } else {
            res.send({cards: allCSCards})
        }
    });
});

app.post('game', function(req,res){
    //Get data for user stats
    //To be implemented later when user database is created
    var userId = req.body.userId;
    var correctAnswers = req.body.numCorrect;
    var winner = req.body.isWinner;
    var master = req.body.is100percent;
    
    //Add info to user db
});

/********************************************************************
 *                    Mongoose Schema for Card Deck
 * *****************************************************************/
 var cardDeckSchema = new mongoose.Schema({
     subject: String,
     question: String,
     answer: String,
     image: String
 });
 
 var BiologyDeck = mongoose.model("BiologyDeck", cardDeckSchema);
 var PhysicsDeck = mongoose.model("PhysicsDeck", cardDeckSchema);
 var HistoryDeck = mongoose.model("HistoryDeck", cardDeckSchema);
 var CSDeck = mongoose.model("CSDeck", cardDeckSchema);
 
//Creates Cards - If you run them more than once, you will get duplicates

//  BiologyDeck.create(
//      {
//          subject: "Biology",
//          question: "What process does the following describe: A passive movement of water molecules through a semi permeable membrane. Water moves from an area of low solute concentration to high solute concentration.",
//          answer: "Osmosis",
//          image: "https://images.unsplash.com/photo-1485939420171-378de92ecd4c?auto=format&fit=crop&w=1050&q=80",
//          unique: true
         
//      }, function(err, biologycard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(biologycard);
//          }
//      });
     



//  BiologyDeck.create(
//      {
//          subject: "Biology",
//          question: "What kind of solution has a higher concentration of solutes outside cell than inside?",
//          answer: "Hypertonic",
//          image: "https://images.unsplash.com/photo-1485939420171-378de92ecd4c?auto=format&fit=crop&w=1050&q=80",
//          unique: true
         
//      }, function(err, biologycard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(biologycard);
//          }
//      });

//  BiologyDeck.create(
//      {
//          subject: "Biology",
//          question: "When two solutions separated by a membrane contains the same concentration of solutes on either side, it is called?",
//          answer: "Isotonic",
//          image: "https://images.unsplash.com/photo-1485939420171-378de92ecd4c?auto=format&fit=crop&w=1050&q=80",
//          unique: true
         
//      }, function(err, biologycard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(biologycard);
//          }
//      });

//  BiologyDeck.create(
//      {
//          subject: "Biology",
//          question: "What is the flexible boundary made of phospholipids between the living cell and its surroundings called?",
//          answer: "Plasma Membrane",
//          image: "https://images.unsplash.com/photo-1485939420171-378de92ecd4c?auto=format&fit=crop&w=1050&q=80",
//          unique: true
         
//      }, function(err, biologycard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(biologycard);
//          }
//      });

//  PhysicsDeck.create(
//      {
//          subject: "Physics",
//          question: "What is the energy used to push or pull an object called?",
//          answer: "Force",
//          unique: true
         
//      }, function(err, physicscard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(physicscard);
//          }
//      });
     
     
//  PhysicsDeck.create(
//      {
//          subject: "Physics",
//          question: "What is the unit of measurement of force",
//          answer: "Newton",
//          unique: true
         
//      }, function(err, physicscard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(physicscard);
//          }
//      });

//  PhysicsDeck.create(
//      {
//          subject: "Physics",
//          question: "What is the amount of matter in an object called?",
//          answer: "Mass",
//          unique: true
         
//      }, function(err, physicscard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(physicscard);
//          }
//      });
     
//  PhysicsDeck.create(
//      {
//          subject: "Physics",
//          question: "What is the force of gravity on an object called?",
//          answer: "Weight",
//          unique: true
         
//      }, function(err, physicscard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(physicscard);
//          }
//      });
     
//  PhysicsDeck.create(
//      {
//          subject: "Physics",
//          question: "What is the unit of measurement for work?",
//          answer: "Joules",
//          unique: true
         
//      }, function(err, physicscard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(physicscard);
//          }
//      });

//  HistoryDeck.create(
//      {
//          subject: "History",
//          question: "What is the constitutional amendment ratified after the Civil War that forbade slavery and involuntary servitude?",
//          answer: "Thirteenth Amendment",
//          unique: true
         
//      }, function(err, historycard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(historycard);
//          }
//     });

//  HistoryDeck.create(
//      {
//          subject: "History",
//          question: "What act passed in 1862 provided free land in the west as long as the person would settle there and make improvements in five years?",
//          answer: "Homestead Act",
//          unique: true
         
//      }, function(err, historycard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(historycard);
//          }
//     });

//  HistoryDeck.create(
//      {
//          subject: "History",
//          question: "What is the constitutional amendment ratified after the Civil War that forbade slavery and involuntary servitude?",
//          answer: "Thirteenth Amendment",
//          unique: true
         
//      }, function(err, historycard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(historycard);
//          }
//     });

//  HistoryDeck.create(
//      {
//          subject: "History",
//          question: "What was the belief that the United States was destined to stretch across the continent from the Atlantic Ocean to the Pacific Ocean called?",
//          answer: "Manifest Destiny",
//          unique: true
         
//      }, function(err, historycard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(historycard);
//          }
//     });
    
//  HistoryDeck.create(
//      {
//          subject: "History",
//          question: "Who was the U.S. president after Lincoln who was almost impeached?",
//          answer: "Andrew Johnson",
//          unique: true
         
//      }, function(err, historycard){
//          if(err){
//              console.log(err);
//          } else {
//              console.log("Successful");
//              console.log(historycard);
//          }
//     });





 CSDeck.create(
     {
         subject: "Computer Science",
         question: "What is a type of object used to store groups of similar elements called?",
         answer: "Array",
         unique: true
         
     }, function(err, cscard){
         if(err){
             console.log(err);
         } else {
             console.log("Successful");
             console.log(cscard);
         }
    });

 CSDeck.create(
     {
         subject: "Computer Science",
         question: "What is a finite set of well-defined instructions for accomplishing a task - a Recipe.",
         answer: "Algorithm",
         unique: true
         
     }, function(err, cscard){
         if(err){
             console.log(err);
         } else {
             console.log("Successful");
             console.log(cscard);
         }
    });

 CSDeck.create(
     {
         subject: "Computer Science",
         question: "What is the data type used to represent a single true or false value",
         answer: "Boolean",
         unique: true
         
     }, function(err, cscard){
         if(err){
             console.log(err);
         } else {
             console.log("Successful");
             console.log(cscard);
         }
    });

 CSDeck.create(
     {
         subject: "Computer Science",
         question: "What is Javascript?",
         answer: "Programming Language",
         unique: true
         
     }, function(err, cscard){
         if(err){
             console.log(err);
         } else {
             console.log("Successful");
             console.log(cscard);
         }
    });


 CSDeck.create(
     {
         subject: "Computer Science",
         question: "What does HTML stand for?",
         answer: "Hypertext Markup Language",
         unique: true
         
     }, function(err, cscard){
         if(err){
             console.log(err);
         } else {
             console.log("Successful");
             console.log(cscard);
         }
    });





/* FOR REFERENCE AND SINCE I'M LAZY.... here are some biology terms for flash card content

===
Eukaryote	an organism whose cells contain a nucleus and organelles
Heterotroph	an organism that must obtain its food by consuming other organisms
Population	all of the individuals of a species living in the same area
Prokaryote	a single-celled organism that does not have a nucleus
Species	a distinct population of organisms that have the same basic structure and can interbreed in nature to produce fertile offspring
abiotic factor	physical, or nonliving, part of an ecosystem, such as the sun, temperature, and rocks
active transport	type of diffusion that requires energy to move particles into and out of the cell (moving from low to high concentration)
asexual reproduction	to reproduce by cell division, spore formation, fission, or budding without the union of individuals or gametes
ATP	adenosine triphosphate; energy molecule of living things that is produced from food by respiration
Autotroph	an organism that can make its own organic food molecules from only carbon dioxide, simple inorganic nitrogen, and light or ATP
Biotic	living things that make up and ecosystem
Carbohydrate	a chemical compound such as sugars or starches that is made up of carbon, hydrogen, and oxygen
Cell	the smallest functional unit of a living organism that is bound by a cell membrane and contains various organelles
Cell membrane	the cellular structure that surrounds the cell separating the inside of the cell from the external environment; controls what goes in and out of the cell; made up of phospholipid bilayer
cell wall	the rigid, outer structure of plant cells that gives the cells shape and strength
chlorophyll	the green photosynthetic pigment found in plant chloroplasts
chloroplast	a plant organelle that contains chlorophyll and is the site of photosynthesis
diffusion	the movement of a substance across a membrane following the electrical or concentration gradient (from high concentration to low concentration); does not require energy; also known as passive transport.
DNA	the abbreviation for deoxyribonucleic acid; it is the blueprint for life, is bundled into chromosomes found in the nucleus of cells and is made up of nucleotides joined together to form a complex double helix structure
endoplasmic reticulum	organelle system of membranes within cells that transport material around the cell; two types: rough and smooth
enzyme	speeds up chemical reactions
eukaryote	a type of cell that contains a nucleus; examples are plants, animals, protists, and fungi
facilitated diffusion	the diffusion of a substance across the cell membrane with the help of a carrier.
Golgi apparatus	organelle system of membranes within cells associated with sorting, modification, packaging, and transport of cell products that come from the endoplasmic reticulum
Homeostasis	the ability of an organism to maintain stability, also known as equilibrium. Temperature regulation is an example.
hypertonic	condition where the solution surrounding a cell has a higher concentration than the concentration inside the cell; cause cells to shrink as water moves out of the cell by osmosis
hypotonic	condition where the solution surrounding a cell has a lower concentration than the concentration inside the cell; cause cells to swell as water moves into the cell by osmosis
isotonic	condition where the solution surrounding a cell has the same concentration as the inside of the cell; do not change the size of cells because osmotic flow in and out of the cell is equal
lipid	macromolecule such as fats, oils, waxes made mostly of fatty acids
lysosome	organelle containing powerful digestive enzymes used to break down cell wastes, food, or engulfed particles
mitochondrion	rod-shaped organelle, in all cells, that produces energy for the cell through respiration
monosaccharide	a single sugar molecule that cannot be broken into smaller, simpler sugars; building blocks for carbohydrates
nucleic acid	the basic building block of DNA and RNA. Structurally made up of a nucleotide base, a sugar molecule, and a phosphate all linked to form a linear chain
nucleotide	the basic structural group of nucleic acids made up of a ribose sugar, a nitrogen base, and a phosphate
nucleus	the central part of the cell that controls the cell and contains genetic material(DNA). The nucleus has 3 parts: the nuclear envelope, the chromatin, and the nucleolus.
Organelle	a specialized cell structure that performs a specific function such as the
osmosis	the diffusion of water across a cell membrane from the area of low solute concentration (high water concentration) to the area of high solute concentration (low water concentration); does not require energy
passive transport	the movement of a substance across a membrane following the electrical or concentration gradient (from high concentration to low concentration); does not require energy; also known as diffusion
photosynthesis	the process plants use to make carbohydrates and oxygen from water and from carbon dioxide in the air in the presence of light
plant cell	eukaryotic cells that make up plant tissues; have cell walls and chloroplasts, but lack centrioles
population	a group of interbreeding plants or animals of the same species that occupy a community or area
producer	an organism that uses the sun to make food for itself
products	substances that are produced from reactants through a chemical reaction
prokaryote	a single celled microorganism, like bacteria, that does not have a nucleus or membrane-bound organelles
protein	a complex organic molecule made up of many amino acids joined by peptide bonds
Reactants	substances that enter a chemical reaction
ribosome	site of protein synthesis
rough endoplasmic reticulum	rough looking part of the endoplasmic reticulum that has ribosomes on its surface; ribosomes cause the rough looking appearance
stomata	a small opening in the bottom of a leaf that allows carbon dioxide and oxygen to diffuse into and out of the leaf
synthesis	a combination of two or more things that form something new
===

*/