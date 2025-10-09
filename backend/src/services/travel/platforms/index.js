/**
 * Travel Platform Services Index
 * Exports all platform-specific service implementations
 */

const PlatformAdapter = require('./PlatformAdapter');
const BookingService = require('./BookingService');
const ExpediaService = require('./ExpediaService');
const TripAdvisorService = require('./TripAdvisorService');
const KayakService = require('./KayakService');

module.exports = {
  PlatformAdapter,
  BookingService,
  ExpediaService,
  TripAdvisorService,
  KayakService
};