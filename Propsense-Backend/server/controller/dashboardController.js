import Deal from "../models/dealModel.js";
import Property from "../models/propertyModel.js";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";


//GET /api/dashboard/agent
export const getAgentDashoard = asyncHandler(async (req, res) => {
    const agentId = req.user._id

    //Listing Count By Status
    const [available, under_offer, sold] = await Promise.all([
        Property.countDocuments({ agent: agentId, status: 'available' }),
        Property.countDocuments({ agent: agentId, status: 'under_offer' }),
        Property.countDocuments({ agent: agentId, status: 'sold' }),
    ])

    //Total View Across All listings
    const viewResult = await Property.aggregate([
        { $match: { agent: agentId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ])
    const totalViews = viewResult[0]?.totalViews || 0;

    //Deal stats 
    const [activeDeals, closeDeals] = await Promise.all([
        Deal.countDocuments({
            agent: agentId,
            status: { $in: ['pending', 'accepted', 'in_progress'] },
        }),
        Deal.countDocuments({ agent: agentId, status: 'completed' }),
    ])

    //Revenue from closed deals
    const revenueResult = await Deal.aggregate([
        { $match: { agent: agentId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$finalPrice' } } },

    ])

    const revenue = revenueResult[0]?.total || 0;

    // 6 Month chart data 
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const chartData = await Deal.aggregate([
        {
            $match: {
                agent: agentId,
                status: 'completed',
                createdAt: { $gte: sixMonthsAgo },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                deals: { $sum: 1 },
                revenue: { $sum: '$finalPrice' },
            },
        },
        { $sort: { _id: 1 } },
    ])

    //Recent listings
    const recentListings = await Property.find({ agent: agentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title price status views createdAt images')

    // Recent deals
    const recentDeals = await Deal.find({ agent: agentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('property', 'title price')
        .populate('buyer', 'name email avatar');

    res.json({
        stats: {
            totalViews,
            activeDeals,
            closeDeals,
            revenue,
        },
        listingsByStatus: { available, under_offer, sold },
        chartData,
        recentListings,
        recentDeals,
    });
})

//GET /api/dashboard/admin
export const getAdminDashboard = asyncHandler(async (req, res) => {
    //Platform wide counts 
    const [
        totalUsers,
        totalAgents,
        totalBuyers,
        totalProperties,
        totalDeals,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'agent' }),
        User.countDocuments({ role: 'buyer' }),
        Property.countDocuments(),
        Deal.countDocuments(),
    ]);

    // Deals by status
    const dealsByStatus = await Deal.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Recent users
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role avatar createdAt');

    // Recent properties
    const recentProperties = await Property.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('agent', 'name email')
        .select('title price type status createdAt images');

    res.json({
        stats: {
            totalUsers,
            totalAgents,
            totalBuyers,
            totalProperties,
            totalDeals,
        },
        dealsByStatus,
        recentUsers,
        recentProperties,
    });
});

const dashboardController = {
    getAgentDashoard,
    getAdminDashboard
}

export default dashboardController