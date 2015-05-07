# nmConfig

[![Build Status](https://travis-ci.org/namshi/reconfig.svg?branch=travis)](https://travis-ci.org/namshi/reconfig)

Handy and _strongly_ opinionated config helper on top of [reconfig](https://github.com/namshi/reconfig).

## So what about it?
Here in Namshi we like our configuration: incremental, overridable, and defined in a compact way.<br/>
As well as we like to don't go nuts when we clone a project repo for the 1st time.<br/>
This is way we came up with tools like [reconfig](https://github.com/namshi/reconfig) and [file-ensure](https://github.com/namshi/node-file-ensure). With nmConfig we put all this things together in a convenient lib that turns all of this in a matter of a `require()` instruction.

## What does it do:

- Automatically creates a `config/` directory and the needed files if they are not present:

```
config/
     |- base.yml
     |- dev.example.yml
     |- staging.yml
     |- live.yml
```
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

- returns you a `reconfig` instance:
```javascript
console.log(config.get('characters.anakin'));

// ==> 'sith'
```

- Figures out a `recofig`'s env overrider prefix from your `package.json`:

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

## Options Params:
Options parameters:

- **baseFiles**: A list of files creating the base configuration
                 before applying the environment specific config.
                 These files will be merged in order, the env file
                 will be the last applied.

- **separator**: The separator Reconfig will use for console vars
                 overlays.

- **prefix**:    The prefix that Reconfig will use while grabbing
                 console variable and applying overlays.

- **ensure**:    Tells to nmConfig to check for the existence of <filename>.yml file.
                 If a <fileName>.example.yml is found, it will be used to produce
                 the ensured file.

- **env**:       Forced value for the environment:
                 by default nmConfig will read you env form:<br/>
                  - PROJECTNAME_ENV <br/>
                  - NODE_ENV<br/>
                  - or default to "dev"

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
