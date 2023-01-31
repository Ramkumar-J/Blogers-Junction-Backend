const express=require("express");
const cors=require("cors");
const mongodb=require("mongodb");
const app=express();
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://blogers-junction.netlify.app",
      ],
}))
app.use(express.json());
const mongoclient=mongodb.MongoClient;
const URL="mongodb+srv://ramrk:blog123@cluster0.b0drx.mongodb.net/?retryWrites=true&w=majority";

app.post("/createblog",async (req,res) => {
   try {
    let connection=await mongoclient.connect(URL);
    let db=connection.db("blogersjunction");
    await db.collection("blogs").insertOne(req.body);
    await connection.close();
    res.json({message:"Blog Created successfully"});
   } catch (error) {
    res.status(500).json({message:"Something went wrong"});
   }
})

app.get("/blogs",async (req,res) => {
    try {
        let connection=await mongoclient.connect(URL);
        let db=connection.db("blogersjunction");
        let allblogs=await db.collection("blogs").find().toArray();
        await connection.close();
        res.json(allblogs);
    } catch (error) {
        res.status(500).json({message:"Something went wrong"});
    }
})

app.get("/blogs/:id",async (req,res) => {
    try {
       let connection=await mongoclient.connect(URL); 
       let db=connection.db("blogersjunction");
       let singleblog=await db.collection("blogs").findOne({_id:mongodb.ObjectId(req.params.id)});
       await connection.close();
       res.json(singleblog);
    } catch (error) {
        res.status(500).json({message:"Something went wrong"});
    }
})

const port=process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Web server on at ${port}`);
});