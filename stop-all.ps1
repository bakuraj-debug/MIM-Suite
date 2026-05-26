$ErrorActionPreference = "SilentlyContinue"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$runDir = Join-Path $root ".run"
$backendPidFile = Join-Path $runDir "backend.pid"
$frontendPidFile = Join-Path $runDir "frontend.pid"

function Stop-FromPidFile($pidFile, $name) {
  if (-not (Test-Path $pidFile)) {
    Write-Host "$name PID file not found."
    return
  }

  $pid = Get-Content $pidFile | Select-Object -First 1
  if (-not $pid) {
    Write-Host "$name PID file empty."
    return
  }

  $proc = Get-Process -Id $pid
  if ($proc) {
    Stop-Process -Id $pid -Force
    Write-Host "Stopped $name (PID $pid)."
  } else {
    Write-Host "$name process already stopped."
  }

  Remove-Item $pidFile -Force
}

Stop-FromPidFile $backendPidFile "Backend"
Stop-FromPidFile $frontendPidFile "Frontend"
