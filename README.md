# DontCam Client — strona (GitHub Pages)

Statyczna strona bez builda. Gotowa do Pages.

## Publikacja (nowe repo)

```powershell
cd dontcam-client-website
git init
git add .
git commit -m "DontCam Client website v1"
git branch -M main
git remote add origin https://github.com/TWOJ_NICK/NAZWA-REPO.git
git push -u origin main
```

GitHub → repo → **Settings → Pages** → **Deploy from a branch** → `main` + `/ (root)` → Save.
Adres: `https://TWOJ_NICK.github.io/NAZWA-REPO/`

## Podpięcie pobierania

1. W repo launchera zrób **Releases → Draft new release → v0.1.0** i dodaj `.exe` / `.msi` z `npm run tauri:build`.
2. Skopiuj linki i wklej w `config.js` jako `DOWNLOAD_EXE_URL` / `DOWNLOAD_MSI_URL` + `GITHUB_REPO`.
3. Push — strona sama podmieni przyciski i ukryje ostrzeżenie.

## Dostęp dla mnie

Żebym mógł sam pushować, dodaj mnie jako collaboratora (Settings → Collaborators) albo podeślij repo URL + token. Na razie działam lokalnie.
