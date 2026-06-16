$ErrorActionPreference = 'Continue'
$root = $PSScriptRoot
Set-Location $root
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;" + $env:Path

Get-ChildItem -Filter "_*.*" -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -ne '_deploy.ps1' } |
  Remove-Item -Force -ErrorAction SilentlyContinue

git add .
git commit -m "perf: parallel fetches + debug endpoint /api/debug/spend para validar dados"
git push origin main

Write-Host ""
Write-Host "[OK] Push feito. Vercel auto-redeploya em ~30-60s." -ForegroundColor Green
Write-Host "Endpoint debug: https://larroude-dash-meta.vercel.app/api/debug/spend?region=US" -ForegroundColor Cyan
