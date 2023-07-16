import path from "node:path"
import fs from "node:fs"
import { Client, Collection, ClientOptions, Events, REST, Routes, ApplicationCommandDataResolvable, CommandInteraction, Message } from "discord.js"
import { token, clientId, guildId } from '../config.json'
import type { CustomCommand } from "../types"


export default class DiscordClient extends Client {
  commands: Collection<any, any>
  commandsArr: ApplicationCommandDataResolvable[]
  $commands: { 
    [key:string]: CustomCommand 
  }
  constructor(options:ClientOptions) {
    super(options)
    this.commands = new Collection()
    this.commandsArr = []
    this.$commands = {}

    this.init()
  }

  protected async loadSlashCommands() {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => {
      return !file.endsWith('.map') && !file.startsWith('$')
    });
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = (await import(filePath)).default;
      console.log(command)
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('data' in command && 'execute' in command) {
        this.commands.set(command.data.name, command)
        this.commandsArr.push(command.data.toJSON())
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }

    const rest = new REST().setToken(token)
    
    try {
      console.log(`Started refreshing ${this.commandsArr.length} application (/) commands.`);

      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId), 
        { body: this.commandsArr }
      ) as Array<any>
  
      console.log(`Successfully reloaded ${data.length} application (/) commands.`)
    }
    catch(error) {
      console.error(error)
    }
   
  }

  protected async load$Commands() {
    console.log(`Started refreshing ${Object.keys(this.$commands).length} custom ($) commands.`);

    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => {
      return !file.endsWith('.map') && file.startsWith('$')
    });

    for(const filename of commandFiles) {
      const filePath = path.join(commandsPath, filename)
      const command = (await import(filePath)).default;
      this.$commands[command.name] = command
    }

    console.log(`Succesfully created ${Object.keys(this.$commands).length} custom ($) commands.`)
  }

  protected async init() {
    await Promise.all([
      this.loadSlashCommands(),
      this.load$Commands(),
      this.loadInteractions()
    ])

    this.on(Events.MessageCreate, async message => {
      this.handleMention(message)
      this.handle$Command(message)
    })
  }

  protected async loadInteractions() {
    this.on(Events.InteractionCreate, async interaction => {
      if(!interaction.isChatInputCommand()) return

      const command = this.commands.get(interaction.commandName)

      if(!command) {
        console.error("No command found for " + interaction.commandName)
        return;
      }

      try {
        await command.execute(interaction)
      }
      catch(error) {
        console.error(error)
        if(interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true })
        }
        else {
          await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
        }
      }
    })
  }

  protected async handleMention(message:Message) {
    if(!this.user) return

    if(message.mentions.has(this.user.id)) {
      
    }
  }

  protected async handle$Command(message:Message) {
    const commandName = message.content.match(/^\$[\w\-]+/)?.[0]
    if(!commandName) return
    const command = this.$commands[commandName]
    if(!command) return
    command.execute(message)
  }
}