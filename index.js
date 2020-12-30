const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l8f7h.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000



const app = express()



app.use(cors());
app.use(bodyParser.json());



var serviceAccount = require("./configs/burj-al-arab-fde98-firebase-adminsdk-4ybjs-c5b918e4ad.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});



const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology : true});
client.connect(err => {
  const booking = client.db("burjAlArab").collection("booking");
  app.post('/addBooking',(req,res) =>{
    const newBooking = req.body;
    booking.insertOne(newBooking)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
    
  })
  app.get('/booking',(req, res) =>{
    const bearer=req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1];
        // console.log({idToken});
        // idToken comes from the client app
        admin.auth().verifyIdToken(idToken)
            .then(function (decodedToken) {
              const tokenEmail = decodedToken.email;
              const queryEmail = req.query.email;
              // console.log(tokenEmail,queryEmail);
              if(tokenEmail ==  queryEmail) {
                booking.find({email: queryEmail})
                  .toArray((err,documents) =>{
                    res.status(200).send(documents);
                })
              }
              else{
                res.status(401).send('un-authorized access')
              }
            })
            .catch(function (error) {
              // Handle error
              res.status(401).send('un-authorized access');
            });
    }
    else{
      res.status(401).send('un-authorized access');
    }
  })
});


app.listen(port)