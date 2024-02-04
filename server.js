const express = require('express'); //using npm install express to use that as our server
const app = express();

app.use((req, res, next) => { //logger middleware, used for debugging, we will see this in the aws pipeline website, we can download the logs there.
    const now = new Date(); //storing the current date in the now variable
    console.log(`${now.toLocaleString()} - ${req.method} Request to ${req.url}`); //logging the date/time in a readable format along with request methof and the queried url.
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

//used npm install mongodb to get the connection
const MongoClient = require('mongodb').MongoClient;


//connect to MongoDB
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




//POST /orders endpoint. We receive the order from the fetch in lessons.js and we put it in the order collection.
app.post('/orders', (req, res) => { //this will extract the orderData (created in lessons.js) from the req.body
    const orderData = req.body; // Includes name, phoneNumber, and cart

    db.collection('orders').insertOne(orderData, (err, result) => { //insert orderData into orders collection
        if (err) {
            console.error(err);
            res.status(500).send("Error saving the order.");
            return;
        }
        //if successful, status code is 201 and this message is recieved in the console.
        res.status(201).send({ message: 'Order saved', id: result.insertedId });
    });
});




//we receive the spaceUpdates array over here and we update it with PUT
// app.put('/lessons/update-spaces', (req, res) => {
//     const updates = req.body;
  
//     //The server processes each update using Promise.all() to ensure all updates are completed. 
//     //If successful, it responds with a message indicating the spaces were updated.
//     Promise.all(updates.map(update => {
//       return db.collection('lessons').updateOne(
//         { id: update.lessonId },
//         { $inc: { spaces: -update.decrement } }
//       );
//     }))
//     .then(result => {
//       res.json({ message: 'Spaces updated', result });
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).send('Error updating spaces');
//     });
//   });

  app.put('/lessons/update-spaces', (req, res) => { //doing validation here to make sure when testing with postman, the spaces don't go below 0
    const updates = req.body;

    //create a sequence of promises for each update operation
    const updatePromises = updates.map(update => {
        //find the lesson to check current spaces
        return db.collection('lessons').findOne({ id: update.lessonId }).then(lesson => {
            if (!lesson) {
                throw new Error(`Lesson with ID ${update.lessonId} not found.`);
            }
            //check if the operation will result in negative spaces
            if (lesson.spaces - update.decrement < 0) {
                throw new Error(`Spaces for lesson ID ${update.lessonId} can't go below 0.`);
            }
            //if the check passes, proceed to update the lesson spaces
            return db.collection('lessons').updateOne(
                { id: update.lessonId },
                { $inc: { spaces: -update.decrement } }
            );
        });
    });

    Promise.all(updatePromises)
        .then(() => res.json({ message: 'Spaces updated successfully' }))
        .catch(err => {
            console.error(err);
            //send the custom error message if spaces go below 0
            res.status(400).send(err.message);
        });
});



  



  //searching - define a GET route
  app.get('/search', (req, res) => {
    const searchQuery = req.query.q || ''; //extracting a search query
    
    //here we query the mongoDB searching in the lessons collection
    db.collection('lessons').find({ 
      $or: [ //this 'or' performs a logical OR operation to match the documents to search by either subject or location.

      //searches for lessons where the subject field matches the searchQuery. 'i' is regex for case insensitivity
        { subject: new RegExp(searchQuery, 'i') }, //case-insensitive regex search on the subject
        { location: new RegExp(searchQuery, 'i') }, //case-insensitive regex search on the location
      ]
    }).toArray((err, results) => { //converts the query results to an array
      if (err) {
        console.error(err);
        res.status(500).send("Error performing search.");
        return;
      }
      res.json(results); //send back the search results as JSON
    });
  });

  //references for searching: https://www.mongodb.com/docs/manual/tutorial/query-arrays/
  //https://www.mongodb.com/docs/manual/reference/method/db.collection.find/




// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Server is running on http://localhost:3000, not anymore, its now hosted on AWS');
});
