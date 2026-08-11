# PowerShell script to update Lockwood component imports and paths
Write-Host "Updating Lockwood component files..." -ForegroundColor Green

# Get all .tsx files recursively
$files = Get-ChildItem -Path . -Filter "*.tsx" -Recurse

Write-Host "Found $($files.Count) TypeScript files to process" -ForegroundColor Cyan

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    # Read file content
    $content = Get-Content $file.FullName -Raw
    
    # Track if changes were made
    $changed = $false
    
    # Update type imports - from '../types'
    if ($content -match "from '../types'") {
        $content = $content -replace "from '../types'", "from '../../lockwood-types'"
        $changed = $true
        Write-Host "  ✓ Updated ../types import" -ForegroundColor Green
    }
    
    # Update type imports - from './types'
    if ($content -match "from './types'") {
        $content = $content -replace "from './types'", "from '../../lockwood-types'"
        $changed = $true
        Write-Host "  ✓ Updated ./types import" -ForegroundColor Green
    }
    
    # Update image src paths
    if ($content -match 'src="/assets/') {
        $content = $content -replace 'src="/assets/', 'src="/lockwood-assets/'
        $changed = $true
        Write-Host "  ✓ Updated image src paths" -ForegroundColor Green
    }
    
    # Update link href paths
    if ($content -match 'href="/assets/') {
        $content = $content -replace 'href="/assets/', 'href="/lockwood-assets/'
        $changed = $true
        Write-Host "  ✓ Updated href paths" -ForegroundColor Green
    }
    
    # Write back to file if changes were made
    if ($changed) {
        $content | Set-Content $file.FullName -NoNewline
        Write-Host "  → File updated successfully" -ForegroundColor Magenta
    } else {
        Write-Host "  → No changes needed" -ForegroundColor Gray
    }
}

Write-Host "`nAll files processed successfully! ✓" -ForegroundColor Green