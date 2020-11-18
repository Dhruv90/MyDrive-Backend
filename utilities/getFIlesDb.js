const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@nodejscourse-hnpdw.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`);
const dbName = 'cloud';
let db;

exports.connect = () => {
  client.connect(async () => {
    try{
      console.log("MongoDb direct connection made");
      db = client.db(dbName);
    } catch(err){
      console.log(err);
    }
  })
}

exports.getDb = () => {
  return db;
}
