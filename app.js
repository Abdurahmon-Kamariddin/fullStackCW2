const http = require('http');
const express = require('express');
const app = express();
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = "mongodb+srv://WebstoreUser:Qoraqamish2002@webstorecluster.3t3jb.mongodb.net/?retryWrites=true&w=majority&appName=WebstoreCluster";
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db("FullStackCW");
const clubCollection = db.collection("clubs");
const ordersCollection = db.collection("orders");

app.get("/products", async (request, response) => {
    console.log("GET /products");
    const products = clubCollection.find({}).toArray( function(err, results) {
        if (err) {
            return nextTick(err);
        }
        response.send(results);
        console.log(results);
        });
    });


app.post("/saveOrder", async (request, response) => {
    console.log("POST /saveOrder");
    const order = request.body;
    console.log(order);
    ordersCollection.insertOne(order, function(err, result) {
        if (err) {
            return nextTick(err);
        }
        response.send(result);
        console.log(result);
    });
});




http.createServer(app).listen(3000);

