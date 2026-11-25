$ErrorActionPreference = "Stop"
$projectDir = "C:\Users\masou\.gemini\antigravity\scratch\ai-virtual-fitting-room"
Set-Location $projectDir

Write-Host "===> 1. Building clean production bundle..." -ForegroundColor Cyan
npm run build

Write-Host "===> 2. Preparing clean staging package..." -ForegroundColor Cyan
$stageDir = Join-Path $projectDir "staging_zip"
if (Test-Path $stageDir) { Remove-Item -Path $stageDir -Recurse -Force }
New-Item -ItemType Directory -Path $stageDir | Out-Null

$foldersToCopy = @("dist", "src", "server")
foreach ($folder in $foldersToCopy) {
    $srcPath = Join-Path $projectDir $folder
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination (Join-Path $stageDir $folder) -Recurse -Force
    }
}

$filesToCopy = @(
    "server.ts",
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "index.html",
    "README.md"
)

foreach ($file in $filesToCopy) {
    $filePath = Join-Path $projectDir $file
    if (Test-Path $filePath) {
        Copy-Item -Path $filePath -Destination $stageDir -Force
    }
}

Write-Host "===> 3. Compressing project into ZIP archive..." -ForegroundColor Cyan
$zipName = "ai-virtual-fitting-room-v2.zip"
$destZip1 = Join-Path $projectDir $zipName
$destZip2 = "C:\Users\masou\.gemini\antigravity\scratch\$zipName"
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$destZipDesktop = Join-Path $desktopPath $zipName

if (Test-Path $destZip1) { Remove-Item $destZip1 -Force }
if (Test-Path $destZip2) { Remove-Item $destZip2 -Force }
if (Test-Path $destZipDesktop) { Remove-Item $destZipDesktop -Force }

tar -a -cf "$destZip1" -C "$stageDir" *
Copy-Item -Path $destZip1 -Destination $destZip2 -Force
try {
    Copy-Item -Path $destZip1 -Destination $destZipDesktop -Force
    Write-Host "Copied to Desktop: $destZipDesktop" -ForegroundColor Green
} catch {
    Write-Host "Desktop copy notice: $($_.Exception.Message)" -ForegroundColor Yellow
}

Remove-Item -Path $stageDir -Recurse -Force

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "SUCCESS! Final clean new project ZIP created:" -ForegroundColor Green
Write-Host "1. $destZip1" -ForegroundColor Yellow
Write-Host "2. $destZip2" -ForegroundColor Yellow
Write-Host "3. $destZipDesktop" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green

Get-Item $destZip1 | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB, 2)}}, LastWriteTime
