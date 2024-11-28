const http = require('http');
const cors = require('cors');
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(cors()); 

app.use(express.static(path.join(__dirname, 'public'))); //serving the images for our clubs via the public file

//connection to the mongo database
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = "mongodb+srv://WebstoreUser:Qoraqamish2002@webstorecluster.3t3jb.mongodb.net/?retryWrites=true&w=majority&appName=WebstoreCluster";
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db("FullStackCW");
const clubCollection = db.collection("clubs");
const ordersCollection = db.collection("orders");

//logger middleware that shows each requests method, path, body and query
const logger = (request, response, next) => {
    console.log(`LOGGER : ${request.method} request to ${request.path}. Body: ${JSON.stringify(request.body)} Query: ${JSON.stringify(request.query)} ...`);
    next();
};

app.use(logger);

//get route that returns all the clubs in the database and is fetched in the frontend
app.get("/clubs", async (request, response) => {
    const products = clubCollection.find({}).toArray(function (err, results) {
        if (err) {
            return nextTick(err);
            console.log(err);
        }
        response.status(200).send(results);
    });
});

//recieves the user's order details from the frontend and inserts a new document into the order collection
app.post("/saveOrder", async (request, response) => {
    const order = request.body;
    ordersCollection.insertOne(order, function (err, result) {
        if (err) {
            return nextTick(err);
            console.log(err);
        }
        response.status(200).send(result);
    });
});

//recieves the searchQuery key and value (entered by the user) pair and is the used to return all clubs that match the search query (should they exist)
app.get("/search", async (request, response) => {
    try {
        const search = request.query.searchQuery;
        if (!search || search === "") { // if the search query is empty, return an error message
            response.status(400).send({ message: "Search query is empty." });
            return
        }
        const result = await clubCollection.find({ subject: { $regex: search, $options: 'i' } }).toArray(); // allows for case-insensitive and partial searches
        if (result.length === 0) {
            response.status(404).send({ message: "No clubs found." });
        } else {
            response.status(200).json(result); //successful search with matching results so they are returned
        }
    } catch (error) {
        console.log("Error searching for club. Err: " + error);
        response.status(500).send({ message: "Error searching for club." });
    }
});

//put route that is called once the checkout is finished and the club seats purchased are removed from the availability
app.put("/updateAvailability", async (request, response) => {
    console.log("PUT /updateAvailability");
    const cart = request.body.cart; //we recieve the cart (which is just the ids of each club seat they purchased ie. [1,1,2,5]) from the frontend
    for (const item of cart) {
        try {
            var clubID = item;
            const result = await clubCollection.updateOne(
                { id: clubID },
                { $inc: { availableSeats: -1 } }
            );
            console.log("Updated club with ID " + clubID + " availability. Result:" + response);
            response.status(200);
        } catch (error) {
            console.log("Error updating availability for club " + clubID + ". Err: " + error);
            response.status(500)
        }
    }
    if (response.statusCode != 500) {
        response.status(200).send({ message: "All clubs updated successfully." });
    } else {
        response.status(500).send({ message: "Error updating availability." });
    }
});


const port = process.env.PORT || 3000;
app.listen(port, function () {
    {
        console.log("Server is running on port " + port);
    }
});
