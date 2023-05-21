const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p9pdn5v.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db("toyStoreDB").collection("toys");


    const indexKeys = {toyName: 1}
    const indexOptions = {name: 'toyNames'}

    const result = await toysCollection.createIndex(indexKeys, indexOptions)

    // To get all toys

    app.get("/all_toys", async (req, res) => {
      console.log(req.query);
      let query = {};
      let sortedBy = {};
      let limit = 20;
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }

      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    // Search toy by name

    app.get('/toys/:name', async(req, res)=>{
      const searchText = req.params.name;
      console.log(searchText);
      const result = await toysCollection.find({toyName: {$regex: searchText, $options: 'i'}}).toArray()
      res.send(result)

    })

    // For displaying single toy details

    app.get("/all_toys/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    // category wise data display

    app.get('/sub_category/:category', async(req, res) =>{
        const category = req.params.category;
        console.log(category)
        if(category === "Avengers" || category === "Transformers" || category === "Star trek"){
          const result = await toysCollection.find({subCategory: category}).toArray()
          return res.send(result)
        }
    })

    // Adding data to database

    app.post("/all_toys", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    });

    // Delete toy data from my toy page

    app.delete("/all_toys/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("MyHeroes Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
