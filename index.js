require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.glst95z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("TalkSphereDB");
    const usersCollection = database.collection("users");

    app.post("/users", async (req, res) => {
      const { name, email, badge, photo } = req.body;

      if (!name || !email || !badge) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      try {
        const existing = await usersCollection.findOne({ email });
        if (existing) {
          return res.status(409).json({ message: "User already exists" });
        }

        const result = await usersCollection.insertOne({
          name,
          email,
          badge,
          photo: photo || "",
          createdAt: new Date()
        });

        res.status(201).json(result);
      } catch (error) {
        console.error("User insert error:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("TalkSphere server is running!");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
