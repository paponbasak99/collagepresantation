Add-Type -AssemblyName System.Drawing

$imgDir = Join-Path $PSScriptRoot "..\public\images"
$files = Get-ChildItem "$imgDir\*.jpg"

# Get JPEG encoder
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)

# Quality 82%
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)

foreach ($f in $files) {
    $src = [System.Drawing.Image]::FromFile($f.FullName)
    $w = $src.Width
    $h = $src.Height
    $origKb = [math]::Round($f.Length / 1024)

    # Scale max dimension to 800px (600px for avatar style doctor images)
    $maxDim = 800
    if ($f.Name -like "doctor-*.jpg") {
        $maxDim = 600
    }

    $scale = 1.0
    if ($w -gt $maxDim -or $h -gt $maxDim) {
        if ($w -gt $h) {
            $scale = $maxDim / $w
        } else {
            $scale = $maxDim / $h
        }
    }

    $newW = [math]::Max(1, [int][math]::Round($w * $scale))
    $newH = [math]::Max(1, [int][math]::Round($h * $scale))

    $bmp = New-Object System.Drawing.Bitmap($newW, $newH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.DrawImage($src, 0, 0, $newW, $newH)
    $g.Dispose()
    $src.Dispose()

    # Save to temporary path then replace
    $tmpPath = "$($f.FullName).tmp"
    $bmp.Save($tmpPath, $jpegCodec, $encoderParams)
    $bmp.Dispose()

    $newKb = [math]::Round((Get-Item $tmpPath).Length / 1024)
    Move-Item -Force $tmpPath $f.FullName
    Write-Host ("Optimized $($f.Name): ${w}x${h} (${origKb}KB) -> ${newW}x${newH} (${newKb}KB)")
}

$encoderParams.Dispose()
Write-Host "All images optimized successfully!"
