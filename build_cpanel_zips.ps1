$ErrorActionPreference = "Stop"

$projectDir = "C:\Users\masou\.gemini\antigravity\scratch\ai-virtual-fitting-room"
Set-Location $projectDir

Write-Host "===> 1. Cleaning and rebuilding project..." -ForegroundColor Cyan
if (Test-Path (Join-Path $projectDir "dist")) {
    Remove-Item (Join-Path $projectDir "dist") -Recurse -Force
}
npm run build

$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$deployDir = Join-Path $projectDir "cpanel_deploy"
if (-not (Test-Path $deployDir)) {
    New-Item -ItemType Directory -Path $deployDir | Out-Null
}

$backendZipDesktop = Join-Path $desktopPath "backend.zip"
$frontendZipDesktop = Join-Path $desktopPath "frontend.zip"
$fullZipDesktop = Join-Path $desktopPath "cpanel_full_package.zip"

$backendZipLocal = Join-Path $deployDir "backend.zip"
$frontendZipLocal = Join-Path $deployDir "frontend.zip"
$fullZipLocal = Join-Path $deployDir "cpanel_full_package.zip"

# Clean old zips
@($backendZipDesktop, $frontendZipDesktop, $fullZipDesktop, $backendZipLocal, $frontendZipLocal, $fullZipLocal) | ForEach-Object {
    if (Test-Path $_) { Remove-Item $_ -Force }
}

# =============================================================
# A. BUILD BACKEND PACKAGE (برای Setup Node.js App در cPanel)
# =============================================================
Write-Host "===> 2. Preparing BACKEND package..." -ForegroundColor Cyan
$backendTemp = Join-Path $projectDir "temp_cpanel_backend"
if (Test-Path $backendTemp) { Remove-Item $backendTemp -Recurse -Force }
New-Item -ItemType Directory -Path $backendTemp | Out-Null
New-Item -ItemType Directory -Path (Join-Path $backendTemp "dist") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $backendTemp "server\data") | Out-Null

# 1. cPanel entry app.js
$appJsContent = @"
// cPanel Node.js Application Startup File
// Multi-Store AI Virtual Fitting Room Backend v2.0
process.chdir(__dirname);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;

console.log('[cPanel Startup] Application Directory:', __dirname);
console.log('[cPanel Startup] Server Port:', process.env.PORT);

require('./dist/server.cjs');
"@
Set-Content -Path (Join-Path $backendTemp "app.js") -Value $appJsContent -Encoding utf8

# 2. dist files
Copy-Item (Join-Path $projectDir "dist\server.cjs") (Join-Path $backendTemp "dist\server.cjs") -Force
if (Test-Path (Join-Path $projectDir "dist\server.cjs.map")) {
    Copy-Item (Join-Path $projectDir "dist\server.cjs.map") (Join-Path $backendTemp "dist\server.cjs.map") -Force
}

# 3. server/db.ts and server/data/
Copy-Item (Join-Path $projectDir "server\db.ts") (Join-Path $backendTemp "server\db.ts") -Force
Copy-Item (Join-Path $projectDir "server\data\*") (Join-Path $backendTemp "server\data") -Recurse -Force

# 4. production package.json (no frontend bloat)
$pkgContent = @"
{
  "name": "ai-virtual-fitting-backend",
  "version": "2.0.0",
  "private": true,
  "description": "Multi-Store AI Virtual Fitting Room Backend API for cPanel",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "prod": "NODE_ENV=production node app.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.21.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
"@
Set-Content -Path (Join-Path $backendTemp "package.json") -Value $pkgContent -Encoding utf8

# 5. .env and .env.example
$envContent = @"
NODE_ENV=production
PORT=3000
"@
Set-Content -Path (Join-Path $backendTemp ".env") -Value $envContent -Encoding utf8
Set-Content -Path (Join-Path $backendTemp ".env.example") -Value $envContent -Encoding utf8

# 6. Backend Persian Guide
$backendDoc = @"
# راهنمای اجرای بک‌اند روی cPanel (Setup Node.js App)

۱. وارد کنترل پنل cPanel هاست خود شوید.
۲. بخش **Setup Node.js App** را باز کنید.
۳. روی دکمه **Create Application** کلیک کنید:
   - **Node.js version**: نسخه 18 یا 20 یا 22 را انتخاب کنید.
   - **Application mode**: گزینه Production را انتخاب کنید.
   - **Application root**: نام پوشه بک‌اند را وارد کنید (مثلا: ``api-server`` یا ``backend``).
   - **Application URL**: ساب‌دامین یا مسیری که می‌خواهید API روی آن فعال باشد (مثلا: ``api.yourdomain.com`` یا مسیر اصلی).
   - **Application startup file**: حتماً بنویسید: ``app.js``
۴. روی دکمه **Create** کلیک کنید تا برنامه ساخته شود.
۵. تمام محتویات این فایل زیپ (پوشه‌های dist و server و فایل‌های app.js, package.json, .env) را درون پوشه ساخته شده (مثلاً ``api-server``) در File Manager استخراج (Extract) کنید.
۶. به صفحه Setup Node.js App برگردید و روی دکمه **Run NPM Install** کلیک کنید.
۷. سپس روی دکمه **Restart** کلیک کنید.
۸. تست صحت کارکرد:
   با باز کردن آدرس زیر در مرورگر:
   ``https://api.yourdomain.com/api/health``
   باید پاسخ JSON با وضعیت ``"status": "ok"`` را مشاهده کنید.
"@
Set-Content -Path (Join-Path $backendTemp "README_BACKEND_CPANEL.md") -Value $backendDoc -Encoding utf8

# Zip Backend
tar -a -cf "$backendZipLocal" -C "$backendTemp" *
Copy-Item "$backendZipLocal" "$backendZipDesktop" -Force
Remove-Item -Path $backendTemp -Recurse -Force
Write-Host " [OK] Backend ZIP created: $backendZipDesktop" -ForegroundColor Green

# =============================================================
# B. BUILD FRONTEND PACKAGE (برای public_html در cPanel)
# =============================================================
Write-Host "===> 3. Preparing FRONTEND package..." -ForegroundColor Cyan
$frontendTemp = Join-Path $projectDir "temp_cpanel_frontend"
if (Test-Path $frontendTemp) { Remove-Item $frontendTemp -Recurse -Force }
New-Item -ItemType Directory -Path $frontendTemp | Out-Null

# 1. Copy index.html and assets/
Copy-Item (Join-Path $projectDir "dist\index.html") $frontendTemp -Force
Copy-Item (Join-Path $projectDir "dist\assets") (Join-Path $frontendTemp "assets") -Recurse -Force

# 2. Create .htaccess for Apache SPA Routing & Performance
$htaccessContent = @"
# Multi-Store AI Virtual Fitting Room - Apache SPA Routing & Optimization
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Caching for static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css application/xml application/xhtml+xml application/rss+xml application/javascript application/x-javascript application/json image/svg+xml
</IfModule>
"@
Set-Content -Path (Join-Path $frontendTemp ".htaccess") -Value $htaccessContent -Encoding utf8

# 3. Frontend Persian Guide
$frontendDoc = @"
# راهنمای اجرای فرانت‌اند روی cPanel (public_html)

۱. وارد File Manager در cPanel شوید و پوشه ``public_html`` (یا پوشه ساب‌دامین فرانت‌تان) را باز کنید.
۲. فایل زیپ ``frontend.zip`` را در این پوشه آپلود کرده و **Extract** کنید.
۳. بررسی محتویات:
   - فایل ``index.html``
   - پوشه ``assets``
   - فایل مخفی ``.htaccess`` (در صورتی که فایل‌های مخفی در File Manager نمایان باشند)
۴. اتصال به بک‌اند:
   - اگر بک‌اند روی ساب‌دامین مجزایی است (مثلاً ``https://api.yourdomain.com``)، فایل ``index.html`` را در File Manager ویرایش کرده و خط مربوط به ``window.__API_URL__`` را تغییر دهید:
     ```html
     <script>
       window.__API_URL__ = 'https://api.yourdomain.com';
     </script>
     ```
   - اگر فرانت و بک‌اند روی یک دامنه یکسان با Reverse Proxy کار می‌کنند، نیازی به هیچ تغییری نیست.
۵. اکنون با باز کردن دامنه در مرورگر، فروشگاه چندمنظوره پرو مجازی هوشمند با سرعت بالا لود خواهد شد!
"@
Set-Content -Path (Join-Path $frontendTemp "README_FRONTEND_CPANEL.md") -Value $frontendDoc -Encoding utf8

# Zip Frontend
tar -a -cf "$frontendZipLocal" -C "$frontendTemp" *
Copy-Item "$frontendZipLocal" "$frontendZipDesktop" -Force
Remove-Item -Path $frontendTemp -Recurse -Force
Write-Host " [OK] Frontend ZIP created: $frontendZipDesktop" -ForegroundColor Green

# =============================================================
# C. BUILD ALL-IN-ONE PACKAGE (هردو پکیج به همراه راهنمای جامع)
# =============================================================
Write-Host "===> 4. Preparing ALL-IN-ONE package..." -ForegroundColor Cyan
$fullTemp = Join-Path $projectDir "temp_cpanel_full"
if (Test-Path $fullTemp) { Remove-Item $fullTemp -Recurse -Force }
New-Item -ItemType Directory -Path $fullTemp | Out-Null

Copy-Item "$backendZipLocal" (Join-Path $fullTemp "backend.zip") -Force
Copy-Item "$frontendZipLocal" (Join-Path $fullTemp "frontend.zip") -Force

$masterGuide = @"
# راهنمای جامع استقرار پروژه پرو مجازی هوشمند روی هاست cPanel

این پکیج شامل دو فایل زیپ مستقل و آماده برای هاست‌های اشتراکی و سرورهای cPanel است:

1. **frontend.zip**:
   - مخصوص استخراج در پوشه ``public_html`` (یا ساب‌دامین فرانت).
   - شامل فایل کامپایل‌شده بهینه SPA، استایل‌های Tailwind 4، فونت‌های Vazirmatn، آیکون‌ها و فایل کانفیگ ``.htaccess`` آپاچی.

2. **backend.zip**:
   - مخصوص استخراج در پوشه برنامه Node.js (مثلاً ``api-server``).
   - شامل سرور Express، دیتابیس هوشمند چندفروشگاهی JSON (فایل‌های ``server/data/products.json`` و ``stores.json``)، فایل استارت‌آپ ``app.js`` برای cPanel Passenger، و راهنمای پرامپت هوش مصنوعی مانکن نامرئی.

## مراحل گام‌به‌گام راه‌اندازی در ۵ دقیقه:

### گام ۱: راه‌اندازی بک‌اند (Node.js App)
1. در cPanel به بخش **Setup Node.js App** بروید.
2. یک اپلیکیشن با مشخصات زیر بسازید:
   - Node.js Version: 18 یا 20 یا 22
   - Application Mode: Production
   - Application Root: ``api-server``
   - Application Startup File: ``app.js``
3. در File Manager، وارد پوشه ``api-server`` شده و فایل ``backend.zip`` را آپلود و Extract کنید.
4. در Setup Node.js App دکمه **Run NPM Install** و سپس **Restart** را بزنید.
5. تست: آدرس ``/api/health`` را باز کنید تا پیام ok نمایش یابد.

### گام ۲: راه‌اندازی فرانت‌اند (public_html)
1. در File Manager، وارد پوشه ``public_html`` شوید.
2. فایل ``frontend.zip`` را آپلود و Extract کنید.
3. در صورت نیاز به تنظیم آدرس API (اگر بک‌اند ساب‌دامین دارد):
   فایل ``index.html`` را باز کرده و آدرس ساب‌دامین بک‌اند را در ``window.__API_URL__ = 'https://api.yourdomain.com';`` بگذارید.
4. پایان! سایت با تمام قابلیت‌های پرو چندفروشگاهی، تفکیک اسلات لباس‌ها و مانکن فعال است.
"@
Set-Content -Path (Join-Path $fullTemp "README_CPANEL_ALL_IN_ONE_FA.md") -Value $masterGuide -Encoding utf8

tar -a -cf "$fullZipLocal" -C "$fullTemp" *
Copy-Item "$fullZipLocal" "$fullZipDesktop" -Force
Remove-Item -Path $fullTemp -Recurse -Force
Write-Host " [OK] All-in-one package created: $fullZipDesktop" -ForegroundColor Green

Write-Host "`n========================================================" -ForegroundColor Magenta
Write-Host "ALL CPANEL PACKAGES SUCCESSFULLY BUILT!" -ForegroundColor Magenta
Write-Host "1. Frontend ZIP: $frontendZipDesktop"
Write-Host "2. Backend ZIP:  $backendZipDesktop"
Write-Host "3. Full Package: $fullZipDesktop"
Write-Host "========================================================`n"
