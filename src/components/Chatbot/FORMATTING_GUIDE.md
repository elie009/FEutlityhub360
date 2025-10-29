# Chatbot Message Formatting Guide

The chatbot now supports rich text formatting for better readability and structure.

## Supported Formatting

### 1. **Numbered Lists**
When the AI responds with numbered items like:
```
1. First item
2. Second item
3. Third item
```
It will be displayed as a properly formatted ordered list (ol).

### 2. **Bullet Lists**
When the AI responds with bullet points using `-`, `*`, or `•`:
```
- First bullet point
- Second bullet point
- Third bullet point
```
It will be displayed as a properly formatted unordered list (ul).

### 3. **Paragraphs**
Text separated by double newlines (`\n\n`) will be formatted as separate paragraphs with proper spacing.

### 4. **Bold Text**
Text wrapped in `**` or `__` will be rendered as **bold**:
```
**This is bold text**
__This is also bold__
```

### 5. **Italic Text**
Text wrapped in single `*` or `_` will be rendered as *italic*:
```
*This is italic text*
_This is also italic_
```

### 6. **Inline Code**
Text wrapped in backticks will be rendered as `inline code` with a gray background:
```
`code snippet`
```

## Examples

### Example 1: Financial Advice with Numbered Steps
**Input:** "How can I improve my financial health?"

**Output:**
```
Here are some steps to improve your financial health:

1. **Track your expenses**: Monitor all your spending for at least a month
2. **Create a budget**: Allocate your income to different categories
3. **Build an emergency fund**: Aim for 3-6 months of expenses
4. **Pay off high-interest debt**: Focus on credit cards first
5. **Start investing**: Consider index funds for long-term growth

Would you like help with any of these steps?
```

### Example 2: Feature Explanation with Bullets
**Input:** "What can this app do?"

**Output:**
```
UtilityHub360 offers several powerful features:

- Bill Management: Track and pay all your bills in one place
- Budget Tracking: Monitor your spending against your budget
- Loan Calculator: Calculate loan payments and interest
- Reports & Analytics: Visualize your financial data
- AI Assistant: Get personalized financial advice

Which feature would you like to explore?
```

### Example 3: Mixed Formatting
**Input:** "How does the bill prediction work?"

**Output:**
```
The **Bill Prediction** feature uses historical data to forecast future bills.

Here's how it works:

1. **Data Collection**: We analyze your past bills (minimum 3 months)
2. **Pattern Recognition**: Our AI identifies seasonal patterns and trends
3. **Forecasting**: We predict future amounts with `confidence scores`
4. **Alert System**: You get notified when predicted amounts differ significantly

The accuracy improves over time as we collect more data!
```

## Technical Implementation

The formatting is handled by two functions:

1. `formatMessageContent(content: string)`: Parses the message and splits it into paragraphs, lists, etc.
2. `formatInlineText(text: string)`: Handles inline formatting like bold, italic, and code.

## User Experience

- **User messages**: Displayed as-is without formatting (plain text)
- **Bot messages**: Processed with full formatting support
- **Quick Actions**: Displayed as clickable chips below formatted messages
- **Report Data**: Rendered as cards with special styling

This formatting makes the chatbot responses more readable, professional, and easier to scan for important information.

