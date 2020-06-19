var express=require('express'),
 path = require('path'),
bodyParser = require('body-parser'),
ejs=require('ejs'),
mongoose=require('mongoose'),
User=require('./model.js'),
methodOverride=require('method-override'),
flash=require('connect-flash'),
session=require('express-session'),
cookie=require('cookie-parser');
var app=express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use(cookie('secret'));
app.use(session({
    secret:'Phone-Book',
    resave:true,
    saveUninitialized:true
}));
app.use(flash());

app.use(function(req,res,next){
    res.locals.success_message=req.flash('success_message'),
    res.locals.failure_message=req.flash('failure_message'),
    res.locals.error_message=req.flash('error_message'),
    next();
});

var url='mongodb://localhost/myPhone';
mongoose.connect(url,{useUnifiedTopology: true,useNewUrlParser:true}).then(()=>{
    console.log("DataBase Connected");
});

// User.remove({},function(err){
//     if(err) console.log(err);
// })

app.get('/',function(req,res){

    User.find({},function(err,data){
        if(data){
            // console.log(data);
            return res.render('Homepage',{User:data});
        }
    });
    
});
app.get('/AllView',function(req,res){
    User.find({},function(err,data){
        if(err) console.log(err);
        else{
           return  res.render("data",{data:data});
        }
    }).sort({Name:1})
    
})

app.get('/add',function(req,res){

    res.render('AddContact');
});
app.post('/add',function(req,res){

    var phoneno=req.body.phoneno;
    var email=req.body.email;
    var i,j=0,k,h=0;
    var flag;
    var fphone=[];
    var femail=[];
    var err='';
    let async = () => {
        for(k=0;k<email.length;k++){
            if(email[k]!=''){
                femail[h]=email[k];
                h++;
            }
        }
        for(i=0;i<phoneno.length;i++){
            if(phoneno[i]){
                fphone[j]=phoneno[i];
                j++;
            }
            User.findOne({Phoneno:{$elemMatch:{$eq:phoneno[i]}}},function(err,data){
                if(data && flag!=2){
                    // console.log(data);
                    flag=2;
                    // console.log(flag);
                    err="Phone Number Already Exist!"
                    return res.render('AddContact',{err:err});
                }
                else if(err) {
                    console.log(err);
                    err="Email is required";
                    return res.render('AddContact',{err:err});
                }
                else{
                    if(flag!=2){
                    flag=3;
                    }
                    // console.log(flag);
                }
        })

        }
        setTimeout(()=>{
            if(flag==3){
                User({
                    Email:femail,
                    Name:req.body.name,
                    DOB:req.body.DOB,
                    Phoneno:fphone
                }).save((err,data)=>{
                    if(err) {
                        console.log(err);
                        // err="Email required";
                        // return res.render('AddContact',{err:err});
                    }
                    else{
                        // console.log("Saved successfully" + data);
                        var success="Added successfully";
                        return res.render('AddContact',{success:success});
                    }
                });
            }
        },2000
        );
    }
    async();
});

app.get('/details/:id',function(req,res){
    var id=req.params.id;
    User.findOne({_id:id},function(err,data){
        if(data){
            return res.render('details',{data:data});
        }
        if(err) console.log(err);
    })
})

app.get('/edit/:id',function(req,res){

    var id=req.params.id;
    User.findOne({_id:id},function(err,data){
        if(data){
            return res.render('edit',{data:data});
        }
        if(err) console.log(err);
    })
})
app.put('/edit/:id',function(req,res){
    var id=req.params.id;
    var newRecord={
        Name:req.body.name,
        Email:req.body.email,
        DOB:req.body.DOB,
        Phoneno:req.body.phoneno
    }
    var email=req.body.email;
    var phoneno=req.body.phoneno;
    var fphone=[];
    var femail=[];
    var i,j=0,k,h=0;
    var flag;
    let async = () => {
        for(k=0;k<email.length;k++){
            if(email[k]!=''){
                femail[h]=email[k];
                h++;
            }
        }
        for(i=0;i<phoneno.length;i++){
            if(phoneno[i]){
                fphone[j]=phoneno[i];
                j++;
            }
            User.findOne({Phoneno:{$elemMatch:{$eq:phoneno[i]}},_id:{$ne: id}},function(err,data){
                if(data && flag!=2){
                    // console.log(data);
                    flag=2;
                    // console.log(flag);
                    req.flash('failure_message','Phone Number Already Exist!');
                    return res.redirect('/edit/' + id);
                }
                else if(err) {
                    return console.log(err);
                }
                else{
                    if(flag!=2){
                    flag=3;
                    }
                    // console.log(flag);
                }
            });
        }
        setTimeout(()=>{
            if(flag==3){
                newRecord={
                    Name:req.body.name,
                    Email:femail,
                    DOB:req.body.DOB,
                    Phoneno:fphone
                }
                User.findByIdAndUpdate(id,newRecord,function(err,updateData){
                    if(err) console.log(err);
                    else{
                        res.redirect('/details/'+id);
                    }
                })
            }
        },2000
        );
    }
    async();
    
})
app.get('/delete/:id',function(req,res){
    var id=req.params.id;
    User.findByIdAndDelete(id,function(err){
        if(err) console.log(err);
        else{
            // console.log("Deleted Contact");
            User.find({},function(err,data){
                if(err) console.log(err);
                else{
                    req.flash('success_message','Deleted Successfully');
                    res.redirect('/AllView');  
                }
            })
           
        }
    })
})
app.listen(process.env.PORT || 8888, process.env.ID, function(req,res){
    console.log("Server started...");
});