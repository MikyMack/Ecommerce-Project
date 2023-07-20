require('dotenv').config() 

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose.connect(process.env.DATABASE);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected');
  })
  