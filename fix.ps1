# Fix HTML file paths for integrated setup
# Run this from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing HTML file paths..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "D:\Kampus\Coding\Third_Semester\third-semester\Final_Project"
$viewsPath = Join-Path $projectRoot "frontend\views"

# Check if views folder exists
if (-not (Test-Path $viewsPath)) {
    Write-Host "Error: Views folder not found at: $viewsPath" -ForegroundColor Red
    Write-Host "Please run this script from the correct location!" -ForegroundColor Red
    exit 1
}

# Get all HTML files
$htmlFiles = Get-ChildItem -Path $viewsPath -Filter "*.html"

if ($htmlFiles.Count -eq 0) {
    Write-Host "No HTML files found in: $viewsPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found $($htmlFiles.Count) HTML files" -ForegroundColor Green
Write-Host ""

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    # Read file content
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix CSS paths
    $content = $content -replace 'href="\.\./public/css/style\.css"', 'href="/css/style.css"'
    $content = $content -replace 'href="\.\.\/public\/css\/style\.css"', 'href="/css/style.css"'
    $content = $content -replace 'href="public/css/style\.css"', 'href="/css/style.css"'
    
    # Fix JS paths
    $content = $content -replace 'src="\.\./public/js/', 'src="/js/'
    $content = $content -replace 'src="\.\.\/public\/js\/', 'src="/js/'
    $content = $content -replace 'src="public/js/', 'src="/js/'
    
    # Fix image paths
    $content = $content -replace 'src="\.\./public/images/', 'src="/images/'
    $content = $content -replace 'href="\.\./public/images/', 'href="/images/'
    
    # Fix navigation links - remove .html extensions
    $content = $content -replace 'href="index\.html"', 'href="/"'
    $content = $content -replace 'href="blog-list\.html"', 'href="/blog-list"'
    $content = $content -replace 'href="blog-detail\.html"', 'href="/blog-detail"'
    $content = $content -replace 'href="about\.html"', 'href="/about"'
    $content = $content -replace 'href="contact\.html"', 'href="/contact"'
    $content = $content -replace 'href="login\.html"', 'href="/login"'
    $content = $content -replace 'href="register\.html"', 'href="/register"'
    $content = $content -replace 'href="admin-dashboard\.html"', 'href="/admin-dashboard"'
    
    # Save updated content
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "  ✓ Updated!" -ForegroundColor Green
    } else {
        Write-Host "  - No changes needed" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done! All HTML files have been updated." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your server (Ctrl+C, then npm run dev)" -ForegroundColor White
Write-Host "2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "3. Refresh page (Ctrl+F5)" -ForegroundColor White
Write-Host "4. Open http://localhost:3000" -ForegroundColor White
Write-Host ""