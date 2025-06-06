const User = require('../models/User');
const jwt = require('jsonwebtoken');
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

        const user = await User.create({name, email, number, password});
        const token = generateToken(user);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    },

    login: async (req, res) => {
        const {email, password} = req.body;
        if (!email || !password) return res.status(400).json({error: "All fields are required"});

        const user = await User.findOne({email});
        if (!user) return res.status(400).json({error: "Invalid credentials"});

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({error: "Incorrect password"});

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        // if (!sessionManager.hasClient(user._id)) {
        //     const client = require('../Backup/whatsapp/initClient')(user._id, global.io);
        //     await sessionManager.setClient(user._id, client);
        //     console.log(`[SESSION CREATED] for user ${user._id}`);
        // }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    }

};

module.exports = authController;
