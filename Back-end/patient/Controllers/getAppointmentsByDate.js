// Controllers/getAppointmentsByDate.js - TEMPORARY TEST VERSION
export const getAppointmentsByDate = async (req, res) => {
    try {
        console.log('Getting appointments for date:', req.params.date);
        
        // Return empty array for now - just to test the route
        res.json({
            success: true,
            appointments: []
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};