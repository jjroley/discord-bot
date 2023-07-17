import { SlashCommandBuilder, CommandInteraction, ModalBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";

export default {
  data: new SlashCommandBuilder()
          .setName('lichess-user')
          .addStringOption(option => (
            option.setName('username').setDescription("Lichess user username")
          ))
          .setDescription('Get Lichess information for a user'),
  async execute(interaction:CommandInteraction) {
    const username = interaction.options.get('username')?.value

    try {
      if(!username) {
        throw new Error()
      }

      const data = await axios.get(`https://lichess.org/api/user/${encodeURIComponent(username)}`).then(res => res.data)

      if(!data) {
        throw new Error()
      }

      const date = new Date(data.createdAt)

      const embed = new EmbedBuilder()
      .setTitle(data.username)
      .setURL(data.url)
      .addFields(
        { name: "Blitz Rating", value: `${data.perfs.blitz.rating}` },
        { name: "Rapid Rating", value: `${data.perfs.rapid.rating}` },
        { name: "Bullet Rating", value: `${data.perfs.bullet.rating}` },
        { name: "Total Games Played", value: `${data.count.all}` },
        { name: "Wins", value: `${data.count.win} (${ Math.floor(data.count.win / (data.count.all || 1) * 100) }%)` },
        { name: "Member Since", value: `${date.toLocaleString('default', { month: 'long'})} ${date.getFullYear()}` }
      )


      // let output = `# ${data.username}\n`
      // output += `**Rapid:** rating: ${data.perfs.rapid.rating}, games: ${data.perfs.rapid.games}\n`
      // output += `**Blitz:** rating  ${data.perfs.blitz.rating}, games: ${data.perfs.blitz.games}\n`
      // output += `**Bullet:** rating: ${data.perfs.bullet.rating}, games: ${data.perfs.bullet.games}\n`
      // output += `**Total Games: ${data.count.all}\n`
      // output += `**Profile:** ${data.url}`

      interaction.reply({ embeds: [embed] })
    }
    catch(err) {
      console.error(err)
      interaction.reply("Unable to find user")
    }
  }        
}