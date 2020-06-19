var mongoose=require('mongoose');

var UserSchema=mongoose.Schema({
    Email:[{
        type:String,
        required:true
    }],
    Name:{
        type:String,
        required:true
    },
    DOB:{
        type:String,
        required:true
    },
    Phoneno:[{
        type:Number,
        required:true
    }]
});

module.exports=new mongoose.model('User',UserSchema);