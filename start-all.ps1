$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$runDir = Join-Path $root ".run"
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"

function Find-Npm {
  $npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if ($npmCmd) { return $npmCmd.Source }

  $paths = @(
    "$env:ProgramFiles\nodejs\npm.cmd",
    "$env:ProgramFiles(x86)\nodejs\npm.cmd",
    "$env:LOCALAPPDATA\Programs\nodejs\npm.cmd"
  )
  foreach ($p in $paths) {
    if (Test-Path $p) { return $p }
  }
  return $null
}

function Find-Python {
  $candidates = @()
  $pyCmd = Get-Command py -ErrorAction SilentlyContinue
  if ($pyCmd) {
    $candidates += @{ Type = "launcher"; Cmd = "py"; Args = @("-3") }
  }

  $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
  if ($pythonCmd -and $pythonCmd.Source -notlike "*WindowsApps*") {
    $candidates += @{ Type = "exe"; Cmd = $pythonCmd.Source; Args = @() }
  }

  $commonPaths = @(
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python310\python.exe",
    "$env:ProgramFiles\Python312\python.exe",
    "$env:ProgramFiles\Python311\python.exe",
    "$env:ProgramFiles\Python310\python.exe"
  )

  foreach ($path in $commonPaths) {
    if (Test-Path $path) {
      $candidates += @{ Type = "exe"; Cmd = $path; Args = @() }
    }
  }

  $discovered = Get-ChildItem "C:\Users\*\AppData\Local\Programs\Python\Python3*\python.exe" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
  foreach ($path in $discovered) {
    if (Test-Path $path) {
      $candidates += @{ Type = "exe"; Cmd = $path; Args = @() }
    }
  }

  foreach ($c in $candidates) {
    try {
      if ($c.Type -eq "launcher") {
        & $c.Cmd @($c.Args + @("--version")) | Out-Null
      } else {
        & $c.Cmd --version | Out-Null
      }
      return $c
    } catch {
      continue
    }
  }
  return $null
}

if (-not (Test-Path $backendDir)) { throw "Missing backend folder at $backendDir" }
if (-not (Test-Path $frontendDir)) { throw "Missing frontend folder at $frontendDir" }

if (-not (Test-Path $venvPython)) {
  $pythonRuntime = Find-Python
  if (-not $pythonRuntime) {
    throw "Python runtime not found. Install Python 3.10+ and ensure either 'py' or 'python' is available."
  }
  Write-Host "Creating backend virtual environment..."
  if ($pythonRuntime.Type -eq "launcher") {
    & $pythonRuntime.Cmd @($pythonRuntime.Args + @("-m", "venv", (Join-Path $backendDir ".venv")))
  } else {
    & $pythonRuntime.Cmd -m venv (Join-Path $backendDir ".venv")
  }
}

Write-Host "Installing backend dependencies..."
& $venvPython -m pip install -r (Join-Path $backendDir "requirements.txt")

Write-Host "Installing frontend dependencies..."
$npmPath = Find-Npm
if (-not $npmPath) {
  throw "npm not found. Install Node.js LTS and retry."
}
Push-Location $frontendDir
& $npmPath install
Pop-Location

$backendLog = Join-Path $runDir "backend.log"
$backendErrLog = Join-Path $runDir "backend.err.log"
$frontendLog = Join-Path $runDir "frontend.log"
$frontendErrLog = Join-Path $runDir "frontend.err.log"
$backendPidFile = Join-Path $runDir "backend.pid"
$frontendPidFile = Join-Path $runDir "frontend.pid"

Write-Host "Starting backend on http://localhost:8000 ..."
$backendProc = Start-Process -FilePath $venvPython `
  -ArgumentList "-m uvicorn app.main:app --reload --port 8000" `
  -WorkingDirectory $backendDir `
  -RedirectStandardOutput $backendLog `
  -RedirectStandardError $backendErrLog `
  -PassThru `
  -WindowStyle Hidden
$backendProc.Id | Set-Content -Path $backendPidFile

Write-Host "Starting frontend on http://localhost:5173 ..."
$frontendProc = Start-Process -FilePath $npmPath `
  -ArgumentList "run dev" `
  -WorkingDirectory $frontendDir `
  -RedirectStandardOutput $frontendLog `
  -RedirectStandardError $frontendErrLog `
  -PassThru `
  -WindowStyle Hidden
$frontendProc.Id | Set-Content -Path $frontendPidFile

Write-Host ""
Write-Host "PEPSICO AI OPS · MIM SUITE is starting."
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:8000"
Write-Host "Logs:     $runDir"
Write-Host ""
Write-Host "To stop both services: .\stop-all.ps1"
