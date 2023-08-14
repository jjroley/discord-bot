import { model, Schema } from "mongoose";

export interface IServerConfig {
    _id: string
    modelName: string
}

const ServerConfigSchema = new Schema<IServerConfig>({
    _id: { type: String, required: true },
    modelName: { type: String, required: true }
});

const ServerConfig = model<IServerConfig>( "ServerConfig", ServerConfigSchema );

export default ServerConfig;