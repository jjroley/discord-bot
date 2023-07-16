import type { CustomCommand } from "../types"
import openai from "../utils/OpenAI"


const command: CustomCommand = {
  name: "$ai",
  async execute(message) {
    const response = await openai.getChatResponse(message)

    if(!response) return

    await message.reply(response)
  }
}

export default command