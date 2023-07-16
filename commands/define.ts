import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import axios from "axios";

export default {
  data: new SlashCommandBuilder()
          .setName('define')
          .addStringOption((option) => (
            option.setName('word')
                  .setDescription('Word to define')
          ))
          .setDescription('Define a word'),
  async execute(interaction:CommandInteraction) {
    const word = interaction.options.get('word')?.value
    if(!word) {
      await interaction.reply("No word specified")
      return
    }
    
    let output = '';

    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)

      if(res.status === 200) {
        const data = await res.data
        if(Array.isArray(data)) {
          output += `### **${data[0].word}**\n`
          output += data[0].meanings.map((meaning:any, index:number) => {
            return `- _${meaning.partOfSpeech}:_ ${meaning.definitions[0].definition}`
          }).join('\n')
        }
      }  
    }
    catch(err) {
      console.error("Dictionary API failed", err)
    }
    
    output = output || "Unable to find definition"
    
    await interaction.reply(output)
  }        
}