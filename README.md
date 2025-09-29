# Business Variable for Grafana

![Dashboard](https://github.com/VolkovLabs/business-variable/raw/main/src/img/dashboard.png)

[![Grafana](https://img.shields.io/badge/Grafana-12.0-orange)](https://grafana.com/)
[![CI](https://github.com/volkovlabs/business-variable/workflows/CI/badge.svg)](https://github.com/volkovlabs/business-variable/actions/workflows/ci.yml)
[![E2E](https://github.com/volkovlabs/business-variable/workflows/E2E/badge.svg)](https://github.com/volkovlabs/business-variable/actions/workflows/e2e.yml)
[![Codecov](https://codecov.io/gh/VolkovLabs/business-variable/branch/main/graph/badge.svg)](https://codecov.io/gh/VolkovLabs/business-variable)
[![CodeQL](https://github.com/VolkovLabs/business-variable/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/VolkovLabs/business-variable/actions/workflows/codeql-analysis.yml)

## Overview

The **Business Variable** panel transforms how you interact with Grafana dashboard variables. Place it anywhere on your dashboard and choose from multiple layouts, including an advanced **TreeView** option, to simplify filtering and boost usability.

[![Watch: Business Variable Panel for Grafana - New Features in 3.0.0](https://raw.githubusercontent.com/volkovlabs/business-variable/main/img/business-variable.png)](https://youtu.be/vcdcLDVQYek)

## Compatibility

- **Version 5.x**: Grafana 11.5 or Grafana 12
- **Version 4.x**: Grafana 11 or Grafana 12
- **Version 3.x**: Grafana 10.3 or Grafana 11
- **Versions 1.x, 2.x**: Grafana 9.2 or Grafana 10

## Installation

Install the Business Variable panel easily through the [Grafana Plugins Catalog](https://grafana.com/grafana/plugins/volkovlabs-variable-panel/) or via the Grafana CLI:

```bash
grafana cli plugins install volkovlabs-variable-panel
```

For a step-by-step visual guide, check out our installation tutorial:  
[![Watch: Install Business Suite Plugins in Cloud, OSS, and Enterprise](https://raw.githubusercontent.com/volkovlabs/.github/main/started.png)](https://youtu.be/1qYzHfPXJF8)

## Key Features

- **Display Modes**: Choose from Table, Minimize, Button, or Slider layouts.
- **TreeView**: Hierarchical data visualization within Table mode.
- **Thresholds**: Highlight statuses using data source thresholds.
- **Variable Support**: Handle single or multi-value variables with an "All" option.
- **Filtering**: Apply pattern-based or favorite-based value filtering.
- **Sticky Positioning**: Panel follows scrolling for easy access.
- **Tabbed TreeViews**: Organize multiple TreeViews into groups or tabs.
- **Input Box**: Support for text input variables.

## Documentation

Explore detailed guides and resources for the Business Variable panel:

| Section                                                                   | Description                          |
| ------------------------------------------------------------------------- | ------------------------------------ |
| [Data Flow](https://volkovlabs.io/plugins/business-variable/data-flow/)   | Understand the panel’s data flow     |
| [Display Modes](https://volkovlabs.io/plugins/business-variable/layout/)  | Explore layout customization options |
| [Features](https://volkovlabs.io/plugins/business-variable/features/)     | Learn about key capabilities         |
| [Tutorials](https://volkovlabs.io/plugins/business-variable/tutorials/)   | Follow step-by-step guides           |
| [Release Notes](https://volkovlabs.io/plugins/business-variable/release/) | Stay updated with recent changes     |

## Business Suite for Grafana

The Business Variable panel is a component of the **Business Suite**, a set of open-source plugins by Volkov Labs. These plugins address common business needs with user-friendly interfaces, backed by extensive documentation, examples, and video tutorials.

[![Explore the Business Suite](https://raw.githubusercontent.com/VolkovLabs/.github/main/business.png)](https://volkovlabs.io/plugins/)

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/volkovlabs/business-variable/blob/main/LICENSE) file for details.
