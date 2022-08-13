import { Logger } from "./lib";
import Loaders from "./loaders";

Loaders.load().then(() => Logger.info("🚀 Server is running."));