import { SlashCommandBuilder, CommandInteraction, ModalBuilder, EmbedBuilder } from "discord.js";
import openai from "../utils/OpenAI";

export default {
  data: new SlashCommandBuilder()
            .setName('valid-models')
						.setDescription('View available models'),

	async execute(interaction:CommandInteraction) {
		const models = (await openai.api.listModels()).data.data

		// const embed = new EmbedBuilder()

		// embed.setTitle("Available Models")

		// embed.addFields(
		// 	...models.map(model => {
		// 		return {
		// 			name: model.id,
		// 			value: model.id
		// 		}
		// 	})
		// )

		// await interaction.reply({
		// 	embeds: [embed]
		// })

		await interaction.reply({
			content: models.map(model => `\`${model.id}\` | ${model.object}`).join('\n')
		})


	}
}
