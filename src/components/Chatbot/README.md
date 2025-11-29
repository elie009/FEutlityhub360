# UtilityHub360 AI Chatbot

## 🤖 Overview

The UtilityHub360 AI Chatbot is an intelligent financial assistant powered by OpenAI's API that helps users navigate the application, set up their accounts, manage bills, view financial reports, and get personalized financial advice. It appears as a floating action button in the bottom-right corner of the application.

## ✨ Features

### 🎯 **Core Functionality**
- **AI-Powered Conversations**: Intelligent responses using OpenAI's API with financial context
- **Account Setup Guidance**: Helps users complete their profile setup
- **Bill Management**: Guides users through adding and managing bills
- **Financial Reports**: Shows real-time financial summaries and analytics
- **Navigation Shortcuts**: Quick access to different sections of the app
- **Interactive Chat**: Natural language processing for user queries

### 🧠 **AI Features**
- **Contextual Responses**: AI has access to user's financial data for personalized advice
- **Conversation History**: Full conversation management with persistent chat history
- **Rate Limiting**: Built-in protection against API abuse (10 requests per minute)
- **Fallback Mode**: Graceful degradation to basic responses when AI is unavailable
- **Token Tracking**: Monitor AI usage and costs

### 📊 **Report Visualization**
- **Financial Summary**: Shows total bills, amounts, and savings rate
- **Bill Analytics**: Displays spending by category and payment status
- **Monthly Reports**: Comprehensive monthly financial overview
- **Real-time Data**: Fetches live data from the API

### 🚀 **Quick Actions**
- **One-click Navigation**: Direct links to different app sections
- **Smart Suggestions**: Context-aware recommendations from AI
- **Shortcut Links**: Opens pages in new tabs when needed

## 🎨 **User Interface**

### **Floating Action Button**
- Positioned in bottom-right corner
- Only visible when user is authenticated
- Chat icon with primary color theme

### **Chat Dialog**
- Modern, responsive design with AI indicators
- Message bubbles with user/bot avatars
- Quick action chips for easy interaction
- Report cards with visual data
- Typing indicators and smooth animations
- AI mode toggle and conversation history

### **AI Controls**
- **AI Mode Toggle**: Switch between AI-powered and basic responses
- **Conversation History**: View and manage past conversations
- **Token Counter**: Track AI usage and costs
- **Rate Limit Protection**: Automatic throttling to prevent abuse

## 🔧 **Technical Implementation**

### **Components**
- `Chatbot.tsx`: Main chatbot component with AI integration
- `ChatbotService.ts`: Service layer for API integration and AI chat

### **Key Features**
- **AI Chat Integration**: Full OpenAI API integration with financial context
- **Real-time API Integration**: Fetches live financial data
- **Context-aware Responses**: Adapts to user's current state and financial data
- **Error Handling**: Graceful fallbacks for API failures
- **Rate Limiting**: Built-in protection against API abuse
- **Conversation Management**: Persistent chat history and context
- **TypeScript Support**: Full type safety
- **Responsive Design**: Works on all screen sizes

### **API Endpoints**
- `POST /api/chat/message`: Send messages to AI chat
- `GET /api/chat/conversations`: Get conversation history
- `GET /api/chat/conversations/{id}/messages`: Get conversation messages
- `DELETE /api/chat/conversations/{id}`: Delete conversation
- `POST /api/chat/generate-report`: Generate financial reports
- `GET /api/chat/bill-reminders`: Get upcoming bill reminders
- `GET /api/chat/budget-suggestions`: Get personalized budget advice
- `GET /api/chat/financial-context`: Get comprehensive financial context

## 📱 **Usage Examples**

### **AI-Powered Financial Analysis**
```
User: "Analyze my spending patterns from the last 30 days and give me recommendations"
AI: Provides detailed analysis with personalized insights based on actual transaction data
```

### **Bill Management with AI**
```
User: "What bills do I have coming up this week?"
AI: Shows upcoming bills with personalized payment suggestions and budget impact
```

### **Financial Planning**
```
User: "Help me create a budget for next month based on my current income and expenses"
AI: Creates personalized budget recommendations using real financial data
```

### **Account Setup**
```
User: "I need help setting up my account"
Bot: Shows profile completion status and quick actions
```

### **Navigation**
```
User: "Go to my bills page"
Bot: Navigates directly to the bills section
```

## 🎯 **Smart Features**

### **AI Context Awareness**
- Detects if user has completed profile setup
- Shows relevant actions based on current page
- Adapts responses to user's financial data
- Provides personalized financial advice based on actual data

### **Financial Data Integration**
- Fetches real-time bill analytics
- Shows current financial status
- Displays spending patterns and trends
- AI has access to comprehensive financial context including:
  - Recent transactions (last 30 days)
  - Upcoming bills (next 7 days)
  - Active loans and their status
  - Savings accounts and goals
  - Financial summary (income, expenses, disposable amount)

### **User Experience**
- Natural conversation flow with AI
- Quick action buttons for common tasks
- Visual data representation
- Seamless navigation integration
- Conversation history management
- Rate limiting protection
- Fallback to basic mode when AI is unavailable

## 🚀 **Getting Started**

The AI chatbot is automatically available once you're logged in. Simply:

1. **Click the chat icon** in the bottom-right corner
2. **Toggle AI mode** for intelligent responses with financial context
3. **Ask questions** about the app or your finances
4. **Use quick actions** for instant navigation
5. **View reports** directly in the chat interface
6. **Access conversation history** to continue previous discussions

## 💡 **Tips for Users**

### **AI Mode (Recommended)**
- Ask specific questions like "Analyze my spending patterns" or "What bills are due this week?"
- Get personalized financial advice based on your actual data
- Use natural language for complex financial queries
- AI provides contextual suggestions and actionable insights

### **Basic Mode**
- Use for simple navigation and basic app guidance
- Faster responses without AI processing
- Good for quick questions about app features

### **General Tips**
- Use the quick action chips for instant navigation
- View financial reports without leaving the chat
- Get personalized guidance based on your account status
- Monitor your AI usage with the token counter
- Access conversation history to continue previous discussions

## 🔧 **Configuration**

### **Prerequisites**
1. **Authentication Required**: All chat endpoints require JWT authentication
2. **OpenAI API Key**: The chat feature requires an OpenAI API key configured in the backend
3. **Rate Limiting**: Limited to 10 messages per minute per user to prevent API abuse

### **Backend Setup**
- Update `OpenAISettings.ApiKey` in your `appsettings.json`
- Ensure the backend has the AI chat endpoints implemented
- Configure rate limiting and error handling

The AI chatbot is designed to be your personal financial assistant, providing intelligent insights and making it easier to manage your finances and navigate the UtilityHub360 application!

