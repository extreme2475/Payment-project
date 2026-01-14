import Message from "../models/Message.js";

// 1. Get Chat History (Existing)
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const history = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      chatHistory: history
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Mark as Read (Existing)
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        status: { $ne: "read" }
      },
      { $set: { status: "read" } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Delete Single Message (New - For "Delete for Everyone")
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Sirf wahi banda delete kar sake jisne bheja hai (Optional check)
    const message = await Message.findOneAndDelete({ 
      _id: messageId, 
      sender: userId 
    });

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found or unauthorized" });
    }

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Clear Full Chat (New)
export const clearChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    // Dono side ki history delete karne ke liye
    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    });

    res.status(200).json({ success: true, message: "Chat cleared successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Add this to your Chat Controller file
export const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.id|| req.user.id;

    // Find all messages sent to ME that are NOT 'read'
    const unreadMessages = await Message.find({
      receiver: userId,
      status: { $ne: "read" }
    });

    // Create a simple map: { senderId: true }
    const unreadMap = {};
    unreadMessages.forEach(msg => {
      unreadMap[msg.sender.toString()] = true;
    });

    res.status(200).json({ success: true, unreadMapping: unreadMap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};