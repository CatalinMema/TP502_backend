const express = require('express');
const mangoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const port = 5000;
const app = express();
app.use(express.json())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
const connectDb = async() => {
    try{
        await mangoose.connect("mongodb+srv://user1:user1@tp502.lob2q.mongodb.net/cookbook?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("MongoDb connection SUCCES");
    }catch(error){
        console.log("MongoDb connection Fail");
    }
}
connectDb();

//schema for recipe
const recipeSchema = new mangoose.Schema({
    title:{
        type: String,
        required: true
    },
    ingredients:{
        type: String,
        required: true
    },
    time:{
        type: Number,
        required: true
    },
    preparation_mode:{
        type: String,
        required: true
    },
    userEmail:{
        type: String
    }
})

const Recipe = mangoose.model('recipe', recipeSchema);

//routes for recipes
app.get("/recipes/:email",(req,res)=>{
    Recipe.find({"userEmail" : req.params.email}).then(recipe => res.json(recipe))
})

app.get('/recipes/:email/page/:nr_skips',(req,res)=>{
    const skipsElements=req.params.nr_skips;
    Recipe.find({"userEmail" : req.params.email}).skip(Number(skipsElements)).limit(10).then(recipe => res.json(recipe))
})

app.get('/recipes/recipe/:_id',(req,res)=>{
    Recipe.findById(req.params._id).then(recipe => res.json(recipe));
})
app.post("/recipes",async (req,res) => {
    const newRecipe = new Recipe({
        title:req.body.title,
        ingredients:req.body.ingredients,
        time:req.body.time,
        preparation_mode:req.body.preparation_mode,
        userEmail:req.body.userEmail
    });
    try {
        await newRecipe.save();
        res.send("Recipe added")
    } catch (error) {
        console.log(error);
        res.send(error)
    }
    //newRecipe.save().then(recipe=> res.json(recipe));
})
  
//schma for user
const userSchema = new mangoose.Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})

userSchema.statics.findUser = async function (email,password){
    const user = await User.findOne({email});
    if(!user){
        return null;
    }
    const passwordsMatch = await bcrypt.compare(password,user.password);
    if(!passwordsMatch){
        return null;
    }
    return user;
}
//before save
userSchema.pre('save', async function(next){
    const user = this;
    if (user.isModified("password")){
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
})
//model
const User = mangoose.model('user', userSchema);

//routes for user
app.get('/user',(req,res)=>{
    res.json({
        msg:'hello'
    })
})

app.post("/authentication/signin", async (req,res)=>{
    const email = req.body.email;
    const password= req.body.password;
    const user = await User.findUser(email,password);
    if(user){
        req.session.user=user._id;
        res.json({
            message:"You are log in",
            auth: true,
            emailOfUser:email
        })
    }
    else{
        res.json({
            message:"Not able to log you in",
            auth:false,
        })
    }
})

app.post("/authentication/signup",(req,res)=>{
    console.log(req.body)
    const user = new User(req.body)
    req.session.user=user._id;
  user.save().then((result)=>{
      res.json({
          message:"SignUp Succes",
          auth:true,
          emailOfUser:req.body.email
      });
  })
  .catch((error)=>{
    res.json({
        message:"SignUp Fail",
        auth:false,
    });
  })
})

app.get("/authentication/signedin",(req,res)=>{
    if(req.session.user){
        return res.json({
            message:'Signed in',
            auth: true,

        });
    }
    return res.json({
        message:'Not loged in',
        auth:false,
    })
})

app.get("/authentication/signout",(req,res)=>{
    req.session.destroy();
    res.json({
        auth:false,
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })