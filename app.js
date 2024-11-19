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

app.get("/clubs", async (request, response) => {
    console.log("GET /clubs");
    const products = clubCollection.find({}).toArray( function(err, results) {
        if (err) {
            return nextTick(err);
            console.log(err);
        }
        response.send(results);
        console.log(results);
        });
    });


app.post("/saveOrder", async (request, response) => {
    console.log("POST /saveOrder");
    const order = request.body;
    ordersCollection.insertOne(order, function(err, result) {
        if (err) {
            return nextTick(err);
            console.log(err);
        }
        response.send(result);
        console.log(result);
    });
});

app.put("/updateAvailability", async (request, response) => {
    console.log("PUT /updateAvailability");
    const cart = request.body;
    for (const item of cart){
        try {
        var clubID = item;
        const result = clubCollection.updateOne(
            { _id: ObjectId(clubID) },
            { $inc: { availability: -1 } }
        );
        console.log("Updated club with ID " + clubID + " availability. Result:" + result);
        } catch (error) {
            console.log("Error updating availability for club " + clubID + ". Err: " + error);
        }
    }
});


const port = process.env.PORT || 3000;
app.listen(port, function() { {
    console.log("Server is running on port " + port);
}});
