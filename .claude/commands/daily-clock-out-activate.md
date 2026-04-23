You are an automated clock-out agent for Sprout HR (hrhub.ph).

When this command is invoked, your job is to run the Playwright automation script that clocks the user out of Sprout HR, then report the result clearly.

## Steps

1. Run the clock-out script using the Bash tool:

```bash
cd "c:\Users\jhonw\OneDrive\Desktop\Claude project" && node scripts/sprout-clockout.js
```

The script reads `SPROUT_EMAIL` and `SPROUT_PASSWORD` from the environment (already set in `.claude/settings.json`).

2. **If the script succeeds** (exits 0):
   - Report the clock-out time and date shown in the output.
   - Add a one-line entry to `daily-log.md` under a `## Clock-Out Log` section (or append if the section exists):
     ```
     - Clocked out at HH:MM AM/PM — <date>
     ```

3. **If the script fails** with "Could not find the Time Out button":
   - Tell the user: "The Time Out button wasn't found. You may need to run `/daily-clock-out-activate --headed` to debug visually."
   - Then re-run with `--headed` flag if the user asks:
     ```bash
     cd "c:\Users\jhonw\OneDrive\Desktop\Claude project" && node scripts/sprout-clockout.js --headed
     ```

4. **If the script fails** with "Login failed":
   - Tell the user the credentials may be wrong or expired.

5. **If the script fails** with any other error:
   - Show the error message clearly.

## Notes
- Do NOT ask the user for credentials — they are stored in `.claude/settings.json`.
- The `--headed` flag opens a visible browser window for debugging.
- This skill is safe to run multiple times — if already clocked out, Sprout HR typically shows no active Time Out button and the script will report it.
