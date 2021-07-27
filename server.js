const express = require('express');
const mangoose = require("mongoose");
const port = 5000;
const app = express();
app.use(express.json())

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
})

const Recipe = mangoose.model('recipe', recipeSchema);


app.get("/recipes",(req,res)=>{
    Recipe.find().then(recipe => res.json(recipe))
})

app.get('/recipes/page/:nr_skips',(req,res)=>{
    const skipsElements=req.params.nr_skips;
    Recipe.find().skip(Number(skipsElements)).limit(10).then(recipe => res.json(recipe))
})

app.get('/recipes/recipe/:_id',(req,res)=>{
    Recipe.findById(req.params._id).then(recipe => res.json(recipe));
})
app.post("/recipes",async (req,res) => {
    const newRecipe = new Recipe({
        title:req.body.title,
        ingredients:req.body.ingredients,
        time:req.body.time,
        preparation_mode:req.body.preparation_mode
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

app.get('/ss', (req, res) => {
    res.send('Hello World!')
  })
  

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })