# Business Variable Panel for Grafana

![Dashboard](https://github.com/VolkovLabs/business-variable/raw/main/src/img/dashboard.png)

![Grafana](https://img.shields.io/badge/Grafana-11.0-orange)
![CI](https://github.com/volkovlabs/business-variable/workflows/CI/badge.svg)
![E2E](https://github.com/volkovlabs/business-variable/workflows/E2E/badge.svg)
[![codecov](https://codecov.io/gh/VolkovLabs/business-variable/branch/main/graph/badge.svg)](https://codecov.io/gh/VolkovLabs/business-variable)
[![CodeQL](https://github.com/VolkovLabs/business-variable/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/VolkovLabs/business-variable/actions/workflows/codeql-analysis.yml)

## Introduction

The Business Variable panel builds on top of the regular dashboard variables. It allows you to have dashboard filters in a separate panel which you can place anywhere on the dashboard.

The variable panel offers you single- and multi-variable layouts along with an advanced Tree View.

[![Business Variable Panel for Grafana. New features and updates 3.0.0](https://raw.githubusercontent.com/volkovlabs/business-variable/main/img/business-variable.png)](https://youtu.be/vcdcLDVQYek)

## Requirements

- Business Variable panel 3.X requires **Grafana 10** or **Grafana 11**.
- Variable panel 1.X, 2.X requires **Grafana 9.2** or **Grafana 10**.

## Getting Started

The Business Variable panel can be installed from the [Grafana Catalog](https://grafana.com/grafana/plugins/volkovlabs-variable-panel/) or utilizing the Grafana command line tool.

For the latter, please use the following command.

```bash
grafana-cli plugins install volkovlabs-variable-panel
```

## Highlights

- Allows working with dashboard variables in the **Table**, **Minimize**, **Button**, and **Slider** display modes.
- The **Table** display mode can be configured into a TreeView.
- Displays statuses based on thresholds from data sources.
- Supports single and multi-value variables with the All option.
- Allows filtering values by pattern and selected favorites.
- Supports follow when scrolling (**Sticky position**).
- Supports multiple TreeViews using groups/tabs.
- Supports the input text (**Input box**) variables.

## Documentation

| Section                                                                   | Description                              |
| ------------------------------------------------------------------------- | ---------------------------------------- |
| [Data Flow](https://volkovlabs.io/plugins/business-variable/data-flow/)   | Explains the Business Variable data flow |
| [Display Modes](https://volkovlabs.io/plugins/business-variable/layout/)  | Explains different display modes         |
| [Features](https://volkovlabs.io/plugins/business-variable/features/)     | Explains panel features                  |
| [Release Notes](https://volkovlabs.io/plugins/business-variable/release/) | The latest features and updates          |

## Feedback

We're looking forward to hearing from you. You can use different ways to get in touch with us.

- Ask a question, request a new feature, and file a bug with [GitHub issues](https://github.com/volkovlabs/business-variable/issues/new/choose).
- Subscribe to our [YouTube Channel](https://www.youtube.com/@volkovlabs) and leave your comments.
- Sponsor our open-source plugins for Grafana with [GitHub Sponsor](https://github.com/sponsors/VolkovLabs).
- Support our project by starring the repository.

## License

Apache License Version 2.0, see [LICENSE](https://github.com/volkovlabs/business-variable/blob/main/LICENSE).
