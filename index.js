const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileUpload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lufn0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(express.static('washmans'));
app.use(fileUpload());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("Welcome To Carwash Server")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log("database connection errors:", err);
    const appointmentCollection = client.db("carwashdb").collection("appointments");
    const washmanCollection = client.db("carwashdb").collection("washman");
    const serviceCollection = client.db("carwashdb").collection("smartcarwash");
    const reviewCollection = client.db("carwashdb").collection("carwashreview");


    // Car servicing Appoinment Api
app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // display appointments for the selected date
app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        console.log(date.date);
        appointmentCollection.find({ date: date.date })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // add washman api & send information to server
app.post('/addWashman', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        console.log(name, email, file);
        file.mv(`${__dirname}/washmans/${file.name}`, err => {
            if (err) {
                console.log(err);
                return res.status(500).send({ msg: 'Failed to upload Image in server' });
            }

        })
        washmanCollection.insertOne({ name, email, image: file.name })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    
    
     // display information in washman components
app.get('/washmans', (req, res) => {
        washmanCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


      // add service api & send information to server
app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const details = req.body.details;
        const price = req.body.price;
        console.log(name, details, price, file);
        file.mv(`${__dirname}/services/${file.name}`, err => {
            if (err) {
                console.log(err);
                return res.status(500).send({ msg: 'Failed to upload Image in server' });
            }
            // return res.send({name: file.name, path: `/${file.name}`})
        })
        serviceCollection.insertOne({ name, details, price, image: file.name })
            .then(result => {
                res.send(result.insertedCount > 0);
                // res.send({count: result.InsertedCount});
            })
    })
    
    // display services info
app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

          // add review api & send information to server
app.post('/addReview', (req, res) => {
        const name = req.body.name;
        const comment = req.body.comment;
        const email = req.body.email;
        
        reviewCollection.insertOne({ name, comment, email })
            .then(result => {
                res.send(result.insertedCount > 0);
                // res.send({count: result.InsertedCount});
            })
    })
        
        // display information in review components
app.get('/testimonials', (req, res) => {
            reviewCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });

        // Add as admin api startZ

});

app.listen(process.env.PORT || port)