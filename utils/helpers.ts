import { Message } from "discord.js";




export async function getReplyChain(message:Message):Promise<Message[]> {
  const messages = []

  messages.push(message)

  let currentMessage = message;
  while(currentMessage.reference?.messageId) {
    try {
      currentMessage = await currentMessage.channel.messages.fetch(currentMessage.reference.messageId)
      messages.unshift(currentMessage)
    }
    catch(err) {
      console.error("Error")
    }
  }

  return messages
}