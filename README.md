# Sidecar Webpack Plugin

This is a Webpack 5 plugin that leverages the use of [Module federation (MF)](https://webpack.js.org/concepts/module-federation/) with sensible conventions to easily provide and consume code in a way that is:

1. sidecar-like: functionality of the sidecar packages is exposed in some "well defined" public API
2. local first: prefers the npm installed implementation
3. remote sidecar: leverages MF to load the code from a location defined at runtime

The problem of having an increasingly large code base is that our applications are usually managed by multiple teams. The agility of the team producing code in a large codebase is usually impacted unrelated parts of an applications are being considered by the build tools all the time.

Please check [plugin/README.md](plugin/README.md) for more information!