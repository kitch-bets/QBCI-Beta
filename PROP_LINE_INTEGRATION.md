# QBCI™ Prop Line Integration

## Overview

The QBCI Calculator now supports prop line data integration, allowing you to track betting accuracy and prop efficiency alongside your Consistency Index scores.

## New Features

### 1. Prop Line Data Columns

You can now include two additional optional columns in your CSV imports:

- **`prop_line`**: The betting line (in passing yards) for each game
- **`bet_result`**: The actual betting outcome (`Over` or `Under`)

### 2. New Metrics Displayed

When prop line data is included, the calculator displays:

- **Over Hit Rate**: Percentage of games where the QB went OVER the prop line
- **Prop Line Average**: Average prop line across all games
- **Line vs Avg Yards**: The difference between average yards and average prop line (shows if lines are typically set too high or too low)

### 3. Enhanced Visualization

The performance chart now displays:
- Game-by-game prop lines (purple dashed line with points)
- Visual comparison between actual yards and betting lines
- Easy identification of over/under performance trends

## CSV Format

### Basic Format (Still Supported)
```csv
player,week,opponent,passing_yards,accuracy_pct,comp_pct,btt_rate,twp_rate
```

### Enhanced Format with Prop Lines
```csv
player,week,opponent,passing_yards,accuracy_pct,comp_pct,btt_rate,twp_rate,prop_line,bet_result
```

## Example Data

See the following files for examples:

1. **`mayfield_weekly_with_props.csv`**: Baker Mayfield's 2024 data with prop lines
2. **`qbci_import_template_with_props.csv`**: Template showing the expected format

## Sample Use Cases

### Use Case 1: Evaluate Betting Accuracy

Track how often a QB beats their prop line:
- Hit Rate > 60%: QB consistently exceeds expectations
- Hit Rate < 40%: QB consistently underperforms expectations
- Hit Rate ~50%: Lines are well-calibrated

### Use Case 2: Identify Line Inefficiencies

Compare Line vs Avg Yards:
- Positive variance: QB averages more than prop lines (VALUE on overs)
- Negative variance: QB averages less than prop lines (VALUE on unders)
- Near zero: Lines are efficient

### Use Case 3: Combine with QBCI for Better Bets

- **High CI (>80) + High Hit Rate (>60%)**: Strong bet candidates
- **High CI (>80) + Low Hit Rate (<40%)**: Consistent underperformance, bet unders
- **Low CI (<60)**: Avoid betting regardless of hit rate (too volatile)

## How to Use

1. **Prepare Your CSV**: Include `prop_line` and `bet_result` columns
2. **Upload to Calculator**: Use the CSV Import tab
3. **View Enhanced Metrics**: All new metrics display automatically when prop data is present
4. **Analyze Results**: Use the visualization and metrics to inform betting decisions

## Sample Data: Baker Mayfield

The included sample data shows Baker Mayfield's first 7 games:
- **Hit Rate**: 42.9% (3/7 overs)
- **Average Yards**: 252.4
- **Average Prop Line**: 236.0
- **Line Variance**: +16.4 yards (lines set too low)

This suggests:
- Mayfield beats his lines when healthy/performing well (weeks 4-6)
- Lines were consistently set below his average (value on overs)
- Combined with QBCI, this provides actionable betting intel

## Backward Compatibility

The prop line columns are **completely optional**. You can still:
- Upload CSVs without prop_line/bet_result
- Use the Manual Entry mode (no prop line support)
- Get full QBCI analysis without betting data

When prop data is missing, the new metrics will display as "N/A".

## Future Enhancements

Potential future additions:
- ROI calculation based on hit rate and CI score
- Confidence intervals for prop line predictions
- Matchup-specific prop line adjustments
- Historical prop line tracking across seasons
