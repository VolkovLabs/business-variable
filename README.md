# Variable Panel for Grafana

![Dashboard](https://github.com/VolkovLabs/volkovlabs-variable-panel/raw/main/src/img/dashboard.png)

![Grafana 10](https://img.shields.io/badge/Grafana-10.0-orange)
![CI](https://github.com/volkovlabs/volkovlabs-variable-panel/workflows/CI/badge.svg)
![E2E](https://github.com/volkovlabs/volkovlabs-variable-panel/workflows/E2E/badge.svg)
[![codecov](https://codecov.io/gh/VolkovLabs/volkovlabs-variable-panel/branch/main/graph/badge.svg)](https://codecov.io/gh/VolkovLabs/volkovlabs-variable-panel)
[![CodeQL](https://github.com/VolkovLabs/volkovlabs-variable-panel/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/VolkovLabs/volkovlabs-variable-panel/actions/workflows/codeql-analysis.yml)

## Introduction

The Variable panel builds on top of the regular dashboard variables. It allows you to have dashboard filters in a separate panel which you can place anywhere on the dashboard.

The variable panel offers you single- and multi-variable layouts along with an advanced Tree View layout.

[![Demonstrates the Variable panel functionality](https://raw.githubusercontent.com/volkovlabs/volkovlabs-variable-panel/main/img/tutorial.png)](https://youtu.be/mYYtMW9qiPA)

## Requirements

- **Grafana 9** and **Grafana 10** are required for major version 1.

## Getting Started

The Variable panel can be installed from the [Grafana Catalog](https://grafana.com/grafana/plugins/volkovlabs-variable-panel/) or utilizing the Grafana command line tool.

For the latter, use the following command.

```bash
grafana-cli plugins install volkovlabs-variable-panel
```

## Highlights

- Allows working with dashboard variables in Table and Tree View layouts.
- Displays statuses based on thresholds from data sources.
- Supports single and multi-value variables with the All option.
- Allows filtering values by pattern and selected favorites.
- Supports follow when scrolling (sticky).
- Supports multiple Tree Views using tabs.

## Documentation

| Section                     | Description                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| [Layout](https://volkovlabs.io/plugins/volkovlabs-variable-panel/layout/) | Explains how to display variables in a table and tree view. |
| [Features](https://volkovlabs.io/plugins/volkovlabs-variable-panel/features/) | Demonstrates panel features. |
| [Release Notes](https://volkovlabs.io/plugins/volkovlabs-variable-panel/release/)    | Stay up to date with the latest features and updates.               |

## Feedback

We love to hear from you. There are various ways to get in touch with us:

- Ask a question, request a new feature, and file a bug with [GitHub issues](https://github.com/volkovlabs/volkovlabs-variable-panel/issues/new/choose).
- Subscribe to our [YouTube Channel](https://www.youtube.com/@volkovlabs) and add a comment.
- Sponsor our open-source plugins for Grafana with [GitHub Sponsor](https://github.com/sponsors/VolkovLabs).
- Star the repository to show your support.

## License

Apache License Version 2.0, see [LICENSE](https://github.com/volkovlabs/volkovlabs-variable-panel/blob/main/LICENSE).
