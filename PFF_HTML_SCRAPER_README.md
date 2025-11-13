# PFF HTML to CSV Scraper

A Python utility to extract passing grade tables from saved PFF (Pro Football Focus) player pages and convert them to CSV format.

## Overview

This scraper is designed for offline processing of PFF player statistics. Instead of scraping the live website, you save the HTML page from your browser and then run this script to extract the data into a clean CSV file.

## Features

- 🎯 **Intelligent Table Detection**: Automatically finds tables under "Passing Grades" headings
- 📊 **Flexible Parsing**: Handles tables with or without proper `<thead>` elements
- 📁 **CSV Export**: Converts HTML tables to clean, structured CSV files
- 🔄 **Fallback Logic**: Falls back to the first table if no passing grades section is found

## Installation

1. Install the required dependency:
```bash
pip install -r requirements.txt
```

This will install `beautifulsoup4>=4.12.0` along with other project dependencies.

## Usage

### Basic Usage

1. **Save the PFF player page**:
   - Navigate to a PFF player page (e.g., https://www.pff.com/nfl/players/matthew-stafford/...)
   - Right-click and select "Save As..." → "Webpage, Complete" or "Webpage, HTML Only"
   - Save the file with a descriptive name (e.g., `Matthew Stafford Passing Grades _ Pro Football Focus.html`)

2. **Run the scraper**:
```bash
python pff_html_scraper.py
```

By default, this will look for `Matthew Stafford Passing Grades _ Pro Football Focus.html` and output to `stafford_passing_grades.csv`.

### Custom File Paths

Edit the `__main__` section in `pff_html_scraper.py` to use your own file paths:

```python
if __name__ == "__main__":
    scrape_pff_html_file(
        "Your Player Name Here _ Pro Football Focus.html",
        "output_filename.csv",
    )
```

Or import and use as a library:

```python
from pff_html_scraper import scrape_pff_html_file

scrape_pff_html_file(
    "path/to/your/player_page.html",
    "path/to/output.csv"
)
```

### Advanced Usage

You can also use the parser function directly to get data as Python dictionaries:

```python
from pff_html_scraper import parse_pff_passing_grades

with open("player_page.html", "r", encoding="utf-8") as f:
    html_content = f.read()

rows = parse_pff_passing_grades(html_content)

for row in rows:
    print(row)  # Each row is a dict with column headers as keys
```

## How It Works

1. **Load HTML**: Reads the saved HTML file from disk
2. **Find Target Table**: Searches for a heading containing "passing" and "grade"
3. **Extract Table**: Finds the next table after that heading
4. **Parse Headers**: Extracts column headers from `<thead>` or first row
5. **Extract Rows**: Converts each table row into a dictionary
6. **Export CSV**: Writes the structured data to a CSV file

## Example Output

Given a PFF player page with passing grades, the output CSV might look like:

```csv
Week,Opponent,Yards,Accuracy,Comp %,BTT Rate,TWP Rate,Grade
1,@ATL,235,68.5,65.2,4.2,8.5,82.3
2,vs HOU,312,72.1,68.9,3.8,10.2,88.7
3,@SF,289,70.3,66.7,4.5,9.1,85.1
```

## Integration with QBCI Project

This scraper complements the existing PFF tools in the QBCI-Beta project:

- **pff_emulator_watcher.py**: Real-time automated extraction from Android emulator
- **pff_html_scraper.py**: Offline batch processing from saved HTML files
- **admin-panel.html**: Manual OCR processing of screenshots

Use this scraper when:
- You want to quickly grab data from a specific player page
- You're doing historical data collection
- You prefer manual browser-based workflows
- You need a backup method if the emulator watcher isn't available

## Requirements

- Python 3.7+
- beautifulsoup4>=4.12.0

## Troubleshooting

### "No table rows found"

This usually means:
- The HTML file doesn't contain a table
- The table structure is unexpected
- The file path is incorrect

**Solution**: Check that you saved the complete HTML page and that it contains visible tables when you open it in a browser.

### Wrong Table Extracted

If the scraper picks up the wrong table:
- Make sure there's a heading with "passing" and "grade" before the target table
- Or modify the search logic in `parse_pff_passing_grades()` to be more specific

### Encoding Issues

If you see garbled characters:
- Ensure the HTML file is saved with UTF-8 encoding
- Check the `encoding="utf-8"` parameter in the file open calls

## Contributing

This tool is part of the QBCI-Beta project. For improvements or bug fixes, please submit a pull request with:
- Clear description of the change
- Test cases if applicable
- Updated documentation

## License

Part of the QBCI-Beta project.
