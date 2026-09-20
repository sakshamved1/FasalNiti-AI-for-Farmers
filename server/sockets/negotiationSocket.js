/**
 * Real-Time Socket.IO Handlers for KisanSetu AI
 * Supports live price notifications, deal negotiations, and chat.
 */

const setupNegotiationSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to KisanSetu Socket: ${socket.id}`);

    // Join listing specific negotiation room
    socket.on('join_listing', (listingId) => {
      socket.join(`listing_${listingId}`);
      console.log(`Socket ${socket.id} joined room listing_${listingId}`);
    });

    // Leave listing room
    socket.on('leave_listing', (listingId) => {
      socket.leave(`listing_${listingId}`);
    });

    // Send chat message in negotiation
    socket.on('send_negotiation_message', (data) => {
      const { listingId, sender, text, price } = data;
      io.to(`listing_${listingId}`).emit('receive_negotiation_message', {
        id: `msg_${Date.now()}`,
        sender,
        text,
        price,
        timestamp: new Date()
      });
    });

    // Typing indicator
    socket.on('typing', ({ listingId, user }) => {
      socket.to(`listing_${listingId}`).emit('user_typing', { user });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected from Socket: ${socket.id}`);
    });
  });
};

module.exports = setupNegotiationSockets;
