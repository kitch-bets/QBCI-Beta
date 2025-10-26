# QBCI™ - Quarterback Consistency Index

**LSX Analytics** | A data-driven betting intelligence system for NFL quarterback performance analysis

---

## 🎯 Project Overview

The Quarterback Consistency Index (QBCI™) is a proprietary algorithm that analyzes NFL quarterback passing consistency to identify risk-adjusted betting opportunities. Unlike traditional statistics that focus on averages, QBCI™ prioritizes **variance analysis** to determine the predictability and reliability of quarterback performance.

## 🔑 Key Features

- **Variance-Based Scoring**: Uses coefficient of variation to measure consistency
- **Risk Tier Classification**: 3-tier system (Low, Moderate, High risk)
- **Performance Bonuses**: Rewards accuracy, completion %, and big-time throws
- **Risk Penalties**: Penalizes turnover-worthy plays and high variance
- **Betting Recommendations**: Data-backed over/under guidance
- **Visual Analytics**: Interactive charts showing game-by-game trends

## 📊 CI Score Methodology

### Formula Components

The CI Score is calculated using:

```
CI Score = 100 - (CV × 100) + Performance Bonuses - Risk Penalties

Where:
- CV = Coefficient of Variation (StdDev / Mean × 100)
- Performance Bonuses = (Accuracy - 65) × 0.3 + (Completion - 60) × 0.2 + BTT Rate × 0.5
- Risk Penalties = TWP Rate × 2
```

### Metrics Analyzed

#### Game-by-Game Stats (Required)
- **Passing Yards**: Total passing yards per game
- **Mean**: Average passing yards
- **Standard Deviation**: Measure of variance
- **Coefficient of Variation**: Normalized variance metric

#### Advanced Metrics (PFF Data)
- **Accuracy %**: PFF's accuracy metric
- **Completion %**: Completion percentage
- **BTT Rate**: Big-Time Throw rate (explosive plays)
- **TWP Rate**: Turnover-Worthy Play rate (risk factor)
- **aDOT**: Average depth of target
- **Time to Throw**: Pocket time in seconds
- **Pressure to Sack %**: Sack rate under pressure

### Risk Tier Classification

| CI Score | Risk Tier | Description | Betting Guidance |
|----------|-----------|-------------|------------------|
| **80-100** | 🟩 Low Risk | Highly consistent, predictable performance | **BETTABLE** - Strong confidence |
| **60-79** | 🟨 Moderate Risk | Some volatility, matchup-dependent | **CAUTION** - Consider context |
| **0-59** | 🟥 High Risk | High variance, unpredictable | **AVOID** - Do not bet |

## 🚀 Quick Start

### Option 1: Open Directly in Browser

1. Clone this repository
2. Open `index.html` in your web browser
3. Click "Launch Calculator"

### Option 2: Use the Calculator

1. Navigate to `ci-calculator.html`
2. Choose your input method:
   - **CSV Import**: Upload PFF data or game logs
   - **Manual Entry**: Enter QB metrics and game-by-game data

### Using CSV Import

1. Click the "CSV Import" tab
2. Upload a CSV file with the following format:

```csv
player,week,opponent,passing_yards,accuracy_pct,comp_pct,btt_rate,twp_rate
Justin Herbert,1,KC,205,62.5,62.5,5.0,3.1
Justin Herbert,2,@LV,167,51.4,51.4,2.9,0.0
...
```

3. Select the quarterback from the dropdown
4. Set the betting line (e.g., 265.5 passing yards)
5. Choose analysis window (All Games / Last 5 / Last 10)
6. Click "Calculate CI Score"

### Using Manual Entry

1. Click the "Manual Entry" tab
2. Enter quarterback name
3. Input advanced metrics (Accuracy %, Completion %, BTT Rate, TWP Rate)
4. Add game-by-game passing yards data (minimum 3 games)
5. Set the betting line
6. Click "Calculate CI Score"

## 📁 Project Structure

```
QBCI-Beta/
├── index.html                      # Landing page
├── ci-calculator.html              # Main calculator application
├── herbert_weekly_grades.csv       # Sample PFF weekly grades
├── qbci_import_template.csv        # Sample data template
├── passing_summary.csv             # Season summary data
├── README.md                       # This file
└── README_DATA.md                  # Data format documentation
```

## 📈 Sample Data

The repository includes sample data for **Justin Herbert** (Weeks 1-8):

- **Average Yards**: 243.0
- **Standard Deviation**: 82.4
- **Coefficient of Variation**: 33.9%
- **Sample CI Score**: ~72 (Moderate Risk)

Click "Load Sample Data" in the calculator to test with this data.

## 🧮 Example Calculation

### Justin Herbert - Week 1-8 Analysis

**Game Data:**
```
Week 1 vs KC:   205 yards
Week 2 @ LV:    167 yards
Week 3 vs DEN:  237 yards
Week 4 @ NYG:   135 yards
Week 5 vs WAS:  284 yards
Week 6 @ MIA:   195 yards
Week 7 vs IND:  315 yards
Week 8 vs MIN:  405 yards
```

**Calculated Metrics:**
- Mean: 243.0 yards
- Std Dev: 82.4 yards
- CV: 33.9%
- Accuracy: 62.5%
- Completion: 60.3%
- BTT Rate: 6.7%
- TWP Rate: 1.5%

**CI Score Breakdown:**
```
Base Score:       100
- CV Penalty:     -33.9
+ Accuracy Bonus: -0.75  (62.5 - 65) × 0.3
+ Comp Bonus:     +0.06  (60.3 - 60) × 0.2
+ BTT Bonus:      +3.35  6.7 × 0.5
- TWP Penalty:    -3.0   1.5 × 2
= CI Score:       ~66 (Moderate Risk)
```

**Recommendation:**
- **Risk Tier**: 🟨 Moderate Risk
- **Guidance**: Proceed with caution. Moderate volatility detected (±82.4 yards). Consider recent trends and matchup.

## 🎓 Understanding the Results

### CI Score Interpretation

- **High CI (80+)**: QB has consistent performance game-to-game
  - Low standard deviation relative to mean
  - Predictable output for betting purposes
  - Strong accuracy and low turnover rates

- **Moderate CI (60-79)**: QB shows some volatility
  - Matchup-dependent performance
  - Review recent games and defensive strength
  - Use with additional context

- **Low CI (<60)**: QB is highly unpredictable
  - High variance in passing yards
  - Avoid betting until consistency improves
  - May indicate injury, scheme changes, or unreliable play

### Betting Recommendations

The calculator provides specific guidance:

1. **BET OVER**: CI ≥ 75 AND Average > Betting Line
2. **BET UNDER**: CI ≥ 75 AND Average < Betting Line
3. **PROCEED WITH CAUTION**: 60 ≤ CI < 75
4. **DO NOT BET**: CI < 60

## 📊 Data Sources

Compatible with:
- **PFF (Pro Football Focus)**: Premium QB metrics
- **NFL.com**: Advanced stats and game logs
- **ESPN**: Basic passing statistics
- **Custom Data**: Manual entry supported

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Structure and layout
- **CSS3**: Styling with custom variables
- **JavaScript (ES6+)**: Calculation engine and interactivity
- **Chart.js**: Data visualization

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### No Dependencies Required
All functionality is self-contained. The calculator works offline after initial load (Chart.js loaded from CDN).

## 📝 Use Cases

### For Sports Bettors
- Identify consistent QBs for player prop bets
- Avoid high-variance QBs regardless of "star" status
- Make data-driven over/under decisions
- Track QB consistency trends over time

### For DFS Players
- Select reliable QBs for cash games (low variance)
- Identify boom/bust candidates for tournaments (high variance)
- Optimize lineup construction based on consistency

### For Analysts
- Quantify QB reliability beyond traditional stats
- Compare QBs on consistency metrics
- Track performance trends throughout the season
- Evaluate impact of injuries, scheme changes, etc.

## 🛣️ Roadmap

### Version 1.0 (Current)
- [x] Basic CI calculation
- [x] CSV import functionality
- [x] Manual data entry
- [x] Risk tier classification
- [x] Betting recommendations
- [x] Performance visualizations

### Version 2.0 (Planned)
- [ ] Defensive strength adjustments
- [ ] Weather impact analysis
- [ ] Rolling window analysis (3/5/10 game trends)
- [ ] Multi-QB comparison tool
- [ ] Historical performance tracking
- [ ] Export/share functionality

### Version 3.0 (Future)
- [ ] Live API integration (real-time data)
- [ ] Machine learning predictions
- [ ] Injury impact modeling
- [ ] Vegas line movement correlation
- [ ] Portfolio optimization (multi-bet strategy)

## 📜 License & Usage

**QBCI™** is a proprietary algorithm developed by **LSX Analytics**.

- ✅ Free for personal use
- ✅ Educational and research purposes
- ❌ Commercial use requires licensing
- ❌ Redistribution of algorithm without attribution prohibited

## 🤝 Contributing

This is a private beta project. For access or collaboration:
- Contact: LSX Analytics
- GitHub Issues: For bug reports only

## ⚠️ Disclaimer

**For informational purposes only.** QBCI™ is a statistical analysis tool and does not guarantee betting success. Always gamble responsibly and within your means. Past performance does not guarantee future results.

---

**LSX Analytics** | QBCI™ 2024
*Data-Driven. Risk-Aware. Profit-Focused.*
