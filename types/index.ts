import type { Message } from "discord.js";


export interface CustomCommand {
  name: string
  execute: (listener:Message) => void
}
