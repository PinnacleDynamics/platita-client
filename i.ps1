# Platita installer for Windows — https://platita.lat
# Uso:  irm https://platita.lat/i.ps1 | iex           (te pedirá el token)
#       o:  & ([scriptblock]::Create((irm https://platita.lat/i.ps1))) -Token plt_XXX
param([string]$Token)

$ErrorActionPreference = "Stop"
$dir = Join-Path $env:USERPROFILE ".platita\bin"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

Invoke-WebRequest -UseBasicParsing "https://platita.lat/install.py" -OutFile (Join-Path $dir "install.py")
Invoke-WebRequest -UseBasicParsing "https://platita.lat/platita_statusline.py" -OutFile (Join-Path $dir "platita_statusline.py")

# buscamos un Python disponible: py -3 → python → python3
$py = $null; $pyArgs = @()
foreach ($c in @(@("py", @("-3")), @("python", @()), @("python3", @()))) {
  try { & $c[0] @($c[1] + @("--version")) *> $null; if ($LASTEXITCODE -eq 0) { $py = $c[0]; $pyArgs = $c[1]; break } } catch {}
}
if (-not $py) { Write-Host "No encontré Python. Instálalo desde python.org y repite." -ForegroundColor Red; exit 1 }

if (-not $Token) { $Token = Read-Host "Pega tu token plt_ (lo ves en platita.lat/panel.html)" }
& $py @($pyArgs + @((Join-Path $dir "install.py"), "--token", $Token))
