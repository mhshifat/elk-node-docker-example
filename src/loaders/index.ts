import { Logger } from "../lib";
import initServer from "./server";

export default class Loaders {
  constructor() {}

  static async load() {
    return Promise.all([
      await initServer()
    ])
  }
}
