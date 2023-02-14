const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "https://blogers-junction.netlify.app"],
  })
);
app.use(express.json());
const mongoclient = mongodb.MongoClient;
const URL =
  "mongodb+srv://ramrk:blog123@cluster0.b0drx.mongodb.net/?retryWrites=true&w=majority";

// Signup or Register
app.post("/signup", async (req, res) => {
  try {
    let connection = await mongoclient.connect(URL);
    let db = connection.db("blogersjunction");
    let salt = bcryptjs.genSaltSync(10);
    let hash = bcryptjs.hashSync(req.body.password, salt);
    req.body.password = hash;
    await db.collection("users").insertOne(req.body);
    await connection.close();
    res.json({ message: "User Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: `Something went wrong : ${error}` });
  }
});

// Signin or Login
app.post("/signin", async (req, res) => {
  try {
    let connection = await mongoclient.connect(URL);
    let db = connection.db("blogersjunction");
    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      let usercheck = bcryptjs.compareSync(req.body.password, user.password);
      if (usercheck) {
        let token = jwt.sign(
          { username: user.username, id: user._id },
          "blogappkey"
        );
        res.json({ jwttoken: token });
        return;
      } else {
        res.status(401).json({ message: "Credential not found" });
      }
    } else {
      res.status(401).json({ message: "Credential not found" });
    }
    await connection.close();
    res.json({ message: "User Login successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Authentication
function authenticate(req, res, next) {
  if (req.headers.authorization) {
    let decoded = jwt.verify(req.headers.authorization, "blogappkey");
    if (decoded) {
      next();
    } else {
      res.status(400).json({ message: "Unauthorized" });
    }
  } else {
    res.status(400).json({ message: "Unauthorized" });
  }
}

// Create Blogs
app.post("/createblog", authenticate, async (req, res) => {
  try {
    let connection = await mongoclient.connect(URL);
    let db = connection.db("blogersjunction");
    await db.collection("blogs").insertOne(req.body);
    await connection.close();
    res.json({ message: "Blog Created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get All Blogs
app.get("/blogs", authenticate, async (req, res) => {
  try {
    let connection = await mongoclient.connect(URL);
    let db = connection.db("blogersjunction");
    let allblogs = await db.collection("blogs").find().toArray();
    await connection.close();
    res.json(allblogs);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get one blog using Id
app.get("/blogs/:id", authenticate, async (req, res) => {
  try {
    let connection = await mongoclient.connect(URL);
    let db = connection.db("blogersjunction");
    let singleblog = await db
      .collection("blogs")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    await connection.close();
    res.json(singleblog);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Web server on at ${port}`);
});
