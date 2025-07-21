const mongoose = require("mongoose");

const connectDb = async () => { 
  await mongoose.connect(
    "mongodb+srv://Vijayavardhan44:veera2147@nodejs.3la1i.mongodb.net/devTinder"
  );
};

module.exports = {
    connectDb
}


