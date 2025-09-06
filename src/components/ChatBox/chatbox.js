import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  getDocs,
  where,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { Sparkles, Send, Bot, User, Trash2, Loader } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { db, storage } from "../../firebase";

const ChatBox = ({ formId, onClose, onQuestionsAdded }) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const q = query(
      collection(db, "chatbot"),
      where("formId", "==", formId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isNew: lastMessageTimestamp === null ? false : 
               doc.data().createdAt?.seconds > lastMessageTimestamp
      }))
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
      });

      if (newMessages.length > 0) {
        setLastMessageTimestamp(newMessages[newMessages.length - 1].createdAt?.seconds || 0);
      }

      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [formId, lastMessageTimestamp]);

  const clearChat = async () => {
    if (!window.confirm("Are you sure you want to clear all chat messages?")) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, "chatbot"),
        where("formId", "==", formId)
      );
      
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setMessages([]);
      setLastMessageTimestamp(null);
    } catch (error) {
      console.error("Error clearing chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const TypewriterText = ({ text, isNew }) => {
    const [displayText, setDisplayText] = useState(isNew ? "" : text);
    const [currentIndex, setCurrentIndex] = useState(0);
  
    useEffect(() => {
      if (!isNew) {
        setDisplayText(text);
        return;
      }

      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(c => c + 1);
        }, 15);
        return () => clearTimeout(timeout);
      }
    }, [currentIndex, text, isNew]);
  
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{displayText}</ReactMarkdown>
      </div>
    );
  };

  const generateAndUploadImage = async (prompt) => {
    const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) throw new Error("API key not configured");

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: "512x512",
          response_format: "b64_json"
        }),
      });

      const data = await response.json();
      if (!data.data || !data.data[0]?.b64_json) throw new Error("No image data received from DALL-E");

      const base64Image = data.data[0].b64_json;
      const timestamp = Date.now();
      const storageRef = ref(storage, `form-images/${formId}_${timestamp}_${prompt.slice(0, 20)}.png`);
      await uploadString(storageRef, base64Image, 'base64', { contentType: 'image/png' });
      
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error generating/uploading image:", error);
      throw error;
    }
  };

  const appendQuestionsToForm = async (questionData) => {
    try {
      setGeneratingQuiz(true);
      if (!formId) throw new Error("No form ID provided");
      
      const formDocRef = doc(db, "forms", formId);
      const formSnapshot = await getDoc(formDocRef);
      
      if (!formSnapshot.exists()) {
        throw new Error("Form not found. Please save your form first.");
      }
      
      const questionsCollRef = collection(formDocRef, "questions");
      const questionsSnapshot = await getDocs(questionsCollRef);
      
      const existingQuestions = questionsSnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      }));
      
      const sortedQuestions = [...existingQuestions].sort((a, b) => a.order - b.order);
      const lastOrder = sortedQuestions.length > 0 ? sortedQuestions[sortedQuestions.length - 1].order : -1;
      const lastId = sortedQuestions.length > 0 
        ? Math.max(...sortedQuestions.map(q => parseInt(q.id)))
        : 0;
      
      let addedCount = 0;
      const newQuestionIds = [];
      
      for (let i = 0; i < questionData.length; i++) {
        const question = questionData[i];
        if (!question.components || !Array.isArray(question.components)) question.components = [];
        
        for (const comp of question.components) {
          if (comp.type === "image_upload" && comp.prompt) {
            try {
              const imageUrl = await generateAndUploadImage(comp.prompt);
              comp.image = imageUrl;
              delete comp.prompt;
            } catch (error) {
              console.error("Failed to generate image:", error);
              comp.image = "https://via.placeholder.com/223x253?text=Image+Failed";
              delete comp.prompt;
            }
          }
        }
        
        const newId = lastId + i + 1;
        const newOrder = lastOrder + i + 1;
        
        question.components.forEach((comp, idx) => {
          if (!comp.position) {
            comp.position = { top: 100 + idx * 50, left: 100 + idx * 20 };
          }
          if (!comp.opacity && comp.opacity !== 0) {
            comp.opacity = 1;
          }
        });
        
        const questionDocRef = doc(collection(formDocRef, "questions"), newId.toString());
        
        await setDoc(questionDocRef, {
          id: newId,
          backgroundColor: question.backgroundColor || "#FFFFFF",
          points: question.points || 0,
          maxAttempts: question.maxAttempts || 0,
          order: newOrder,
          components: question.components || []
        });
        
        newQuestionIds.push(newId);
        addedCount++;
      }
      
      console.log(`Successfully added ${addedCount} questions with IDs: ${newQuestionIds.join(', ')}`);
      
      // Trigger success overlay and reload
      if (onQuestionsAdded && typeof onQuestionsAdded === 'function') {
        onQuestionsAdded(addedCount, newQuestionIds);
        // Delay reload to allow success overlay to display
        setTimeout(() => {
          window.location.reload();
        }, 2500); // Matches SuccessOverlay duration
      }
      
      return addedCount;
    } catch (error) {
      console.error("Error appending questions:", error);
      throw error;
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const getChatbotResponse = async (userMessage) => {
    const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) return "Error: API key not configured.";

    try {
      const isQuizRequest = userMessage.toLowerCase().includes("create") || 
                            userMessage.toLowerCase().includes("add") || 
                            userMessage.toLowerCase().includes("make");
      
      const hasTopic = userMessage.toLowerCase().includes("quiz") || 
                       userMessage.toLowerCase().includes("question") || 
                       userMessage.toLowerCase().includes("test");
      
      const willGenerateQuiz = isQuizRequest && hasTopic;
      const model = willGenerateQuiz ? "gpt-4o-mini" : "gpt-o3-mini";

      const systemPrompt = willGenerateQuiz ? 
        `You are an expert quiz designer and AI assistant for a quiz creation platform.
  
  CRUCIAL INSTRUCTION: You MUST include a JSON array of questions in your response, formatted exactly as shown below. This JSON MUST be wrapped in triple backticks with the json tag. For example:
  
  \`\`\`json
  [{"question": "data"}]
  \`\`\`
  
  This JSON structure is REQUIRED for the application to function properly. Do not skip this step.
  
  When users ask you to create quiz questions, follow these guidelines:
  1. Design questions that fit within an 800x600 canvas
  2. Use a maximum of 25 components per question
  3. Create visually appealing layouts with balanced component placement
  4. Generate educational and meaningful content related to the requested topic
  
  COMPONENT TYPES AND STRUCTURE:
  Each component must follow these exact structures:
  
  1. Text component:
  {
    "id": 1,
    "type": "text",
    "position": {"top": 50, "left": 200},
    "width": 400, 
    "height": 64,
    "opacity": 1,
    "text": {
      "text": "Your text content here",
      "format": {
        "bold": false,
        "italic": false,
        "align": "center",
        "size": "text-xl",
        "color": "#000000",
        "font": "Arial"
      }
    }
  }
  
  2. True/False component:
  {
    "id": 2,
    "type": "true_false",
    "position": {"top": 120, "left": 300},
    "width": 128,
    "height": 56,
    "opacity": 1,
    "value": false
  }
  
  3. Multiple Choice (Single) component:
  {
    "id": 3,
    "type": "multiple_choice_single",
    "position": {"top": 200, "left": 250},
    "width": 288,
    "height": 200,
    "opacity": 1,
    "options": ["Option 1", "Option 2", "Option 3"],
    "correctIndex": 0
  }
  
  4. Multiple Choice (Multi) component:
  {
    "id": 4,
    "type": "multiple_choice_multi",
    "position": {"top": 200, "left": 250},
    "width": 288,
    "height": 200,
    "opacity": 1,
    "options": ["Option A", "Option B", "Option C"],
    "correctAnswers": [0, 2]
  }
  
  5. Ranking component:
  {
    "id": 5,
    "type": "ranking",
    "position": {"top": 150, "left": 250},
    "width": 320,
    "height": 220,
    "opacity": 1,
    "items": ["Item 1", "Item 2", "Item 3"],
    "correctOrder": [0, 1, 2]
  }
  
  6. Image Upload component:
  {
    "id": 3,
    "type": "image_upload",
    "position": {"top": 170, "left": 540},
    "width": 223,
    "height": 253,
    "opacity": 1,
    "prompt": "description of the image to generate"
  }
  
  NOTE: For image_upload components, provide a descriptive "prompt" field. The image will be generated using DALL-E and the "prompt" will be replaced with an "image" field containing the URL.
  
  EXAMPLE OF A COMPLETE RESPONSE:
  \`\`\`json
  [
    {
      "backgroundColor": "#F8F9FA",
      "points": 10,
      "maxAttempts": 1,
      "components": [
        {
          "id": 1,
          "type": "text",
          "position": {"top": 50, "left": 100},
          "width": 600,
          "height": 80,
          "opacity": 1,
          "text": {
            "text": "What is the largest planet?",
            "format": {
              "bold": true,
              "italic": false,
              "align": "center",
              "size": "text-xl",
              "color": "#000000",
              "font": "Arial"
            }
          }
        },
        {
          "id": 2,
          "type": "multiple_choice_single",
          "position": {"top": 150, "left": 250},
          "width": 288,
          "height": 200,
          "opacity": 1,
          "options": ["Earth", "Jupiter", "Mars"],
          "correctIndex": 1
        },
        {
          "id": 3,
          "type": "image_upload",
          "position": {"top": 170, "left": 540},
          "width": 223,
          "height": 253,
          "opacity": 1,
          "prompt": "a diagram of the solar system"
        }
      ]
    }
  ]
  \`\`\`
  
  IMPORTANT REMINDER: The JSON structure is ABSOLUTELY REQUIRED. If you do not include it, the application will not be able to add the questions to the form.` :
        "You are a quiz maker and design bot who provides insightful and concise responses.";

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      });
      
      const data = await response.json();
      let responseContent = data.choices?.[0]?.message?.content || "Sorry, I didn't understand that.";
      
      if (willGenerateQuiz) {
        const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                         responseContent.match(/```\s*([$$     {][\s\S]*?[     $}])/g) ||
                         responseContent.match(/\[\s*\{\s*"backgroundColor"[\s\S]*\}\s*\]/);
        
        if (jsonMatch) {
          const jsonString = jsonMatch[1] || jsonMatch[0];
          const parsedData = JSON.parse(jsonString.replace(/```/g, '').trim());
          
          let questionData = Array.isArray(parsedData) ? parsedData :
                           parsedData.questions && Array.isArray(parsedData.questions) ? parsedData.questions :
                           parsedData.components && Array.isArray(parsedData.components) ? [parsedData] :
                           null;
          
          if (questionData && questionData.length > 0) {
            const addedCount = await appendQuestionsToForm(questionData);
            const humanReadableResponse = responseContent.replace(/```json[\s\S]*?```/g, '').trim();
            return `${humanReadableResponse}\n\nI've added ${addedCount} new question${addedCount !== 1 ? 's' : ''} to your form.`;
          }
        }
        
        const secondResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: "You are a quiz generator that responds ONLY with a JSON array of questions. Format with ```json and ``` wrapping the content." },
              { role: "user", content: `Based on this request: "${userMessage}", generate ONLY a JSON array of quiz questions to add to a form.` }
            ],
            temperature: 0.7,
            max_tokens: 2500,
          }),
        });
        
        const secondData = await secondResponse.json();
        const secondResponseContent = secondData.choices?.[0]?.message?.content || "";
        const secondJsonMatch = secondResponseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                              secondResponseContent.match(/```\s*([\[\{][\s\S]*?[\]\}])/g) ||
                              secondResponseContent.match(/\$\$\s*\{\s*"backgroundColor"[\s\S]*\}\s*\$\$/);
        
        if (secondJsonMatch) {
          const jsonString = secondJsonMatch[1] || secondJsonMatch[0];
          const questionData = JSON.parse(jsonString.replace(/```/g, '').trim());
          
          if (Array.isArray(questionData) && questionData.length > 0) {
            const addedCount = await appendQuestionsToForm(questionData);
            return `${responseContent}\n\nI've added ${addedCount} new question${addedCount !== 1 ? 's' : ''} to your form.`;
          }
        }
        
        return `${responseContent}\n\nI couldn't generate the proper structure. Please try again with more specific details.`;
      }
      
      return responseContent;
    } catch (error) {
      console.error("Error fetching OpenAI API:", error);
      return "Error: Unable to get a response. " + error.message;
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    try {
      await addDoc(collection(db, "chatbot"), {
        sender: "user",
        message: inputValue,
        createdAt: serverTimestamp(),
        formId: formId
      });

      const userMessage = inputValue;
      setInputValue("");
      setLoading(true);

      const chatbotResponse = await getChatbotResponse(userMessage);
      await addDoc(collection(db, "chatbot"), {
        sender: "chatbot",
        message: chatbotResponse,
        createdAt: serverTimestamp(),
        formId: formId
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-white" size={24} />
          <h1 className="text-xl font-semibold text-white">Quiz Designer AI</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            disabled={loading || generatingQuiz}
            className="p-2 text-white hover:text-red-200 transition-colors"
            title="Clear chat history"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center p-6 text-gray-500">
            <Bot size={40} className="mx-auto mb-3 text-blue-500 opacity-70" />
            <h3 className="font-semibold text-gray-700 mb-1">Quiz Designer AI</h3>
            <p className="text-sm mb-3">Hello! I can help you add questions or images to your current form.</p>
            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-sm">
              <button 
                onClick={() => setInputValue("Create 3 multiple choice questions about solar system planets")}
                className="p-2 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Create 3 multiple choice questions about solar system planets
              </button>
              <button 
                onClick={() => setInputValue("Add an image of a mountain landscape")}
                className="p-2 text-left rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Add an image of a mountain landscape
              </button>
              <button 
                onClick={() => setInputValue("Create a ranking question about the tallest buildings")}
                className="p-2 text-left rounded-lg border border-gray-200 hover:bg-gray,50"
              >
                Create a ranking question about the tallest buildings
              </button>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2 ${
              msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.sender === "user" ? "bg-blue-100" : "bg-emerald-100"
            }`}>
              {msg.sender === "user" ? (
                <User size={20} className="text-blue-600" />
              ) : (
                <Bot size={20} className="text-emerald-600" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.sender === "chatbot" ? (
                <TypewriterText text={msg.message} isNew={msg.isNew} />
              ) : (
                msg.message
              )}
            </div>
          </div>
        ))}
        
        {generatingQuiz && (
          <div className="flex items-start space-x-2 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Bot size={20} className="text-emerald-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[75%]">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Loader size={18} className="text-blue-500 animate-spin" />
                    <div className="absolute inset-0 animate-ping opacity-30 rounded-full bg-blue-400" 
                        style={{animationDuration: "3s"}}></div>
                  </div>
                  <div className="text-gray-700">
                    <p className="font-medium">Creating content...</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Designing components for your form
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 w-0 animate-progress-bar" 
                        style={{
                          animationDuration: "15s",
                          animationTimingFunction: "cubic-bezier(0.1, 0.5, 0.5, 1)"
                        }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Processing</span>
                    <span>Creating</span>
                    <span>Adding</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && !generatingQuiz && (
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Bot size={20} className="text-emerald-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleUserSubmit} className="border-t border-gray-100 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ask me to add questions or images to your form..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading || generatingQuiz}
          />
          <button
            type="submit"
            disabled={loading || generatingQuiz}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;