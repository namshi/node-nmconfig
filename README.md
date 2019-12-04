# nmConfig

[![Build Status](https://travis-ci.org/namshi/reconfig.svg?branch=travis)](https://travis-ci.org/namshi/reconfig)

Handy and _strongly_ opinionated config helper on top of [reconfig](https://github.com/namshi/reconfig).

## So what about it

Here in Namshi we like our configuration: incremental, overridable, and defined in a compact way.

As well as we like to don't go nuts when we clone a project repo for the 1st time.

This is why we came up with tools like [reconfig](https://github.com/namshi/reconfig) and [file-ensure](https://github.com/namshi/node-file-ensure). With nmConfig we put all this things together in a convenient lib that turns all of this in a matter of a `require()` instruction.

## What does it do

- Automatically creates a `config/` directory and the needed files if they are not present:

```code
config/
     |- base.yml
     |- dev.example.yml
     |- staging.yml
     |- live.yml
```

You can override the default files list by adding `defaultFiles` list to your app's package.json:

```json
{
  ...
  "scripts": {...},
  "nmConfig": {
    "defaultFiles": [
      "base",
      "development.dist",
      "staging",
      "production"
    ]
  },
  "dependencies": {...}
}
```

When you pass your own file names, make sure to pass them as `baseFiles` property in your options object (check below).

- Compiles your config files, figures out your environment and applies the needed merging on the `base.yml` one:

```yml

#base.yml
characters:
  yoda: jedi
  anakin: jedi
  obiWan: jedi

#dev.yml
characters:
  anakin: sith

```

will result in:

```javascript
{
  characters: {
    yoda: 'jedi',
    anakin: 'sith',
    obiWan: 'jedi'
  }
}
```

You can eventually define configuration paths in your app's `package.json` too, using your app's name as key,
and they'll be added to the final configuration:

```javascript

// Put something like this in your package.json

{
  "name": "myConfigurableApp",
  "version": "0.0.1",
  "description": "I can configure apps",
  "myConfigurableApp": {
    "characters": {
      "benSolo": "sith"
    }
  }

// and you'll obtain:

{
  characters: {
    yoda: 'jedi',
    anakin: 'sith',
    obiWan: 'jedi',
    benSolo: 'sith'
  }
}

```

- returns you a `reconfig` instance:

```javascript
console.log(config.get('characters.anakin'));

// ==> 'sith'
```

- Figures out a `reconfig`'s env overrider prefix from your `package.json`:

```javascript
//pacakage.json
{
  "name": "myApp",
  "version": "0.1.0",
  "description": "this is my app, there are many like it, but this one is mine!"
// [...]
}
```

will yield a `MYAPP_CONFIG` env prefix for `reconfig` (check [this section](https://github.com/namshi/reconfig#nodejs-specifics) on `reconfig`'s doc for more infos on what this does)

- Ensure you've a `dev.yml` on your dev machine, or eventually creates one from `dev.example.yml`

## Options Params

Options parameters:

- **baseFiles**: A list of files creating the base configuration
                 before applying the environment specific config.
                 These files will be merged in order, the env file
                 will be the last applied.

- **separator**: The separator Reconfig will use for console vars
                 overlays.

- **projectName**: Defines Your project's name. If none is given, the project's name
                   will be inferred form your package.json "name" value. All spaces will be removed.

- **prefix**:    The prefix that Reconfig will use while grabbing
                 console variable and applying overlays.

- **ensure**:    Tells to nmConfig to check for the existence of `<filename>`.yml file.
                 If a `<fileName>`.example.yml is found, it will be used to produce
                 the ensured file.

- **env**:       Forced value for the environment:
  - by default nmConfig will read you env form:
    - PROJECTNAME_ENV
    - NODE_ENV
    - or default to "dev"

NOTE: If you want to output the value of your system configuration on loading your config then you can set an option in your environment `config` file with a value of `verboseConfig: true` at the top level. If this is set then the config will be printed to `STDOUT`. 

## Installation

Install this library via [NPM](https://www.npmjs.org/package/node-nmconfig):

``` bash
npm install node-nmconfig
```

## Usage

```javascript
var config = require('node-nmconfig')();

// or

var config = require('node-nmconfig')({ /* options */ });

```

If you need it on the client side we highly recommend
[browserify](http://browserify.org/).

## Tests

This library is a little convenience wrapper on top of extensively tested projects,
so for once we can be a little bit lazy and skip them ;)<br/>
We do like tests tho, so if you feel giving us a hand we'll be more than happy
to see some PR love on this side :D
