# ALeagueOfOurOwn
Leaguey McLeagueFace

Prod: https://gilded-piroshki-2bd9dc.netlify.app/
Staging: https://staging--gilded-piroshki-2bd9dc.netlify.app/

## Local Development

This project is a small React UI (`ui/`) backed by a FastAPI app deployed as a Netlify Function (`api/api.py`). The simplest way to run everything together locally is to use the Netlify CLI.

### Prerequisites

- **Node.js**: v18+ recommended (includes `npm`).
- **Python 3**: v3.9+ recommended, with `pip` available on your `PATH`.
- **Netlify CLI**: install globally with:

  ```bash
  npm install -g netlify-cli
  ```

### One-shot local dev on Windows (recommended)

From the repo root:

```bash
.\dev.cmd
```

What this does:

- **Installs UI dependencies** in `ui/`.
- **Creates/uses a local Python virtualenv** in `.venv` and installs backend deps from `api/requirements.txt`.
- **Starts the Netlify dev server**, which in turn runs `npm --prefix ui run dev` on port 3000 and proxies everything through `http://localhost:8888/` (including the FastAPI Netlify Function).

Once it’s running:

- **App UI**: `http://localhost:8888/`
- **API health endpoint**: `http://localhost:8888/.netlify/functions/api/health`

You can re-run `.\dev.cmd` any time; it will re-use existing `node_modules` and `.venv` if they already exist.

### Manual local dev (alternative)

If you prefer to do things manually instead of using `dev.cmd`, you can run:

```bash
npm --prefix ui install
pip install -r api/requirements.txt
netlify dev
```

Run those commands from the repo root. This gives you the same behavior as `dev.cmd`: the React app and the FastAPI Netlify Function are both served together by the Netlify dev server.

## Troubleshooting

- **`netlify` is not recognized**:
  - Make sure you installed the Netlify CLI globally with `npm install -g netlify-cli`.
  - Close and reopen your terminal so the updated `PATH` is picked up.

- **Port 8888 already in use**:
  - Either stop the process currently listening on that port, or run:

    ```bash
    netlify dev --port 3000
    ```

    (If you use a non-default port, adjust URLs accordingly, e.g. `http://localhost:3000/` and `http://localhost:3000/.netlify/functions/api/health`.)
