/**
 * WhatsApp Business API Client
 * Enterprise-grade integration for Maya Travel Agent
 */

const axios = require('axios');

class WhatsAppClient {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    
    // Check if WhatsApp is configured
    this.isConfigured = this.accessToken && 
                        !this.accessToken.includes('your_whatsapp') &&
                        this.phoneNumberId;
    
    if (this.isConfigured) {
      console.log('✅ WhatsApp Business API initialized');
      console.log(`📱 Phone Number ID: ${this.phoneNumberId}`);
    } else {
      console.log('⚠️ WhatsApp not configured - using fallback mode');
    }
  }

  /**
   * Send text message
   */
  async sendMessage(to, message) {
    if (!this.isConfigured) {
      console.log('⚠️ WhatsApp not configured - message not sent');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace(/[^0-9]/g, ''), // Remove non-numeric characters
          type: 'text',
          text: { 
            preview_url: false,
            body: message 
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp message sent to ${to}`);
      return { 
        success: true, 
        data: response.data,
        messageId: response.data.messages?.[0]?.id
      };

    } catch (error) {
      console.error('❌ WhatsApp Send Error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }

  /**
   * Send template message
   */
  async sendTemplate(to, templateName, languageCode = 'ar', components = []) {
    if (!this.isConfigured) {
      console.log('⚠️ WhatsApp not configured - template not sent');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/[^0-9]/g, ''),
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp template sent to ${to}`);
      return { 
        success: true, 
        data: response.data,
        messageId: response.data.messages?.[0]?.id
      };

    } catch (error) {
      console.error('❌ WhatsApp Template Error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }

  /**
   * Send interactive message with buttons
   */
  async sendInteractive(to, bodyText, buttons) {
    if (!this.isConfigured) {
      console.log('⚠️ WhatsApp not configured - interactive message not sent');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace(/[^0-9]/g, ''),
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
              buttons: buttons.map((btn, idx) => ({
                type: 'reply',
                reply: {
                  id: btn.id || `btn_${idx}`,
                  title: btn.title.substring(0, 20) // Max 20 chars
                }
              }))
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp interactive message sent to ${to}`);
      return { 
        success: true, 
        data: response.data,
        messageId: response.data.messages?.[0]?.id
      };

    } catch (error) {
      console.error('❌ WhatsApp Interactive Error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }

  /**
   * Send list message
   */
  async sendList(to, bodyText, buttonText, sections) {
    if (!this.isConfigured) {
      console.log('⚠️ WhatsApp not configured - list message not sent');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace(/[^0-9]/g, ''),
          type: 'interactive',
          interactive: {
            type: 'list',
            body: { text: bodyText },
            action: {
              button: buttonText,
              sections: sections
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp list message sent to ${to}`);
      return { 
        success: true, 
        data: response.data,
        messageId: response.data.messages?.[0]?.id
      };

    } catch (error) {
      console.error('❌ WhatsApp List Error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    if (!this.isConfigured) return { success: false };

    try {
      await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('❌ WhatsApp Mark Read Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get media URL
   */
  async getMediaUrl(mediaId) {
    if (!this.isConfigured) return null;

    try {
      const response = await axios.get(
        `${this.baseUrl}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data.url;
    } catch (error) {
      console.error('❌ WhatsApp Get Media Error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.isConfigured) {
      return { 
        success: false, 
        status: 'not_configured',
        message: 'WhatsApp API not configured'
      };
    }

    try {
      // Try to get phone number info
      const response = await axios.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return { 
        success: true, 
        status: 'healthy',
        data: response.data
      };
    } catch (error) {
      return { 
        success: false, 
        status: 'unhealthy',
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

module.exports = WhatsAppClient;
