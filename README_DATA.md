# QBCI™ Data Import Guide

## CSV File Formats

### Required Columns for CI Calculator

The QBCI™ calculator requires the following data columns:

#### Game-by-Game Stats (Required)
- `player` - Player name (e.g., "Justin Herbert")
- `week` - Week number (1-18)
- `opponent` - Opponent team code (e.g., "KC", "@LV")
- `passing_yards` - Total passing yards for the game

#### Advanced Metrics (for enhanced CI calculation)
- `completions` - Completed passes
- `attempts` - Pass attempts
- `touchdowns` - Passing TDs
- `interceptions` - Interceptions thrown
- `accuracy_pct` - Accuracy percentage (PFF metric)
- `adot` - Average depth of target
- `time_to_throw` - Time to throw (seconds)
- `btt_rate` - Big-Time Throw rate (%)
- `comp_pct` - Completion percentage
- `ypa` - Yards per attempt
- `twp_rate` - Turnover-Worthy Play rate (%)
- `pressure_to_sack_pct` - Pressure to sack percentage
- `pass_grade` - PFF passing grade (0-100)

## Sample Data Files

### 1. herbert_weekly_grades.csv
Raw PFF weekly grades data for Justin Herbert (Weeks 1-8)

### 2. qbci_import_template.csv
Complete template with all metrics populated with sample data

### 3. passing_summary.csv
Season-long summary statistics for multiple QBs

## How to Use

1. **Minimum Data Required**: For basic CI calculation, you need at minimum:
   - Player name
   - 3+ games of passing yards data
   - Accuracy percentage
   - Completion percentage
   - BTT rate
   - TWP rate

2. **Enhanced Calculation**: For full QBCI™ analysis, include all advanced metrics

3. **Import Process**:
   - Format your data to match the template structure
   - Ensure minimum 3 games for statistical validity
   - Upload CSV to calculator
   - Review calculated CI score and risk tier

## CI Score Interpretation

- **🟩 Low Risk (CI ≥ 80)**: Consistent, bettable quarterback
- **🟨 Moderate Risk (60-79)**: Some volatility, proceed with caution
- **🟥 High Risk (<60)**: High variance, avoid betting

## Data Sources

Compatible with:
- PFF (Pro Football Focus) CSV exports
- NFL.com advanced stats
- Custom game logs
- Manual entry

## Example Usage

```csv
player,week,opponent,passing_yards,accuracy_pct,comp_pct,btt_rate,twp_rate
Justin Herbert,1,KC,205,62.5,62.5,5.0,3.1
Justin Herbert,2,@LV,167,51.4,51.4,2.9,0.0
Justin Herbert,3,DEN,237,53.8,53.8,7.7,2.6
...
```

The calculator will:
1. Calculate mean and standard deviation of passing yards
2. Compute coefficient of variation
3. Apply performance bonuses/penalties
4. Output CI score (0-100) and risk tier
5. Provide betting recommendation

---

**LSX Analytics** | QBCI™ - Quarterback Consistency Index
