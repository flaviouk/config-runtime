# config-runtime

## Motivation

The handoff from the server to client of config values is not simple. Typings are hard, global variables are used and usually not cleaned up and there's no distinction of server and client only configs.

This library is heavily inspired from [NextJS Runtime Config](https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration).

## Usage

```ts
import { CreateRuntimeConfig, RuntimeConfig } from 'config-runtime'

interface ClientConfig {
  foo: string
}

interface ServerConfig {
  bar: number
}

const myConfig: RuntimeConfig<ClientConfig, ServerConfig> = {
  client: {
    foo: 'hello',
  },
  server: {
    bar: 5,
  },
}

const Config = new CreateRuntimeConfig<ClientConfig, ServerConfig>(
  // Useful for different kinds of config
  '__MY_CONFIG_NAME_TOTALLY_OPTIONAL__'
)

// Server entrypoint (only once)
Config.setConfig(
  myConfig
)

// Handoff between server and client (html payload)
`<script>${Config.serializedClientConfig}</script>`

// On the server
config.client // { foo: 'hello' }
config.server // { bar: 5 }

// On the client
config.client // { foo: 'hello' }
config.server // Error
```

## Features

1. Allows for server only config
2. An app could have as many configs as it wants (They are cached by the configName parameter in `new CreateRuntimeConfig(configName)`)
3. Caching enabled (Saves to an in memory variable, never to the global scope, exception being on the payload sent from the server, which get's deleted on the first getCall made)

## Flow

1. Create a config with this module, with a unique key and export it
2. Import that config in your server side entrypoint and call setConfig at the very top, just once
3. In the server to client handoff payload send the serialized public runtime config `serializedClientConfig`, this allows it to be available in Config.client
4. Call `Config.client` anywhere and call `Config.server` only on the server, doing something else will throw errors

## Gotchas

It doesn't protect against possible runtime errors due to something relying on a server value in the client so be careful.
