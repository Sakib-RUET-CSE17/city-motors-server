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

    app.get('/bikes', (req, res) => {
        bikeCollection.find({})
            .toArray((err, items) => {
                res.send(items)
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
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)