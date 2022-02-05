// Load env variables into process.env
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const mongoose = require('mongoose');

// Database Connexion
mongoose.connect(process.env.DATABASE_URL)
    .then((res) => {
        console.log('Connected to Mongo Database');
        app.listen( PORT, () => {
            console.log(`server is running on port ${PORT}`);
        });
    }
    )
    .catch((err) => console.log(err))


// Json Rest Api
app.use(express.json());

// Text Ressource routes
const textRouter = require('./routes/text');
app.use('/text', textRouter);