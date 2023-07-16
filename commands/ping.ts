import { SlashCommandBuilder, CommandInteraction } from "discord.js";


export default {
  data: new SlashCommandBuilder()
          .setName('ping')
          .setDescription('Test if Bot is online'),
  async execute(interaction:CommandInteraction) {
    await interaction.reply("Pong!")
  }        
}