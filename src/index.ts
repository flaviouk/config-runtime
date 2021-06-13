// @ts-expect-error
import serialize from "serialize-javascript";

export interface RuntimeConfig<ClientConfig, ServerConfig> {
  // Will be available on both server and client
  client: ClientConfig;
  // Will only be available on the server side
  server: ServerConfig;
}

export class CreateRuntimeConfig<ClientConfig, ServerConfig> {
  private name: string;
  private cacheConfig: RuntimeConfig<ClientConfig, ServerConfig> | null;

  constructor(configName: string = "__RUNTIME_CONFIG__") {
    this.name = configName;
    this.cacheConfig = null;
  }

  static isServerSide() {
    return typeof window === "undefined";
  }

  private displayConfigName() {
    return `[config-name/${this.name}]`;
  }

  // Call this at the root of the application, in the server
  setConfig(config: RuntimeConfig<ClientConfig, ServerConfig>) {
    if (CreateRuntimeConfig.isServerSide()) {
      if (this.cacheConfig) {
        throw new Error(
          `${this.displayConfigName()} An instance of this config is already set, please only call setConfig once`
        );
      }
      this.cacheConfig = config;
    } else {
      throw new Error(
        `${this.displayConfigName()} setConfig should only be called on the server`
      );
    }
  }

  private getConfig(): RuntimeConfig<ClientConfig, ServerConfig> {
    if (this.cacheConfig) return this.cacheConfig;

    if (CreateRuntimeConfig.isServerSide()) {
      throw Error(
        `${this.displayConfigName()} Please use setConfig on the server`
      );
    }

    const config: RuntimeConfig<ClientConfig, ServerConfig> =
      // @ts-expect-error
      this.name in window ? window[this.name] : null;

    if (!config) {
      throw Error(
        `${this.displayConfigName()} Runtime Config was not found, did you forget to forward it from the server with "serializedClientConfig"?`
      );
    }
    this.cacheConfig = config;

    // @ts-expect-error
    delete window[this.name];
    return this.cacheConfig;
  }

  get client() {
    return this.getConfig().client;
  }

  get server() {
    if (!CreateRuntimeConfig.isServerSide()) {
      throw Error(
        `${this.displayConfigName()} Unable to use server config in a client environment`
      );
    }

    return this.getConfig().server;
  }

  // IMPORTANT, only "public" should be exposed here
  // Otherwise server only configuration can be exposed client
  get serializedClientConfig() {
    return `window.${this.name}=${serialize({ client: this.client })};`;
  }
}
