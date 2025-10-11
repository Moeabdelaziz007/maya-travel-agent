# Amadeus Travel API Setup Guide

This guide provides step-by-step instructions for setting up free Amadeus Travel API keys for the Amrikyy Travel Agent project.

## Overview

Amadeus provides a comprehensive set of APIs for travel-related services including flight search, booking, hotel reservations, and more. The free tier offers generous rate limits suitable for development and small-scale production use.

## Prerequisites

- Active internet connection
- Valid email address for account registration
- Basic understanding of API concepts

## Step 1: Create Amadeus Developer Account

1. Navigate to the [Amadeus for Developers portal](https://developers.amadeus.com/)
2. Click on "Sign Up" or "Get Started"
3. Fill out the registration form with:
   - Your name
   - Valid email address
   - Company/organization name (can be personal project)
   - Purpose of use (select "Travel Agency" or "Development")
4. Verify your email address by clicking the confirmation link sent to your inbox
5. Complete your profile setup

## Step 2: Create a New Application

1. Log in to your Amadeus developer account
2. Navigate to the "My Apps" section in your dashboard
3. Click "Create New App"
4. Fill in the application details:
   - **App Name**: `Amrikyy Travel Agent`
   - **Description**: `AI-powered travel booking assistant with quantum AI capabilities`
   - **Product**: Select the APIs you need (Flight Search, Hotel Search, etc.)
   - **Environment**: `Sandbox` (for development and testing)

## Step 3: Obtain API Credentials

After creating the application, you'll receive:

- **API Key** (Client ID): A unique identifier for your application
- **API Secret** (Client Secret): A confidential key for authentication

**Important Security Notes:**
- Keep your API Secret confidential and never commit it to version control
- Use environment variables to store credentials in production
- Rotate keys periodically for security

## Step 4: Configure Environment Variables

Add the following environment variables to your project's `.env` file:

```bash
# Amadeus Travel API Configuration
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_API_SECRET=your_amadeus_api_secret_here
```

### For Different Environments

**Development (.env):**
```bash
AMADEUS_API_KEY=your_sandbox_api_key
AMADEUS_API_SECRET=your_sandbox_api_secret
```

**Production (.env.production):**
```bash
AMADEUS_API_KEY=your_production_api_key
AMADEUS_API_SECRET=your_production_api_secret
```

## Step 5: Test API Integration

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Test the Amadeus integration by making a sample flight search request:
   ```bash
   curl -X GET "http://localhost:3001/api/flights/search?origin=JFK&destination=LAX&departureDate=2024-12-01&adults=1" \
        -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. Verify the response contains flight data from Amadeus

## API Rate Limits (Free Tier)

- **Flight Search**: 500 requests/day
- **Hotel Search**: 200 requests/day
- **Flight Offers**: 100 requests/day
- **Hotel Booking**: 50 requests/day

Monitor your usage in the Amadeus developer dashboard to avoid hitting limits.

## Troubleshooting

### Common Issues

**401 Unauthorized Error:**
- Verify API Key and Secret are correct
- Check if keys are for the correct environment (Sandbox vs Production)
- Ensure environment variables are loaded properly

**429 Rate Limit Exceeded:**
- You've exceeded the free tier limits
- Wait for the daily reset or upgrade to a paid plan
- Implement request throttling in your application

**400 Bad Request:**
- Check API endpoint URLs
- Verify required parameters are included
- Ensure date formats match API specifications (YYYY-MM-DD)

### Getting Help

- [Amadeus Developer Documentation](https://developers.amadeus.com/self-service)
- [API Reference](https://developers.amadeus.com/self-service/apis-docs)
- [Community Forums](https://developers.amadeus.com/support)

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all credentials**
3. **Implement proper error handling** to avoid exposing sensitive information
4. **Rotate API keys regularly** (recommended every 90 days)
5. **Monitor API usage** through the developer dashboard
6. **Use HTTPS** for all API communications

## Next Steps

Once API keys are configured:

1. Test all Amadeus-related features in your application
2. Implement proper error handling for API failures
3. Set up monitoring for API usage and performance
4. Consider implementing caching to reduce API calls
5. Plan for scaling beyond free tier limits as your application grows

## Environment File Template

Copy this template to create your `.env` file:

```bash
# Amadeus Travel API
AMADEUS_API_KEY=
AMADEUS_API_SECRET=

# Other environment variables...
```

Replace the empty values with your actual API credentials from the Amadeus developer portal.