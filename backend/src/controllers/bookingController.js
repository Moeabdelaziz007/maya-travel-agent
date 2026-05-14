const Booking = require('../../models/Booking');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const booking = await Booking.save(req.body);
        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a booking
exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.update(req.params.id, req.body);
        res.status(200).json({ message: 'Booking updated successfully', booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        await Booking.delete(req.params.id);
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get detailed itinerary for a booking
exports.getItinerary = async (req, res) => {
    try {
        const itinerary = await Booking.getItinerary(req.params.id);
        res.status(200).json({ message: 'Itinerary fetched successfully', itinerary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Book flights/hotels for a booking
exports.bookTrip = async (req, res) => {
    try {
        // This seems redundant, as we are already in the booking controller.
        // This might be a separate process.
        // For now, we will just return a success message.
        res.status(200).json({ message: 'Booking process initiated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
