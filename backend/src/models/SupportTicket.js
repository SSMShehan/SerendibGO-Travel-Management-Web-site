const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  // User who submitted the ticket
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Ticket details
  subject: {
    type: String,
    required: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  category: {
    type: String,
    enum: ['technical', 'booking', 'payment', 'account', 'general', 'guide', 'tour', 'vehicle', 'hotel'],
    required: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Staff member
  },
  
  // Messages/Conversation
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderType: {
      type: String,
      enum: ['user', 'staff'],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      type: String
    }],
    isRead: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution details
  resolution: {
    type: String,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  },
  
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  resolvedAt: {
    type: Date
  },
  
  // Additional metadata
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Internal notes (staff only)
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Response time tracking
  firstResponseAt: {
    type: Date
  },
  
  // Satisfaction rating (after resolution)
  satisfactionRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ lastActivity: -1 });

// Virtual for unread messages count
supportTicketSchema.virtual('unreadMessagesCount').get(function() {
  return this.messages.filter(msg => !msg.isRead && msg.senderType === 'user').length;
});

// Method to add a message
supportTicketSchema.methods.addMessage = function(senderId, senderType, message, attachments = []) {
  this.messages.push({
    sender: senderId,
    senderType: senderType,
    message: message,
    attachments: attachments,
    timestamp: new Date()
  });
  
  this.lastActivity = new Date();
  
  // Set first response time if this is the first staff message
  if (senderType === 'staff' && !this.firstResponseAt) {
    this.firstResponseAt = new Date();
  }
  
  return this.save();
};

// Method to mark messages as read
supportTicketSchema.methods.markMessagesAsRead = function(userId) {
  this.messages.forEach(msg => {
    if (msg.sender.toString() !== userId.toString() && !msg.isRead) {
      msg.isRead = true;
    }
  });
  
  return this.save();
};

// Static method to get tickets for a user
supportTicketSchema.statics.getUserTickets = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query)
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get tickets for staff
supportTicketSchema.statics.getStaffTickets = function(options = {}) {
  const query = {};
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.assignedTo) {
    query.assignedTo = options.assignedTo;
  }
  
  return this.find(query)
    .populate('user', 'firstName lastName email phone')
    .populate('assignedTo', 'firstName lastName email')
    .populate('messages.sender', 'firstName lastName')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
