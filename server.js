const { MongoClient, ObjectId } = require('mongodb')
const express = require('express');
require("dotenv").config();
const app = express()
const URI = process.env.MONGO_URI
const PORT = process.env.PORT
app.use(express.json())

const client = new MongoClient(URI)

app.get('/', (req, res)=> {
    res.send('Bienvenido a tu organizador de tareas.');
});
       
app.get("/TasksList", async (req, res)=> {
    try {
        await client.connect()
        const db = client.db('TasksList')
        const collection = db.collection("Tasks")
        const result = await collection.find().toArray();
        console.log(result)  
        res.send(result)
    }catch(error){
        return error;
    }
});

app.get("/TasksList/Complete", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("TasksList");
    const collection = db.collection("Tasks");
    const filter = { state: true };
    const result = await collection.find(filter).toArray();
    console.log(result);
    res.send(result);
  } catch (error) {
    return error;
  }
});

app.get("/TasksList/Incomplete", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("TasksList");
    const collection = db.collection("Tasks");
    const filter = { state: false };
    const result = await collection.find(filter).toArray();
    console.log(result);
    res.send(result);
  } catch (error) {
    return error;
  }
});

app.post("/CreateTask", async (req, res) => {
  try {
    const { title } = req.body;
    const { description } = req.body;
    const newTask = {
      title,
      description,
      state: false,
    };

    await client.connect();
    const db = client.db("TasksList");
    const collection = db.collection("Tasks");
    const result = await collection.insertOne(newTask);

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to create task" });
  } finally {
    await client.close();
  }
});

app.delete('/Delete/Task/:id', async (req, res)=> {
    const id = req.params.id
    try{
        const db = client.db('TasksList');
        const collection = db.collection('Tasks')
        const result = await collection.deleteOne({_id: new ObjectId(id)})   
        res.send(result)
    }catch(error){
        return error;
    }
});

app.delete('/Delete/AllTasks', async (req, res) => {

  try {
    const db = client.db('TasksList');
    const collection = db.collection('Tasks');
    const result = await collection.deleteMany({});

    res.send(result);
  } catch (error) {
    return error;
  }
});

app.put('/Update/Title/:id', async (req, res)=> {
    const id = req.params.id
    const {title} = req.body
    try{
        const db = client.db('TasksList');
        const collection = db.collection('Tasks')
        const result = await collection.updateOne({_id: new ObjectId(id)}, {$set:{title}})   
        res.send(result)
    }catch(error){
        return error;
    }
});

app.put('/Update/Description/:id', async (req, res)=> {
    const id = req.params.id
    const {description} = req.body
    try{
        const db = client.db('TasksList');
        const collection = db.collection('Tasks')
        const result = await collection.updateOne({_id: new ObjectId(id)}, {$set:{description}})   
        res.send(result)
    }catch(error){
        return error;
    }
});

app.put('/Update/State/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const db = client.db('TasksList');
    const collection = db.collection('Tasks');

    const task = await collection.findOne({ _id: new ObjectId(id) });
    const currentState = task.state;
    const updatedState = !currentState;
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { state: updatedState } });

    res.send(result);
  } catch (error) {
    return error;
  }
});

app.listen(PORT, ()=>{
    console.log(`http://localhost:${PORT}`)
});