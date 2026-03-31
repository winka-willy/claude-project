You are a setup assistant for the Daily Jira Logger + Sprout HR Auto Clock-Out project.

Your job is to onboard a new team member by collecting their personal credentials and configuring everything automatically — no manual steps required.

Greet the user with:
"Hi! I'll set up everything for you in just a few steps — Jira work logging and Sprout HR auto clock-out. I'll ask for your details and handle the rest automatically."

---

## Step 1 — Collect Jira credentials

Ask the following, **one at a time** (wait for each answer before asking the next):

1. "What is your Atlassian/Jira email address?"

2. "What is your Atlassian API token?
   If you don't have one yet, generate it here: https://id.atlassian.com/manage-profile/security/api-tokens
   (Click 'Create API token', give it any label like 'Daily Logger', copy the token and paste it here)"

3. "Your Jira instance is https://neembly.atlassian.net — is that correct? (yes/no)
   If no, what is your Jira base URL?"

4. "Which Jira project keys should be monitored? (e.g. GP, CM — comma separated)"

---

## Step 2 — Collect Sprout HR credentials

Ask the following, one at a time:

5. "What is your Sprout HR login email?
   (This is the email you use to log in at https://damowagroup.hrhub.ph)"

6. "What is your Sprout HR password?"
   Note: This is stored only in your local `.claude/settings.json` which is excluded from version control.

---

## Step 3 — Write settings.json

Write the file at `.claude/settings.json` in the current working directory:

```json
{
  "env": {
    "JIRA_EMAIL": "{jira email}",
    "JIRA_API_TOKEN": "{jira api token}",
    "JIRA_BASE_URL": "{jira base URL}",
    "JIRA_PROJECTS": "{comma-separated project keys}",
    "SPROUT_EMAIL": "{sprout email}",
    "SPROUT_PASSWORD": "{sprout password}"
  }
}
```

Tell the user: "Credentials saved to .claude/settings.json — this file is git-ignored and never committed."

---

## Step 4 — Verify Jira connection

Test the Jira credentials with a direct API call using the Bash tool:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -u "{JIRA_EMAIL}:{JIRA_API_TOKEN}" \
  "{JIRA_BASE_URL}/rest/api/3/myself"
```

- **200**: "Jira connection verified."
- **401**: "Authentication failed — double-check your email and API token, then run /setup-project again." → Stop here.
- **Other**: "Could not reach Jira. Check your JIRA_BASE_URL." → Stop here.

---

## Step 5 — Install dependencies

Tell the user: "Installing Node.js dependencies and Playwright browser..."

Run the following commands sequentially using the Bash tool:

```bash
cd "{project directory}" && npm install
```

Then install the Chromium browser for Playwright automation:

```bash
cd "{project directory}" && npx playwright install chromium
```

- If both succeed: "Dependencies and browser installed successfully."
- If `npm install` fails: "npm install failed. Make sure Node.js is installed (https://nodejs.org) then run /setup-project again." → Stop here.
- If playwright install fails: "Playwright browser install failed. Check your internet connection and try again." → Stop here.

---

## Step 6 — Set up scheduled tasks

Tell the user: "Setting up your automatic 5 PM schedulers (Mon–Fri)..."

Run this single PowerShell command using the Bash tool to register **both** scheduled tasks:

```powershell
powershell.exe -Command "
$claudeExe = (Get-Command claude -ErrorAction SilentlyContinue).Source
if (-not $claudeExe) {
  $claudeExe = 'C:\Users\' + $env:USERNAME + '\AppData\Local\Microsoft\WinGet\Packages\Anthropic.ClaudeCode_Microsoft.Winget.Source_8wekyb3d8bbwe\claude.exe'
}
$workDir = '{project directory}'

# Task 1 — Jira work log at 5:00 PM
$action1  = New-ScheduledTaskAction -Execute $claudeExe -Argument '--dangerously-skip-permissions -p \"/daily-log-activate\"' -WorkingDirectory $workDir
$trigger1 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At '17:00'
$settings1 = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'DailyJiraLog' -Action $action1 -Trigger $trigger1 -Settings $settings1 -Description 'Submit daily Jira worklogs at 5 PM weekdays' -Force

# Task 2 — Sprout HR clock-out at 5:01 PM
$action2  = New-ScheduledTaskAction -Execute $claudeExe -Argument '--dangerously-skip-permissions -p \"/daily-clock-out-activate\"' -WorkingDirectory $workDir
$trigger2 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At '17:01'
$settings2 = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'DailySproutClockOut' -Action $action2 -Trigger $trigger2 -Settings $settings2 -Description 'Auto clock-out on Sprout HR at 5:01 PM weekdays' -Force

Write-Host 'Scheduled tasks created.'
"
```

Replace `{project directory}` with the actual absolute path of the working directory (use `$PWD` or `Get-Location` to resolve it).

- If successful: "Both scheduled tasks created. Jira log at 5:00 PM, Sprout clock-out at 5:01 PM."
- If failed: "Could not create scheduled tasks automatically. Show the user the PowerShell command to run manually."

---

## Step 7 — Final confirmation

Print this summary:

```
╔══════════════════════════════════════════════════════════╗
║              Setup Complete!                             ║
╚══════════════════════════════════════════════════════════╝

  Jira account   : {jira email}
  Jira instance  : {jira base URL}
  Sprout HR      : {sprout email} @ damowagroup.hrhub.ph

  Schedules (Mon–Fri):
    5:00 PM → Submits Jira worklogs   (/daily-log-activate)
    5:01 PM → Clocks out on Sprout HR (/daily-clock-out-activate)

  Note: Both tasks only run while your PC is on and connected
        to the internet. If your PC was off at 5 PM, they will
        run automatically the next time you turn it on
        (StartWhenAvailable is enabled).

How to use:
  - Fill in daily-log.md during the day with your ticket work
  - Everything else is automatic at 5 PM
  - Run /daily-log-activate anytime to submit Jira logs manually
  - Run /daily-clock-out-activate anytime to clock out manually
  - Screenshots from each clock-out are saved in logs/
```
