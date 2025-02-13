# Change Log

## 3.7.0 (2025-02-13)

### Features / Enhancements

- Updated datasource ID instead of name and added support variables (#229)
- Updated sticky header for Scenes dashboards (#230)
- Updated display favorites icon (#234)
- Added not supports variable type Alert message (#235)
- Added Date picker (#237)
- Updated to Grafana 11.4.0 and dependencies (#241)
- Added advanced option to change browser tab title (#243)

## 3.6.0 (2024-10-24)

### Features / Enhancements

- Updated behavior in table view for Textbox variable type (#211)
- Added Date Time Selector (#209)
- Added All options in Scenes dashboards (#213)
- Updated e2e tests (#216)
- Updated Slider view to prevent display error (#220)
- Updated to Grafana 11.3.0 and dependencies (#222)
- Update Sticky position in Scenes dashboards (#221)

## 3.5.0 (2024-10-02)

### Features / Enhancements

- Updated select variable on Minimize view (#197)
- Updated @tanstack/virtual to the latest version (#207)
- Updated to Grafana 11.2.2 and dependencies (#207)

## 3.4.0 (2024-08-23)

### Features / Enhancements

- Added panel options for changing tabs order (#193)
- Updated the local storage key for favorites (#194)
- Update to Grafana 11.1.4 (#195)

## 3.3.0 (2024-08-14)

### Features / Enhancements

- Added data source use for favorites (#184)
- Updated documentation (#185)
- Added scrollbar for button view (#187)

## 3.2.0 (2024-07-09)

### Features / Enhancements

- Updated video tutorial (#166)
- Updated E2E workflow using Docker (#173)
- Added image threshold style for showing status in Table view (#170)

## 3.1.0 (2024-06-06)

### Features / Enhancements

- Added collapse/expand rows option on initial load (#159)
- Updated Selection Behavior using Ctrl key (#160)
- Updated Grafana 11.0.0 and dependencies (#161)
- Added Reset button for button view (#162)
- Updated selection for variables with key/value pair (#165)

## 3.0.0 (2024-05-09)

### Breaking changes

- Requires Grafana 10 and Grafana 11

### Features / Enhancements

- Updated selecting and deselecting multi-levels (#139)
- Updated Auto/Static Minimize label width (#144)
- Added show and hide Minimize label (#144)
- Added maximum visible values option in minimize view (#147)
- Added plugin e2e tests and remove cypress (#149)
- Added Row count in Table view (#148)
- Updated AutoScroll Behavior (#152)
- Added Slider View (#154)
- Prepared for Grafana 11 (#155)
- Updated Grafana 10.4.2 and dependencies (#158)

## 2.5.0 (2024-04-01)

### Features / Enhancements

- Added the indeterminate state to the checkboxes (#127)
- Updated Tree View scrolling (#128)
- Added Responsive tabs (#130)
- Added support new items in Variable (minimize mode) (#134)
- Added Preserve selection of the group between dashboards (#135)
- Improved Tree view display and scroll (#136)
- Added Reset dependent variables when selecting the value (#138)

## 2.4.0 (2024-03-17)

### Breaking changes

- Requires Grafana 9.2 and Grafana 10

### Features / Enhancements

- Updated video tutorial in README (#111)
- Updated timescale data (#119)
- Updated dependencies and Actions (#120)
- Updated the default color contrast (#122)
- Added preserve selected group option (#124)
- Added label for Button view (#125)

## 2.3.1 (2023-12-14)

### Bugfixes

- Fixed draggable icon for Grafana 10.3 (#107)

## 2.3.0 (2023-12-13)

### Features / Enhancements

- Added clean table state on tab change (#101)
- Updated ESLint configuration and refactor (#102)
- Added persistent mode (#103)
- Updated to Grafana 10.2.2 and Volkov labs packages (#104)

## 2.2.0 (2023-11-20)

### Features / Enhancements

- Added dashboard redirect option (#92)
- Updated ESLint configuration and sort imports (#93)
- Updated Safari layout for favorites (#97)
- Updated to Grafana 10.2.1 (#98)
- Added clean filter value button (#99)

## 2.1.0 (2023-11-08)

### Features / Enhancements

- Added an option for an always-visible search filter (#83)
- Added Group rename functionality (#84)
- Added selecting fields from data frames without RefId (#85)
- Added toggle expanded row state by clicking on the label (#86)

### Bugfixes

- Update the deselection of All variable value which is not defined in the URL (#87)
- Removed ability to add group to favorites (#88)

## 2.0.0 (2023-10-16)

### Features / Enhancements

- Update variable option label for parent items in tree view (#62)
- Add handling pressing enter and escape keys for Text Variable (#69)
- Add table virtualization to improve performance (#64, #74)
- Clear value for multi-choice variable (#66)
- Update to Plugin Tools 2.1.1 (#72)
- Use Grafana Access Policy to sign plugin (#72)
- Update to Grafana 10.1.5 (#73)

### Bugfixes

- Fix key:value option selection for Minimize and Button views (#75)

## 1.7.0 (2023-08-08)

### Features / Enhancements

- Add variables with text and value in Table/Tree View (#57)
- Add Button View (#59)
- Add group selection (#58)
- Update dependencies to Grafana 10.0.3 (#60)

## 1.6.0 (2023-07-26)

### Features / Enhancements

- Update ESLint configuration (#47)
- Add status sort button (#49, #51)
- Add minimize mode similar to the native select for Query and Custom (#50)
- Add input for text box variable (#53)

## 1.5.0 (2023-07-11)

### Features / Enhancements

- Update single select variable with All enabled (#41)
- Add sticky header and auto scroll on multi-group selection (#38)
- Add drag and drop for Groups (#42)
- Add expand and collapse all in the header (#46)

## 1.4.0 (2023-07-06)

### Features / Enhancements

- Add Tutorial (#21)
- Update adding new Level to last (#22)
- Hide unselectable items (#24)
- Use the main view scroll element to support Grafana 9 (#26)
- Add a Favorite icon to filter selected favorites (#25)
- Add Tree View groups. Requires to update Tree View configuration. (#20)
- Add an option to display the variable name in front of the value (#30)
- Increase tests coverage (#31)
- Add auto scroll to the selected value (#32)
- Community signed release (#37)

## 1.3.0 (2023-06-30)

### Features / Enhancements

- Add Display Header option (#15)
- Add the ability to collapse parent rows (#16)
- Add a Sticky option to follow when scrolling (#17)
- Add Table Filter (#18)
- Add selecting favorites (#19)
- Update documentation (#20)

## 1.2.0 (2023-06-26)

### Features / Enhancements

- Add Tree View (#12, #13)
- Update README and screenshot (#14)

## 1.1.0 (2023-06-21)

### Features / Enhancements

- Add Variable statuses based on Threshold (#6)
- Add react-table v8 instead of Table (#8)
- Add Field options for variable values and statuses (#9)
- Update Provisioning and README (#10)
- Add support for Grafana 8.5.0 (#11)

## 1.0.0 (2023-06-19)

### Features / Enhancements

- Initial release based on Volkov Labs Abc Panel template
- Update README and configuration (#1)
- Refactor Legacy Code (#2, #4)
- Update to Grafana 10.0.0 (#3)
- Update Provisioning and README (#5)
