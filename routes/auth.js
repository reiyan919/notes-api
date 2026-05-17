const express = require('express');
const routeur = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

routeur.post('/register', async (req, res) => {
    const { name,email,password } = req.body;

    const exists = await User.findOne({ email });
    if (exists){
        return res.status(400).json({message:'User already exists'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({message:'User registered'});
});


routeur.post('/login', async (req, res) => {
    const { email,password } = req.body;

    const foundUser = await User.findOne({ email });
    if (!foundUser){
        return res.status(400).json({message:'Invalid credentials'});
    }
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch){
        return res.status(400).json({message:'Invalid credentials'});
    }
    const token =jwt.sign({id: foundUser._id},process.env.JWT_SECRET);
    res.json({token});
});

module.exports = routeur;