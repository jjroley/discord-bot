import { Configuration, OpenAIApi } from "openai"
import type { CustomCommand } from "../types"
import { openAI } from '../config.json'
import fs from 'node:fs'
import path from 'node:path'

const configuration = new Configuration({
  apiKey: openAI
})

const openai = new OpenAIApi(configuration)

const command: CustomCommand = {
  name: "$ai",
  async execute(message) {
    
    let systemPrompt = '';
    try {
      systemPrompt = fs.readFileSync( path.join(__dirname, '..', 'system-prompt.txt'), { encoding: 'utf-8', flag: 'r' } )
    }
    catch(err) {
      console.error("Error reading prompt", err)
    }

    console.log(systemPrompt)

    const chatCompletion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system', content: systemPrompt
        },
        {
          role: 'user', content: message.content.slice(3)
        }
      ],
      max_tokens: 250
    })

    const response = chatCompletion.data.choices[0].message

    if(!response) return

    await message.reply(response)
  }
}

export default command