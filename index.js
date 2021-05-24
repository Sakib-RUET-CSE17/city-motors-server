const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const port = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejoil.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    console.log('connection err', err)
    const bikeCollection = client.db(process.env.DB_NAME).collection("bikes");
    const ordersCollection = client.db(process.env.DB_NAME).collection("orders");

    app.get('/bikes', (req, res) => {
        bikeCollection.find({})
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.get('/bike/:id', (req, res) => {
        console.log()
        bikeCollection.find({ _id: ObjectID(req.params.id) })
            .toArray((err, items) => {
                res.send(items[0])
            })
    })

    app.post('/addBike', (req, res) => {
        const newEvent = req.body
        console.log('adding new event:', newEvent)
        bikeCollection.insertOne(newEvent)
            .then(result => {
                console.log('inserted Count', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    app.delete('/deleteBike/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        console.log('delete this', id)
        bikeCollection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))
    })

    app.patch('/updateBike/:id', (req, res) => {
        console.log(req.body)
        bikeCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { price: req.body.price }
            }
        )
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    app.post('/addOrder', (req, res) => {
        const order = req.body
        console.log(order)
        ordersCollection.insertOne(order)
            .then(result => {
                console.log(result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/orders', (req, res) => {
        const queryEmail = req.query.email
        ordersCollection.find({ email: queryEmail })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)