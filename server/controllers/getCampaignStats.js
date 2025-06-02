const Campaign = require('../models/Campaign');

const getCampaignStats = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalCount = await Campaign.countDocuments();
        const campaigns = await Campaign.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        const data = campaigns.map(c => {
            const sent = c.logs.filter(l => l.status === 'success').length;
            const failed = c.logs.filter(l => l.status === 'failed').length;
            return {
                id: c._id,
                campaignName: c.campaignName,
                sent,
                failed,
                sentAt: c.sentAt
            };
        });

        const totalSent = await Campaign.aggregate([
            { $unwind: "$logs" },
            { $match: { "logs.status": "success" } },
            { $count: "totalSent" }
        ]);
        const totalFailed = await Campaign.aggregate([
            { $unwind: "$logs" },
            { $match: { "logs.status": "failed" } },
            { $count: "totalFailed" }
        ]);

        res.json({
            totalSent: totalSent[0]?.totalSent || 0,
            totalFailed: totalFailed[0]?.totalFailed || 0,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            campaigns: data
        });
    } catch (err) {
        console.error('❌ Error fetching campaign stats:', err);
        res.status(500).json({ error: 'Failed to fetch campaign statistics' });
    }
};

module.exports = getCampaignStats;
