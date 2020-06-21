const { getMaxListeners } = require('process');

var express=require('express'),
 path = require('path'),
bodyParser = require('body-parser'),
ejs=require('ejs'),
mongoose=require('mongoose'),
User=require('./model.js'),
LoginUser=require('./LoginData.js'),
methodOverride=require('method-override'),
session=require('express-session'),
cookie=require('cookie-parser'),

passport=require('passport'),
localStrategy=require('passport-local').Strategy,
bcrypt=require('bcryptjs'),
flash=require('connect-flash');
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
    res.locals.error=req.flash('error'),
    next();
});
app.use(passport.initialize());
app.use(passport.session());

var url="mongodb://ashma:%Matters4@cluster0-shard-00-00-dnxyl.mongodb.net:27017,cluster0-shard-00-01-dnxyl.mongodb.net:27017,cluster0-shard-00-02-dnxyl.mongodb.net:27017/<dbname>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(url,{useUnifiedTopology: true,useNewUrlParser:true}).then(()=>{
    console.log("DataBase Connected");
});

var checkAuthent=function(req,res,next){
    if(req.isAuthenticated()){
        res.set('Cache-Control', 'no-cache,privete,no-store,must-revalidate,post-check=0,pre-checked=0');
        return next();
    }
    else{
        req.flash('failure_message',"You Need to Login First");
        return res.redirect('/login');
    }
}

// User.remove({Email:"ishika@gmail.co"},function(err){
//     if(err) console.log(err);
// })
// LoginUser.remove({UserEmail:"ishika@gmail.co"},function(err){
//     if(err) console.log(err);
// })
app.get('/',checkAuthent,function(req,res){
    User.find({},function(err,data){
        if(data){
            // console.log(data);
            return res.render('Homepage',{User:data,user:req.user});
        }
    });
    
});
app.get('/AllView',checkAuthent,function(req,res){
    User.find({},function(err,data){
        if(err) console.log(err);
        else{
           return  res.render("data",{data:data,user:req.user});
        }
    }).sort({Name:1})
    
})

app.get('/add',checkAuthent,function(req,res){

    res.render('AddContact',{user:req.user});
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

app.get('/details/:id',checkAuthent,function(req,res){
    var id=req.params.id;
    User.findOne({_id:id},function(err,data){
        if(data){
            return res.render('details',{data:data,user:req.user});
        }
        if(err) console.log(err);
    })
})

app.get('/edit/:id',checkAuthent,function(req,res){

    var id=req.params.id;
    User.findOne({_id:id},function(err,data){
        if(data){
            return res.render('edit',{data:data,user:req.user});
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
app.get('/delete/:id',checkAuthent,function(req,res){
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


//User Login,signup and logout Portals


app.get('/signup',function(req,res){
    LoginUser.find({},function(err,data){
        console.log(data);
    })
    res.render('SignUp.ejs');
})
app.post('/signup',function(req,res){
    var {email,name,password,cpassword,DOB,phoneno}=req.body;
    var err;
    // if(!email || !name || !password ||!cpassword || !phone){
    //     err="Fill All Fields";
    //     return res.render('SignUp.ejs',{err:err});
    // }

    if(password!=cpassword){
        err="Password Doesn't Match";
        return res.render('SignUp.ejs',{err:err});
    }
    if(typeof err=='undefined'){

        // Check if Number is already not registered to any other customer(Not in just "LoginUser" but "User" also) who had even multiple numbers registered to their names
        User.findOne({Phoneno:{$elemMatch:{$eq:phoneno}}},function(err,data){
            if(data){
                err="PLease Check Your Number";
                res.render('SignUp',{err:err});
            }
            else if(err) console.log(err);

            // if no such number is already exists then
            else{

                // check for if some registered through same email id (LoginUser)
                LoginUser.findOne({UserEmail:email},(err,data)=>{
                    if(err){ console.log(err);}
                    if(data){
                        err="Data already exist.";
                        res.render('SignUp',{err:err});
                    }
                    // If not such email id is present in database then allow LoginUser to signup
                    else{
                        bcrypt.genSalt(10, (err,salt)=>{
                            if(err){ console.log(err);}
                            bcrypt.hash(password, salt, (err,hash)=>{
                                if(err){ console.log(err);}
                                password=hash;
                                //if a user signup successfully also save its data in User by default.
                                User({
                                    Name:name,
                                    Email:email.toLowerCase(),
                                    DOB:DOB,
                                    Phoneno: phoneno
                                }).save((err,data)=>{
                                    if(err) console.log(err);
                                });
                            LoginUser({
                                UserEmail:email.toLowerCase(),
                                UserPassword:password,
                                UserName:name,
                                UserDOB:DOB,
                                UserPhone:phoneno
                            }).save((err,data)=>{
                                if(err){ console.log(err);}
                                req.flash('success_message',"Registered successfully and ata has been added to Phonebook!");
                                res.redirect('/login');
                            });
                        });
                        });
                    }
                });
            }
        });

    }
    
})

//authentication 
passport.use(new localStrategy({usernameField:'email'},(email,password,done)=>{
    LoginUser.findOne({UserEmail:email},(err,data)=>{
        if(err){
            console.log("there is an error");
            console.log(err);
        }
        
        if(!data){
            return done(null, false, {message:"Email is not Registered."});
        }
        bcrypt.compare(password,data.UserPassword,(err,match)=>{
            if(err){
                console.log("One more error");
                console.log(err);
                return done(null,false);
            }
            if(!match){
                return done(null,false, {message:"Invalid email or password."});
            }
            if(match){
                return done(null,data);
            }
        });
    });
}));


passport.serializeUser(function(LoginUser,cb){
    cb(null,LoginUser.id);
});
passport.deserializeUser(function(id,cb){
    LoginUser.findById(id,function(err,LoginUser){
        cb(err,LoginUser);
    });
});

// authentication strategy ends here
app.get('/login',function(req,res){
    res.render('Login');
})


app.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        failureRedirect: '/login',
        successRedirect: '/',
        failureFlash: true,
    })(req,res,next);
});


app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
});
app.listen(process.env.PORT || 8888, process.env.ID, function(req,res){
    console.log("Server started...");
});