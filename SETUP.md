# Setup Instructions

## Prerequisites

- Docker Desktop installed and running
- Node.js 20+ (for local UI development)
- Firely Server license (obtain from [fire.ly](https://fire.ly))

## Initial Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd converge-and-collaborate-dublin-hackaton
```

### 2. Configure Firely Server License

⚠️ **IMPORTANT**: You must provide your own Firely Server license.

1. Copy the license template:
   ```bash
   cp config/firely-license.json.template config/firely-license.json
   ```

2. Edit `config/firely-license.json` and paste your license content from Firely.

3. The license file is already in `.gitignore` and will never be committed.

### 3. Start the Stack

```bash
# Start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

**Note**: Firely Server takes 3-5 minutes to initialize on first startup.

### 4. Access the Services

- **UI Dashboard**: http://localhost:3000
- **Firely Server API**: http://localhost:4080
- **OpenFHIR**: http://localhost:8083
- **MongoDB**: localhost:27017

### 5. Server Status Monitoring

The UI Dashboard includes **automatic server status checking**:

- **Green Banner**: Firely server is operational and ready
- **Blue Banner**: Server is initializing (loading conformance resources, ~3-5 minutes)
- **Red Banner**: Server unavailable or license issue - includes detailed setup instructions

The banner auto-refreshes every 30 seconds when issues are detected, so you'll know immediately when the server is ready or if action is needed.

## UI Development

### Local Development

```bash
cd ui
npm install
npm run dev
```

The UI will be available at http://localhost:3000

### Build for Production

```bash
cd ui
npm run build
```

## Stopping the Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v
```

## Configuration Files

| File | Purpose | Commit? |
|------|---------|---------|
| `config/firely-license.json` | Your Firely license | ❌ NO |
| `config/firely-license.json.template` | License template | ✅ Yes |
| `config/appsettings.instance.json` | Firely settings | ✅ Yes |
| `config/cdrs.yml` | openEHR CDR config | ✅ Yes |
| `ui/.env` | UI environment vars | ❌ NO |
| `docker-compose.yml` | Docker orchestration | ✅ Yes |

## Troubleshooting

### License Issues

If Firely Server exits immediately:
1. Check license validity date
2. Verify license file format
3. Check logs: `docker compose logs firely`

### Port Conflicts

If ports are already in use:
```bash
# Check what's using the port
netstat -ano | findstr :4080
netstat -ano | findstr :3000
netstat -ano | findstr :27017
```

### Reset Everything

```bash
docker compose down -v
docker system prune -f
docker compose up -d
```

## Getting a Firely License

1. Visit https://fire.ly/
2. Request an evaluation license
3. Copy the license JSON to `config/firely-license.json`

Evaluation licenses are typically valid for 30 days with 12-hour uptime limit.
