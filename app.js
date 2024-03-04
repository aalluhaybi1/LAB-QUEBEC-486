require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function getChainsawData() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    const result = await client.db("lab-quebec").collection("lab-quebec-1").find().toArray();
    console.log("mongo call await inside f/n: ", result);
    return result;
  } catch (err) {
    console.log("getChainsawData() error: ", err);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

// Reading from mongo
app.get('/', async (req, res) => {
  let result = await getChainsawData().catch(console.error);

  console.log("getChainsawData() Result: ", result);

  res.render('index', {
    pageTitle: "barry's saws",
    chainsawData: result
  });
});

// Create to mongo
app.post('/addSaw', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("lab-quebec").collection("lab-quebec-1");

    // Draws from body parser
    console.log(req.body);

    await collection.insertOne(req.body);
    res.redirect('/');
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

app.post('/updateDrink/:id', async (req, res) => {
  try {
    console.log("req.params.id: ", req.params.id);
    await client.connect();
    const collection = client.db("chillAppz").collection("drinkz");
    let result = await collection.findOneAndUpdate(
      { "_id": ObjectId(req.params.id) },
      { $set: { "size": "REALLY BIG DRINK" } }
    )
      .then(result => {
        console.log(result);
        res.redirect('/');
      })
      .catch(error => console.error(error));
  } finally {
    await client.close();
  }
});

app.post('/deleteDrink/:id', async (req, res) => {
  try {
    console.log("req.params.id: ", req.params.id);
    await client.connect();
    const collection = client.db("chillAppz").collection("drinkz");
    let result = await collection.findOneAndDelete(
      { "_id": ObjectId(req.params.id) }
    )
      .then(result => {
        console.log(result);
        res.redirect('/');
      })
      .catch(error => console.error(error));
  } finally {
    await client.close();
  }
});

app.get('/name', (req, res) => {
  console.log("in get to slash name:", req.query.ejsFormName);
  myTypeServer = req.query.ejsFormName;

  res.render('index', {
    myTypeClient: myTypeServer,
    myResultClient: "myResultServer"
  });
});

app.listen(port, () => {
  console.log(`barrys saws (quebec) app listening on port ${port}`);
});
