const Campaign = require('../models/Campaign');

const CreateCampaign = async (req, res) => {
    try {
        const { name, description, createdBy } = req.body;
        const campaign = await Campaign.create({ name, description, createdBy });
        res.status(201).json({ success: true, campaign });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = CreateCampaign;
