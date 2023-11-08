const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser=require('cookie-parser')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app= express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cp7ahlj.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middleware
const logger=(req,res,next)=>{
  console.log( "called",req.host,req.originalUrl);
  next();
}

// const verifyToken=(req,res,next)=>{
//   const token = req.cookies?.token;
//   console.log('value of token',token);
//   if(!token){
//     return(res.status(401).send({message:'not Authorized'}))
//   }
//   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
//     // error
//     if(err){
//       console.log(err);
//       return res.status(401).send({massage: 'unauthorized'})
//     }
//     // if token is valid then it would be decoded
//     console.log('value in the token', decoded);
//     req.user= decoded;
//     next()
//   })
// }



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection= client.db('foodDB').collection('food');
    const requestFoodCollection=client.db('foodDB').collection('requestFood');

    // auth related api
    app.post('/jwt', logger,async(req,res)=>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
      res
      .cookie('token',token,{
        httpOnly:true,
        secure:false,
        
      })
      .send({success:true});

    })

    app.post('/logout',async(req,res)=>{
      const user = req.body;
      console.log("log out",user);
      res.clearCookie('token',{maxAge:0}).send({success:true});
    })

    app.get('/addFood',logger,async(req,res)=>{
      const cursor= foodCollection.find().sort({quantity : -1});
      
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/availableFood/sort',logger,async(req,res)=>{
      const cursor=foodCollection.find().sort({date:1});
      const result= await cursor.toArray();
      res.send(result);
    })

    app.get('/addFood/:id',logger,async(req,res)=>{
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
  

    // request section
    app.get('/requestFood',async(req,res)=>{
       const result=await requestFoodCollection.find().toArray();
      res.send(result);
    })

    app.get('/requestFood/:id',async(req,res)=>{
      const id=req.params.id;
      const query= {_id: new ObjectId(id)};
      const result= await requestFoodCollection.findOne(query);
      res.send(result);
    })

    app.post('/requestFood',async(req,res)=>{
      const singleFood=req.body;
      console.log(singleFood);
      const result=await requestFoodCollection.insertOne(singleFood);
      res.send(result);
    })

    app.delete('/requestFood/:id',async(req,res)=>{
      const id  = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result= await requestFoodCollection.deleteOne(query);
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