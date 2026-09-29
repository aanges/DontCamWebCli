<#
  gen-latest-json.ps1 — generates Tauri updater v2 manifest (updates/latest.json).

  Reads the .sig produced by `tauri build` and writes the static JSON
  served by GitHub Pages at https://dontcamclient.duckdns.org/updates/latest.json

  Typical flow after `.\build-release.ps1` (in dontcum-launcher):
    1. Upload the installer to GitHub Releases (repo DontCamClient-Releases):
         gh release create "v0.1.1" --notes "…" --title "v0.1.1"
         gh release upload "v0.1.1" "…\DontCam Client_0.1.1_x64-setup.exe#DontCamClient-0.1.1-x64-setup.exe"
       (the part after # renames the asset; BYTES must stay identical —
        the .sig covers file content, not the name)
    2. Run this script (it only READS the .sig, never secrets):
         .\tools\gen-latest-json.ps1 -Version 0.1.1 -NsisExe "<path>\DontCam Client_0.1.1_x64-setup.exe" -UpdateSiteLinks
    3. Commit + push dontcam-client-website (GitHub Pages serves latest.json).

  Usage:
    powershell -ExecutionPolicy Bypass -File .\tools\gen-latest-json.ps1 `
      -Version 0.1.1 `
      -NsisExe "C:\...\bundle\nsis\DontCam Client_0.1.1_x64-setup.exe" `
      [-Notes "…"] [-Repo "aanges/DontCamClient-Releases"] [-UpdateSiteLinks]
#>
param(
  [Parameter(Mandatory = $true)][string]$Version,
  [Parameter(Mandatory = $true)][string]$NsisExe,
  [string]$Notes = '',
  [string]$Repo = 'aanges/DontCamClient-Releases',
  [string]$WebsiteDir = '',
  [switch]$UpdateSiteLinks
)

$ErrorActionPreference = 'Stop'

$Version = $Version.Trim().TrimStart('v')
if (-not (Test-Path $NsisExe)) { throw "Installer not found: $NsisExe" }

$sigPath = "$NsisExe.sig"
if (-not (Test-Path $sigPath)) { throw "Signature not found: $sigPath. Build with signing env (see launcher build-release.ps1)." }

if ([string]::IsNullOrWhiteSpace($WebsiteDir)) {
  $WebsiteDir = Split-Path $PSScriptRoot -Parent
}
$updatesDir = Join-Path $WebsiteDir 'updates'
New-Item -ItemType Directory -Force -Path $updatesDir | Out-Null

# .sig content goes VERBATIM into JSON (single line, no whitespace).
$signature = ((Get-Content $sigPath -Raw) -replace '\s+', '')
if ([string]::IsNullOrWhiteSpace($signature)) { throw "Empty signature in $sigPath" }

$assetName = "DontCamClient-$Version-x64-setup.exe"
$url = "https://github.com/$Repo/releases/download/v$Version/$assetName"
if ([string]::IsNullOrWhiteSpace($Notes)) { $Notes = "DontCam Client v$Version" }
$pubDate = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')

$manifest = [ordered]@{
  version   = $Version
  notes     = $Notes
  pub_date  = $pubDate
  platforms = [ordered]@{
    'windows-x86_64' = [ordered]@{
      signature = $signature
      url       = $url
    }
  }
}

$outPath = Join-Path $updatesDir 'latest.json'
[IO.File]::WriteAllText($outPath, ($manifest | ConvertTo-Json -Depth 6), [Text.UTF8Encoding]::new($false))
Write-Output "[updates] wrote $outPath (v$Version)"

if ($UpdateSiteLinks) {
  $configPath = Join-Path $WebsiteDir 'config.js'
  if (Test-Path $configPath) {
    $cfg = Get-Content $configPath -Raw
    $cfg = $cfg -replace 'GITHUB_REPO:\s*"[^"]*"', "GITHUB_REPO: `"https://github.com/$Repo`""
    $cfg = $cfg -replace 'DOWNLOAD_EXE_URL:\s*"[^"]*"', "DOWNLOAD_EXE_URL: `"$url`""
    [IO.File]::WriteAllText($configPath, $cfg, [Text.UTF8Encoding]::new($false))
    Write-Output "[updates] patched DOWNLOAD_EXE_URL in config.js"
  } else {
    Write-Output "[updates] WARNING: config.js not found, links not patched"
  }
}

Write-Output ''
Write-Output 'Next steps:'
Write-Output "  1. gh release upload `"v$Version`" `"$NsisExe#$assetName`" --repo $Repo"
Write-Output '  2. git add updates/latest.json [config.js] && git commit && git push (website repo)'
Write-Output '  3. Verify: https://dontcamclient.duckdns.org/updates/latest.json'
