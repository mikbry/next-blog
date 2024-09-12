---
layout: post
title:  "Best practices for publishing your npm package"
date:   2020-01-14
excerpt:  You want to create a new library for your project and publish it using npmjs. easy ?
categories: javascript npm
---
# How to master the art of npm packaging

You want to publish your brand new javascript library using npmjs ? In this article I will give you some valuable tips on how to build the perfect, slick and efficient package.

Firstly, why do you want to publish to npmjs ? You should read this : [become a better developer](https://dev.to/thegeoffstevens/why-publishing-your-own-npm-packages-can-make-you-a-better-developer-2lc6).

Ok are you ready ?

##  `$ npm publish`

There are many articles explaining how to start publishing your npm package. So I will not detail it here.

You should read npmjs documentation at first :

<https://docs.npmjs.com/cli/publish>

Once your are confident with publishing process, some points need to be validated :
- [Make sure your package installs and works](https://docs.npmjs.com/misc/developers#before-publishing-make-sure-your-package-installs-and-works)
- Did you check the files included in your package ?
- Are you sure that all the entries in the package.json are useful ?
- Did your package works smoothly on all targets ?

To check these points and others I recommend you to use [np](https://github.com/sindresorhus/np) a tool that will help you follow some good practices.

But it is not enough. As recent version of Node.js and browsers are compatibles with ESM (Import) and ES6+ syntax, you need a publishing strategy to target your audience.


## Modern javascript : targeting ESM but stay compatible with CommonJS

This strategy will help you develop and publish using modern javascript with no boilerplate and maintain a retro compatibility with older javascript engines.

You should read this article to understand how it works : [Hybrid npm packages](https://2ality.com/2019/10/hybrid-npm-packages.html).

I mainly use [Rollup bundler](https://rollupjs.org/)  to build a legacy package with support for ESM and CommonJS. Rollup will create two code bases:
- index.mjs : same as you code source
- index.js : your code source is transformed to CommonJS. You could also use Babel to transpile your code to older targets.

Your package.json contains two entries:
```json
{
  "main": "index.js",
  "module": "index.mjs",
}
```

## A minimal file structure

A package should contain at least :
```
- index.js
- package.json
- README
- LICENSE
```
package.json is the only mandatory file, as it describes your package. But without index.js it is useless. You should also add some information with a README (README.md) file and a LICENSE file. 

I recommend this structure for modern javascript bundles as we seen previously:
```
- index.js
- index.js.map
- index.mjs
- index.mjs.map
- package.json
- README.md
- CHANGELOG.md
- LICENSE
```
`*.map` files are useful for debugging purposes.

## Package.json: some unnecessary items

package.json is used mainly in 2 stages:
- during development: some fields like scripts, devDependencies or configurations for dev tools (Husky, ESLint, ...)
- As a descriptor for publishing: dependencies is the most important object. It lists all necessary modules to install.

But items used for development like scripts, devDependencies stay present in the published bundle.

Note: some scripts could be executed during installation/uninstallation steps. It could give you some extra control on how your library is used.. Like calling a webservice to count how many packages are really installed. See : <https://docs.npmjs.com/misc/scripts>

## Package your library

You don't need to publish all stuff from your project. Some files or directories should be excluded. You have 3 methods to do so.

<https://docs.npmjs.com/misc/developers#keeping-files-out-of-your-package>

### 1 - Using .npmignore or .gitignore

You exclude files using patterns from the bundle.

### 2 - Using files field in package.json

It works the opposite of #1, files contains an array of file patterns.

Note : in CommonJS package spec, you should detail how the struct of your package is using a 'directories' object. But I don't use it anymore.

<https://docs.npmjs.com/files/package.json#files>


### 3 - Using a dist folder

You need to copy all necessary files to a dist folder, and then add this folder to npm publish command:

```
$ npm build ./dist
$ cp ./README.md ./dist/README.md
$ cp ./package.json./dist/package.json
$ ...
$ npm publish ./dist
```

By doing so you have a better control on what to publish. dist folder is only dedicated to publishing (and building) so you could make some changes, reordering on included files. For example, you could change package.json without corrupting project's one, see next.

## Use Packito to clean your package before publishing it

I created this tool to go further in packaging npm module. It is a superset of previous step 3. In a dist folder, it will copy mandatory and selected files, but also refactor package.json to remove/change some fields.

<https://github.com/mikbry/packito>

So Packito will help you:
- clean your package.json
- no more scripting to copy files in dist

Here is a sample .packito.json. 
```json
{
  "remove": {
    "devDependencies": "*",
    "scripts": "*",
    "type": true,
    "esm": true,
    "husky": true,
    "commitlint": true
  },
  "replace": {
    "main": "index.js",
    "module": "index.mjs"
  },
  "publisher": {
    "name": "yarn test"
  },
  "output": "./dist",
  "copy": ["bin", "README.md", "LICENSE"]
}
```

Here, I use esm module for dev, test and coverage. I also setup husky and commitlint. So all references to these tools in dist/packages.json are useless for publishing so they will be removed. Also I use different paths for main and module fields, as index.* files are not present at the root during development stage, instead of publishing stage.


Package.json extracted from packito :
```json
{
  "name": "packito",
  "version": "0.4.0",
  "description": "clean your package before publishing it !",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "repository": "https://github.com/mikbry/packito.git",
  "bugs": "https://github.com/mikbry/packito/issues",
  "homepage": "https://github.com/mikbry/packito",
  "author": "Mik <mik@miklabs.com>",
  "license": "MIT",
  "scripts": {
    "build": "rollup -c && ./bin/packito.js",
    "dev": "rollup -c  &&  cross-env NODE_ENV=development node ./dist",
    "lint": "$(yarn bin)/eslint src",
    "test": "cross-env NODE_ENV=test  $(yarn bin)/mocha  --require esm",
    "coverage": "cross-env NODE_ENV=test  $(yarn bin)/nyc  _mocha",
    "report-coverage": "$(yarn bin)/nyc report --reporter=text-lcov > coverage.lcov",
    "prepublishOnly": "yarn build"
  },
  "bin": {
    "packito": "./bin/packito.js"
  },
  "engines": {
    "node": ">=10"
  },
  "dependencies": {
    "chalk": "^3.0.0",
    "minimist": "^1.2.0",
    "node-emoji": "^1.10.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^8.2.0",
    "@commitlint/config-conventional": "^8.2.0",
    "@rollup/plugin-json": "^4.0.0",
    "@rollup/plugin-node-resolve": "^6.0.0",
    "chai": "^4.2.0",
    "cross-env": "^6.0.3",
    "eslint": "^6.7.2",
    "eslint-config-airbnb-base": "^14.0.0",
    "eslint-config-prettier": "^6.7.0",
    "eslint-plugin-import": "^2.19.1",
    "eslint-plugin-jest": "^23.1.1",
    "eslint-plugin-prettier": "^3.1.1",
    "esm": "^3.2.25",
    "husky": "^3.1.0",
    "mocha": "^6.2.2",
    "nodemon": "^2.0.1",
    "nyc": "^14.1.1",
    "prettier": "^1.19.1",
    "rimraf": "^3.0.0",
    "rollup": "^1.27.9"
  },
  "husky": {
    "hooks": {
      "pre-commit": "yarn lint",
      "commit-msg": "[[ -n $HUSKY_BYPASS ]] || commitlint -E HUSKY_GIT_PARAMS"
    },
    "commitlint": {
      "extends": [
        "@commitlint/config-conventional"
      ]
    }
  }
}
```
You have a 65 lines json...

Generated package.json in ./dist

```json
{
	"name": "packito",
	"version": "0.4.0",
	"description": "clean your package before publishing it !",
	"main": "index.js",
	"module": "index.mjs",
	"repository": "https://github.com/mikbry/packito.git",
	"bugs": "https://github.com/mikbry/packito/issues",
	"homepage": "https://github.com/mikbry/packito",
	"author": "Mik <mik@miklabs.com>",
	"license": "MIT",
	"bin": {
		"packito": "./bin/packito.js"
	},
	"engines": {
		"node": ">=10"
	},
	"dependencies": {
		"chalk": "^3.0.0",
		"minimist": "^1.2.0",
		"node-emoji": "^1.10.0"
	}
}
```
Now you get 23 lines !

And package structure is optimized to :
```
- index.js
- index.js.map
- index.mjs
- index.mjs.map
- package.json
- README.md
- LICENSE
```

Distributing a polished and slick package is a respectful act. It is like ‘the cherry on the cake’. All pieces are well developed, tested, packaged and at the right place. Nothing is superfluous. And your code is much more clear for other team members working on it. You are a master-chief !

Don't hesitate to help me enhance [Packito](https://github.com/mikbry/packito), star it and give me some feedback. 

<a class="github-button" href="https://github.com/mikbry/packito" data-icon="octicon-star" aria-label="Star mikbry/packito on GitHub">Star</a>

**Thanks for reading !**

{% include share.html %}