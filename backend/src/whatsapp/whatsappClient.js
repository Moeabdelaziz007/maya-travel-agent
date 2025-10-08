const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class WhatsAppClient {
  constructor() {
    this.baseURL = 'https://graph.facebook.com';
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  }

  // Validate configuration
  validateConfig() {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('WhatsApp configuration missing: Access token and phone number ID are required');
    }
  }

  // Make API request with error handling
  async makeRequest(method, endpoint, data = null) {
    try {
      this.validateConfig();
      
      const url = `${this.baseURL}/${this.apiVersion}/${endpoint}`;
      const config = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  // Send text message
  async sendTextMessage(to, message) {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\+/g, ''),
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };

    return this.makeRequest('POST', `${this.phoneNumberId}/messages`, data);
  }

  // Send interactive buttons
  async sendButtons(to, message, buttons) {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\+/g, ''),
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: message
        },
        action: {
          buttons: buttons.map((btn, index) => ({
            type: 'reply',
            reply: {
              id: `btn_${index}`,
              title: btn.title
            }
          }))
        }
      }
    };

    return this.makeRequest('POST', `${this.phoneNumberId}/messages`, data);
  }

  // Send list message
  async sendListMessage(to, message, sections, buttonText = 'View Options') {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\+/g, ''),
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: message
        },
        action: {
          button: buttonText,
          sections: sections.map((section, index) => ({
            title: section.title,
            rows: section.options.map((option, optIndex) => ({
              id: `section_${index}_opt_${optIndex}`,
              title: option.title,
              description: option.description || ''
            }))
          }))
        }
      }
    };

    return this.makeRequest('POST', `${this.phoneNumberId}/messages`, data);
  }

  // Send template message
  async sendTemplate(to, templateName, language = 'en', components = []) {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\+/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language
        },
        components: components
      }
    };

    return this.makeRequest('POST', `${this.phoneNumberId}/messages`, data);
  }

  // Send media (image, document, audio, video)
  async sendMedia(to, type, url, caption = '') {
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\+/g, ''),
      type: type,
      [type]: {
        link: url,
        caption: caption
      }
    };

    return this.makeRequest('POST', `${this.phoneNumberId}/messages`, data);
  }

  // Mark message as read
  async markAsRead(messageId) {
    const data = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    };

    return this.makeRequest('POST', `${this.phoneNumberId}/messages`, data);
  }

  // Get business profile
  async getBusinessProfile() {
    return this.makeRequest('GET', `${this.phoneNumberId}/whatsapp_business_profile`);
  }

  // Get message template list
  async getMessageTemplates() {
    return this.makeRequest('GET', `${this.businessAccountId}/message_templates`);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.getBusinessProfile();
      return {
        healthy: response.success,
        timestamp: new Date().toISOString(),
        details: response.success ? 'Connected to WhatsApp Business API' : response.error
      };
    } catch (error) {
      return {
        healthy: false,
        timestamp: new Date().toISOString(),
        details: error.message
      };
    }
  }
}

module.exports = WhatsAppClient;
