<!-- 6448ac3b-b686-4219-b080-bdc303943aa7 5a94706a-3910-453d-bd4f-7997706dab8a -->
# N8n AI Workflow Generator Integration Plan

## Problem Analysis

### Critical Issues Identified

1. **Backend Server Crash** (Blocking)

                                                                                                                                                                                                - File: `backend/src/ai/mcpTools.js` line 21-22
                                                                                                                                                                                                - Error: `TypeError: Cannot read properties of undefined (reading 'bind')`
                                                                                                                                                                                                - Root Cause: Method name mismatch - `getPublicTransport` doesn't exist (should be `getLocalTransport`)
                                                                                                                                                                                                - Missing method: `getSafetyAlerts` is referenced but not implemented

2. **Performance Bottleneck**

                                                                                                                                                                                                - Trunk crashpad_handler consuming 89.3% CPU
                                                                                                                                                                                                - Multiple unnecessary MCP servers running (8+ instances)
                                                                                                                                                                                                - Redis server running but potentially not needed

3. **N8n Integration Requirement**

                                                                                                                                                                                                - Need to integrate AI-powered workflow generator
                                                                                                                                                                                                - Convert natural language to executable n8n JSON workflows
                                                                                                                                                                                                - Expose through API endpoint and AI chat system

## Solution Architecture

### Phase 1: Critical Bug Fix (Priority: Highest)

Fix the backend crash to get servers running properly.

**File: `backend/src/ai/mcpTools.js`**

Lines 21-22 need correction:

```javascript
// BEFORE (BROKEN):
public_transport: this.getPublicTransport.bind(this),
safety_alerts: this.getSafetyAlerts.bind(this),

// AFTER (FIXED):
public_transport: this.getLocalTransport.bind(this),
safety_alerts: this.getSafetyAlerts.bind(this),
```

Add missing `getSafetyAlerts` method after line 617:

```javascript
async getSafetyAlerts(params) {
  const { destination } = params;
  return {
    success: true,
    data: {
      overall_safety: 'safe',
      alerts: [],
      precautions: ['احتفظ بممتلكاتك الشخصية', 'كن يقظًا في المناطق المزدحمة'],
      emergency_numbers: {
        police: '911',
        ambulance: '997',
        tourist_police: '1234'
      }
    }
  };
}
```

### Phase 2: N8n Workflow Generator Service

Create a dedicated service for n8n workflow generation.

**New File: `backend/src/services/n8nWorkflowGenerator.js`**

Architecture:

- HttpClient for webhook communication
- Prompt template builder for converting user input to n8n format
- Error handling and retry logic
- Response validator for n8n JSON schema

Key Methods:

- `generateWorkflow(description)` - Main entry point
- `buildPrompt(description)` - Format input for n8n API
- `validateWorkflowJson(json)` - Ensure valid n8n structure
- `executeWorkflow(workflowJson)` - Optional: trigger execution

Implementation Strategy:

```javascript
class N8nWorkflowGenerator {
  constructor() {
    this.n8nWebhookUrl = 'https://amrikyy.app.n8n.cloud/workflow/QZeDhWQFrKqwLOPN';
    this.maxRetries = 3;
  }

  async generateWorkflow(description) {
    // Format prompt according to n8n requirements
    const prompt = this.buildPrompt(description);
    
    // Call n8n webhook
    const response = await this.callN8nWebhook(prompt);
    
    // Validate and parse response
    const workflowJson = this.validateWorkflowJson(response);
    
    return {
      success: true,
      workflow: workflowJson,
      description: description
    };
  }
}
```

### Phase 3: API Endpoint Integration

**File: `backend/routes/ai.js`**

Add new endpoint after line 562:

```javascript
/**
 * POST /api/ai/generate-workflow
 * Generate n8n workflow from natural language
 */
router.post('/generate-workflow', async (req, res) => {
  try {
    const { description, userId } = req.body;
    
    if (!description || description.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Workflow description must be at least 10 characters'
      });
    }

    console.log(`🔧 Generating n8n workflow for user: ${userId}`);
    
    const generator = new N8nWorkflowGenerator();
    const result = await generator.generateWorkflow(description);
    
    res.json({
      success: true,
      workflow: result.workflow,
      metadata: {
        description: description,
        userId: userId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Workflow Generation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Phase 4: Frontend UI Component

**New File: `frontend/src/components/WorkflowGenerator.tsx`**

Features:

- Text input for natural language description
- Real-time workflow preview
- Visual n8n JSON display
- Download workflow button
- Integration with Maya AI chat

Component Structure:

- Input form with validation
- Loading state with progress indicator
- Success view with workflow visualization
- Error handling with retry button

### Phase 5: Maya AI Integration

Enhance Maya's chat system to recognize workflow requests.

**File: `backend/src/ai/zaiClient.js` or `backend/advanced-telegram-bot.js`**

Add workflow detection logic:

```javascript
// Detect workflow generation requests
if (userMessage.includes('create workflow') || 
    userMessage.includes('build automation') ||
    userMessage.includes('n8n workflow')) {
  
  // Extract workflow description
  const description = extractWorkflowDescription(userMessage);
  
  // Generate workflow
  const workflow = await n8nGenerator.generateWorkflow(description);
  
  // Return formatted response
  return formatWorkflowResponse(workflow);
}
```

### Phase 6: Performance Optimization

Clean up resource-hogging processes.

Actions:

1. Kill Trunk daemon (89% CPU usage)
2. Disable unnecessary MCP servers in Cursor settings
3. Add resource monitoring to prevent future issues

**New File: `backend/utils/resourceMonitor.js`**

Monitor CPU/memory usage and auto-restart if thresholds exceeded.

## Implementation Order

1. **Fix Backend Crash** (5 minutes)

                                                                                                                                                                                                - Correct method names in mcpTools.js
                                                                                                                                                                                                - Add missing getSafetyAlerts method
                                                                                                                                                                                                - Restart backend server

2. **Create N8n Service** (20 minutes)

                                                                                                                                                                                                - Build N8nWorkflowGenerator class
                                                                                                                                                                                                - Implement HTTP client for webhook
                                                                                                                                                                                                - Add prompt template builder
                                                                                                                                                                                                - Add validation logic

3. **Add API Endpoint** (10 minutes)

                                                                                                                                                                                                - Create /api/ai/generate-workflow route
                                                                                                                                                                                                - Add request validation
                                                                                                                                                                                                - Integrate with N8n service
                                                                                                                                                                                                - Add error handling

4. **Build Frontend Component** (30 minutes)

                                                                                                                                                                                                - Create WorkflowGenerator UI
                                                                                                                                                                                                - Add form validation
                                                                                                                                                                                                - Implement workflow preview
                                                                                                                                                                                                - Add download functionality

5. **Integrate with Maya AI** (15 minutes)

                                                                                                                                                                                                - Add workflow detection logic
                                                                                                                                                                                                - Format AI responses
                                                                                                                                                                                                - Add Telegram bot support

6. **Performance Optimization** (10 minutes)

                                                                                                                                                                                                - Kill resource-heavy processes
                                                                                                                                                                                                - Add monitoring
                                                                                                                                                                                                - Document best practices

## Technical Specifications

### N8n Webhook Payload Format

```json
{
  "userInput": "Convert this natural language description into an n8n workflow specification: [USER_DESCRIPTION]. Output valid n8n JSON with workflow nodes, connections, and credentials."
}
```

### Expected N8n Response Format

```json
{
  "name": "Generated Workflow",
  "nodes": [
    {
      "name": "Start",
      "type": "webhook",
      "position": [250, 300],
      "parameters": {}
    },
    {
      "name": "Process",
      "type": "code",
      "position": [450, 300],
      "parameters": {}
    }
  ],
  "connections": {
    "Start": {
      "main": [[{"node": "Process", "type": "main", "index": 0}]]
    }
  }
}
```

### API Endpoint Specification

**Endpoint:** POST `/api/ai/generate-workflow`

**Request:**

```json
{
  "description": "Create a workflow that sends an email when a new user registers",
  "userId": "user123"
}
```

**Response:**

```json
{
  "success": true,
  "workflow": { ...n8n JSON... },
  "metadata": {
    "description": "...",
    "userId": "user123",
    "timestamp": "2025-10-09T16:45:00Z"
  }
}
```

## Testing Strategy

1. Unit test N8n service with mock responses
2. Integration test API endpoint
3. E2E test with real n8n webhook
4. UI component testing with Playwright
5. Load testing with multiple concurrent requests

## Security Considerations

- Validate all user input before sending to n8n
- Rate limit workflow generation endpoint (5 requests/minute)
- Sanitize workflow descriptions to prevent injection
- Add authentication middleware
- Log all workflow generation attempts

## Success Criteria

- Backend server runs without crashes
- N8n workflow generation works end-to-end
- Frontend UI is responsive and user-friendly
- Maya AI can generate workflows from chat
- Performance improved (CPU usage < 30%)
- All tests passing

## Rollback Plan

If integration fails:

1. Remove new API endpoint
2. Restore original mcpTools.js
3. Disable frontend workflow component
4. Document issues for future attempt

### To-dos

- [ ] Fix mcpTools.js method name mismatch and add missing getSafetyAlerts method
- [ ] Create N8nWorkflowGenerator service class with webhook integration
- [ ] Add POST /api/ai/generate-workflow endpoint to routes/ai.js
- [ ] Create WorkflowGenerator React component with form and preview
- [ ] Add workflow detection logic to Maya's chat system
- [ ] Kill resource-heavy processes and add monitoring
- [ ] Write unit, integration, and E2E tests for workflow generation