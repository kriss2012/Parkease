const { body } = require('express-validator');

const createBookingRules = [
  body('mallId').isMongoId().withMessage('Valid mallId is required'),
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
  body('vehicleType').isIn(['2-wheeler', '4-wheeler', 'ev', 'handicap-accessible']).withMessage('Invalid vehicle type'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('arrivalTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('arrivalTime must be HH:mm'),
  body('durationHours').isFloat({ min: 1, max: 720 }).withMessage('durationHours must be between 1 and 720'),
];

module.exports = { createBookingRules };
