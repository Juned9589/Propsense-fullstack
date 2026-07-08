import Notification from "../models/notificationModel.js";
import asyncHandler from "../utils/asyncHandler.js";


//GET /api/notifications
export const getNotification = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50)

    const unreadCount = notifications.filter((n) => !n.read).length

    res.status(200).json({ notifications, unreadCount })
})

//PUT /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { read: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });
});

// PUT /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, read: false },
        { read: true }
    );

    // Return the updated list and count to ensure frontend sync
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);

    res.json({ 
        message: 'All notifications marked as read',
        notifications,
        unreadCount: 0 
    });
});

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
});

const notificationController = {
    getNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
}

export default notificationController