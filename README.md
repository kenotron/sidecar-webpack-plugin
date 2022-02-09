# Sidecar Webpack Plugin

This is a Webpack 5 plugin that leverage the use of module federation (MF) and various conventions to easily provide and consume code in a way that is:

1. sidecar-like: functionality of the sidecar packages is behind what is defined in the package.json's "exports" field
2. local first: prefers the npm installed implementation
3. remote sidecar: leverages MF to load the code from a location defined at runtime

## Overview

The problem of having an increasingly large code base is that our applications are usually managed by multiple teams. The agility of the team producing code in a large codebase is usually impacted unrelated parts of an applications are being considered by the build tools all the time. 

### Is it Micro-Frontend?

The frontend community has been rallying behind an architectural pattern called [microfrontend](https://micro-frontends.org/). This has the advantage of allowing the individual team to develop and deploy their own function at will.

The drawback of the above mentioned method is that it forces the use of custom elements to achieve micro frontends. Custom elements themselves did not support a load mechanism at all. Further, it means that duplicated dependencies are going to be present on the page.

Pros:
* all modern browsers now support this standard
* the architectural pattern is very valid in addressing developer team agility 

Cons: 
* the DOM has limited semantics in addressing a micro frontend _architecture_
* no provided script loading mechanism
* no provided way to express shared dependencies
### Is it Module Federation?

[Module federation](https://webpack.js.org/concepts/module-federation/) is created to address some of the drawbacks above. The main drawback of using it as presented in the documentation is that all federated remotes are required to be known at build time.

Sidecar Webpack Plugin seeks to leverage MF while providing a way to override the remote entry point URL at run time. Adopting MF is not a all or nothing approach. Much of the MF documentation focuses on the dynamism in loading remotes at runtime. 

Pros:
* script loading is provided by the bundler
* independent of running environment (browser implementations or even node.js)
* 

> Author's opinion: to achieve the best tree shaking and deduplication, we should continue bundling with all npm packages for production. Sidecar Webpack Plugin pairs well in this case for a remote provider to only use it for inner loop develop against a deployed **preview host URL** that has the Sidecar Webpack Plugin enabled.

## Creating a sidecar Package

The sidecar package should have the following: 

1. a `package.json` that lists the entry point in its main field
2. (upcoming feature) list out all the exported API in the package.json via the `exports` key to automatically fill out what is "exposed" for the underlying MF plugin
3. a `webpack.config.js` that will turn the package into a remote bundle

## Configuring host to accept sidecar

Modify the `webpack.config.js` to add this plugin

```js
module.exports = {
  plugins: [
    new SidecarWebpackPlugin({
      // options
    })
  ]
}
```

# Contributing

### How to test this out?

```
yarn
yarn build
yarn start
```


