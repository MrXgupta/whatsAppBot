const Campaign = require('../models/Campaign');

// Saving the campaign in the db
const CreateCampaign = async (req, res) => {
    try {
        const {name, description} = req.body;
        const userId = req.user.id;
        const campaign = await Campaign.create({name, description, createdBy: userId});
        res.status(201).json({success: true, campaign});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};

// Deleting the campaign from the db
const deleteCampaign = async (req, res) => {
    try {
        const {id, userId} = req.params;

        const deleted = await Campaign.findOneAndDelete({_id: id, userId: userId});

        if (!deleted) {
            return res.status(404).json({success: false, message: "Campaign not found or unauthorized"});
        }

        res.status(200).json({success: true, message: "Campaign deleted successfully"});
    } catch (err) {
        console.error("Error deleting campaign:", err);
        res.status(500).json({success: false, message: "Internal server error"});
    }
};

module.exports = {CreateCampaign, deleteCampaign};
