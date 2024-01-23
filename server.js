const express = require('express');
const app = express();

app.use(express.json())
app.set('port', 3000)
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Origin-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Origin-Headers", "Access-Control-Allow-Origin-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
})

const MongoClient = require('mongodb').MongoClient;


// Connect to MongoDB
let db;
MongoClient.connect('mongodb+srv://krishKal:lionking@cluster0.hykpngx.mongodb.net', (err, client) => {
    db = client.db('afterSchool');
});

// GET /lessons endpoint
// app.get('/lessons', (req, res) => {
//     db.collection('lessons').find({}).toArray((err, results) => {
//         if (err) throw err;
//         res.json(results);
//     });
// });

app.param('collectionName', (req, res, next, collectionName) =>{
    req.collection = db.collection(collectionName)
    return next()
})

app.get('/collection/:collectionName', (req,res,next) =>{
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
});
// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
