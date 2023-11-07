const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app= express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cp7ahlj.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection= client.db('foodDB').collection('food');
    const requestFoodCollection=client.db('foodDB').collection('requestFood');


    app.get('/addFood',async(req,res)=>{
      const cursor= foodCollection.find().sort({quantity : -1});
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/availableFood/sort',async(req,res)=>{
      const cursor=foodCollection.find().sort({date:1});
      const result= await cursor.toArray();
      res.send(result);
    })

    app.get('/addFood/:id',async(req,res)=>{
      const id= req.params.id;
      const query= {_id: new ObjectId(id)};
      const result= await foodCollection.findOne(query);
      res.send(result)
    })

    app.post('/addFood', async(req,res)=>{
        const newFood= req.body;
        console.log(newFood);
        const result= await foodCollection.insertOne(newFood);
        res.send(result);
    })

    app.delete('/addFood/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result= await foodCollection.deleteOne(query);
        res.send(result);
    })

    // update
    app.put('/addFood/:id',async(req,res)=>{
      const id=req.params.id;
      const filter= {_id: new ObjectId(id)}
      const options = {upsert:true}
      const updateFood=req.body
      const Food={
        $set:{
          name:updateFood.name,
          photo:updateFood.photo,
          quantity:updateFood.quantity,
          location:updateFood.location,
          date:updateFood.date,
          notes:updateFood.notes,


        }
      }
      const result= await foodCollection.updateOne(filter,Food,options);
      res.send(result);
     
    })
  //  {name,photo,quantity,location,date,notes

    // request section
    app.get('/requestFood',async(req,res)=>{
      const cursor= requestFoodCollection.find();
      const result=await cursor.toArray();
      res.send(result);
    })



    app.post('/requestFood',async(req,res)=>{
      const singleFood=req.body;
      console.log(singleFood);
      const result=await requestFoodCollection.insertOne(singleFood);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('food share server is running...')
});


app.listen(port,()=>{
    console.log(`food share is running port: ${port}`);
})