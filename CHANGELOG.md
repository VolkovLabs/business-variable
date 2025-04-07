# Changelog

All notable changes to the Business Variable panel are documented here.

## 3.9.0 (In Progress)

### Features & Enhancements

- Added a custom message for the 'no data' and 'variable not selected' cases. (#262)
- Upgraded to Grafana 11.6.0 with updated dependencies (#264)

## 3.8.0 (2025-03-26)

### Features & Enhancements

- Added attestation to release workflow (#246)
- Removed `@volkovlabs/grafana-utils` dependency (#247)
- Introduced resize behavior for panels with sticky headers (#253)

## 3.7.0 (2025-02-13)

### Features & Enhancements

- Updated to use datasource ID instead of name, with variable support (#229)
- Enhanced sticky header for Scenes dashboards (#230)
- Improved favorites icon visibility (#234)
- Excluded Alert Message variable type from support (#235)
- Added Date Picker component (#237)
- Upgraded to Grafana 11.4.0 with updated dependencies (#241)
- Added advanced option to modify browser tab title (#243)

## 3.6.0 (2024-10-24)

### Features & Enhancements

- Refined Textbox variable behavior in Table view (#211)
- Added Date Time Selector (#209)
- Enabled "All" option in Scenes dashboards (#213)
- Updated E2E tests (#216)
- Fixed display errors in Slider view (#220)
- Upgraded to Grafana 11.3.0 with dependency updates (#222)
- Improved sticky positioning in Scenes dashboards (#221)

## 3.5.0 (2024-10-02)

### Features & Enhancements

- Improved variable selection in Minimize view (#197)
- Updated `@tanstack/virtual` to latest version (#207)
- Upgraded to Grafana 11.2.2 with dependency updates (#207)

## 3.4.0 (2024-08-23)

### Features & Enhancements

- Added option to reorder tabs in panel settings (#193)
- Updated local storage key for favorites (#194)
- Upgraded to Grafana 11.1.4 (#195)

## 3.3.0 (2024-08-14)

### Features & Enhancements

- Integrated datasource-driven favorites (#184)
- Enhanced documentation (#185)
- Added scrollbar to Button view (#187)

## 3.2.0 (2024-07-09)

### Features & Enhancements

- Updated video tutorial (#166)
- Improved E2E workflow with Docker (#173)
- Added image threshold styling for status in Table view (#170)

## 3.1.0 (2024-06-06)

### Features & Enhancements

- Added option to collapse/expand rows on load (#159)
- Updated selection behavior with Ctrl key (#160)
- Upgraded to Grafana 11.0.0 with dependency updates (#161)
- Added Reset button to Button view (#162)
- Enhanced key/value pair selection for variables (#165)

## 3.0.0 (2024-05-09)

### Breaking Changes

- Requires Grafana 10 or Grafana 11

### Features & Enhancements

- Improved multi-level selection/deselection (#139)
- Updated Minimize label width to Auto/Static (#144)
- Added option to show/hide Minimize label (#144)
- Introduced maximum visible values in Minimize view (#147)
- Added plugin E2E tests, removed Cypress (#149)
- Added row count in Table view (#148)
- Enhanced autoscroll behavior (#152)
- Introduced Slider view (#154)
- Prepared for Grafana 11 compatibility (#155)
- Upgraded to Grafana 10.4.2 with dependency updates (#158)

## 2.5.0 (2024-04-01)

### Features & Enhancements

- Added indeterminate checkbox state (#127)
- Improved Tree View scrolling (#128)
- Added responsive tabs (#130)
- Supported new items in Minimize mode (#134)
- Preserved group selection across dashboards (#135)
- Enhanced Tree View display and scrolling (#136)
- Added reset for dependent variables on value selection (#138)

## 2.4.0 (2024-03-17)

### Breaking Changes

- Requires Grafana 9.2 or Grafana 10

### Features & Enhancements

- Updated README video tutorial (#111)
- Enhanced Timescale data handling (#119)
- Updated dependencies and GitHub Actions (#120)
- Improved default color contrast (#122)
- Added preserve selected group option (#124)
- Added label support in Button view (#125)

## 2.3.1 (2023-12-14)

### Bug Fixes

- Fixed draggable icon for Grafana 10.3 (#107)

## 2.3.0 (2023-12-13)

### Features & Enhancements

- Cleared table state on tab change (#101)
- Updated ESLint config and refactored code (#102)
- Added persistent mode (#103)
- Upgraded to Grafana 10.2.2 with Volkov Labs package updates (#104)

## 2.2.0 (2023-11-20)

### Features & Enhancements

- Added dashboard redirect option (#92)
- Updated ESLint config and sorted imports (#93)
- Improved Safari layout for favorites (#97)
- Upgraded to Grafana 10.2.1 (#98)
- Added clear filter value button (#99)

## 2.1.0 (2023-11-08)

### Features & Enhancements

- Added always-visible search filter option (#83)
- Enabled group rename functionality (#84)
- Supported field selection from data frames without RefId (#85)
- Added toggle for expanded row state via label click (#86)

### Bug Fixes

- Fixed deselection of undefined "All" variable in URL (#87)
- Removed group favoriting capability (#88)

## 2.0.0 (2023-10-16)

### Features & Enhancements

- Updated parent item labels in Tree View (#62)
- Added Enter/Escape key handling for Text Variable (#69)
- Implemented table virtualization for performance (#64, #74)
- Enabled clear value for multi-choice variables (#66)
- Upgraded to Plugin Tools 2.1.1 (#72)
- Signed plugin with Grafana Access Policy (#72)
- Upgraded to Grafana 10.1.5 (#73)

### Bug Fixes

- Fixed key:value option selection in Minimize/Button views (#75)

## 1.7.0 (2023-08-08)

### Features & Enhancements

- Added text/value variables in Table/Tree View (#57)
- Introduced Button View (#59)
- Enabled group selection (#58)
- Upgraded to Grafana 10.0.3 (#60)

## 1.6.0 (2023-07-26)

### Features & Enhancements

- Updated ESLint configuration (#47)
- Added status sort button (#49, #51)
- Introduced Minimize mode for Query/Custom variables (#50)
- Added input for Textbox variable (#53)

## 1.5.0 (2023-07-11)

### Features & Enhancements

- Enhanced single-select variables with "All" option (#41)
- Added sticky header and autoscroll for multi-group selection (#38)
- Enabled drag-and-drop for groups (#42)
- Added expand/collapse all in header (#46)

## 1.4.0 (2023-07-06)

### Features & Enhancements

- Added tutorial (#21)
- Updated level addition to append at end (#22)
- Hid unselectable items (#24)
- Supported Grafana 9 with main view scroll (#26)
- Added favorite filter icon (#25)
- Introduced Tree View groups (requires config update) (#20)
- Added option to prefix variable name to value (#30)
- Increased test coverage (#31)
- Added autoscroll to selected value (#32)
- Released as community-signed plugin (#37)

## 1.3.0 (2023-06-30)

### Features & Enhancements

- Added Display Header option (#15)
- Enabled collapsing parent rows (#16)
- Added sticky scrolling option (#17)
- Introduced Table Filter (#18)
- Added favorite selection (#19)
- Updated documentation (#20)

## 1.2.0 (2023-06-26)

### Features & Enhancements

- Introduced Tree View (#12, #13)
- Updated README and screenshot (#14)

## 1.1.0 (2023-06-21)

### Features & Enhancements

- Added variable statuses via thresholds (#6)
- Replaced Table with react-table v8 (#8)
- Added field options for values/statuses (#9)
- Updated provisioning and README (#10)
- Supported Grafana 8.5.0 (#11)

## 1.0.0 (2023-06-19)

### Features & Enhancements

- Initial release based on Volkov Labs ABC Panel template
- Updated README and configuration (#1)
- Refactored legacy code (#2, #4)
- Upgraded to Grafana 10.0.0 (#3)
- Updated provisioning and README (#5)
