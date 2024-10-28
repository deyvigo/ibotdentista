import OpenAI from 'openai'
import dotenv from 'dotenv'
import { ResponseFormatJSONObject, ResponseFormatJSONSchema, ResponseFormatText } from 'openai/resources'
import { formatDate } from '@utils/formatDate'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const askToAI = async (
  userMessage: string,
  typeResponse: 'text' | 'json_object' | 'json_schema',
  someInstructions?: string
) => {
  const messages: Message[] = []

  // predefine system messages
  messages.push({
    role: 'system',
    content: `Hoy es ${formatDate(new Date())}. Te llamas Leopoldo y eres un asistente chatbot de una clínica dental llamada Tapia y Asociados que responde de manera amigable y corta. Los domingos el doctor no trabaja, por lo cuál no se pueden reservar citas ese día ni cancelar las citas de ese día.`
  })

  // push system instructions if provided
  if (someInstructions) {
    messages.push({ role: 'system', content: someInstructions })
  }

  // user message
  messages.push({ role: 'user', content: userMessage })

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    response_format: { 'type': typeResponse } as ResponseFormatJSONObject | ResponseFormatJSONSchema | ResponseFormatText
  })

  return completion.choices[0].message.content
}
