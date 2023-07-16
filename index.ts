import { token } from './config.json'
import { Events, GatewayIntentBits } from 'discord.js'
import DiscordClient from './utils/Client'

const client = new DiscordClient({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ] 
});

client.once(Events.ClientReady, (c:any) => {
  console.log("Client logged in: " + c.user.tag)
})

client.login(token);

export default client