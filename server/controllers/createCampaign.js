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

const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Campaign.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }

        res.status(200).json({ success: true, message: "Campaign deleted successfully" });
    } catch (err) {
        console.error("Error deleting campaign:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {CreateCampaign , deleteCampaign};
