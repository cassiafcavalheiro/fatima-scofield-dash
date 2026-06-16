# =============================================================
#  Larroude - Dash Meta - Deploy Vercel (somente)
# =============================================================
# Roda isto APENAS para fazer o deploy na Vercel.
# O resto (npm install, build, git, GitHub) ja esta feito.
# =============================================================

$ErrorActionPreference = 'Continue'
$root = $PSScriptRoot
Set-Location $root

$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;" + $env:Path
$env:Path = $env:Path + ";" + "$env:APPDATA\npm"

function Step($t) { Write-Host ""; Write-Host "=== $t ===" -ForegroundColor Magenta }
function Ok($t)   { Write-Host "[OK] $t" -ForegroundColor Green }
function Warn($t) { Write-Host "[!] $t" -ForegroundColor Yellow }
function Err($t)  { Write-Host "[X] $t" -ForegroundColor Red }

# Limpa lixo do troubleshoot
Remove-Item "$root\env-check.txt" -Force -ErrorAction SilentlyContinue

# 1. Vercel CLI
Step "Verificando Vercel CLI"
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercel) {
  Warn "Instalando Vercel CLI globalmente (pode demorar 1 min)"
  npm i -g vercel
  $vercel = Get-Command vercel -ErrorAction SilentlyContinue
  if (-not $vercel) {
    Err "Vercel CLI nao instalou. Tente manualmente: npm i -g vercel"
    exit 1
  }
}
Ok "Vercel CLI: $($vercel.Source)"

# 2. Login
Step "Verificando login Vercel"
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Warn "Precisa logar na Vercel. Vai abrir o navegador."
  vercel login
}
Ok "Logada: $(vercel whoami 2>&1)"

# 3. Link
Step "Linkando projeto Vercel"
if (-not (Test-Path ".vercel")) {
  Warn "Siga as instrucoes: -> Set up and deploy / -> escolha o scope / -> Link to existing? NAO / -> nome do projeto (sugestao: larroude-dash-meta)"
  vercel link
} else {
  Ok "Ja linkado"
}

# 4. Env vars
Step "Configurando variaveis de ambiente"
Write-Host "Vou pegar o token do arquivo .env local e adicionar na Vercel" -ForegroundColor Cyan
$token = (Get-Content "$root\.env" | Where-Object { $_ -match "^META_ACCESS_TOKEN=" }) -replace "^META_ACCESS_TOKEN=", ""

if ($token) {
  Write-Host "Token encontrado no .env (length: $($token.Length))" -ForegroundColor Cyan
  $resp = Read-Host "Adicionar META_ACCESS_TOKEN na Vercel? (s/N)"
  if ($resp -eq "s" -or $resp -eq "S") {
    # Adiciona para os 3 ambientes via stdin
    Write-Host "Adicionando para Production..." -ForegroundColor Cyan
    $token | vercel env add META_ACCESS_TOKEN production
    Write-Host "Adicionando para Preview..." -ForegroundColor Cyan
    $token | vercel env add META_ACCESS_TOKEN preview
    Write-Host "Adicionando para Development..." -ForegroundColor Cyan
    $token | vercel env add META_ACCESS_TOKEN development
    Ok "Token adicionado"
  }
} else {
  Warn "META_ACCESS_TOKEN nao encontrado no .env"
}

# 5. Deploy
Step "Deploy em producao"
$resp = Read-Host "Fazer deploy --prod agora? (s/N)"
if ($resp -eq "s" -or $resp -eq "S") {
  vercel --prod
  Ok "Deploy concluido. URL acima."
} else {
  Warn "Quando quiser deployar: vercel --prod"
}

Write-Host ""
Write-Host "Pronto. GitHub: https://github.com/cassiafernandes-larroude/larroude-dash-meta" -ForegroundColor Green
