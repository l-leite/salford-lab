<#
Publish pages to studio.salford-lab.xyz

  .\publish.ps1                                   # rebuild index, commit, push everything
  .\publish.ps1 -Name brief -From C:\path\brief.html   # add/update page /brief from an HTML file
  .\publish.ps1 -Name brief -From C:\path\folder       # ...or from a whole folder (must contain index.html)
  .\publish.ps1 -Message "Fix typo"               # custom commit message

A single HTML file is copied as <Name>/index.html, plus any local files it references
(images, css, js). Folders starting with "_" or "." are published but left off the index.
#>
param(
    [string]$Name,
    [string]$From,
    [string]$Message
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$env:Path += ";$HOME\tools\gh\bin"

# --- add / update a page -------------------------------------------------
if ($Name -or $From) {
    if (-not ($Name -and $From)) { throw "Use -Name and -From together." }
    if ($Name -notmatch '^[a-z0-9][a-z0-9_-]*$') { throw "Name must be lowercase letters, digits, - or _ (e.g. site-analysis-tips)." }
    $target = Join-Path $PSScriptRoot $Name
    New-Item -ItemType Directory -Force $target | Out-Null

    if (Test-Path $From -PathType Container) {
        if (-not (Test-Path (Join-Path $From 'index.html'))) { throw "$From has no index.html" }
        Copy-Item (Join-Path $From '*') $target -Recurse -Force
    } else {
        $html = Get-Content $From -Raw
        Copy-Item $From (Join-Path $target 'index.html') -Force
        $srcDir = Split-Path (Resolve-Path $From)
        $refs = [regex]::Matches($html, '(?:src|href)\s*=\s*["'']([^"''#?]+)["'']') | ForEach-Object { $_.Groups[1].Value }
        $refs += [regex]::Matches($html, 'url\(\s*["'']?([^"'')#?]+)') | ForEach-Object { $_.Groups[1].Value }
        foreach ($r in ($refs | Sort-Object -Unique)) {
            if ($r -match '^(https?:|//|data:|mailto:|/)') { continue }
            $file = Join-Path $srcDir $r
            if (Test-Path $file -PathType Leaf) {
                $dest = Join-Path $target $r
                New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
                Copy-Item $file $dest -Force
                Write-Host "  + $r"
            } else {
                Write-Warning "Referenced file not found next to the HTML: $r"
            }
        }
    }
    if (-not $Message) { $Message = "Update $Name" }
}

# --- rebuild landing page ------------------------------------------------
$items = Get-ChildItem -Directory | Where-Object { $_.Name -notmatch '^[._]' -and (Test-Path (Join-Path $_.FullName 'index.html')) } | ForEach-Object {
    $h = Get-Content (Join-Path $_.FullName 'index.html') -Raw
    $t = if ($h -match '(?is)<title>\s*(.*?)\s*</title>') { $Matches[1] } else { $_.Name }
    [pscustomobject]@{ Name = $_.Name; Title = $t; Date = (Get-Item (Join-Path $_.FullName 'index.html')).LastWriteTime }
} | Sort-Object Title

$links = ($items | ForEach-Object {
    "      <li><a href=`"$($_.Name)/`"><span class=`"t`">$($_.Title)</span><span class=`"u`">/$($_.Name)</span></a></li>"
}) -join "`n"

@"
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Salford Studio</title>
<style>
  :root { --bg:#fafaf8; --fg:#1c1c1a; --muted:#6b6b66; --line:#dcdcd6; --accent:#b3261e; }
  @media (prefers-color-scheme: dark) { :root { --bg:#161615; --fg:#ececea; --muted:#9a9a94; --line:#33332f; --accent:#ff8a80; } }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:17px/1.5 system-ui,-apple-system,Segoe UI,sans-serif; }
  main { max-width:40rem; margin:0 auto; padding:4rem 16px; }
  h1 { font-size:1.8rem; margin:0 0 .25rem; }
  p.sub { color:var(--muted); margin:0 0 2.5rem; }
  ul { list-style:none; padding:0; margin:0; border-top:1px solid var(--line); }
  li { border-bottom:1px solid var(--line); }
  a { display:flex; justify-content:space-between; gap:1rem; padding:1rem 0; color:inherit; text-decoration:none; }
  a:hover .t { color:var(--accent); }
  .u { color:var(--muted); font-size:.9rem; font-family:ui-monospace,Consolas,monospace; }
</style>
</head>
<body>
  <main>
    <h1>Salford Studio</h1>
    <p class="sub">Guidance and resources</p>
    <ul>
$links
    </ul>
  </main>
</body>
</html>
"@ | Set-Content (Join-Path $PSScriptRoot 'index.html') -Encoding utf8

# --- commit + push -------------------------------------------------------
git add -A
if (-not (git status --porcelain)) { Write-Host "Nothing to publish."; return }
if (-not $Message) { $Message = "Update site" }
git commit -m $Message | Out-Null
git push -u origin main
Write-Host "`nPublished. Live in ~1 minute at https://studio.salford-lab.xyz/" -ForegroundColor Green
