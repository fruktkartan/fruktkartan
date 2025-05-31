# Fruktkartan

[![Build](https://github.com/fruktkartan/fruktkartan/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/fruktkartan/fruktkartan/actions/workflows/build.yml) \
[![Deploy](https://github.com/fruktkartan/fruktkartan/actions/workflows/deploy-production.yml/badge.svg?branch=production)](https://github.com/fruktkartan/fruktkartan/actions/workflows/deploy-production.yml) to production

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

### Internal changes in Vue3 upgrade

- Snackbar messages handled in a central pinia store, and queued
- DayJS (only used in one place) replaced with native JS toLocaleDateString

### Roadmap

- Move backend into this repo, so that we can use the same logic for tree
  types, etc.
  - Now that we are on Vue3, that can be quickly setup with Nuxt:
    https://nuxt.com/docs/guide/directory-structure/server

- Clean up routing, that is currently a half-baked mess
- The Vue Leaflet package is abandonware, and also integrates quite poorly into
  the Vue system. Sooner or later we will want to replace that with something
  else.

## Contributing

### Project setup

Clone the repository and set up the project by running the following. Currently
nodejs v22.x (LTS) is recommended.

```
npm install
```

This no longer seems to be needed: `export NODE_OPTIONS=--openssl-legacy-provider`

### Run development server

The following servers up the app in a localhost web server with hot-reloads
(code is reloaded when edited and saved). It will run towards the S3 dev-bucket
(the photos), the dev-instance of the API (and therefore also the dev-instance
of the Postgres database).

```
npm run dev
```

It loads [`.env`](.env) and [`.env.development`](.env.development), and also
`.env.development.local`, if you have one. Can be useful for overriding.

### Build for production

The following compiles and minifies for production:

```
npm run build
```

It loads [`.env`](.env).

### Lint and format code

- `npm run lint` -- runs `eslint`
- `npm run lint-fix` -- runs `eslint --fix`
- `npm run format` -- runs `prettier` on relevant files in src/
- `npm run format-write` -- runs `prettier --write` on relevant files in src/

## License

The [license](LICENSE) is AGPLv3.
