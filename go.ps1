# =============================================================
#  Larroude - Dash Meta - Script de setup local + deploy
# =============================================================
# Como usar:
#   cd "C:\Users\Cassia.Fernandes\Documents\Claude\Projects\Dash Meta"
#   .\go.ps1
# =============================================================

$ErrorActionPreference = 'Continue'
$root = $PSScriptRoot
Set-Location $root

# Garante PATH com node, git e gh
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;" + $env:Path

function Step($t) { Write-Host ""; Write-Host "=== $t ===" -ForegroundColor Magenta }
function Ok($t)   { Write-Host "[OK] $t" -ForegroundColor Green }
function Warn($t) { Write-Host "[!] $t" -ForegroundColor Yellow }
function Err($t)  { Write-Host "[X] $t" -ForegroundColor Red }

# ----- Limpa temporarios -----
Step "Limpando arquivos temporarios"
Get-ChildItem -Path $root -Filter "_*.*" -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -ne 'go.ps1' } |
  Remove-Item -Force -ErrorAction SilentlyContinue
schtasks /Delete /TN LarroudeInstall /F 2>&1 | Out-Null
if (Test-Path "node_modules") {
  Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
Ok "Limpeza concluida"

# ----- npm install -----
Step "npm install (1 a 2 min - baixando 250 pacotes)"
npm install --no-audit --no-fund --loglevel=warn
if ($LASTEXITCODE -ne 0) {
  Err "npm install falhou (exit $LASTEXITCODE)"
  exit 1
}
$pkgCount = (Get-ChildItem 'node_modules' -Directory -ErrorAction SilentlyContinue).Count
Ok "$pkgCount pacotes instalados"

# ----- Build -----
Step "npm run build (validacao TypeScript)"
npm run build
if ($LASTEXITCODE -ne 0) {
  Err "Build falhou - corrigir erros antes de seguir"
  exit 1
}
Ok "Build de producao OK"

# ----- Git -----
Step "Git init e primeiro commit"
if (-not (Test-Path ".git")) {
  git init
  git branch -M main
  Ok "Git inicializado"
} else {
  Ok "Git ja inicializado"
}
git add .
$hasChanges = git status --porcelain
if ($hasChanges) {
  git commit -m "feat: dashboard Meta Ads Larroude US/BR"
  Ok "Commit criado"
} else {
  Ok "Sem mudancas para commitar"
}

# ----- GitHub repo -----
Step "Criando repositorio no GitHub via gh CLI"
$ghPath = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghPath) {
  Err "gh CLI nao encontrado. Instale com: winget install GitHub.cli"
} else {
  gh auth status 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Warn "gh precisa de login. Rodando gh auth login (siga as instrucoes)"
    gh auth login
  }
  gh repo view larroude-dash-meta 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    gh repo create larroude-dash-meta --private --source=. --remote=origin --push
    Ok "Repositorio criado e push feito"
  } else {
    $remotes = git remote 2>&1
    if (-not ($remotes -match "origin")) {
      $user = gh api user --jq .login
      git remote add origin "https://github.com/$user/larroude-dash-meta.git"
    }
    git push -u origin main
    Ok "Push feito"
  }
}

# ----- Vercel -----
Step "Deploy Vercel"
$vercelPath = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelPath) {
  Warn "Instalando Vercel CLI globalmente"
  npm i -g vercel
}

if (-not (Test-Path ".vercel")) {
  Warn "Linkando projeto a Vercel (siga as instrucoes)"
  vercel link
}

Write-Host ""
Write-Host "Configure as variaveis de ambiente:" -ForegroundColor Cyan
Write-Host "  vercel env add META_ACCESS_TOKEN" -ForegroundColor White
Write-Host "  (cole o token do .env e selecione Production + Preview + Development)" -ForegroundColor White

$resp = Read-Host "Adicionar META_ACCESS_TOKEN agora? (s/N)"
if ($resp -eq "s" -or $resp -eq "S") {
  vercel env add META_ACCESS_TOKEN
}

$resp = Read-Host "Fazer deploy em producao agora? (s/N)"
if ($resp -eq "s" -or $resp -eq "S") {
  vercel --prod
  Ok "Deploy concluido"
}

Write-Host ""
Write-Host "Tudo pronto." -ForegroundColor Green
Write-Host "  Local:  npm run dev (http://localhost:3000)"
Write-Host "  Deploy: git push (Vercel auto-deploya da branch main)"
