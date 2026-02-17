# User Testing Checklist

## Upload Flow
- [ ] Drag-and-drop CSV upload works
- [ ] File browse dialog works
- [ ] Demo data loads correctly
- [ ] Large CSV files (1000+ rows) upload without issues
- [ ] Invalid file types show error message
- [ ] Progress indication during upload
- [ ] Auto-navigation to dashboard after upload

## Dashboard - Chart Display
- [ ] All survey questions generate charts
- [ ] Chart type selector shows recommendations
- [ ] Chart type switching works (horizontal bar, vertical bar, pie, donut, lollipop)
- [ ] Chart animations play on load (staggered entrance)
- [ ] Chart type switch transitions smoothly
- [ ] Data table shows below each chart
- [ ] Percentages calculate correctly in table

## Dashboard - Interactions
- [ ] Sort control changes all charts (high-to-low / low-to-high)
- [ ] Per-chart filter shows available values
- [ ] Filtering updates chart and data table
- [ ] "Reset Filters" clears all filters
- [ ] Editable chart titles work (click to edit, Enter to save, Escape to cancel)
- [ ] Cross-tab builder shows suggested relationships
- [ ] Custom cross-tab selection works

## Theme System
- [ ] Theme editor opens from toolbar
- [ ] Color palette changes apply to all charts
- [ ] Font changes apply to all text
- [ ] Border radius changes apply to cards
- [ ] Preset themes apply correctly
- [ ] Theme export/import works
- [ ] Theme changes persist across navigation

## Storytelling Mode
- [ ] Toggle enables/disables annotations
- [ ] Pattern detection generates insights
- [ ] Annotations display above relevant bars
- [ ] Annotation text is editable
- [ ] Annotations can be removed
- [ ] All chart types support storytelling

## Export
- [ ] PNG export per chart
- [ ] SVG export per chart
- [ ] Clipboard copy works
- [ ] Full PDF export generates correctly
- [ ] Export excludes UI controls (buttons, selectors)
- [ ] Custom titles appear in exports

## Insights Page
- [ ] AI summaries display for text columns
- [ ] Representative quotes show
- [ ] Sentiment analysis results display
- [ ] Key themes identified

## Accessibility
- [ ] Tab navigation works through all interactive elements
- [ ] Chart type selector: keyboard navigation (arrows, enter, escape)
- [ ] Focus indicators visible on all buttons
- [ ] Screen reader announces chart regions
- [ ] Data tables have proper headers
- [ ] Reduced motion: animations respect system preference

## Performance
- [ ] Initial page load under 3 seconds
- [ ] Chart rendering feels instant after upload
- [ ] Smooth scrolling with 20+ charts
- [ ] No visible jank during chart type switching
- [ ] Theme changes apply without delay

## Cross-Browser
- [ ] Chrome: all features work
- [ ] Firefox: all features work
- [ ] Safari: all features work
- [ ] Mobile: responsive layout, touch interactions
