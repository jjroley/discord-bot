import { SlashCommandBuilder, CommandInteraction, ModalBuilder, EmbedBuilder } from "discord.js";
import mongoClient from "../utils/MongoClient";
import { ServerConfig as ServerConfigRecord } from "../schema";
import openai from "../utils/OpenAI";
import { mongo } from "mongoose";

export default {
  data: new SlashCommandBuilder()
            .setName('change-model')
            .addStringOption(option => (
                option.setName('model').setDescription("Open AI model")
            ))
						.setDescription('Change the Open AI model'),

    async execute(interaction:CommandInteraction) {
			const currentModel = await ServerConfigRecord.findById( interaction.guildId )

			const modelName = interaction.options.get('model')?.value as string

			if( ! modelName ) {
					return await interaction.reply({
							content: "No model specified",
							ephemeral: true
					})
			}

			try {
					await openai.api.retrieveModel( modelName )
			}
			catch(err) {
					return await interaction.reply({
							content: "Invalid model specified",
							ephemeral: true
					})
			}

			if( currentModel ) {
				currentModel.modelName = modelName
				await currentModel.save()
			}
			else {
				const newModel = new ServerConfigRecord({
					_id: interaction.guildId,
					modelName: modelName
				})

				await newModel.save()
			}

			await interaction.reply({
					content: `Derwin Jinx is now powered by ${modelName}`,
			})
    }
}