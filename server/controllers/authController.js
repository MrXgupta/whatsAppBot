const whatsappSessionController = require("./startController");
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateBetaCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const generateToken = (user) => {
    return jwt.sign(
        {_id: user._id, email: user.email},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );
};

const authController = {
    signup: async (req, res) => {
        const {name, email, number, password, confirmPassword} = req.body;
        if (!name || !email || !number || !password || !confirmPassword)
            return res.status(400).json({error: "All fields are required"});

        if (password !== confirmPassword)
            return res.status(400).json({error: "Passwords do not match"});

        const existingUser = await User.findOne({email});
        if (existingUser)
            return res.status(400).json({error: "User already exists"});

        const betaCode = generateBetaCode();

        const user = await User.create({
            name,
            email,
            number,
            password,
            betaCode,
            isVerified: false,
        });

        const token = generateToken(user);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            betaCode,
            token,
            message: "Your beta access code is shown above. Please keep it safe.",
        });
    },

    login: async (req, res) => {
        const {email, password, betaCode} = req.body;
        if (!email || !password || !betaCode)
            return res.status(400).json({error: "Email, password, and beta code are required"});

        const user = await User.findOne({email});
        if (!user)
            return res.status(400).json({error: "Invalid credentials"});

        const isMatch = await user.matchPassword(password);
        if (!isMatch)
            return res.status(401).json({error: "Incorrect password"});

        if (user.betaCode !== betaCode)
            return res.status(403).json({error: "Invalid beta access code"});

        // Optionally mark as verified
        user.isVerified = true;
        await user.save();

        const token = generateToken(user);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    }
};

module.exports = authController;
