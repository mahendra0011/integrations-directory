$files = Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch 'node_modules|dist|\.git|\.tmp' } | Select-Object -ExpandProperty FullName
$total = $files.Count
$batchSize = [math]::Ceiling($total / 70)

git init
git config user.email "developer@example.com"
git config user.name "Developer"

$counter = 1

for ($i = 0; $i -lt 70; $i++) {
    $start = $i * $batchSize
    $end = [math]::Min($start + $batchSize - 1, $total - 1)
    
    if ($start -ge $total) { break }
    
    $batch = @()
    for ($j = $start; $j -le $end; $j++) {
        $batch += $files[$j]
    }
    
    # Get unique directories in this batch
    $dirs = @()
    foreach ($f in $batch) {
        $rel = $f.Substring($f.IndexOf("integrations-directory\") + "integrations-directory\".Length)
        $firstDir = $rel -replace '\\[^\\]+$', '' -replace '^\\', ''
        if ($firstDir -and $dirs -notcontains $firstDir) {
            $dirs += $firstDir
        }
    }
    
    $dirsStr = $dirs -join ', '
    if (-not $dirsStr) { $dirsStr = "root files" }
    
    $batch | ForEach-Object { git add $_ }
    
    $fileCount = $batch.Count
    git commit -m "feat: add $fileCount files from $dirsStr (commit $counter)"
    
    Write-Host "Commit $counter : $fileCount files from $dirsStr"
    $counter++
}

# Commit any remaining files
$remainingStart = 70 * $batchSize
if ($remainingStart -lt $total) {
    $remaining = $files[$remainingStart..($total-1)]
    $remaining | ForEach-Object { git add $_ }
    $dirs = @()
    foreach ($f in $remaining) {
        $rel = $f.Substring($f.IndexOf("integrations-directory\") + "integrations-directory\".Length)
        $firstDir = $rel -replace '\\[^\\]+$', '' -replace '^\\', ''
        if ($firstDir -and $dirs -notcontains $firstDir) {
            $dirs += $firstDir
        }
    }
    $dirsStr = $dirs -join ', '
    if (-not $dirsStr) { $dirsStr = "root files" }
    git commit -m "feat: add remaining $($remaining.Count) files from $dirsStr (commit $counter)"
    Write-Host "Commit $counter : $($remaining.Count) remaining files from $dirsStr"
}

Write-Host "`nTotal commits created: $((git log --oneline | Measure-Object | Select-Object -ExpandProperty Count))"