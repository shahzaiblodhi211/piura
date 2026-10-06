Add-Type -AssemblyName System.Drawing
$src = "C:\Users\Shahmeer\.cursor\projects\c-Users-Shahmeer-projects-piura\assets\c__Users_Shahmeer_AppData_Roaming_Cursor_User_workspaceStorage_089605ee17c2e7efec842f7b416aee45_images_image-c9784e5a-561d-42f9-9633-6b166283f304.png"
$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path $src))
$minX = $img.Width; $minY = $img.Height; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $img.Height; $y++) {
  for ($x = 0; $x -lt $img.Width; $x++) {
    $p = $img.GetPixel($x, $y)
    if ($p.R -gt 12 -or $p.G -gt 12 -or $p.B -gt 12) {
      if ($x -lt $minX) { $minX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$pad = 28
$x0 = [Math]::Max(0, $minX - $pad)
$y0 = [Math]::Max(0, $minY - $pad)
$x1 = [Math]::Min($img.Width - 1, $maxX + $pad)
$y1 = [Math]::Min($img.Height - 1, $maxY + $pad)
$w = $x1 - $x0 + 1
$h = $y1 - $y0 + 1
$out = New-Object System.Drawing.Bitmap $w, $h
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $p = $img.GetPixel($x0 + $x, $y0 + $y)
    $level = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
    if ($level -le 12) {
      $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    } else {
      $alpha = [Math]::Min(255, [int](($level - 12) * 255 / 28))
      $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 34, 33, 31))
    }
  }
}
$dest = "c:\Users\Shahmeer\projects\piura\public\assets\cat-coastlines.png"
$out.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "saved $w x $h"
$img.Dispose()
$out.Dispose()
