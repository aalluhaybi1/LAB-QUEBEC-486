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

async function getQuebecData() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    const result = await client.db("lab-quebec").collection("lab-quebec-1").find().toArray();
    console.log("Mongo call await inside function: ", result);
    return result;
  } catch (err) {
    console.log("getQuebecData() error: ", err);
    throw err; // Propagate the error to the caller
  } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
  }
}

// Reading from MongoDB
app.get('/', async (req, res) => {
  try {
    let result = await getQuebecData();
    console.log("getQuebecData() Result: ", result);

    res.render('index', {
      pageTitle: "Ayman's saws",
      QuebecData: result
    });
  } catch (err) {
    console.error("Error in GET /:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Create to MongoDB
app.post('/addSaw', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("lab-quebec").collection("lab-quebec-1");

    // Draw from body parser
    console.log(req.body);

    await collection.insertOne(req.body);
    res.redirect('/');
  } catch (err) {
    console.error("Error in POST /addSaw:", err);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
});

// Other CRUD routes...

app.listen(port, () => {
  console.log(`Ayman saws (quebec) app listening on port ${port}`);
});
