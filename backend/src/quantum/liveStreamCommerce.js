/**
 * Live Stream Commerce - Lean Implementation
 * Live streaming with instant booking
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class LiveStreamCommerce extends EventEmitter {
  constructor() {
    super();
    this.activeStreams = new Map();
    this.liveDeals = new Map();
    this.groupBuys = new Map();
  }

  async startLiveStream(config) {
    const streamId = `stream_${Date.now()}`;

    const stream = {
      id: streamId,
      hostName: config.hostName,
      title: config.title,
      destination: config.destination,
      status: 'live',
      startedAt: Date.now(),
      viewers: [],
      currentViewers: 0,
      likes: 0,
      comments: [],
      activeDeals: []
    };

    this.activeStreams.set(streamId, stream);

    logger.info('Stream started', { streamId, host: config.hostName });

    return stream;
  }

  async createLiveDeal(streamId, dealData) {
    const dealId = `deal_${Date.now()}`;

    const deal = {
      id: dealId,
      streamId,
      title: dealData.title,
      originalPrice: dealData.originalPrice,
      discountPrice: dealData.discountPrice,
      quantity: dealData.quantity,
      remaining: dealData.quantity,
      expiresAt: Date.now() + 300000, // 5 min
      status: 'active'
    };

    this.liveDeals.set(dealId, deal);

    const stream = this.activeStreams.get(streamId);
    if (stream) {
      stream.activeDeals.push(dealId);
    }

    logger.info('Live deal created', { dealId, streamId });

    setTimeout(() => this.expireDeal(dealId), 300000);

    return deal;
  }

  async bookFromLiveStream(dealId, viewerId, bookingData) {
    const deal = this.liveDeals.get(dealId);

    if (!deal || deal.status !== 'active' || deal.remaining <= 0) {
      throw new Error('Deal not available');
    }

    const bookingId = `booking_${Date.now()}`;

    deal.remaining--;

    logger.info('Live booking', { bookingId, dealId, viewerId });

    return {
      id: bookingId,
      dealId,
      viewerId,
      price: deal.discountPrice,
      status: 'pending_payment'
    };
  }

  expireDeal(dealId) {
    const deal = this.liveDeals.get(dealId);
    if (deal) {
      deal.status = 'expired';
      logger.info('Deal expired', { dealId });
    }
  }

  getActiveStreams() {
    return Array.from(this.activeStreams.values())
      .filter(s => s.status === 'live')
      .map(s => ({
        id: s.id,
        title: s.title,
        hostName: s.hostName,
        currentViewers: s.currentViewers
      }));
  }
}

module.exports = new LiveStreamCommerce();

