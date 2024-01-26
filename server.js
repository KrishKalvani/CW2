const express = require('express');
const app = express();

app.use((req, res, next) => { //logger middleware, used for debugging
    const now = new Date();
    console.log(`${now.toLocaleString()} - ${req.method} Request to ${req.url}`);
    next();
});

app.use(express.json())
app.set('port', 3000)
app.use((req,res,next)=>{ //used for the CORS error
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


//reference for express.static - https://expressjs.com/en/starter/static-files.html
app.use('/static', express.static('public')) //displays in the html. Middleware thats telling express that any URL that has /static at the end, should look into the public directory.
app.use('/images', express.static('images'))//displays the images. Similar to the previous line but it tells express to access the images directory.
app.use('/images', (req, res) => { //error handling, test with postman
    res.status(404).send('Image not found');
});

//GET /lessons endpoint
app.get('/lessons', (req, res) => { //defining the route on the server for a get request on /lessons
    db.collection('lessons').find({}).toArray((err, results) => { //querying the DB for all the documents in the lessons collection
        if (err) throw err;
        res.json(results); //send results to client as JSON data
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
