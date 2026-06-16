# =============================================================
#  Larroudé · Dash Meta — Setup & Deploy script (PowerShell)
# =============================================================
# Uso:
#   .\setup.ps1 install   # instala dependências
#   .\setup.ps1 dev       # roda local em http://localhost:3000
#   .\setup.ps1 build     # build de produção
#   .\setup.ps1 git       # inicializa git + primeiro commit
#   .\setup.ps1 vercel    # deploy na Vercel (precisa: npm i -g vercel; vercel login)
#   .\setup.ps1 all       # install -> build -> git -> vercel
# =============================================================

param([string]$cmd = "help")

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

function Step($msg) { Write-Host "`n→ $msg" -ForegroundColor Magenta }
function Ok($msg)   { Write-Host "✓ $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "⚠ $msg" -ForegroundColor Yellow }

function Cmd-Install {
  Step "Instalando dependências"
  npm install
  Ok "Dependências instaladas"
}

function Cmd-Dev {
  Step "Rodando dev server (http://localhost:3000)"
  npm run dev
}

function Cmd-Build {
  Step "Build de produção"
  npm run build
  Ok "Build OK"
}

function Cmd-Git {
  Step "Inicializando repositório Git"
  if (-not (Test-Path ".git")) {
    git init
    git branch -M main
  } else {
    Warn "Repositório Git já existe — pulando init"
  }

  git add .
  $hasChanges = git status --porcelain
  if ($hasChanges) {
    git commit -m "feat: dashboard Meta Ads Larroudé US/BR"
    Ok "Commit criado"
  } else {
    Warn "Sem mudanças para commitar"
  }

  Write-Host ""
  Write-Host "Para criar o repositório remoto e publicar:" -ForegroundColor Cyan
  Write-Host "  gh repo create larroude-dash-meta --private --source=. --remote=origin --push" -ForegroundColor White
  Write-Host "OU, se você já tem repo criado:" -ForegroundColor Cyan
  Write-Host "  git remote add origin https://github.com/<seu-user>/<repo>.git" -ForegroundColor White
  Write-Host "  git push -u origin main" -ForegroundColor White
}

function Cmd-Vercel {
  Step "Deploy Vercel"
  # Verifica CLI
  $vercelExists = Get-Command vercel -ErrorAction SilentlyContinue
  if (-not $vercelExists) {
    Step "Instalando Vercel CLI"
    npm i -g vercel
  }

  # Linkagem (se ainda não linkou)
  if (-not (Test-Path ".vercel")) {
    Step "Linkando projeto"
    vercel link
  }

  Write-Host ""
  Write-Host "Adicione as variáveis de ambiente na Vercel:" -ForegroundColor Cyan
  Write-Host "  vercel env add META_ACCESS_TOKEN" -ForegroundColor White
  Write-Host "  vercel env add META_API_VERSION  # opcional, default v20.0" -ForegroundColor White
  Write-Host ""
  $resp = Read-Host "Já configurou as env vars? (s/N)"
  if ($resp -eq "s" -or $resp -eq "S") {
    Step "Fazendo deploy em produção"
    vercel --prod
    Ok "Deploy concluído"
  } else {
    Warn "Configure as env vars antes de prosseguir com 'vercel --prod'"
  }
}

function Cmd-All {
  Cmd-Install
  Cmd-Build
  Cmd-Git
  Cmd-Vercel
}

function Cmd-Help {
  Write-Host ""
  Write-Host "Larroudé · Dash Meta — Setup script" -ForegroundColor Magenta
  Write-Host "Uso: .\setup.ps1 [install|dev|build|git|vercel|all]" -ForegroundColor White
  Write-Host ""
  Write-Host "Comandos:" -ForegroundColor Cyan
  Write-Host "  install  → npm install"
  Write-Host "  dev      → roda local em http://localhost:3000"
  Write-Host "  build    → build de produção"
  Write-Host "  git      → git init + primeiro commit"
  Write-Host "  vercel   → instala CLI + link + deploy"
  Write-Host "  all      → install → build → git → vercel"
  Write-Host ""
}

switch ($cmd.ToLower()) {
  "install" { Cmd-Install }
  "dev"     { Cmd-Dev }
  "build"   { Cmd-Build }
  "git"     { Cmd-Git }
  "vercel"  { Cmd-Vercel }
  "all"     { Cmd-All }
  default   { Cmd-Help }
}
