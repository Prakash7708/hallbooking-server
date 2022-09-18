const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongodb = require("mongodb");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoClient = mongodb.MongoClient;
const URL = process.env.DB;
const SECRET = process.env.SECRET;
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);


let authenticate = function (req, res, next) {
    //console.log(req.headers.authorization)
    
   if(req.headers.authorization) {
     try {
      let verify = jwt.verify(req.headers.authorization, SECRET);
      if(verify) {
        req.userid = verify._id;
        next();
      } else {
        res.status(401).json({ message: "Unauthorized1" });
      }
     } catch (error) {
      res.json({ message: "🔒Please Login to Continue" });
     }
    } else {
      res.status(401).json({ message: "Unauthorized3" });
    }
};

app.post("/register", async function (req, res) {
    try {
      const connection = await mongoClient.connect(URL);
  
      const db = connection.db("hallbooking");

      const salt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(req.body.password, salt);
      req.body.password = hash;
      await db.collection("users").insertOne(req.body);
      await connection.close();
  
      res.json({
        message: "Successfully Registered",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error",
      });
    }
});

app.post("/login", async function (req, res) {
    try {
      // Open the Connection
      const connection = await mongoClient.connect(URL);
  
      // Select the DB
      const db = connection.db("hallbooking");
  
      // Select the Collection
      const user = await db
        .collection("users")
        .findOne({ username: req.body.username });
  
      if (user) {
        const match = await bcryptjs.compare(req.body.password, user.password);
        if (match) {
          // Token
          // const token = jwt.sign({ _id: user._id }, SECRET, { expiresIn: "1m" });
          const token = jwt.sign({ _id: user._id }, SECRET);
          res.status(200).json({
            message: "Successfully Logged In",
            token,
          });
        } else {
          res.json({
            message: "Password is incorrect",
          });
        }
      } else {
        res.json({
          message: "User not found Please sign in",
        });
      }
    } catch (error) {
      console.log(error);
    }
});


app.post("/Createhotel",async function (req, res) {
    //console.log(req.body)
    try {
      const connection = await mongoClient.connect(URL);
      const db = connection.db("hallbooking");
      
      await db.collection("hotels").insertOne(req.body);
      await connection.close();
      res.json({
        message: "Hotel Added",
      });

    }catch(err){
       console.log(err)
    }

});

app.get("/hotels",async function (req, res) {
  //console.log(req.body)
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("hallbooking");
    
    let hotels=await db.collection("hotels").find().toArray();
    await connection.close();
    res.json(hotels);

  }catch(err){
     console.log(err)
  }

});

app.get("/hotels/:id",async function (req, res) {
  //console.log(req.params.id)
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("hallbooking");
    
    let hotel=await db.collection("hotels").findOne({hotelname:`${req.params.id}`});
    await connection.close();
    res.json(hotel);
  //console.log(hotel)
  }catch(err){
     console.log(err)
  }

});

app.put("/bookRoom/:id",authenticate,async function (req,res){
  //  console.log(req.userid)
  // console.log(req.params.id)
  // console.log(req.body)
  
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("hallbooking");
    let roomno=req.params.id
      //console.log(roomno)
      if(roomno==="s1"){
        await db.collection("hotels").updateOne({_id:mongodb.ObjectId(`${req.body._id}`)},{$set:{s1:true}})
        delete req.body._id
        req.body.RoomNo1=true
        req.body.userid = mongodb.ObjectId(req.userid);
        await db.collection("bookings").insertOne(req.body)
      }else if(roomno==="s2"){
        await db.collection("hotels").updateOne({_id:mongodb.ObjectId(`${req.body._id}`)},{$set:{s2:true}})
        delete req.body._id
        req.body.RoomNo2=true
        req.body.userid = mongodb.ObjectId(req.userid);
        await db.collection("bookings").insertOne(req.body)
      }else if(roomno==="s3"){
        await db.collection("hotels").updateOne({_id:mongodb.ObjectId(`${req.body._id}`)},{$set:{s3:true}})
        delete req.body._id
        req.body.RoomNo3=true
        req.body.userid = mongodb.ObjectId(req.userid);
        await db.collection("bookings").insertOne(req.body)
      }else if(roomno==="d1"){
        await db.collection("hotels").updateOne({_id:mongodb.ObjectId(`${req.body._id}`)},{$set:{d1:true}})
        delete req.body._id
        req.body.DoubleRoomNo1=true
        req.body.userid = mongodb.ObjectId(req.userid);
        await db.collection("bookings").insertOne(req.body)
      }else if(roomno==="d2"){
        await db.collection("hotels").updateOne({_id:mongodb.ObjectId(`${req.body._id}`)},{$set:{d2:true}})
        delete req.body._id
        req.body.DoubleRoomNo2=true
        req.body.userid = mongodb.ObjectId(req.userid);
        await db.collection("bookings").insertOne(req.body)
      }
      await connection.close();
    res.json({
      message: "Room Booked",
    });
  } catch (error) {
    console.log(error);
  }
})

app.get("/bookings",async function (req, res) {
  
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("hallbooking");
    let bookings=await db.collection("bookings").find().toArray();
    await connection.close();
    res.json(bookings);
  }catch(err){
     console.log(err)
  }

});

app.put("/cancelRoom/:id",async function (req,res){
   
  // console.log(req.params.id)
   //console.log(req.body)
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("hallbooking");
    if(req.body.RoomNo1){
      await db.collection("hotels").updateOne({hotelname:`${req.body.hotelname}`},{$set:{s1:false}})
      await db.collection("bookings").deleteOne({_id:mongodb.ObjectId(req.body._id)})
    }else if(req.body.RoomNo2){
      await db.collection("hotels").updateOne({hotelname:`${req.body.hotelname}`},{$set:{s2:false}})
      await db.collection("bookings").deleteOne({_id:mongodb.ObjectId(req.body._id)})
    }else if(req.body.RoomNo3){
      await db.collection("hotels").updateOne({hotelname:`${req.body.hotelname}`},{$set:{s3:false}})
      await db.collection("bookings").deleteOne({_id:mongodb.ObjectId(req.body._id)})
    }else if(req.body.DoubleRoomNo1){
      await db.collection("hotels").updateOne({hotelname:`${req.body.hotelname}`},{$set:{d1:false}})
      await db.collection("bookings").deleteOne({_id:mongodb.ObjectId(req.body._id)})
    }else if(req.body.DoubleRoomNo2){
      await db.collection("hotels").updateOne({hotelname:`${req.body.hotelname}`},{$set:{d2:false}})
      await db.collection("bookings").deleteOne({_id:mongodb.ObjectId(req.body._id)})
    }
    await connection.close();
    res.json({
      message: "Room Unreserved",
    });
  }catch(err){
    console.log(err)
  }

});


app.listen(process.env.PORT || 3001);