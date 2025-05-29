const Campaign = require('../models/Campaign');

const getCampaignStats = async (req, res) => {
    try {
        const campaigns = await Campaign.find({}, 'campaignName logs');

        const data = campaigns.map(c => {
            const sent = c.logs.filter(l => l.status === 'success').length;
            const failed = c.logs.filter(l => l.status === 'failed').length;
            return {
                campaignName: c.campaignName,
                sent,
                failed
            };
        });

        const totalSent = data.reduce((sum, c) => sum + c.sent, 0);
        const totalFailed = data.reduce((sum, c) => sum + c.failed, 0);

        res.json({
            totalSent,
            totalFailed,
            campaigns: data
        });
    } catch (err) {
        console.error('❌ Error fetching campaign stats:', err);
        res.status(500).json({ error: 'Failed to fetch campaign statistics' });
    }
};

module.exports = getCampaignStats;
