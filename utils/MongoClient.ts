import { connect, Schema } from "mongoose";
import { mongoURI } from '../config.json';
import { ServerConfig } from "../schema";
import { IServerConfig } from "../schema/server-config";

class MongoClient {
		URI: string;
    status: "connected" | "loading" | "error";

		static defaultServerConfig = {
			modelName: 'gpt-3.5-turbo'
		}

    constructor(URI:string) {
			this.URI = URI;
    }

    async connect() {
			this.status = "loading";

			try {
				await connect(this.URI);
				this.status = "connected";
			}
			catch(err) {
				console.error("Failed to connect to MongoDB", err)
				this.status = "error";
			}
    }

    get connected() {
      return this.status === 'connected';
    }

		async getServerConfig(guildId:string):Promise<IServerConfig> {
			await this.connect();

			const defaultConfig = {
				_id: guildId,
				...MongoClient.defaultServerConfig
			}

			if( this.status !== 'connected' ) {
				return defaultConfig
			}

			const serverConfig = await ServerConfig.findById(guildId)

			if( ! serverConfig ) {
				return defaultConfig
			}

			return serverConfig;
		}
}

export default new MongoClient(mongoURI)