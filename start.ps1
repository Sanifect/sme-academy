$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$port = 8765
$prefix = "http://127.0.0.1:$port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".md"   = "text/plain; charset=utf-8"
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
} catch {
  Write-Host "Could not bind $prefix — opening index.html instead."
  Start-Process (Join-Path $root "index.html")
  exit 1
}

Write-Host "Sanifect SME Academy"
Write-Host "Serving $root"
Write-Host $prefix
Start-Process $prefix

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
  $path = Join-Path $root $rel
  $full = [IO.Path]::GetFullPath($path)
  $rootFull = [IO.Path]::GetFullPath($root)
  if (-not $full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $full -PathType Leaf)) {
    $ctx.Response.StatusCode = 404
    $bytes = [Text.Encoding]::UTF8.GetBytes("Not found")
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.Close()
    continue
  }
  $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
  $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" })
  $bytes = [IO.File]::ReadAllBytes($full)
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.Close()
}
