# PFF Emulator Watcher for Avantus Analytics

Automatically monitors the PFF mobile app running in an Android emulator (Bluestacks) and extracts prop data to the Avantus Analytics website using Claude Vision API and Supabase.

## Features

- 📱 **ADB Integration**: Captures screenshots from Android emulator
- 🤖 **Claude Vision API**: Superior OCR accuracy for table extraction
- 🔄 **Change Detection**: Only processes when screen content changes
- 💾 **Automatic Upload**: Sends data directly to Supabase database
- 📊 **Real-time Updates**: Data appears instantly in admin panel
- 🎨 **Pretty Logging**: Color-coded terminal output
- 📸 **Screenshot Archive**: Saves all captures for debugging

## Prerequisites

### 1. Android Platform Tools (ADB)

You've already installed this, but to verify:

```bash
adb --version
```

If not in PATH, add it:
```
C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools
```

### 2. Python 3.8+

Check your Python version:
```bash
python --version
```

### 3. Bluestacks Emulator

Make sure Bluestacks is running and PFF app is installed.

## Setup Instructions

### Step 1: Install Python Dependencies

```bash
cd /path/to/QBCI-Beta
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:

   **Supabase Credentials:**
   - Already filled in: `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - These match your `config/supabase-config.js`

   **Claude API Key:**
   - Get from: https://console.anthropic.com/settings/keys
   - Replace `your_claude_api_key_here` with your actual key (starts with `sk-ant-api03-`)

   **ADB Device (Optional):**
   - If you have multiple emulators running, specify the device ID
   - Get device ID: `adb devices`
   - Example: `ADB_DEVICE=emulator-5554`

### Step 3: Connect to Emulator

1. Start Bluestacks emulator
2. Open PFF app
3. Navigate to the prop data screen you want to monitor

4. Test ADB connection:
   ```bash
   adb devices
   ```

   You should see something like:
   ```
   List of devices attached
   emulator-5554   device
   127.0.0.1:5555  device
   ```

5. If you see "more than one device/emulator", you need to specify which one in `.env`:
   ```bash
   # In .env file
   ADB_DEVICE=127.0.0.1:5555
   ```

### Step 4: Test Screenshot Capture

Test that ADB can capture screenshots:

```bash
# If one device
adb exec-out screencap -p > test.png

# If multiple devices (replace with your device ID)
adb -s 127.0.0.1:5555 exec-out screencap -p > test.png
```

Open `test.png` to verify it captured the correct screen.

## Usage

### Start the Watcher

```bash
python pff_emulator_watcher.py
```

### What Happens:

1. Script connects to your emulator via ADB
2. If multiple devices exist, it will ask you to select one
3. Every 30 seconds (configurable):
   - Captures screenshot from emulator
   - Checks if screen changed (if enabled)
   - Sends image to Claude Vision API for OCR
   - Extracts prop data from table
   - Uploads to Supabase database
4. Data appears immediately in your Avantus Analytics admin panel

### Example Output:

```
[2025-11-10 15:30:00] [INFO] ============================================================
[2025-11-10 15:30:00] [INFO] PFF Emulator Watcher for Avantus Analytics
[2025-11-10 15:30:00] [INFO] ============================================================
[2025-11-10 15:30:01] [SUCCESS] Auto-selected device: 127.0.0.1:5555
[2025-11-10 15:30:01] [INFO] Watch interval: 30 seconds
[2025-11-10 15:30:01] [INFO] Change detection: enabled
[2025-11-10 15:30:01] [INFO] Screenshot directory: C:\Users\Keegan\QBCI-Beta\screenshots
[2025-11-10 15:30:01] [WARNING] Press Ctrl+C to stop watching

[2025-11-10 15:30:01] [INFO] --- Cycle 1 ---
[2025-11-10 15:30:01] [INFO] Capturing screenshot...
[2025-11-10 15:30:02] [SUCCESS] New screenshot detected: pff_screenshot_20251110_153002.png
[2025-11-10 15:30:02] [INFO] Analyzing screenshot with Claude Vision API...
[2025-11-10 15:30:05] [SUCCESS] Successfully extracted 15 lines
[2025-11-10 15:30:05] [SUCCESS] Parsed 14 rows with columns: Player, Week, Opponent, Yards, Accuracy
[2025-11-10 15:30:05] [INFO] Sending 14 records to Supabase...
[2025-11-10 15:30:06] [SUCCESS] Successfully inserted 14 records
[2025-11-10 15:30:06] [SUCCESS] ✓ Data successfully uploaded to Avantus Analytics
[2025-11-10 15:30:06] [INFO] Waiting 30 seconds until next check...
```

### Stop the Watcher:

Press `Ctrl+C` to stop.

## Configuration Options

Edit these in your `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `WATCH_INTERVAL` | 30 | Seconds between screenshots |
| `SCREENSHOT_DIR` | ./screenshots | Where to save screenshots |
| `ENABLE_CHANGE_DETECTION` | true | Only process when screen changes |
| `ADB_DEVICE` | (auto) | Specific device ID if multiple connected |

## Troubleshooting

### Problem: "ADB not found"
**Solution:**
- Install Android Platform Tools
- Add to PATH: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools`
- Restart terminal

### Problem: "more than one device/emulator"
**Solution:**
1. Run `adb devices` to see all devices
2. Add to `.env`: `ADB_DEVICE=emulator-5554` (replace with your device ID)

### Problem: "No ADB devices found"
**Solution:**
- Make sure Bluestacks is running
- Enable ADB in Bluestacks settings:
  - Settings → Advanced → Android Debug Bridge (ADB) → Enable
  - Note the port (usually 5555)
- Restart Bluestacks

### Problem: "CLAUDE_API_KEY not set"
**Solution:**
- Get API key from: https://console.anthropic.com/settings/keys
- Add to `.env` file: `CLAUDE_API_KEY=sk-ant-api03-...`

### Problem: "Failed to extract data"
**Solution:**
- Make sure PFF app is showing a clear table view
- Check `screenshots/` folder to see what was captured
- The screen might not contain a table to extract

### Problem: "Supabase error"
**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
- Check if database table `qb_weekly_data` exists
- View Supabase logs at: https://app.supabase.com/project/zaljfpagjzndgudnyggu/logs

## How It Works

### Data Flow:

```
┌─────────────────────┐
│ Bluestacks Emulator │
│   (PFF Mobile App)  │
└──────────┬──────────┘
           │ ADB: adb shell screencap
           ▼
┌─────────────────────┐
│ pff_emulator_watcher.py │
│ - Capture loop      │
│ - Change detection  │
│ - Image processing  │
└──────────┬──────────┘
           │ base64 encoded image
           ▼
┌─────────────────────┐
│ Claude Vision API   │
│ (claude-3-5-sonnet) │
│ - Table extraction  │
│ - OCR processing    │
└──────────┬──────────┘
           │ tab-separated values
           ▼
┌─────────────────────┐
│ Python Parser       │
│ - Parse TSV data    │
│ - Map to schema     │
│ - Validate data     │
└──────────┬──────────┘
           │ JSON records
           ▼
┌─────────────────────┐
│  Supabase REST API  │
│ (qb_weekly_data)    │
│ - Insert records    │
│ - Return results    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Admin Panel        │
│ (Avantus Analytics) │
│ - Real-time view    │
└─────────────────────┘
```

### Database Schema:

The watcher automatically maps extracted data to your `qb_weekly_data` table:

| Column | Type | Required | Example |
|--------|------|----------|---------|
| player | TEXT | Yes | "Baker Mayfield" |
| week | INTEGER | Yes | 1 |
| opponent | TEXT | Yes | "@ATL" |
| passing_yards | INTEGER | Yes | 167 |
| accuracy_pct | DECIMAL | Yes | 53.1 |
| comp_pct | DECIMAL | Yes | 53.1 |
| btt_rate | DECIMAL | No | 6.1 |
| twp_rate | DECIMAL | No | 10.5 |
| prop_line | DECIMAL | No | 244.5 |
| bet_result | TEXT | No | "Over" / "Under" |

### Cost Estimation:

- **Claude API**: ~$0.004 per screenshot
- **30 second interval**: ~$0.48 per hour (120 screenshots)
- **Recommended**: Use change detection to reduce costs

## Advanced Usage

### Run in Background (Windows)

Create a batch file `start_watcher.bat`:

```batch
@echo off
cd C:\path\to\QBCI-Beta
python pff_emulator_watcher.py
pause
```

### Custom Screen Regions

If you want to crop to specific screen regions, modify `capture_screenshot()` function to use OpenCV:

```python
import cv2

def crop_screenshot(image_path, x, y, width, height):
    img = cv2.imread(str(image_path))
    cropped = img[y:y+height, x:x+width]
    cv2.imwrite(str(image_path), cropped)
```

### Webhook Notifications

Add to `send_to_supabase()` to get notifications:

```python
# Send Discord/Slack webhook
requests.post('YOUR_WEBHOOK_URL', json={
    'content': f'✓ Uploaded {len(data)} records to Avantus Analytics'
})
```

## Next Steps

1. ✅ Start the watcher: `python pff_emulator_watcher.py`
2. ✅ Open PFF app in Bluestacks to prop data screen
3. ✅ Watch data automatically flow to admin panel
4. ✅ Check `screenshots/` folder to see captured images
5. ✅ View data at: `admin-panel.html`

## Support

For issues or questions:
- Check `screenshots/` folder for captured images
- Check `screenshots/*.txt` files for extracted text
- View Supabase logs for database errors
- Review Claude API usage at: https://console.anthropic.com

## License

MIT License - Part of the Avantus Analytics project
