/**
 * Cultural Adaptation Engine
 * Applies regional preferences and tone adjustments based on locale or region code.
 */

const regionProfiles = {
  ar: {
    language: 'Arabic',
    tone: 'respectful, warm, and family-oriented',
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    travelTips: [
      'Respect local customs and prayer times when visiting religious sites.',
      'Dress modestly in conservative areas and religious landmarks.'
    ]
  },
  en: {
    language: 'English',
    tone: 'friendly and concise',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    travelTips: [
      'Check tipping customs for restaurants and taxis.',
      'Consider travel insurance for medical and trip cancellations.'
    ]
  },
  fr: {
    language: 'French',
    tone: 'polite and formal',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    travelTips: [
      'Learn a few basic phrases in French to ease interactions.',
      'Be mindful of local lunch hours when planning visits.'
    ]
  }
};

function getCultureProfile(regionOrLang = 'ar') {
  const key = (regionOrLang || '').toLowerCase();
  return regionProfiles[key] || regionProfiles.ar;
}

function buildCulturalSystemPrompt(regionOrLang = 'ar') {
  const profile = getCultureProfile(regionOrLang);
  const lines = [
    `You must adapt your answers to the following cultural profile:`,
    `- Preferred language: ${profile.language}`,
    `- Tone: ${profile.tone}`,
    `- Currency: ${profile.currency}`,
    `- Date format: ${profile.dateFormat}`,
    `- Local travel tips to consider: ${profile.travelTips.join('; ')}`
  ];
  return lines.join('\n');
}

module.exports = { getCultureProfile, buildCulturalSystemPrompt };

