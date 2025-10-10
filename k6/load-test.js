/**
 * k6 Load Test for Maya Travel Agent
 * Tests system performance under load
 * 
 * Run with: k6 run k6/load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const tripPlanningDuration = new Trend('trip_planning_duration');
const chatResponseDuration = new Trend('chat_response_duration');
const errorRate = new Rate('error_rate');
const successfulRequests = new Counter('successful_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 50 },   // Ramp down to 50 users
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests under 5s
    http_req_failed: ['rate<0.05'],    // Error rate under 5%
    'error_rate': ['rate<0.05'],
    'trip_planning_duration': ['p(95)<10000'], // Trip planning under 10s
    'chat_response_duration': ['p(95)<3000'],  // Chat response under 3s
  },
};

// Environment variables
const BASE_URL = __ENV.K6_TARGET_URL || 'http://localhost:3001';
const API_KEY = __ENV.K6_API_KEY || 'test-key';

// Test data generators
function generateUserId() {
  return `load-test-user-${__VU}-${Math.floor(Math.random() * 1000)}`;
}

function generateTripRequest() {
  const destinations = ['Tokyo', 'Paris', 'Dubai', 'New York', 'London', 'Cairo', 'Istanbul'];
  const budgets = [1000, 2000, 3000, 5000, 10000];
  
  return {
    userId: generateUserId(),
    message: `I want to plan a trip to ${destinations[Math.floor(Math.random() * destinations.length)]}`,
    budget: budgets[Math.floor(Math.random() * budgets.length)],
    travelers: Math.floor(Math.random() * 4) + 1,
    departure_date: '2024-12-01',
    return_date: '2024-12-10'
  };
}

function generateChatMessage() {
  const messages = [
    'ما هي أفضل وجهة سياحية في الصيف؟',
    'What are the best hotels in Dubai?',
    'أحتاج مساعدة في تخطيط رحلة عائلية',
    'Can you recommend activities for kids?',
    'كم تكلفة السفر إلى باريس؟',
    'What documents do I need for travel?'
  ];
  
  return {
    userId: generateUserId(),
    message: messages[Math.floor(Math.random() * messages.length)],
    conversationId: `load-test-conv-${__VU}`
  };
}

// Request headers
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`
};

// Test scenarios
export default function () {
  const scenario = Math.random();
  
  // 50% - Trip Planning
  if (scenario < 0.5) {
    testTripPlanning();
  }
  // 30% - Chat
  else if (scenario < 0.8) {
    testChat();
  }
  // 10% - Skills
  else if (scenario < 0.9) {
    testSkills();
  }
  // 10% - Health Check
  else {
    testHealthCheck();
  }
  
  sleep(Math.random() * 3 + 1); // Random sleep 1-4 seconds
}

function testTripPlanning() {
  const startTime = Date.now();
  
  const payload = JSON.stringify(generateTripRequest());
  const response = http.post(`${BASE_URL}/api/v1/trip`, payload, { headers });
  
  const duration = Date.now() - startTime;
  tripPlanningDuration.add(duration);
  
  const success = check(response, {
    'trip planning status is 200': (r) => r.status === 200,
    'trip planning has success field': (r) => {
      try {
        return JSON.parse(r.body).success === true;
      } catch {
        return false;
      }
    },
    'trip planning response time < 15s': () => duration < 15000,
  });
  
  if (success) {
    successfulRequests.add(1);
  } else {
    errorRate.add(1);
  }
}

function testChat() {
  const startTime = Date.now();
  
  const payload = JSON.stringify(generateChatMessage());
  const response = http.post(`${BASE_URL}/api/v1/chat`, payload, { headers });
  
  const duration = Date.now() - startTime;
  chatResponseDuration.add(duration);
  
  const success = check(response, {
    'chat status is 200': (r) => r.status === 200,
    'chat has reply': (r) => {
      try {
        return JSON.parse(r.body).reply !== undefined;
      } catch {
        return false;
      }
    },
    'chat response time < 5s': () => duration < 5000,
  });
  
  if (success) {
    successfulRequests.add(1);
  } else {
    errorRate.add(1);
  }
}

function testSkills() {
  const payload = JSON.stringify({
    message: 'أنا متحمس جداً للرحلة!',
    language: 'ar'
  });
  
  const response = http.post(`${BASE_URL}/api/v1/skills/empathy`, payload, { headers });
  
  const success = check(response, {
    'skills status is 200': (r) => r.status === 200,
    'skills has emotion data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success && data.data.primary_emotion !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  if (success) {
    successfulRequests.add(1);
  } else {
    errorRate.add(1);
  }
}

function testHealthCheck() {
  const response = http.get(`${BASE_URL}/health`);
  
  const success = check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check returns ok': (r) => {
      try {
        return JSON.parse(r.body).status === 'ok';
      } catch {
        return false;
      }
    },
  });
  
  if (success) {
    successfulRequests.add(1);
  } else {
    errorRate.add(1);
  }
}

// Summary handler
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options) {
  const { indent = '', enableColors = false } = options || {};
  
  let summary = '\n';
  summary += `${indent}📊 Load Test Summary\n`;
  summary += `${indent}${'='.repeat(50)}\n\n`;
  
  // Test duration
  summary += `${indent}⏱️  Duration: ${(data.state.testRunDurationMs / 1000).toFixed(2)}s\n`;
  summary += `${indent}👥 Virtual Users: ${data.metrics.vus.values.max}\n\n`;
  
  // HTTP metrics
  summary += `${indent}🌐 HTTP Requests:\n`;
  summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}  Failed: ${data.metrics.http_req_failed.values.rate * 100}%\n`;
  summary += `${indent}  Duration (avg): ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  Duration (p99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
  
  // Custom metrics
  if (data.metrics.trip_planning_duration) {
    summary += `${indent}✈️  Trip Planning:\n`;
    summary += `${indent}  Duration (avg): ${data.metrics.trip_planning_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  Duration (p95): ${data.metrics.trip_planning_duration.values['p(95)'].toFixed(2)}ms\n\n`;
  }
  
  if (data.metrics.chat_response_duration) {
    summary += `${indent}💬 Chat Responses:\n`;
    summary += `${indent}  Duration (avg): ${data.metrics.chat_response_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  Duration (p95): ${data.metrics.chat_response_duration.values['p(95)'].toFixed(2)}ms\n\n`;
  }
  
  // Thresholds
  summary += `${indent}✅ Threshold Results:\n`;
  Object.keys(data.metrics).forEach(metric => {
    if (data.metrics[metric].thresholds) {
      Object.keys(data.metrics[metric].thresholds).forEach(threshold => {
        const result = data.metrics[metric].thresholds[threshold];
        const status = result.ok ? '✓' : '✗';
        summary += `${indent}  ${status} ${metric}: ${threshold}\n`;
      });
    }
  });
  
  summary += `\n${indent}${'='.repeat(50)}\n`;
  
  return summary;
}

