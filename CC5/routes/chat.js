const express = require('express');
const router = express.Router();

// Mental health knowledge base for RAG
const mentalHealthKnowledge = [
  {
    id: 1,
    topic: "anxiety",
    content: "Anxiety is a normal and often healthy emotion. However, when a person regularly feels disproportionate levels of anxiety, it might become a medical disorder. Techniques like deep breathing, mindfulness, and cognitive behavioral therapy can help manage anxiety."
  },
  {
    id: 2,
    topic: "depression",
    content: "Depression is a common and serious medical illness that negatively affects how you feel, the way you think, and how you act. It's characterized by persistent feelings of sadness and loss of interest in activities once enjoyed. It's important to seek professional help if experiencing symptoms of depression."
  },
  {
    id: 3,
    topic: "stress",
    content: "Stress is your body's reaction to pressure from a certain situation or event. It can be positive as a short-term motivator but can negatively impact health when chronic. Stress management techniques include regular exercise, adequate sleep, and relaxation practices."
  },
  {
    id: 4,
    topic: "mindfulness",
    content: "Mindfulness is the practice of purposely focusing your attention on the present moment and accepting it without judgment. Regular mindfulness practice can reduce stress, improve focus, and increase emotional regulation."
  },
  {
    id: 5,
    topic: "self_care",
    content: "Self-care means taking the time to do things that help you live well and improve both your physical health and mental health. Self-care can include maintaining a regular sleep routine, eating healthy, spending time in nature, or engaging in hobbies."
  }
];

// Distress signals detection
const distressKeywords = [
  "suicide", "kill myself", "end my life", "don't want to live", 
  "self-harm", "hurt myself", "cutting myself", 
  "hopeless", "worthless", "no reason to live"
];

// Helper function to detect distress signals
function detectDistress(message) {
  const lowercaseMessage = message.toLowerCase();
  return distressKeywords.some(keyword => lowercaseMessage.includes(keyword));
}

// Helper function for RAG - retrieve relevant knowledge
function retrieveKnowledge(message) {
  const lowercaseMessage = message.toLowerCase();
  
  // Simple keyword matching for retrieval
  for (const knowledge of mentalHealthKnowledge) {
    if (lowercaseMessage.includes(knowledge.topic)) {
      return knowledge.content;
    }
  }
  
  return null;
}

// Generate response using RAG approach
function generateResponse(message, username) {
  // Check for distress signals first
  if (detectDistress(message)) {
    return {
      text: "I notice you may be going through a difficult time. Remember that you're not alone, and help is available. Would you like me to provide some crisis resources that might be helpful?",
      distressDetected: true
    };
  }
  
  // Retrieve relevant knowledge
  const relevantKnowledge = retrieveKnowledge(message);
  
  // Generate response based on message and knowledge
  let response;
  
  if (relevantKnowledge) {
    // Use retrieved knowledge to inform response
    response = `I understand you're asking about ${message.toLowerCase().includes('anxiety') ? 'anxiety' : 
                message.toLowerCase().includes('depression') ? 'depression' : 
                message.toLowerCase().includes('stress') ? 'stress' : 
                message.toLowerCase().includes('mindfulness') ? 'mindfulness' : 'self-care'}. ${relevantKnowledge}`;
  } else {
    // Generic supportive responses when no specific knowledge is retrieved
    const supportiveResponses = [
      `I hear you, ${username}. How long have you been feeling this way?`,
      `Thank you for sharing that with me. Would you like to talk more about what's on your mind?`,
      `I'm here to support you. What do you think might help you feel better right now?`,
      `That sounds challenging. Have you tried any coping strategies that have worked for you in the past?`,
      `I appreciate you opening up. Remember that your feelings are valid, and it's okay to ask for help.`
    ];
    
    // Select a random supportive response
    const randomIndex = Math.floor(Math.random() * supportiveResponses.length);
    response = supportiveResponses[randomIndex];
  }
  
  return {
    text: response,
    distressDetected: false
  };
}

// Chat history endpoint
router.get('/history', (req, res) => {
  // In a real app, this would fetch from a database
  // For now, we'll return an empty array
  res.json({ history: [] });
});

// Send message endpoint
router.post('/message', (req, res) => {
  const { message, username = 'User' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Generate response using RAG
  const response = generateResponse(message, username);
  
  // In a real app, we would save the message and response to a database
  
  res.json({
    message: {
      text: message,
      sender: 'user',
      timestamp: new Date()
    },
    response: {
      text: response.text,
      sender: 'bot',
      timestamp: new Date(),
      distressDetected: response.distressDetected
    }
  });
});

module.exports = { chatRouter: router };