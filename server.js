require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json()); 
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.log('Connection failed:', err));

app.use('/auth', require('./routes/auth'));
app.use('/notes', require('./routes/notes'));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});