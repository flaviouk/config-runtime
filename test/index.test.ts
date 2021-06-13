import { CreateRuntimeConfig, RuntimeConfig } from "../src";

interface ClientConfig {
  foo: string;
}

interface ServerConfig {
  bar: number;
}

let config: CreateRuntimeConfig<ClientConfig, ServerConfig>;

CreateRuntimeConfig.isServerSide = jest.fn();

const configName = "__GLOBAL_CONFIG_KEY__";

const setIsServer = (isServer: boolean) => {
  // @ts-expect-error
  CreateRuntimeConfig.isServerSide.mockReturnValue(isServer);
};

beforeEach(() => {
  config = new CreateRuntimeConfig(configName);
  setIsServer(true);
});

afterEach(() => {
  // @ts-ignore
  config = undefined;
  // @ts-ignore
  delete window[configName];
});

const mockConfig: RuntimeConfig<ClientConfig, ServerConfig> = {
  client: { foo: "" },
  server: { bar: 0 }
};

describe("[CreateRuntimeConfig/public]", () => {
  it("fails to set config in the client", () => {
    setIsServer(false);
    expect(() =>
      config.setConfig(mockConfig)
    ).toThrowErrorMatchingInlineSnapshot(
      `"[config-name/__GLOBAL_CONFIG_KEY__] setConfig should only be called on the server"`
    );
  });

  it("is able to get the client config multiple times", () => {
    config.setConfig(mockConfig);
    setIsServer(false);

    expect(config.client).toEqual(mockConfig.client);
    expect(config.client).toEqual(mockConfig.client);
    // @ts-ignore
    expect(window[configName]).toBe(undefined);
  });

  it("Should pick the config from the window", () => {
    // @ts-ignore
    window[configName] = { client: mockConfig.client };
    setIsServer(false);

    expect(config.client).toEqual(mockConfig.client);
  });

  it("Should fail in the client if it doesn't find any config", () => {
    setIsServer(false);

    expect(() => config.client).toThrowErrorMatchingInlineSnapshot(
      `"[config-name/__GLOBAL_CONFIG_KEY__] Runtime Config was not found, did you forget to forward it from the server with \\"serializedClientConfig\\"?"`
    );
  });
});

describe("[CreateRuntimeConfig/server]", () => {
  it("fails to set config more than once", () => {
    config.setConfig(mockConfig);
    expect(() =>
      config.setConfig(mockConfig)
    ).toThrowErrorMatchingInlineSnapshot(
      `"[config-name/__GLOBAL_CONFIG_KEY__] An instance of this config is already set, please only call setConfig once"`
    );
  });

  it("is able to get public config on server and client", () => {
    config.setConfig(mockConfig);

    expect(config.client).toEqual(mockConfig.client);

    setIsServer(false);
    expect(config.client).toEqual(mockConfig.client);
  });

  it("is able to get server config only on server", () => {
    config.setConfig(mockConfig);

    expect(config.server).toEqual(mockConfig.server);

    setIsServer(false);
    expect(() => config.server).toThrowErrorMatchingInlineSnapshot(
      `"[config-name/__GLOBAL_CONFIG_KEY__] Unable to use server config in a client environment"`
    );
  });

  it("is able to get the serialized client config", () => {
    config.setConfig(mockConfig);

    expect(config.serializedClientConfig).toMatchInlineSnapshot(
      `"window.__GLOBAL_CONFIG_KEY__={\\"client\\":{\\"foo\\":\\"\\"}};"`
    );
  });

  it("is able to get the server config multiple times", () => {
    config.setConfig(mockConfig);

    expect(config.server).toEqual(mockConfig.server);
    expect(config.server).toEqual(mockConfig.server);
  });

  it("can't get a config if is not set", () => {
    expect(() => config.client).toThrowErrorMatchingInlineSnapshot(
      `"[config-name/__GLOBAL_CONFIG_KEY__] Please use setConfig on the server"`
    );
    expect(() => config.server).toThrowErrorMatchingInlineSnapshot(
      `"[config-name/__GLOBAL_CONFIG_KEY__] Please use setConfig on the server"`
    );
  });

  it("is able to get the client config multiple times", () => {
    config.setConfig(mockConfig);

    expect(config.client).toEqual(mockConfig.client);
    expect(config.client).toEqual(mockConfig.client);
  });
});
