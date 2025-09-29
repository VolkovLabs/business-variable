# Change Log

All notable changes to the **Business Variable Panel** for Grafana are documented in this file. This panel provides advanced variable management and visualization capabilities for Grafana dashboards.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - 2025-09-29

### Breaking Changes

- Requires the Scenes framework in Grafana 11.5 or Grafana 12.

### Added

- Added display tree view in the dock menu ([#291](https://github.com/volkovlabs/business-variable/issues/291)).
- Added group listbox instead of tabs with a 3-dot menu to expand ([#294](https://github.com/volkovlabs/business-variable/issues/294)).

### Changed

- Updated minimum Grafana version to 11.5.0 ([#292](https://github.com/volkovlabs/business-variable/issues/292)).
- Updated panel in docked menu on window resize ([#293](https://github.com/volkovlabs/business-variable/issues/293)).

## [4.2.0] - 2025-08-31

### Changed

- Update menu dots layout to prevent overlap ([#288](https://github.com/volkovlabs/business-variable/issues/288)).
- Updated Development Provisioning ([#289](https://github.com/volkovlabs/business-variable/issues/289)).

## [4.1.0] - 2025-07-29

### Overview

This release introduces new features and enhancements to improve user experience and functionality in the Business Variable plugin. Key additions include pinning group filters, custom icons for minimized panels, and new options for latency requests and tree view. Alongside these, we've made important updates to dependencies and configurations.

### Added

- **Pin/Unpin Group Filters**: Added the ability to pin or unpin group filters for better customization and usability ([#274](https://github.com/volkovlabs/business-variable/issues/274)).
- **Custom Icons for Minimized Panels**: Introduced the option to select native or custom icons for minimized variable panels ([#281](https://github.com/volkovlabs/business-variable/issues/281)).
- **Latency Request Option**: Added a new option to configure latency requests for improved performance tuning ([#283](https://github.com/volkovlabs/business-variable/issues/283)).
- **Tree View Values Wrap**: Implemented wrapping options for values in Tree View to enhance readability ([#285](https://github.com/volkovlabs/business-variable/issues/285)).

### Changed

- **Updated `useDatasourceRequest` Hook**: Improved the `useDatasourceRequest` hook by integrating updates from related packages ([#282](https://github.com/volkovlabs/business-variable/issues/282)).
- **Updated ESLint Configuration**: Revised ESLint settings to ensure better code quality and consistency ([#286](https://github.com/volkovlabs/business-variable/issues/286)).

## [4.0.0] - 2025-06-03

**Summary**: Major update with Grafana 12 compatibility and new filtering features.

### Breaking Changes

- Requires Grafana 11 or Grafana 12.

### Added

- Show selected values filter and selected range ([#269](https://github.com/volkovlabs/business-variable/issues/269)).

### Changed

- Upgraded to Grafana 12.0.1 with updated dependencies ([#271](https://github.com/volkovlabs/business-variable/issues/271)).

## [3.9.0] - 2025-04-08

**Summary**: Enhanced user experience with custom messages and minimized views.

### Added

- Custom message for 'no data' and 'variable not selected' cases ([#262](https://github.com/volkovlabs/business-variable/issues/262)).
- Minimized view for Tree View layout ([#263](https://github.com/volkovlabs/business-variable/issues/263)).

### Changed

- Upgraded to Grafana 11.6.0 with updated dependencies ([#265](https://github.com/volkovlabs/business-variable/issues/265)).

## [3.8.0] - 2025-03-26

**Summary**: Workflow improvements and dependency cleanup.

### Added

- Attestation to release workflow ([#246](https://github.com/volkovlabs/business-variable/issues/246)).
- Resize behavior for panels with sticky headers ([#253](https://github.com/volkovlabs/business-variable/issues/253)).

### Removed

- Dependency on `@volkovlabs/grafana-utils` ([#247](https://github.com/volkovlabs/business-variable/issues/247)).

## [3.7.0] - 2025-02-13

### Added

- Date Picker component ([#237](https://github.com/volkovlabs/business-variable/issues/237))
- Advanced option to modify browser tab title ([#243](https://github.com/volkovlabs/business-variable/issues/243))

### Changed

- Updated to use datasource ID instead of name, with variable support ([#229](https://github.com/volkovlabs/business-variable/issues/229))
- Enhanced sticky header for Scenes dashboards ([#230](https://github.com/volkovlabs/business-variable/issues/230))
- Improved favorites icon visibility ([#234](https://github.com/volkovlabs/business-variable/issues/234))
- Upgraded to Grafana 11.4.0 with updated dependencies ([#241](https://github.com/volkovlabs/business-variable/issues/241))

### Removed

- Alert Message variable type from support ([#235](https://github.com/volkovlabs/business-variable/issues/235))

## [3.6.0] - 2024-10-24

### Added

- Date Time Selector ([#209](https://github.com/volkovlabs/business-variable/issues/209))
- "All" option in Scenes dashboards ([#213](https://github.com/volkovlabs/business-variable/issues/213))

### Changed

- Refined Textbox variable behavior in Table view ([#211](https://github.com/volkovlabs/business-variable/issues/211))
- Updated E2E tests ([#216](https://github.com/volkovlabs/business-variable/issues/216))
- Improved sticky positioning in Scenes dashboards ([#221](https://github.com/volkovlabs/business-variable/issues/221))
- Upgraded to Grafana 11.3.0 with dependency updates ([#222](https://github.com/volkovlabs/business-variable/issues/222))

### Fixed

- Display errors in Slider view ([#220](https://github.com/volkovlabs/business-variable/issues/220))

## [3.5.0] - 2024-10-02

### Changed

- Improved variable selection in Minimize view ([#197](https://github.com/volkovlabs/business-variable/issues/197))
- Updated `@tanstack/virtual` to the latest version ([#207](https://github.com/volkovlabs/business-variable/issues/207))
- Upgraded to Grafana 11.2.2 with dependency updates ([#207](https://github.com/volkovlabs/business-variable/issues/207))

## [3.4.0] - 2024-08-23

### Added

- Option to reorder tabs in panel settings ([#193](https://github.com/volkovlabs/business-variable/issues/193))

### Changed

- Updated local storage key for favorites ([#194](https://github.com/volkovlabs/business-variable/issues/194))
- Upgraded to Grafana 11.1.4 ([#195](https://github.com/volkovlabs/business-variable/issues/195))

## [3.3.0] - 2024-08-14

### Added

- Scrollbar to Button view ([#187](https://github.com/volkovlabs/business-variable/issues/187))

### Changed

- Integrated datasource-driven favorites ([#184](https://github.com/volkovlabs/business-variable/issues/184))
- Enhanced documentation ([#185](https://github.com/volkovlabs/business-variable/issues/185))

## [3.2.0] - 2024-07-09

### Added

- Image threshold styling for status in Table view ([#170](https://github.com/volkovlabs/business-variable/issues/170))

### Changed

- Updated video tutorial ([#166](https://github.com/volkovlabs/business-variable/issues/166))
- Improved E2E workflow with Docker ([#173](https://github.com/volkovlabs/business-variable/issues/173))

## [3.1.0] - 2024-06-06

### Added

- Option to collapse/expand rows on load ([#159](https://github.com/volkovlabs/business-variable/issues/159))
- Reset button to Button view ([#162](https://github.com/volkovlabs/business-variable/issues/162))

### Changed

- Updated selection behavior with Ctrl key ([#160](https://github.com/volkovlabs/business-variable/issues/160))
- Upgraded to Grafana 11.0.0 with dependency updates ([#161](https://github.com/volkovlabs/business-variable/issues/161))
- Enhanced key/value pair selection for variables ([#165](https://github.com/volkovlabs/business-variable/issues/165))

## [3.0.0] - 2024-05-09

### Breaking Changes

- Requires Grafana 10 or Grafana 11

### Added

- Option to show/hide Minimize label ([#144](https://github.com/volkovlabs/business-variable/issues/144))
- Maximum visible values in Minimize view ([#147](https://github.com/volkovlabs/business-variable/issues/147))
- Plugin E2E tests, removed Cypress ([#149](https://github.com/volkovlabs/business-variable/issues/149))
- Row count in Table view ([#148](https://github.com/volkovlabs/business-variable/issues/148))
- Slider view ([#154](https://github.com/volkovlabs/business-variable/issues/154))

### Changed

- Improved multi-level selection/deselection ([#139](https://github.com/volkovlabs/business-variable/issues/139))
- Updated Minimize label width to Auto/Static ([#144](https://github.com/volkovlabs/business-variable/issues/144))
- Enhanced autoscroll behavior ([#152](https://github.com/volkovlabs/business-variable/issues/152))
- Prepared for Grafana 11 compatibility ([#155](https://github.com/volkovlabs/business-variable/issues/155))
- Upgraded to Grafana 10.4.2 with dependency updates ([#158](https://github.com/volkovlabs/business-variable/issues/158))

## [2.5.0] - 2024-04-01

### Added

- Indeterminate checkbox state ([#127](https://github.com/volkovlabs/business-variable/issues/127))
- Responsive tabs ([#130](https://github.com/volkovlabs/business-variable/issues/130))

### Changed

- Improved Tree View scrolling ([#128](https://github.com/volkovlabs/business-variable/issues/128))
- Supported new items in Minimize mode ([#134](https://github.com/volkovlabs/business-variable/issues/134))
- Preserved group selection across dashboards ([#135](https://github.com/volkovlabs/business-variable/issues/135))
- Enhanced Tree View display and scrolling ([#136](https://github.com/volkovlabs/business-variable/issues/136))
- Added reset for dependent variables on value selection ([#138](https://github.com/volkovlabs/business-variable/issues/138))

## [2.4.0] - 2024-03-17

### Breaking Changes

- Requires Grafana 9.2 or Grafana 10

### Added

- Preserve selected group option ([#124](https://github.com/volkovlabs/business-variable/issues/124))
- Label support in Button view ([#125](https://github.com/volkovlabs/business-variable/issues/125))

### Changed

- Updated README video tutorial ([#111](https://github.com/volkovlabs/business-variable/issues/111))
- Enhanced Timescale data handling ([#119](https://github.com/volkovlabs/business-variable/issues/119))
- Updated dependencies and GitHub Actions ([#120](https://github.com/volkovlabs/business-variable/issues/120))
- Improved default color contrast ([#122](https://github.com/volkovlabs/business-variable/issues/122))

## [2.3.1] - 2023-12-14

### Fixed

- Draggable icon for Grafana 10.3 ([#107](https://github.com/volkovlabs/business-variable/issues/107))

## [2.3.0] - 2023-12-13

### Added

- Persistent mode ([#103](https://github.com/volkovlabs/business-variable/issues/103))

### Changed

- Cleared table state on tab change ([#101](https://github.com/volkovlabs/business-variable/issues/101))
- Updated ESLint config and refactored code ([#102](https://github.com/volkovlabs/business-variable/issues/102))
- Upgraded to Grafana 10.2.2 with Volkov Labs package updates ([#104](https://github.com/volkovlabs/business-variable/issues/104))

## [2.2.0] - 2023-11-20

### Added

- Dashboard redirect option ([#92](https://github.com/volkovlabs/business-variable/issues/92))
- Clear filter value button ([#99](https://github.com/volkovlabs/business-variable/issues/99))

### Changed

- Updated ESLint config and sorted imports ([#93](https://github.com/volkovlabs/business-variable/issues/93))
- Improved Safari layout for favorites ([#97](https://github.com/volkovlabs/business-variable/issues/97))
- Upgraded to Grafana 10.2.1 ([#98](https://github.com/volkovlabs/business-variable/issues/98))

## [2.1.0] - 2023-11-08

### Added

- Always-visible search filter option ([#83](https://github.com/volkovlabs/business-variable/issues/83))
- Group rename functionality ([#84](https://github.com/volkovlabs/business-variable/issues/84))
- Toggle for expanded row state via label click ([#86](https://github.com/volkovlabs/business-variable/issues/86))

### Changed

- Supported field selection from data frames without RefId ([#85](https://github.com/volkovlabs/business-variable/issues/85))

### Fixed

- Deselection of undefined "All" variable in URL ([#87](https://github.com/volkovlabs/business-variable/issues/87))
- Removed group favoriting capability ([#88](https://github.com/volkovlabs/business-variable/issues/88))

## [2.0.0] - 2023-10-16

### Added

- Enter/Escape key handling for Text Variable ([#69](https://github.com/volkovlabs/business-variable/issues/69))
- Clear value for multi-choice variables ([#66](https://github.com/volkovlabs/business-variable/issues/66))

### Changed

- Updated parent item labels in Tree View ([#62](https://github.com/volkovlabs/business-variable/issues/62))
- Implemented table virtualization for performance ([#64](https://github.com/volkovlabs/business-variable/issues/64), [#74](https://github.com/volkovlabs/business-variable/issues/74))
- Upgraded to Plugin Tools 2.1.1 ([#72](https://github.com/volkovlabs/business-variable/issues/72))
- Signed plugin with Grafana Access Policy ([#72](https://github.com/volkovlabs/business-variable/issues/72))
- Upgraded to Grafana 10.1.5 ([#73](https://github.com/volkovlabs/business-variable/issues/73))

### Fixed

- Key:value option selection in Minimize/Button views ([#75](https://github.com/volkovlabs/business-variable/issues/75))

## [1.7.0] - 2023-08-08

### Added

- Text/value variables in Table/Tree View ([#57](https://github.com/volkovlabs/business-variable/issues/57))
- Button View ([#59](https://github.com/volkovlabs/business-variable/issues/59))
- Group selection ([#58](https://github.com/volkovlabs/business-variable/issues/58))

### Changed

- Upgraded to Grafana 10.0.3 ([#60](https://github.com/volkovlabs/business-variable/issues/60))

## [1.6.0] - 2023-07-26

### Added

- Status sort button ([#49](https://github.com/volkovlabs/business-variable/issues/49), [#51](https://github.com/volkovlabs/business-variable/issues/51))
- Minimize mode for Query/Custom variables ([#50](https://github.com/volkovlabs/business-variable/issues/50))
- Input for Textbox variable ([#53](https://github.com/volkovlabs/business-variable/issues/53))

### Changed

- Updated ESLint configuration ([#47](https://github.com/volkovlabs/business-variable/issues/47))

## [1.5.0] - 2023-07-11

### Added

- Sticky header and autoscroll for multi-group selection ([#38](https://github.com/volkovlabs/business-variable/issues/38))
- Drag-and-drop for groups ([#42](https://github.com/volkovlabs/business-variable/issues/42))
- Expand/collapse all in header ([#46](https://github.com/volkovlabs/business-variable/issues/46))

### Changed

- Enhanced single-select variables with "All" option ([#41](https://github.com/volkovlabs/business-variable/issues/41))

## [1.4.0] - 2023-07-06

### Added

- Tutorial ([#21](https://github.com/volkovlabs/business-variable/issues/21))
- Favorite filter icon ([#25](https://github.com/volkovlabs/business-variable/issues/25))
- Tree View groups (requires config update) ([#20](https://github.com/volkovlabs/business-variable/issues/20))
- Option to prefix variable name to value ([#30](https://github.com/volkovlabs/business-variable/issues/30))
- Autoscroll to selected value ([#32](https://github.com/volkovlabs/business-variable/issues/32))
- Released as community-signed plugin ([#37](https://github.com/volkovlabs/business-variable/issues/37))

### Changed

- Updated level addition to append at end ([#22](https://github.com/volkovlabs/business-variable/issues/22))
- Hid unselectable items ([#24](https://github.com/volkovlabs/business-variable/issues/24))
- Supported Grafana 9 with main view scroll ([#26](https://github.com/volkovlabs/business-variable/issues/26))
- Increased test coverage ([#31](https://github.com/volkovlabs/business-variable/issues/31))

## [1.3.0] - 2023-06-30

### Added

- Display Header option ([#15](https://github.com/volkovlabs/business-variable/issues/15))
- Collapsing parent rows ([#16](https://github.com/volkovlabs/business-variable/issues/16))
- Sticky scrolling option ([#17](https://github.com/volkovlabs/business-variable/issues/17))
- Table Filter ([#18](https://github.com/volkovlabs/business-variable/issues/18))
- Favorite selection ([#19](https://github.com/volkovlabs/business-variable/issues/19))

### Changed

- Updated documentation ([#20](https://github.com/volkovlabs/business-variable/issues/20))

## [1.2.0] - 2023-06-26

### Added

- Tree View ([#12](https://github.com/volkovlabs/business-variable/issues/12), [#13](https://github.com/volkovlabs/business-variable/issues/13))

### Changed

- Updated README and screenshot ([#14](https://github.com/volkovlabs/business-variable/issues/14))

## [1.1.0] - 2023-06-21

### Added

- Variable statuses via thresholds ([#6](https://github.com/volkovlabs/business-variable/issues/6))
- Field options for values/statuses ([#9](https://github.com/volkovlabs/business-variable/issues/9))

### Changed

- Replaced Table with react-table v8 ([#8](https://github.com/volkovlabs/business-variable/issues/8))
- Updated provisioning and README ([#10](https://github.com/volkovlabs/business-variable/issues/10))
- Supported Grafana 8.5.0 ([#11](https://github.com/volkovlabs/business-variable/issues/11))

## [1.0.0] - 2023-06-19

### Added

- Initial release based on Volkov Labs Panel template

### Changed

- Updated README and configuration ([#1](https://github.com/volkovlabs/business-variable/issues/1))
- Refactored legacy code ([#2](https://github.com/volkovlabs/business-variable/issues/2), [#4](https://github.com/volkovlabs/business-variable/issues/4))
- Upgraded to Grafana 10.0.0 ([#3](https://github.com/volkovlabs/business-variable/issues/3))
- Updated provisioning and README ([#5](https://github.com/volkovlabs/business-variable/issues/5))
