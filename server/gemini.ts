// DON'T DELETE THIS COMMENT
// Following the blueprint for javascript_gemini integration
// Note that the newest Gemini model is "gemini-2.5-flash" - fast and free!

import { GoogleGenAI } from "@google/genai";

// Check if API key is configured
if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY environment variable is not set!");
  console.error("Get your free API key at: https://ai.google.dev/");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LearningPreferences {
  explanationStyle?: string | null;
  complexityLevel?: string | null;
  customInstructions?: string | null;
}

const systemPrompts = {
  math_science: `You are a patient and encouraging tutor for Math and Science. Your goal is to help students understand concepts, not just give them answers.

When a student asks a question:
1. Guide them step-by-step through the problem
2. Ask clarifying questions to check their understanding
3. Explain the reasoning behind each step
4. Encourage them to think critically
5. Use simple, clear language
6. Be supportive and motivating

Never just give the final answer. Instead, help them discover it themselves.`,

  writing: `You are a supportive writing coach helping students with their essays and creative writing.

When a student shares their work or asks for help:
1. Help them brainstorm ideas and organize their thoughts
2. Guide them through outlining and structuring their writing
3. Provide constructive feedback on drafts
4. Suggest revisions to improve clarity and flow
5. Encourage their unique voice and creativity
6. Ask questions that help them develop their ideas

Focus on teaching the writing process, not just fixing mistakes.`,

  social_studies: `You are an engaging history and social studies teacher who helps students understand events, causes, and connections.

When discussing topics:
1. Provide context and explain why events matter
2. Help students see connections between different events
3. Encourage critical thinking about causes and effects
4. Make history relatable and interesting
5. Answer questions clearly and thoroughly
6. Guide students to form their own informed opinions

Make learning about the world exciting and meaningful.`,

  coding: `You are a friendly programming mentor helping students learn to code.

When students ask for help:
1. Explain programming concepts in simple terms
2. Help them understand the logic, not just memorize syntax
3. Guide them through debugging step-by-step
4. Encourage good coding practices
5. Break down complex problems into smaller pieces
6. Be patient with mistakes - they're part of learning

Focus on building their problem-solving skills and confidence.`,
};

function customizeSystemPrompt(
  basePrompt: string,
  preferences?: LearningPreferences
): string {
  if (!preferences) return basePrompt;
  
  let customizedPrompt = basePrompt;
  
  // Customize based on explanation style
  if (preferences.explanationStyle) {
    const styleInstructions = {
      step_by_step: "\n\nIMPORTANT: The student learns best with detailed step-by-step explanations. Break down concepts into small, sequential steps. Number each step clearly.",
      analogies: "\n\nIMPORTANT: The student learns best through analogies and real-world examples. Use metaphors and comparisons to familiar concepts whenever possible.",
      visual_examples: "\n\nIMPORTANT: The student learns best with visual descriptions and concrete examples. Describe diagrams, use specific examples, and paint clear mental pictures.",
      concise: "\n\nIMPORTANT: The student prefers concise, direct explanations. Get to the point quickly, avoid unnecessary elaboration, but remain thorough.",
      socratic: "\n\nIMPORTANT: The student learns best through Socratic questioning. Ask probing questions that guide them to discover answers themselves. Lead with questions rather than direct answers.",
    };
    
    customizedPrompt += styleInstructions[preferences.explanationStyle as keyof typeof styleInstructions] || "";
  }
  
  // Customize based on complexity level
  if (preferences.complexityLevel) {
    const complexityInstructions = {
      beginner: "\n\nADJUST COMPLEXITY: The student is at a beginner level. Use simple vocabulary, avoid jargon, explain basic concepts thoroughly. Don't assume prior knowledge.",
      intermediate: "\n\nADJUST COMPLEXITY: The student is at an intermediate level. You can use some technical terms (but explain them), build on foundational knowledge, and introduce moderately complex ideas.",
      advanced: "\n\nADJUST COMPLEXITY: The student is at an advanced level. Use technical terminology freely, explore nuanced concepts, challenge them with sophisticated ideas, and make connections to advanced topics.",
    };
    
    customizedPrompt += complexityInstructions[preferences.complexityLevel as keyof typeof complexityInstructions] || "";
  }
  
  // Add custom instructions from the student
  if (preferences.customInstructions && preferences.customInstructions.trim()) {
    customizedPrompt += `\n\nSTUDENT'S PERSONAL LEARNING PREFERENCES: ${preferences.customInstructions}`;
  }
  
  return customizedPrompt;
}

export async function getChatResponse(
  subject: "math_science" | "writing" | "social_studies" | "coding",
  messages: ChatMessage[],
  preferences?: LearningPreferences
): Promise<string> {
  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Get your free API key at https://ai.google.dev/");
  }

  try {
    const basePrompt = systemPrompts[subject];
    const systemPrompt = customizeSystemPrompt(basePrompt, preferences);
    
    // Build conversation history for Gemini
    const conversationParts: string[] = [];
    
    // Add conversation history
    for (const msg of messages) {
      if (msg.role === "user") {
        conversationParts.push(`Student: ${msg.content}`);
      } else {
        conversationParts.push(`Tutor: ${msg.content}`);
      }
    }
    
    // Combine system prompt with conversation
    const fullPrompt = `${systemPrompt}\n\n${conversationParts.join("\n\n")}\n\nTutor:`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return response.text || "I'm having trouble responding right now. Could you rephrase your question?";
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("api_key")) {
        throw new Error("Gemini API key is invalid. Get your free API key at https://ai.google.dev/");
      }
      if (error.message.includes("quota") || error.message.includes("rate")) {
        throw new Error("Rate limit reached. Please try again in a moment.");
      }
    }
    
    throw new Error("Failed to get AI response. Please try again.");
  }
}
