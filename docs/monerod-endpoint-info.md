## Monerod Mainnet TCP ports

* 18080 --> exposes **P2P network** bound to ``0.0.0.0`` for outgoing connections
* 18081 --> exposes **JSON RPC API** bound to ``0.0.0.0`` for outgoing connections
* 18083 --> exposes **ZMQ Pub** bound to ``0.0.0.0`` for outgoing connections

## How to fetch monerod daemon info

You can query the Monerod daemon using `curl` over either HTTP or HTTPS as shown below:

## HTTP
```bash
curl http://node.forcaworks.net:18081/json_rpc -d '{"jsonrpc":"2.0","id":"0","method":"get_info"}' -H 'Content-Type: application/json' -sL
```

## HTTPS

```bash
curl https://node.forcaworks.net:18081/json_rpc -d '{"jsonrpc":"2.0","id":"0","method":"get_info"}' -H 'Content-Type: application/json' -sL
```

However, more info about monerod's JSON RPC API calls can be found here for future use: https://docs.getmonero.org/rpc-library/monerod-rpc/#json-rpc-methods
