import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // Reference to the user who sent the message
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  // Reference to the user receiving the message
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  // The actual text content
  text: { 
    type: String, 
    required: true,
    trim: true 
  },
  // Status for WhatsApp-style ticks
  status: { 
    type: String, 
    enum: ["sent", "delivered", "read"], 
    default: "sent" 
  }
}, { timestamps: true });

// Indexing allows for very fast lookups when loading chat history
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;