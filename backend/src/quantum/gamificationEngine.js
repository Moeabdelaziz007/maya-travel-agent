/**
 * Gamification Engine - Lean Implementation
 * Rewards users and learns from feedback
 */

const logger = require('../utils/logger');

class GamificationEngine {
  constructor() {
    this.pointsSystem = {
      workflow_completed: 10,
      feedback_provided: 5,
      group_booking: 40,
    };

    this.userProfiles = new Map();
    this.achievements = this.initAchievements();
  }

  async awardPoints(userId, action, metadata = {}) {
    const profile = this.getOrCreateProfile(userId);
    const points = this.pointsSystem[action] || 0;

    profile.points += points;
    profile.totalPoints += points;
    profile.statistics[action] = (profile.statistics[action] || 0) + 1;

    // Check level up
    const leveledUp = this.checkLevelUp(profile);

    // Check achievements
    const newAchievements = this.checkAchievements(profile);

    logger.info('Points awarded', {
      userId,
      action,
      points,
      level: profile.level,
      leveledUp,
    });

    return {
      success: true,
      points,
      totalPoints: profile.totalPoints,
      level: profile.level,
      leveledUp,
      newAchievements,
    };
  }

  async recordFeedback(userId, workflowId, feedbackData) {
    const profile = this.getOrCreateProfile(userId);

    // Store feedback
    const feedback = {
      id: `fb_${Date.now()}`,
      userId,
      workflowId,
      ...feedbackData,
      timestamp: Date.now(),
    };

    // Reward user
    const reward = await this.awardPoints(userId, 'feedback_provided');

    logger.info('Feedback recorded', { userId, workflowId });

    return {
      success: true,
      feedbackId: feedback.id,
      reward,
      message: 'شكراً لملاحظاتك!',
    };
  }

  getOrCreateProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        level: 1,
        points: 0,
        totalPoints: 0,
        achievements: [],
        statistics: {},
        createdAt: Date.now(),
      });
    }
    return this.userProfiles.get(userId);
  }

  checkLevelUp(profile) {
    const required = Math.floor(100 * Math.pow(1.5, profile.level - 1));
    if (profile.totalPoints >= required) {
      profile.level++;
      return true;
    }
    return false;
  }

  checkAchievements(profile) {
    const newAchievements = [];

    for (const [id, achievement] of this.achievements) {
      if (!profile.achievements.includes(id)) {
        if (this.isUnlocked(profile, achievement)) {
          profile.achievements.push(id);
          newAchievements.push(achievement);
        }
      }
    }

    return newAchievements;
  }

  isUnlocked(profile, achievement) {
    const { type, value } = achievement.condition;

    if (type === 'level') return profile.level >= value;
    if (type === 'points') return profile.totalPoints >= value;
    if (type === 'workflows')
      return (profile.statistics.workflow_completed || 0) >= value;

    return false;
  }

  initAchievements() {
    const achievements = new Map();

    achievements.set('first_trip', {
      id: 'first_trip',
      name: 'الرحلة الأولى',
      reward: 50,
      condition: { type: 'workflows', value: 1 },
    });

    achievements.set('level_5', {
      id: 'level_5',
      name: 'خبير السفر',
      reward: 200,
      condition: { type: 'level', value: 5 },
    });

    return achievements;
  }

  getUserProfile(userId) {
    return this.userProfiles.get(userId);
  }
}

module.exports = new GamificationEngine();
