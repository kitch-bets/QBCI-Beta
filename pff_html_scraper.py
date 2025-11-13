#!/usr/bin/env python3
"""
PFF HTML to CSV Scraper
Loads a saved PFF player page HTML file and extracts passing grades table to CSV.
"""

import csv
from bs4 import BeautifulSoup


def parse_pff_passing_grades(html_text: str):
    """
    Parse a saved PFF player page and extract a passing grades table.
    Returns a list of dict rows.
    """
    soup = BeautifulSoup(html_text, "html.parser")

    # Try to find a heading for the passing grades section
    heading = soup.find(
        lambda tag: tag.name in ["h1", "h2", "h3", "h4"]
        and "passing" in tag.get_text(strip=True).lower()
        and "grade" in tag.get_text(strip=True).lower()
    )

    if heading:
        table = heading.find_next("table")
    else:
        # Fallback to first table in the page
        table = soup.find("table")

    if table is None:
        return []

    # Get header cells
    thead = table.find("thead")
    if thead:
        header_cells = [th.get_text(strip=True) for th in thead.find_all("th")]
        data_rows = table.find("tbody").find_all("tr")
    else:
        # Fallback if there is no thead
        all_rows = table.find_all("tr")
        if not all_rows:
            return []
        header_cells = [
            cell.get_text(strip=True)
            for cell in all_rows[0].find_all(["th", "td"])
        ]
        data_rows = all_rows[1:]

    rows = []
    for tr in data_rows:
        cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        if len(cells) != len(header_cells):
            continue
        row = dict(zip(header_cells, cells))
        rows.append(row)

    return rows


def scrape_pff_html_file(input_html_path: str, output_csv_path: str):
    """
    Load a saved PFF HTML file from disk and export a CSV of the passing table.
    """
    with open(input_html_path, "r", encoding="utf-8") as f:
        html_text = f.read()

    rows = parse_pff_passing_grades(html_text)
    if not rows:
        print("No table rows found")
        return

    fieldnames = list(rows[0].keys())
    with open(output_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {output_csv_path}")


if __name__ == "__main__":
    # Example paths, match your saved file name
    scrape_pff_html_file(
        "Matthew Stafford Passing Grades _ Pro Football Focus.html",
        "stafford_passing_grades.csv",
    )
