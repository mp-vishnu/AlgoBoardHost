const mongoose = require("mongoose");
// making connection to mongodb

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
    })
    .then((data) => {
      // if connection is done
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    })
    .catch((err) => {
      // if any error is occured
      console.log(err);
    });
};

module.exports = connectDatabase;
