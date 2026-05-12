# Workspace

This is your working directory for the tutorial. All files you create and edit throughout the session live here.

By the end of the tutorial your workspace should contain:

```
workspace/
  docker-compose.yml        # built up step by step throughout the tutorial
  config/
    appsettings.instance.json
    firely-license.json     # your Firely Server trial license (add this yourself)
    cdrs.yml                # added in Step 4
    logsettings.json        # added in Step 4 (optional)
  vonk-imported/            # create manually before Step 1 (see below)
  .plugins/                 # pre-populated with plugin DLLs
```

## Before you start

Create the `vonk-imported/` directory here (in the workspace dir) with the correct permissions before running `docker compose up` for the first time.

**Linux / macOS:**
```bash
mkdir -p vonk-imported && chmod 777 vonk-imported
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path vonk-imported
```

All `docker compose` commands should be run from this `workspace/` directory.
