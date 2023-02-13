const express=require("express");
const cors=require("cors");
const mongodb=require("mongodb");
const bcryptjs=require("bcryptjs");
const jwt=require("jsonwebtoken");
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

// Signup or Register
app.post("/signup", async (req,res) => {
try{
   // Open the connection or Server connect with Database
   let connection= await mongoclient.connect(URL);
   // Select the Database
   let db=connection.db("blogersjunction");
   // Hash Mechanism
   let salt=bcryptjs.genSaltSync(10);
   let hash=bcryptjs.hashSync(req.body.password,salt);
   req.body.password=hash;
   // Select the Database Collection and Do Request operation
   await db.collection("users").insertOne(req.body);
   // Close the connection
   await connection.close();
   // Response
   res.json({message:"User Registered successfully"});
}
catch (error){
   res.status(500).json({message:`Something went wrong : ${error}`})
}
})

// Signin or Login
app.post("/signin", async (req,res) => {
    try{
       // Open the connection or Server connect with Database
       let connection= await mongoclient.connect(URL);
       // Select the Database
       let db=connection.db("blogersjunction");
       // Select the Database Collection and Do Request operation
       let user=await db.collection("users").findOne({email:req.body.email});
       if(user){
        let usercheck=bcryptjs.compareSync(req.body.password,user.password);
        if(usercheck){
            // Generate Token
            let token = jwt.sign({username:user.username,id:user._id}, 'thisissecretkey');
            res.json({jwttoken:token});
            return;
        }
        else{
            res.status(401).json({message:"Credential not found"})
        }
       }
       else{
        res.status(401).json({message:"Credential not found"})
       }
       // Close the connection
       await connection.close();
       // Response
       res.json({message:"User Login successfully"});
    }
    catch (error){
       res.status(500).json({message:"Something went wrong"})
    }
    })

// app.post("/signin", async (req,res) => {
//     try {
//       let connection=await mongoClient.connect(URL);
//       let db=connection.db("blogersjunction");
//       let userinfo=await db.collection("users").findOne({email:req.body.email});
//       if(userinfo){
//         let compare=bcryptjs.compareSync(req.body.password,userinfo.password);
//         if(compare){
//           let token = jwt.sign({name:userinfo.username,id:userinfo._id}, "thisissecretkey");
//           res.json({jwtToken:token});
//           return;
//         }
//         else{
//           res.status(401).json({message:"Credential not found"})
//         }
//       }
//       else{
//         res.status(401).json({message:"Credential not found"})
//       }
//       await connection.close();
//       res.json({message:"Login Successfully"});
//     } catch (error) {
//       res.status(500).json({message:"Something went wrong"});
//     }
//   });

    // Authentication 
function authenticate(req,res,next){
    if(req.headers.authorization){
        let decoded = jwt.verify(req.headers.authorization, 'thisissecretkey');
        if(decoded){
            next();
        }else{
            res.status(400).json({message:'Unauthorized'});
        }
    }else{
        res.status(400).json({message:'Unauthorized'});
    }
}

app.post("/createblog",authenticate, async (req,res) => {
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

app.get("/blogs",authenticate, async (req,res) => {
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

app.get("/blogs/:id",authenticate, async (req,res) => {
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