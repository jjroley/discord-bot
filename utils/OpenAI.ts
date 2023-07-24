import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai"
import { openAIToken } from '../config.json'
import { systemPrompt } from '../data.json'
import { Message } from "discord.js";
import { getReplyChain } from "./helpers";

import client from "..";

class OpenAI {
  private configuration: Configuration;
  private api: OpenAIApi
  constructor() {
    this.configuration = new Configuration({
      apiKey: openAIToken
    })
    this.api = new OpenAIApi(this.configuration)
  }

  async getChatResponse(message:Message) {
    const messages:ChatCompletionRequestMessage[] = (await getReplyChain(message)).map(message => {
      return {
        role: client.user?.id === message.author.id ? 'assistant' : 'user',
        content: message.cleanContent.replace(/^\$[\w\-]+/, '')
      }
    }) 

    console.log(messages)
    
    const chatCompletion = await this.api.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 600
    })

    const response = chatCompletion.data.choices[0].message

    return response
  }
}

const openai = new OpenAI()

export default openai
