import OpenAI from 'openai'
import dotenv from 'dotenv'
import { ResponseFormatJSONObject, ResponseFormatJSONSchema, ResponseFormatText } from 'openai/resources'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const askToAI = async (
  question: string,
  typeResponse: 'text' | 'json_object' | 'json_schema',
  systemMessages?: string
) => {
  const messages: Message[] = []

  // predefine system messages
  messages.push({ role: 'system', content: 'Te llamas Leopoldo y eres un asistente chatbot de una clínica dental llamada Tapia y Asociados que responde de manera amigable y corta.' })
  
  // push system instructions if provided
  if (systemMessages) {
    messages.push({ role: 'system', content: systemMessages })
  }

  // user message
  messages.push({ role: 'user', content: question })

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    response_format: { 'type': typeResponse } as ResponseFormatJSONObject | ResponseFormatJSONSchema | ResponseFormatText
  })

  return completion.choices[0].message.content
}
