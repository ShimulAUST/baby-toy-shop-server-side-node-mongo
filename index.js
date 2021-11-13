const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const admin = require("firebase-admin");
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const serviceAccount = {
    "type": "service_account",
    "project_id": "baby-toy-shop",
    "private_key_id": "aa8dbabc6001c8e4d9cd6e36aabd11dc959c71ad",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4X9kZnQj207Ow\nPjLWn4aPbv2xxQsSklahu4Y9Bha1pFbYskjpxk85GoOw0A3tkma77n9cU3Y8hwP5\nRcpCjT1Z9bMiQDmqK4IPBblkuATZW/v3rUN41bdReXmUgla378xEnp+WbEOzWVF+\nngkEV8BfbpnXddJIP56dvW/ARhJlV801I/Gq9mDuz9J0yidFL59e+iOw6L9qc1WO\nkHeVp9w6+pdTIiSde/QYYVjx8hB3KPrgjnoBl0Acrilb728NJrABIWGG8mxKINBY\nA/gUWNj5K3DuYUAsGTFLuB+z2Y3Lx0zdbxKE9xNuKJh/AZBmiqFLYHZVT8vzZsqZ\nFAVORHbPAgMBAAECggEAQuyDpMD0CogQnsYM9Qulr7W1f4wK91xH9t/XG5p0rs0u\nuuyH+9dAVXVy3MDAdX4hLVEmSLCA5/qILjivcJXM8bT2J1YRuFufk21b/JuxIua5\nII9zQM6ugnPp9kaTTKPNzRCY0+SLdHPU2XVqx3lEuj8ut18si44QOKiVAkFNFxx4\nd5c9nxrspbefJucQNPFX+FTbWXfiv10EzNJ+a6PAf2TA7s+P75Fd0gsypvvjkF2F\nvrRm4hsmBKLyIeQTMCd9MIMPFp9KDkDzbiKRWk1zsVxchiLoIvUjtVPMWFL8/RPp\nGAj0171RS2hhwp4nVfjhaB/ktk260UOx5k7EtKP97QKBgQDfZ7oKh2VIIF/L1Hi5\nvzEfoDl8LiuJy+Yk5xPNyQbTHfqJKjCnhPb+kTSGSpeDv4awHnECmHurAQAGoQf0\nQ/Y3SEsEY8NEYEPjkhJ9mbcpce6QpCRQHdwsmE1EwsDwJdccntwGs2hxGK6FfW/L\n+rHXqjhnNv8lRsWUPOBMctavewKBgQDTRk5gyIIBravbGeCwbBc1VpVEc/SlHzlU\nTE01M9BY2VyJQTMltgK9oNzTO56vhGymbtzPdgrwPoVeQlSCSiG64NtRg1hM9EOP\njP+xy2d16cfBKvG/4ho64qeqqLMvbv24HUcb44bzNaR2RS3xrswUX5w980qK6ON9\nnK7jKV3rvQKBgQDdj52ue4Ey+wiGuf3RGZC6cMkSIygCzTk+N/4oBMrD7eNezXzb\nZr8e0RtqY+fIPdZyLH6fuGJNwfwoluOwmQZC5WuguuAZm+84btHvxtckP13+DQwG\neNa3U4SuQQfgI2cnd1V3P87A+115/mE1xzdBUAwIMT7x1TJ2Rbmdl/baqQKBgHDO\n/HCe/xPIWJffpGJvBKFdPsxTIdC88E57g0oiBWA7hzZeUuIS4jnAV8iN7/gFvEHN\nticr/0EyEOI4hoke7g2rnE9U02QblKtkfO7BDdge4KLavERZhOnmNeJgu3RbTivt\nrhdNELRx8wOXgqWmUJ+cQX+ulSHAoh9i9tqiLtz9AoGAeaFlnFiHEndsXU8NdALo\nDOPVJIUNrzbZ46lPVuoI7FMByjiSS2bvmz2Wf+0+v2p/scD5qEVdtQ8R6qUNRikW\nBWFqTgC0sGHMfxEnD7LB8b/cT65twVXXVM6vhkac2duuHs3g8FDfy99RAzOlV2g0\nkbsdQqOZCJdX3GMo7mPM18g=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-qiuo5@baby-toy-shop.iam.gserviceaccount.com",
    "client_id": "104242722940421439733",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qiuo5%40baby-toy-shop.iam.gserviceaccount.com"
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
async function verifyToken(req, res, next) {
    if (req.headers.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }
    }
    next();
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.da9dr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('DB Connected');
        const database = client.db('baby_toys_shop');
        const usersCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');
        const ordersCollection = database.collection('orders');
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });
        app.post('/products', async (req, res) => {
            const service = req.body;
            const result = await productsCollection.insertOne(service);
            res.send(result);
        });
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });
        app.post('/orders', async (req, res) => {
            const orders = req.body;
            console.log(orders);
            const result = await ordersCollection.insertOne(orders);
            console.log(result);
            res.send(result);
        });
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });
        //delete api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });
        //update order status 
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateUser = "shipped";
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateUser
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);

            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(user);
            res.json(result);
        });
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester })
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'You do not have permission' });
            }

        });
    }
    finally {
        //await client.close();
    }
}

run().catch(console.dir);
app.get('/', (req, res) => {
    res.send("Hello Baby Toys Shop");
});

app.listen(port, () => {
    console.log('Listening Baby Toys Shop from : ', port);
})