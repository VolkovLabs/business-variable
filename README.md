# Business Variable for Grafana

![Dashboard](https://github.com/VolkovLabs/business-variable/raw/main/src/img/dashboard.png)

![Grafana](https://img.shields.io/badge/Grafana-11.6-orange)
![CI](https://github.com/volkovlabs/business-variable/workflows/CI/badge.svg)
![E2E](https://github.com/volkovlabs/business-variable/workflows/E2E/badge.svg)
[![Codecov](https://codecov.io/gh/VolkovLabs/business-variable/branch/main/graph/badge.svg)](https://codecov.io/gh/VolkovLabs/business-variable)
[![CodeQL](https://github.com/VolkovLabs/business-variable/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/VolkovLabs/business-variable/actions/workflows/codeql-analysis.yml)

## Overview

The **Business Variable** panel enhances Grafana’s dashboard variables by presenting them in a dedicated, customizable panel. Position it anywhere on your dashboard and choose from a variety of layouts, including an advanced **TreeView** option, to streamline filtering and improve usability.

[![Watch: Business Variable Panel for Grafana - New Features in 3.0.0](https://raw.githubusercontent.com/volkovlabs/business-variable/main/img/business-variable.png)](https://youtu.be/vcdcLDVQYek)

## Requirements

- **Version 3.x**: Compatible with Grafana 10.3 or Grafana 11
- **Versions 1.x, 2.x**: Compatible with Grafana 9.2 or Grafana 10

## Installation

Install the Business Variable panel via the [Grafana Plugins Catalog](https://grafana.com/grafana/plugins/volkovlabs-variable-panel/) or use the Grafana CLI:

```bash
grafana-cli plugins install volkovlabs-variable-panel
```

For a visual guide, watch our installation tutorial:  
[![Watch: Install Business Suite Plugins in Cloud, OSS, and Enterprise](https://raw.githubusercontent.com/volkovlabs/.github/main/started.png)](https://youtu.be/1qYzHfPXJF8)

## Features

- **Display Modes**: Table, Minimize, Button, Slider
- **TreeView**: Configurable within Table mode for hierarchical data
- **Thresholds**: Visualize statuses based on data source thresholds
- **Variable Support**: Single/multi-value variables with "All" option
- **Filtering**: Pattern-based and favorite-based value filtering
- **Sticky Positioning**: Follows scrolling for accessibility
- **Tabbed TreeViews**: Organize multiple TreeViews with groups/tabs
- **Input Box**: Supports text input variables

## Documentation

| Section                                                                   | Description                            |
| ------------------------------------------------------------------------- | -------------------------------------- |
| [Data Flow](https://volkovlabs.io/plugins/business-variable/data-flow/)   | Details the panel’s data flow          |
| [Display Modes](https://volkovlabs.io/plugins/business-variable/layout/)  | Explores available layout options      |
| [Features](https://volkovlabs.io/plugins/business-variable/features/)     | Describes key panel capabilities       |
| [Tutorials](https://volkovlabs.io/plugins/business-variable/tutorials/)   | Step-by-step guides                    |
| [Release Notes](https://volkovlabs.io/plugins/business-variable/release/) | Highlights recent updates and features |

## Business Suite for Grafana

The Business Variable panel is part of the **Business Suite**, a collection of open-source plugins developed and maintained by Volkov Labs. Designed to address common business challenges, the suite offers intuitive interfaces backed by detailed documentation, examples, and video tutorials.

[![Explore the Business Suite](https://raw.githubusercontent.com/VolkovLabs/.github/main/business.png)](https://volkovlabs.io/plugins/)

### Enterprise Support

Subscribe to [Business Suite Enterprise](https://volkovlabs.io/pricing/) for comprehensive support:

- Dedicated support team via Zendesk
- Priority feature requests and bug fixes
- In-person consultations
- Access to Business Intelligence platform

## Community & Feedback

We’d love to hear from you!

- File issues, request features, or ask questions on [GitHub Issues](https://github.com/volkovlabs/business-variable/issues)
- Subscribe to our [YouTube Channel](https://youtube.com/@volkovlabs) and share your thoughts

## License

Licensed under the Apache License 2.0. See [LICENSE](https://github.com/volkovlabs/business-variable/blob/main/LICENSE) for details.
