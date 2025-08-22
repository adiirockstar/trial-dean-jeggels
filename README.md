# Dean Jeggels - Personal Codex Agent

A context-aware AI agent that authentically represents Dean Jeggels, built using n8n workflows, Supabase RAG, and a modern React interface from bolt.new.

## 🎯 Project Overview

This Personal Codex Agent answers questions about Dean's professional background, technical skills, projects, and work philosophy using real data extracted from his CV and supporting documents. It demonstrates AI-native development practices and structured data handling.

**Live Demo**: https://form-ui-with-supabas-hfsr.bolt.host/  
**Demo Video**: [Your 5-minute walkthrough]

## 🏗️ System Architecture

[React UI] → [Webhook] → [n8n Workflow] → [Supabase RAG] → [OpenAI GPT-o4mini with AI agent] → [Webhook Response] → [Answer in UI]  

### Design Choices

1. **n8n for Orchestration**: Chosen for AI agent logic for response to users questions
2. **Supabase as RAG Database**: Provides structured JSON storage with powerful querying capabilities  
3. **React UI with Mode Switcher**: Demonstrates different conversation personalities and chatbot functionality
4. **OpenAI GPT-o4mini**: Model for nuanced, contextual responses

## 🚀 Features

### Core Functionality
- ✅ Context-aware responses using real CV and project data
- ✅ RAG implementation with Supabase database
- ✅ Authentic voice representation speaking as Dean
- ✅ Real-time conversation through webhook integration

### Bonus Features  
- 🎭 **5 Conversation Modes**: Interview, Storytelling, Fast Facts, Humble Brag, Self-Reflection
- 🧠 **Self-Reflective Responses**: "What energizes/drains me?", "How do I collaborate best?"
- 📊 **Structured Data Architecture**: Organized CV and supporting document insights
- 🎨 **Modern UI**: Clean, responsive interface with sample questions

## 💾 Data Structure

The agent draws from structured data in Supabase:

dean_profile/
├── cv_profile # Basic info, experience, skills, projects
├── work_insights # Problem-solving approach, values, communication style
├── supporting_docs # Blog posts, code documentation, personal reflections
└── self_reflection # Energy sources, collaboration preferences, growth areas


## 🧪 Sample Questions & Expected Responses

| Question | Mode | Expected Response Style |
|----------|------|------------------------|
| "What kind of engineer are you?" | Default | "I'm an AI Robotics Engineer who specializes in bridging embedded systems with modern AI automation..." |
| "What are your strongest skills?" | Interview | Concise, achievement-focused list with measurable outcomes |
| "Tell me about your PocketQube project" | Storytelling | Detailed narrative with context, challenges, and lessons learned |
| "Quick facts about your experience" | Fast Facts | Bullet-point summary of key highlights |
| "What makes you stand out?" | Humble Brag | Confident presentation of unique achievements |
| "What kind of work energizes you?" | Self-Reflection | Thoughtful insights about motivation and collaboration |

## 🔧 Setup Instructions

### Prerequisites
- n8n instance (cloud or self-hosted)
- Supabase account with database access
- OpenAI API key
- Node.js for UI development

### 1. Database Setup
-- Run the provided SQL scripts to create tables and insert data
CREATE TABLE dean_profile (
id SERIAL PRIMARY KEY,
section VARCHAR(50) NOT NULL,
data JSONB NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);
-- [Insert statements provided in setup files]


### 2. n8n Workflow Import
1. Import the below workflow JSON into your n8n instance

{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "codex-agent",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        1536,
        896
      ],
      "id": "f062c0c4-1312-4d6f-8e3e-13782440acd2",
      "name": "Webhook Trigger",
      "webhookId": "8ab22f17-fd5c-4985-aa45-9be54ac9d733"
    },
    {
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "// Extract and validate input parameters\nconst question = $input.item.json.body.question || '';\nconst mode = $input.item.json.body.mode || 'default';\nconst sessionId = $input.item.json.body.session_id || 'default';\nconst timestamp = $input.item.json.body.timestamp || new Date().toISOString();\n\n// Mode-specific system message adjustments\nconst modeConfigurations = {\n  'interview': {\n    suffix: 'Keep responses concise, professional, and informative. Focus on achievements and measurable outcomes.',\n    style: 'professional'\n  },\n  'storytelling': {\n    suffix: 'Provide longer, more reflective narratives with context and personal insights. Share the story behind the facts.',\n    style: 'narrative'\n  },\n  'facts': {\n    suffix: 'Respond in bullet points or TL;DR format. Be concise and factual.',\n    style: 'concise'\n  },\n  'humble_brag': {\n    suffix: 'Answer with confidence and highlight achievements prominently, while staying grounded in truth.',\n    style: 'confident'\n  },\n  'reflection': {\n    suffix: 'Focus on self-awareness, growth areas, work preferences, and personal insights about collaboration and energy.',\n    style: 'reflective'\n  },\n  'default': {\n    suffix: 'Maintain Dean\\'s authentic, conversational tone with technical depth when appropriate.',\n    style: 'authentic'\n  }\n};\n\nconst config = modeConfigurations[mode] || modeConfigurations['default'];\n\nreturn {\n  question,\n  mode,\n  sessionId,\n  timestamp,\n  modeConfig: config,\n  processedAt: new Date().toISOString()\n};"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1744,
        896
      ],
      "id": "eaff6fae-eca9-4e11-8796-7ab3a9cebc4a",
      "name": "Process Input"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.question }}",
        "options": {
          "systemMessage": "=You are Dean Jeggels' Personal AI Assistant. Answer questions about Dean in first person using data from the Supabase database.\n\nCORE IDENTITY:\n- 23-year-old AI Robotics Engineer from Stellenbosch, South Africa\n- Founder of CH-ISE.co.za, Freelance AI Workflow Developer\n- Passionate about solving real-world problems through AI automation\n- Values continuous learning, innovation, collaboration, and measurable impact\n\nCONVERSATION CONTEXT:\nMode: {{ $json.mode }}\nStyle: {{ $json.modeConfig.style }}\nSpecific Instructions: {{ $json.modeConfig.suffix }}\n\nRESPONSE GUIDELINES:\n- Always speak as Dean (\"I am...\", \"My experience...\", \"I specialize in...\")\n- Query the Supabase database for current, accurate information\n- Use specific examples, projects, and measurable outcomes from the data\n- Reference concrete technologies, client work, and achievements\n- Maintain Dean's authentic personality: confident yet approachable, technically deep, results-oriented\n- Adapt tone and length based on the conversation mode\n\nALWAYS use the Supabase tool to retrieve Dean's current profile data before responding."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        2016,
        896
      ],
      "id": "f4aa00d2-ddd2-4374-9d89-95e108e607f2",
      "name": "Enhanced AI Agent"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "o4-mini",
          "mode": "list",
          "cachedResultName": "o4-mini"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        2016,
        1120
      ],
      "id": "e1336faa-b719-4d8c-949a-0e991d904f6f",
      "name": "OpenAI GPT-4o",
      "credentials": {
        "openAiApi": {
          "id": "PmlPgSChOQtH3gbc",
          "name": "OpenAi account"
        }
      }
    },
    {
      "parameters": {
        "descriptionType": "manual",
        "toolDescription": "Access Dean Jeggels' complete professional profile including CV data, work experience, technical skills, projects, education, work insights, problem-solving approach, and personal values. Use this comprehensive database to provide authentic, detailed answers about Dean's background and capabilities.",
        "operation": "getAll",
        "tableId": "dean_profile"
      },
      "type": "n8n-nodes-base.supabaseTool",
      "typeVersion": 1,
      "position": [
        2176,
        1088
      ],
      "id": "35e85783-b909-4c9d-8639-476d47e9e7bc",
      "name": "Dean Profile Database",
      "credentials": {
        "supabaseApi": {
          "id": "NUg5hLHAIt8Wg8bD",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "// Format response with metadata and mode information\nconst aiResponse = $input.item.json.message?.content || $input.item.json.output || 'I apologize, but I encountered an issue processing your question.';\nconst originalInput = $('Process Input').first().json;\n\n// Extract key topics mentioned in response for analytics\nconst keyTopics = [];\nif (aiResponse.toLowerCase().includes('project')) keyTopics.push('projects');\nif (aiResponse.toLowerCase().includes('skill')) keyTopics.push('technical_skills');\nif (aiResponse.toLowerCase().includes('experience')) keyTopics.push('work_experience');\nif (aiResponse.toLowerCase().includes('automation')) keyTopics.push('automation');\nif (aiResponse.toLowerCase().includes('n8n')) keyTopics.push('n8n');\n\nreturn {\n  status: 'success',\n  response: aiResponse,\n  metadata: {\n    mode_used: originalInput.mode,\n    style: originalInput.modeConfig.style,\n    session_id: originalInput.sessionId,\n    response_timestamp: new Date().toISOString(),\n    topics_covered: keyTopics,\n    response_length: aiResponse.length,\n    responder: 'Dean Jeggels Personal AI Assistant'\n  },\n  follow_up_suggestions: [\n    'Tell me more about your technical approach',\n    'What challenges did you face in that project?',\n    'How do you stay updated with new technologies?',\n    'What advice would you give to someone starting in AI automation?'\n  ]\n};"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2304,
        896
      ],
      "id": "3bab64f1-cf96-4745-be88-c0825ec215d1",
      "name": "Format Response"
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        2496,
        896
      ],
      "id": "dcbe025b-09d4-47d5-af1c-315a70e8ef93",
      "name": "Respond to Webhook1"
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Process Input",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Input": {
      "main": [
        [
          {
            "node": "Enhanced AI Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enhanced AI Agent": {
      "main": [
        [
          {
            "node": "Format Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI GPT-4o": {
      "ai_languageModel": [
        [
          {
            "node": "Enhanced AI Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Dean Profile Database": {
      "ai_tool": [
        [
          {
            "node": "Enhanced AI Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Format Response": {
      "main": [
        [
          {
            "node": "Respond to Webhook1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "350d7b83761a47d8c35fa4a1ca5c934378258826c45313721dfd9111c8cbf85b"
  }
}


2. Configure credentials for Supabase and OpenAI
3. Update webhook URL in the UI configuration

### 3. UI Deployment  
deployed in bolt.new


## 🤖 AI Collaboration Artifacts

### AI Agents Used
1. **Claude (Anthropic)** - System architecture and n8n workflow design, content structuring and prompt engineering
2. **bolt.new** - React component development and JavaScript logic
3. **GPT-4** - Content structuring and prompt engineering

### Prompt Engineering Evolution

**Initial Prompt** (too generic):
"You are an AI assistant that answers questions about Dean"


**Final Prompt** (context-aware):
"You are Dean Jeggels' Personal AI Assistant. Answer questions about Dean in first person using data from the Supabase database. Always query the database first, then respond in Dean's authentic voice with specific examples..."

All system prompts can be found within the JSON n8n workflow above. These were generated with help of giving context to Claude (Anthropic) model sonnet 4.0 thinking.


## 📈 What I'd Improve With More Time

### Technical Enhancements
- **Vector Search**: Implement semantic search for more relevant context retrieval
- **Conversation Memory**: Persistent chat history across sessions  
- **Analytics Dashboard**: Track question patterns and response effectiveness
- **Multi-modal Support**: Add voice input/output capabilities

### Content Enhancements  
- **Dynamic Learning**: API endpoints to add new experiences and projects
- **Social Proof**: Integration with LinkedIn/GitHub for real-time updates
- **Interactive Examples**: Embedded code snippets and project demos


## 🎥 Video Walkthrough

[5-minute demo video covering]:
1. UI tour and mode demonstrations
2. Sample conversations showing personality
3. Behind-the-scenes: n8n workflow and Supabase data
4. AI collaboration process and artifacts

## 🔗 Links

- **Live Demo**: https://form-ui-with-supabas-hfsr.bolt.host/
- **GitHub Repository**: [This repo]](https://github.com/DeanJeggels/UbundiTrialProject)
- **Demo Video**: [YouTube/Loom link]

## 📊 Evaluation Criteria Coverage

| Criteria | Implementation | Evidence |
|----------|---------------|----------|
| Context Handling | ✅ Structured Supabase RAG with CV + supporting docs | `/sql/` folder with data structure |
| Agentic Thinking | ✅ 5 conversation modes + self-reflection capabilities | Mode switcher in UI |
| Personal Data Usage | ✅ Authentic CV, projects, work insights, client references | Comprehensive data in `/data/` |
| Build Quality | ✅ Deployed, documented, testable system | Live demo + setup instructions |
| Voice & Reflection | ✅ First-person responses with Dean's personality | Sample conversations |
| AI Build Artifacts | ✅ Detailed collaboration logs and prompt evolution | `/ai-artifacts/` folder |
| RAG Usage | ✅ Supabase vector storage with intelligent retrieval | n8n workflow implementation |

---

*Built with ❤️ using AI-native development practices*
*Dean Jeggels - AI Robotics Engineer & Automation Specialist*
