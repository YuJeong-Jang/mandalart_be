# mandalart_be

### Installation
```sh
$ cd functions
$ npm install
```

### Local Build
```sh
$ npm run serve
```

### error
-  Port 5002 is not open on 0.0.0.0, could not start Functions Emulator.
```sh
$ lsof -i:5002
$ kill -9 {PID NUMBER}
```

### deploy
```sh
$ npm run deploy
```