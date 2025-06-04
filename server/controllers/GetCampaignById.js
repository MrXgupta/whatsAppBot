const Campaign = require('../models/Campaign');

module.exports = async (req, res) => {
    try {
        const { id } = req.params;

        const campaign = await Campaign.findOne({ _id: id});

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not found or unauthorized' });
        }

        res.json({ success: true, data: campaign });
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch campaign data' });
    }
};
