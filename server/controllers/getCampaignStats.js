const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');

// Get all campaign overview details with pagination proving only 10 campaign per req 
const getCampaignStats = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'sentAt';
        const order = req.query.order === 'asc' ? 1 : -1;

        const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
        const toDate = req.query.toDate ? new Date(req.query.toDate) : null;

        const userId = new mongoose.Types.ObjectId(req.body.userId);
        console.log("getCampaignStats userId:", userId);

        const matchStage = {userId};

        if (fromDate || toDate) {
            matchStage.sentAt = {};
            if (fromDate) matchStage.sentAt.$gte = fromDate;
            if (toDate) matchStage.sentAt.$lte = toDate;
        }

        const campaigns = await Campaign.aggregate([
            {$match: matchStage},
            {
                $addFields: {
                    sent: {
                        $size: {
                            $filter: {
                                input: "$logs",
                                as: "log",
                                cond: {$eq: ["$$log.status", "success"]}
                            }
                        }
                    },
                    failed: {
                        $size: {
                            $filter: {
                                input: "$logs",
                                as: "log",
                                cond: {$eq: ["$$log.status", "failed"]}
                            }
                        }
                    }
                }
            },
            {$sort: {[sortBy]: order}},
            {$skip: skip},
            {$limit: limit},
            {
                $project: {
                    campaignName: 1,
                    sent: 1,
                    failed: 1,
                    sentAt: 1
                }
            }
        ]);

        const totalCount = await Campaign.countDocuments(matchStage);

        const totalSentAgg = await Campaign.aggregate([
            {$match: matchStage},
            {$unwind: "$logs"},
            {$match: {"logs.status": "success"}},
            {$count: "totalSent"}
        ]);

        const totalFailedAgg = await Campaign.aggregate([
            {$match: matchStage},
            {$unwind: "$logs"},
            {$match: {"logs.status": "failed"}},
            {$count: "totalFailed"}
        ]);

        res.json({
            totalSent: totalSentAgg[0]?.totalSent || 0,
            totalFailed: totalFailedAgg[0]?.totalFailed || 0,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            campaigns: campaigns.map(c => ({
                id: c._id,
                campaignName: c.campaignName,
                sent: c.sent,
                failed: c.failed,
                sentAt: c.sentAt
            }))
        });

    } catch (err) {
        console.error("❌ Error fetching campaign stats:", err);
        res.status(500).json({error: "Failed to fetch campaign statistics"});
    }
};

// Get the campaign overview details without pagination for dashboard overview
const getAllCampaignStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.body.userId);
        console.log("getAllCampaignStats userId:", userId);

        const stats = await Campaign.aggregate([
            {
                $match: {
                    userId,
                    sentAt: {$ne: null}
                }
            },
            {$unwind: "$logs"},
            {
                $group: {
                    _id: {
                        date: {$dateToString: {format: "%Y-%m-%d", date: "$sentAt"}},
                        status: "$logs.status"
                    },
                    count: {$sum: 1}
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    sent: {
                        $sum: {
                            $cond: [{$eq: ["$_id.status", "success"]}, "$count", 0]
                        }
                    },
                    failed: {
                        $sum: {
                            $cond: [{$eq: ["$_id.status", "failed"]}, "$count", 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    sent: 1,
                    failed: 1
                }
            },
            {$sort: {date: 1}}
        ]);

        res.status(200).json(stats);
    } catch (err) {
        console.error("❌ Error generating campaign stats:", err);
        res.status(500).json({message: "Server error", error: err});
    }
};

module.exports = {getCampaignStats, getAllCampaignStats};
