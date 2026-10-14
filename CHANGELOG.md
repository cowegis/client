# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.8] - 2026-10-14

### Fixed

- Maps without a configured center stayed blank if their view should be adjusted to the bounds of the data layers
  (`bounds.adjustAfterLoad`). Leaflet fires the `add` event of a layer only after the map has a view, so the bounds
  listener registered in 1.0.7 never contributed. Data layers now check if they are on the map when the bounds are
  calculated.

## [1.0.7] - 2026-10-14

### Added

- Test suite based on Vitest and happy-dom: smoke tests for all registered control, layer and icon types, unit tests
  and integration tests for `<cowegis-map>` and `<cowegis-editor>`, including a contract test with a map config
  exported from the backend.
- GitHub Actions workflow running lint and tests on Node.js 22 and 24.
- Dependabot configuration; major updates arrive as separate pull requests.

### Changed

- Only data layers that are shown on the map contribute to `bounds.adjustAfterLoad`. Hidden layers are ignored.
- Stricter ESLint rules (`eslint:recommended`, `import/named`, `import/no-unresolved`).
- The client code no longer relies on the global `L` or `global` objects.

### Fixed

- Fullscreen control is compatible with `leaflet.fullscreen` 5
  ([#2](https://github.com/cowegis/client/pull/2)). Thanks to [@qzminski](https://github.com/qzminski)!
- The marker cluster and loading controls no longer depend on Leaflet being loaded by another module first.
- Font Awesome icons are imported in a way compatible with the package exports of Font Awesome 7. The webpack
  bundle only contains the icon files.
- Binding popups and tooltips no longer modifies the shared presets.
- Features referencing an icon preset without having `options` no longer throw an error.
- A `radius` property on marker features no longer throws an error.
- The bounds listener of data layers is registered only while the layer is on the map.
- Overpass layer:
  - Responses arriving after the layer was removed from the map are ignored.
  - The `moveend` listener is removed together with the layer.
  - Failed requests end the loading state and are logged.

[1.0.8]: https://github.com/cowegis/client/compare/1.0.7...1.0.8
[1.0.7]: https://github.com/cowegis/client/compare/1.0.6...1.0.7
