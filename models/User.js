const mongoose = require('mongoose');

//User Schema 
const UserSchema = mongoose.Schema({
    email:{ type: String, required: true, unique: true 
        
    },
    password:{ type: String, required: true 
        
    },
    
    profile:
    {
        name: String,
        grade: Number
    }
});

const User = module.exports = mongoose.model('User', UserSchema);