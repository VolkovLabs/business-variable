# Template to create a new Grafana panel plugin

![Dashboard](https://github.com/VolkovLabs/volkovlabs-abc-panel/raw/main/src/img/dashboard.png)

![Grafana 9](https://img.shields.io/badge/Grafana-9.5.2-orange)
![CI](https://github.com/volkovlabs/volkovlabs-abc-panel/workflows/CI/badge.svg)
![E2E](https://github.com/volkovlabs/volkovlabs-abc-panel/workflows/E2E/badge.svg)
[![codecov](https://codecov.io/gh/VolkovLabs/volkovlabs-abc-panel/branch/main/graph/badge.svg)](https://codecov.io/gh/VolkovLabs/volkovlabs-abc-panel)
[![CodeQL](https://github.com/VolkovLabs/volkovlabs-abc-panel/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/VolkovLabs/volkovlabs-abc-panel/actions/workflows/codeql-analysis.yml)

## Introduction

The Abc panel is a template we created to streamline our development process and gladly share it with the Grafana community.

To make the creation process efficient, starting with a well-constructed template is always easier.

Generate a template with [https://github.com/VolkovLabs/volkovlabs-abc-panel/generate](https://github.com/VolkovLabs/volkovlabs-abc-panel/generate).

## Requirements

- **Grafana 8.5+, Grafana 9.0+** is required for version 2.X.
- **Grafana 8.0+** is required for version 1.X.

## Getting Started

1. Install packages

```bash
npm install
```

2. Build the plugin

```bash
npm run build
```

3. Sign the plugins if required

```bash
export GRAFANA_API_KEY=erfdfsgfs==
npm run sign
```

4. Start the Docker container

```bash
npm run start
```

## Highlights

- Use `docker-compose` to start the development environment with provisioned data source and a dashboard.
- Provides unit and E2E test configuration.
- Based on the latest version of Grafana and Grafana Tools.
- Includes GitHub Actions for CI, E2E and Release.
- Includes Static Data Source to emulate any data.

## Support

We provide GitHub Discussions and Premium tier support for the development plugins available via [GitHub Sponsor](https://github.com/sponsors/VolkovLabs).

## License

Apache License Version 2.0, see [LICENSE](https://github.com/volkovlabs/volkovlabs-abc-panel/blob/main/LICENSE).
