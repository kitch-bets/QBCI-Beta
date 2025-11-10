#!/usr/bin/env python3
"""
PFF Emulator Watcher
Monitors PFF app running in Android emulator and automatically extracts prop data
to Avantus Analytics website using Claude API OCR and Supabase.
"""

import os
import time
import base64
import json
import subprocess
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Tuple
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://zaljfpagjzndgudnyggu.supabase.co')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY')
CLAUDE_MODEL = os.getenv('CLAUDE_MODEL', 'claude-3-5-sonnet-20241022')
ADB_DEVICE = os.getenv('ADB_DEVICE', None)  # Optional: specific device ID
WATCH_INTERVAL = int(os.getenv('WATCH_INTERVAL', '30'))  # seconds
SCREENSHOT_DIR = Path(os.getenv('SCREENSHOT_DIR', './screenshots'))
ENABLE_CHANGE_DETECTION = os.getenv('ENABLE_CHANGE_DETECTION', 'true').lower() == 'true'

# Create screenshots directory
SCREENSHOT_DIR.mkdir(exist_ok=True)

class Colors:
    """Terminal colors for pretty output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def log(message: str, level: str = 'INFO'):
    """Pretty logging with colors"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    colors = {
        'INFO': Colors.OKCYAN,
        'SUCCESS': Colors.OKGREEN,
        'WARNING': Colors.WARNING,
        'ERROR': Colors.FAIL,
        'DEBUG': Colors.OKBLUE
    }
    color = colors.get(level, Colors.ENDC)
    print(f"{color}[{timestamp}] [{level}]{Colors.ENDC} {message}")

def check_config():
    """Validate required configuration"""
    if not SUPABASE_ANON_KEY:
        log("SUPABASE_ANON_KEY not set in .env file", 'ERROR')
        return False
    if not CLAUDE_API_KEY or CLAUDE_API_KEY == 'YOUR_CLAUDE_API_KEY':
        log("CLAUDE_API_KEY not set or invalid in .env file", 'ERROR')
        return False
    return True

def list_adb_devices() -> List[str]:
    """List all connected ADB devices"""
    try:
        result = subprocess.run(['adb', 'devices'], capture_output=True, text=True, check=True)
        lines = result.stdout.strip().split('\n')[1:]  # Skip header
        devices = [line.split('\t')[0] for line in lines if '\tdevice' in line]
        return devices
    except subprocess.CalledProcessError as e:
        log(f"Failed to list ADB devices: {e}", 'ERROR')
        return []
    except FileNotFoundError:
        log("ADB not found. Please install Android Platform Tools and add to PATH", 'ERROR')
        return []

def select_device(devices: List[str]) -> Optional[str]:
    """Let user select device if multiple are connected"""
    if len(devices) == 0:
        log("No ADB devices found. Please start your emulator and try again.", 'ERROR')
        return None
    elif len(devices) == 1:
        log(f"Auto-selected device: {devices[0]}", 'INFO')
        return devices[0]
    else:
        log("Multiple devices found:", 'INFO')
        for i, device in enumerate(devices, 1):
            print(f"  {i}. {device}")
        try:
            choice = int(input(f"{Colors.OKCYAN}Select device (1-{len(devices)}): {Colors.ENDC}"))
            if 1 <= choice <= len(devices):
                return devices[choice - 1]
            else:
                log("Invalid selection", 'ERROR')
                return None
        except (ValueError, KeyboardInterrupt):
            log("Selection cancelled", 'ERROR')
            return None

def capture_screenshot(device: str, output_path: Path) -> bool:
    """Capture screenshot from Android device via ADB"""
    try:
        # Use adb with specific device
        device_arg = ['-s', device] if device else []

        # Capture screenshot on device
        temp_path = '/sdcard/pff_screenshot.png'
        subprocess.run(
            ['adb'] + device_arg + ['shell', 'screencap', '-p', temp_path],
            check=True,
            capture_output=True
        )

        # Pull screenshot to local machine
        subprocess.run(
            ['adb'] + device_arg + ['pull', temp_path, str(output_path)],
            check=True,
            capture_output=True
        )

        # Clean up device storage
        subprocess.run(
            ['adb'] + device_arg + ['shell', 'rm', temp_path],
            check=False,  # Don't fail if cleanup fails
            capture_output=True
        )

        return output_path.exists()
    except subprocess.CalledProcessError as e:
        log(f"Failed to capture screenshot: {e}", 'ERROR')
        return False

def get_image_hash(image_path: Path) -> str:
    """Calculate hash of image for change detection"""
    with open(image_path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def image_to_base64(image_path: Path) -> str:
    """Convert image to base64 string"""
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

def extract_data_with_claude(image_path: Path) -> Optional[str]:
    """
    Extract table data from screenshot using Claude Vision API
    Uses the same prompt as admin-panel.html for consistency
    """
    try:
        log("Analyzing screenshot with Claude Vision API...", 'INFO')

        # Convert image to base64
        base64_image = image_to_base64(image_path)

        # Prepare Claude API request (exact same as admin-panel.html)
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            json={
                'model': CLAUDE_MODEL,
                'max_tokens': 4096,
                'messages': [{
                    'role': 'user',
                    'content': [
                        {
                            'type': 'image',
                            'source': {
                                'type': 'base64',
                                'media_type': 'image/png',
                                'data': base64_image
                            }
                        },
                        {
                            'type': 'text',
                            'text': """Extract the data from this table image and format it as a tab-separated table.

Rules:
- Preserve all rows and columns exactly as shown
- Use tabs (\\t) to separate columns
- Include the header row if present
- Do not add any explanation or commentary
- Output ONLY the extracted table data
- Maintain numerical precision
- Keep column alignment

Example output format:
Player\\tWeek\\tOpponent\\tYards\\tAccuracy
Baker Mayfield\\t1\\t@ATL\\t167\\t53.1
Baker Mayfield\\t2\\t@HOU\\t215\\t65.8

Now extract the table:"""
                        }
                    ]
                }]
            }
        )

        if not response.ok:
            error_data = response.json()
            log(f"Claude API error: {error_data.get('error', {}).get('message', 'Unknown error')}", 'ERROR')
            return None

        data = response.json()
        extracted_text = data.get('content', [{}])[0].get('text', '')

        if extracted_text:
            log(f"Successfully extracted {len(extracted_text.splitlines())} lines", 'SUCCESS')
            return extracted_text
        else:
            log("No data extracted from image", 'WARNING')
            return None

    except Exception as e:
        log(f"Failed to extract data with Claude: {e}", 'ERROR')
        return None

def parse_tsv_data(tsv_text: str, has_header: bool = True) -> Tuple[List[str], List[List[str]]]:
    """
    Parse tab-separated values from Claude OCR output
    Returns: (headers, rows)
    """
    lines = [line.strip() for line in tsv_text.strip().split('\n') if line.strip()]

    if not lines:
        return [], []

    if has_header:
        headers = lines[0].split('\t')
        data_rows = [line.split('\t') for line in lines[1:]]
    else:
        # Generate default headers
        first_row = lines[0].split('\t')
        headers = [f'Col{i+1}' for i in range(len(first_row))]
        data_rows = [line.split('\t') for line in lines]

    return headers, data_rows

def format_for_supabase(headers: List[str], rows: List[List[str]]) -> List[Dict]:
    """
    Format parsed data for Supabase insertion
    Maps to qb_weekly_data schema
    """
    formatted_data = []

    # Map headers to database columns (case-insensitive matching)
    header_map = {h.lower().strip(): h for h in headers}

    for row in rows:
        try:
            # Create dict from row
            row_dict = {headers[i].lower().strip(): val.strip() for i, val in enumerate(row) if i < len(headers)}

            # Map to database schema
            record = {
                'player': row_dict.get('player', ''),
                'week': int(row_dict.get('week', 0)),
                'opponent': row_dict.get('opponent', ''),
                'passing_yards': int(row_dict.get('passing_yards', 0) or row_dict.get('yards', 0)),
                'accuracy_pct': float(row_dict.get('accuracy_pct', 0) or row_dict.get('accuracy', 0)),
                'comp_pct': float(row_dict.get('comp_pct', 0) or row_dict.get('completion', 0) or row_dict.get('comp %', 0)),
                'btt_rate': float(row_dict.get('btt_rate', 0) or row_dict.get('btt', 0)),
                'twp_rate': float(row_dict.get('twp_rate', 0) or row_dict.get('twp', 0)),
            }

            # Optional fields
            if 'prop_line' in row_dict or 'prop' in row_dict:
                prop_val = row_dict.get('prop_line') or row_dict.get('prop')
                if prop_val:
                    record['prop_line'] = float(prop_val)

            if 'bet_result' in row_dict or 'result' in row_dict:
                result = row_dict.get('bet_result') or row_dict.get('result')
                if result and result.lower() in ['over', 'under']:
                    record['bet_result'] = result.capitalize()

            formatted_data.append(record)
        except (ValueError, KeyError, IndexError) as e:
            log(f"Failed to parse row {row}: {e}", 'WARNING')
            continue

    return formatted_data

def send_to_supabase(data: List[Dict]) -> bool:
    """Send formatted data to Supabase"""
    if not data:
        log("No data to send to Supabase", 'WARNING')
        return False

    try:
        log(f"Sending {len(data)} records to Supabase...", 'INFO')

        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/qb_weekly_data",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Prefer': 'return=representation'
            },
            json=data
        )

        if response.ok:
            inserted = response.json()
            log(f"Successfully inserted {len(inserted)} records", 'SUCCESS')
            return True
        else:
            error = response.text
            log(f"Supabase error: {error}", 'ERROR')
            return False

    except Exception as e:
        log(f"Failed to send data to Supabase: {e}", 'ERROR')
        return False

def process_screenshot(device: str, last_hash: Optional[str] = None) -> Optional[str]:
    """
    Main processing pipeline:
    1. Capture screenshot
    2. Check for changes (optional)
    3. Extract data with Claude
    4. Format and send to Supabase

    Returns: hash of processed screenshot
    """
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    screenshot_path = SCREENSHOT_DIR / f'pff_screenshot_{timestamp}.png'

    # Capture screenshot
    log("Capturing screenshot...", 'INFO')
    if not capture_screenshot(device, screenshot_path):
        return last_hash

    # Check if image changed
    current_hash = get_image_hash(screenshot_path)
    if ENABLE_CHANGE_DETECTION and current_hash == last_hash:
        log("No changes detected, skipping OCR", 'INFO')
        screenshot_path.unlink()  # Delete duplicate screenshot
        return current_hash

    log(f"New screenshot detected: {screenshot_path.name}", 'SUCCESS')

    # Extract data with Claude
    extracted_text = extract_data_with_claude(screenshot_path)
    if not extracted_text:
        log("Failed to extract data, skipping this cycle", 'WARNING')
        return current_hash

    # Save extracted text for debugging
    text_path = screenshot_path.with_suffix('.txt')
    with open(text_path, 'w') as f:
        f.write(extracted_text)
    log(f"Saved extracted text to: {text_path.name}", 'DEBUG')

    # Parse data
    headers, rows = parse_tsv_data(extracted_text)
    if not rows:
        log("No data rows parsed from extraction", 'WARNING')
        return current_hash

    log(f"Parsed {len(rows)} rows with columns: {', '.join(headers)}", 'SUCCESS')

    # Format for Supabase
    formatted_data = format_for_supabase(headers, rows)
    if not formatted_data:
        log("No valid data to send to database", 'WARNING')
        return current_hash

    # Send to Supabase
    if send_to_supabase(formatted_data):
        log("✓ Data successfully uploaded to Avantus Analytics", 'SUCCESS')
    else:
        log("✗ Failed to upload data", 'ERROR')

    return current_hash

def watch_emulator():
    """Main watch loop"""
    log("=" * 60, 'INFO')
    log("PFF Emulator Watcher for Avantus Analytics", 'INFO')
    log("=" * 60, 'INFO')

    # Check configuration
    if not check_config():
        log("Configuration check failed. Please update your .env file.", 'ERROR')
        return

    # List and select device
    devices = list_adb_devices()
    device = ADB_DEVICE or select_device(devices)

    if not device:
        return

    log(f"Using device: {device}", 'SUCCESS')
    log(f"Watch interval: {WATCH_INTERVAL} seconds", 'INFO')
    log(f"Change detection: {'enabled' if ENABLE_CHANGE_DETECTION else 'disabled'}", 'INFO')
    log(f"Screenshot directory: {SCREENSHOT_DIR.absolute()}", 'INFO')
    log("", 'INFO')
    log("Press Ctrl+C to stop watching", 'WARNING')
    log("", 'INFO')

    last_hash = None
    cycle = 0

    try:
        while True:
            cycle += 1
            log(f"--- Cycle {cycle} ---", 'INFO')

            last_hash = process_screenshot(device, last_hash)

            log(f"Waiting {WATCH_INTERVAL} seconds until next check...", 'INFO')
            log("", 'INFO')
            time.sleep(WATCH_INTERVAL)

    except KeyboardInterrupt:
        log("", 'INFO')
        log("Watcher stopped by user", 'WARNING')
        log(f"Processed {cycle} cycles", 'INFO')
        log("Screenshots saved in: " + str(SCREENSHOT_DIR.absolute()), 'INFO')

if __name__ == '__main__':
    watch_emulator()
