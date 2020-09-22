const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileRoutes = require('./routes/file');
const authRoutes = require('./routes/auth');
const gridfs = require('./gridfs');
const helmet = require('helmet');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@nodejscourse-hnpdw.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;
console.log(process.env.MONGO_PASS);


const app = express();
app.use(bodyParser.json());
app.use(helmet());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "x-www-form-urlencoded, Content-Type, Authorization");
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
})
app.use('/files', fileRoutes);
app.use('/auth', authRoutes);


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode;
    res.status(status).json({message: error.message, data: error.data})
})

mongoose.connect(MONGODB_URI).then(result => {
    console.log('connected to Mongo')
    app.listen(process.env.PORT || 3001);
    gridfs.streamInit();
}).catch(err => {
    console.log(err);
})




