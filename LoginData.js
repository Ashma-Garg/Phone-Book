var mongoose=require('mongoose');

var Schema=mongoose.Schema({
    UserEmail:{
        type:String,
        required:true        
    },
    UserName:{
        type:String,
        required:true
    },

    UserPassword:{
        type:String,
        required:true
    },
    UserDOB:{
        type:String
    },
    UserPhone:{
        type:Number,
        required:true
    }
});

module.exports=new mongoose.model('LoginUser',Schema);