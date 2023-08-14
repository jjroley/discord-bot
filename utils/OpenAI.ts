import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai"
import { openAIToken } from '../config.json'
import { systemPrompt } from '../data.json'
import { Message } from "discord.js";
import { getReplyChain } from "./helpers";

import client from "..";
import { ServerConfig } from "../schema";
import mongoClient from "./MongoClient";
import { botUsername } from "../config.json";

class OpenAI {
  private configuration: Configuration;

  api: OpenAIApi

  constructor() {
    this.configuration = new Configuration({
      apiKey: openAIToken
    })
    this.api = new OpenAIApi(this.configuration)
  }

  async getChatResponse(message:Message) {
    await mongoClient.connect()

    const serverConfig = await ServerConfig.findById(message.guild?.id)

    let modalName:string;

    if( ! serverConfig?.modelName ) {
      modalName = 'gpt-3.5-turbo'
    }
    else {
      modalName = serverConfig.modelName
    }

    const messages = await getReplyChain(message)

    // first try to send a message with the chat completions api
    try {
      const chatCompletionMessages:ChatCompletionRequestMessage[] = messages.map(message => {
        return {
          role: client.user?.id === message.author.id ? 'assistant' : 'user',
          content: message.cleanContent.replace(/^\$[\w\-]+/, '')
        }
      })
      return await this.generateChatCompletion(chatCompletionMessages, modalName)
    }
    // if that fails, send a message with the completion api
    catch(err) {
      const completionMessages = messages.map(message => {
        return {
          name: message.author.username,
          content: message.cleanContent.replace(/^\$[\w\-]+/, '')
        }
      })
      return await this.generateCompletion(completionMessages, modalName)
    }
  }    
   
  private async generateChatCompletion(messages:ChatCompletionRequestMessage[], modalName:string) {
    const chatCompletion = await this.api.createChatCompletion({
      model: modalName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 600
    })

    return chatCompletion.data.choices[0].message?.content
  }

  private async generateCompletion(messages:{ name: string, content:string }[], modalName:string) {
    const formattedMessages = ([...messages, { name: botUsername, content: '' }]).map(message => {
      return `${message.name}: ${message.content}`
    }).join('\n')

    const completion = await this.api.createCompletion({
      model: modalName,
      prompt: formattedMessages,
      max_tokens: 600,
    })

    return completion.data.choices[0].text
  }
}

const openai = new OpenAI()

export default openai