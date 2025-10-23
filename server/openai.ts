import OpenAI from "openai";

// This is using OpenAI's API - following the blueprint for javascript_openai integration
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY environment variable is not set!");
  console.error("Please configure the OPENAI_API_KEY secret in your deployment settings.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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

export async function getChatResponse(
  subject: "math_science" | "writing" | "social_studies" | "coding",
  messages: ChatMessage[]
): Promise<string> {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable in your deployment settings.");
  }

  try {
    const systemPrompt = systemPrompts[subject];
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      max_completion_tokens: 1024,
    });

    return response.choices[0].message.content || "I'm having trouble responding right now. Could you rephrase your question?";
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("api_key")) {
        throw new Error("OpenAI API key is invalid. Please check your OPENAI_API_KEY environment variable.");
      }
      if (error.message.includes("rate_limit")) {
        throw new Error("OpenAI rate limit exceeded. Please try again in a moment.");
      }
    }
    
    throw new Error("Failed to get AI response. Please try again.");
  }
}
