# Fruktkartan

<img src="https://github.com/fruktkartan/fruktkartan/workflows/Build/badge.svg?branch=master" title="master branch" />

Branch [`production`](https://github.com/fruktkartan/fruktkartan/tree/production)
is deployed [automatically](https://github.com/fruktkartan/fruktkartan/actions/workflows/deploy-production.yml)
to the [fruktkartan.github.io repo](https://github.com/fruktkartan/fruktkartan.github.io)
which is published at https://fruktkartan.se

Branch `master` is deployed [automatically](https://app.netlify.com/sites/fruktkartan/deploys)
to https://master--fruktkartan.netlify.app

## What is Fruktkartan?

*Fruktkartan* (Swedish for "the fruit map") is a map where we collaboratively
build a database of edible fruits and berries in the wild, on common lands and
in public parks. Anyone can edit the map and the information is freely
licensed, the information under the [Open Database License](https://opendatacommons.org/licenses/odbl/summary/)
and submitted images under [CC0](https://creativecommons.org/publicdomain/zero/1.0/deed.sv).

![The logo of Fruktkartan](/public/og-f.png)

## Technical framework

*Fruktkartan* is built using Vue/Vuetify, and Leaflet with OpenStreetMap.

## Contributing

### Project setup

Set up your project by running:
```
npm install
```

Due to bit rot (old dependencies), this currently needs to be set:
```
export NODE_OPTIONS=--openssl-legacy-provider
```

### Compiles and hot-reloads for development
```
npm run serve
```

Loads [`.env`](.env) and [`.env.development`](.env.development) (and
`.env.development.local`, if you have one! useful for overriding)

### Compiles and minifies for production
```
npm run build
```

Loads [`.env`](.env).

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

## License

The [license](LICENSE) is AGPLv3.
