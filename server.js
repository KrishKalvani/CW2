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




//POST /orders endpoint
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




//PUT  
app.put('/lessons/update-spaces', (req, res) => {
    const updates = req.body;
  
    Promise.all(updates.map(update => {
      return db.collection('lessons').updateOne(
        { id: update.lessonId },
        { $inc: { spaces: -update.decrement } }
      );
    }))
    .then(result => {
      res.json({ message: 'Spaces updated', result });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error updating spaces');
    });
  });
  





//PUT /lessons/update-spaces endpoint
// app.put('/lessons/update-spaces', (req, res) => {
//     const updates = req.body; // Expecting an array of updates

//     // First, check if the updates are valid
//     const validationPromises = updates.map(update => {
//         return db.collection('lessons').findOne({ id: update.lessonId })
//             .then(lesson => {
//                 if (!lesson || lesson.spaces - update.decrement < 0) {
//                     throw new Error(`Invalid update for lesson ID ${update.lessonId}`);
//                 }
//             });
//     });

//     Promise.all(validationPromises)
//         .then(() => {
//             // Perform the updates if all validations pass
//             const updatePromises = updates.map(update => {
//                 return db.collection('lessons').updateOne(
//                     { id: update.lessonId },
//                     { $inc: { spaces: -update.decrement } }
//                 );
//             });
//             return Promise.all(updatePromises);
//         })
//         .then(result => {
//             res.json({ message: 'Spaces updated', result });
//         })
//         .catch(err => {
//             console.error(err);
//             res.status(400).send('Error updating spaces: ' + err.message);
//         });
// });



// app.put('/lessons/update-spaces', (req, res) => {
//     const updates = req.body;

//     Promise.all(updates.map(update => {
//         return db.collection('lessons').updateOne(
//             { id: update.lessonId },
//             { $inc: { spaces: -update.decrement } }
//         );
//     }))
//     .then(result => {
//         res.json({ message: 'Spaces updated', result });
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).send('Error updating spaces');
//     });
// });
// app.put('/lessons/update-cart-item-count', (req, res) => {
//     const { lessonId, cartItemCount } = req.body;
//     db.collection('lessons').updateOne(
//         { id: lessonId },
//         { $set: { cartItemCount: cartItemCount } },
//         (err, result) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).send('Error updating cartItemCount');
//             } else {
//                 res.json({ message: 'cartItemCount updated', result });
//             }
//         }
//     );
// });




// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
