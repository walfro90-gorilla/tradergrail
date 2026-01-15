import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export interface MarketAnalysis {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: number
    summary: string
    reasoning: string[]
    sources: string[]
}

export async function analyzeMarketWithGemini(
    symbol: string,
    currentPrice: number,
    context?: string
): Promise<MarketAnalysis> {
    // Note: Google Grounding is enabled via API settings in Google AI Studio
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp'
    })

    const prompt = `You are a professional financial analyst specializing in algorithmic trading.

Analyze the current market conditions for ${symbol} at $${currentPrice}.
${context ? `Additional context: ${context}` : ''}

Use Google Search to find the latest news and market developments for ${symbol}.

Provide your analysis in the following JSON format:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": <0-100>,
  "summary": "<2-3 sentence overview>",
  "reasoning": ["<key point 1>", "<key point 2>", "<key point 3>"],
  "sources": ["<news source 1>", "<news source 2>"]
}

Be conservative and data-driven. Only respond with the JSON object, no additional text.`

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/{[\s\S]*}/)
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text

        const analysis: MarketAnalysis = JSON.parse(jsonString.trim())
        return analysis
    } catch (error) {
        console.error('Gemini analysis error:', error)
        throw new Error('Failed to analyze market with Gemini AI')
    }
}

export async function chatWithAiAnalyst(
    userMessage: string,
    conversationHistory: { role: string; content: string }[] = []
): Promise<string> {
    // Note: Google Grounding is enabled via API settings in Google AI Studio
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp'
    })

    const chat = model.startChat({
        history: conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        })),
        systemInstruction: `You are an AI trading analyst for TraderGrail, a sophisticated algorithmic trading platform. 
    
Your role is to:
- Provide market insights using the latest news via Google Search
- Explain trading strategies in clear, professional language
- Never provide financial advice, only educational analysis
- Be concise and data-driven
- Cite your sources when discussing news or events`
    })

    const result = await chat.sendMessage(userMessage)
    return result.response.text()
}
