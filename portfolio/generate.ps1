Add-Type -AssemblyName System.Drawing
$width = 500
$height = 500
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

# Circle (cx=50, cy=50, r=48 scaled by 5)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#bae6fd"))
$g.FillEllipse($brush, 10, 10, 480, 480)

# Monitor base
$basePoints = @(
    (New-Object System.Drawing.PointF(150, 390)),
    (New-Object System.Drawing.PointF(350, 390)),
    (New-Object System.Drawing.PointF(310, 350)),
    (New-Object System.Drawing.PointF(190, 350))
)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#1e293b"))
$g.FillPolygon($brush, $basePoints)

# Stand
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#334155"))
$g.FillRectangle($brush, 220, 325, 60, 50)

# Monitor Frame
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#1e293b"))
$g.FillRectangle($brush, 75, 100, 350, 240)

# Cyan Screen
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#06b6d4"))
$g.FillRectangle($brush, 90, 115, 320, 210)

# Yellow Bar
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#f9ca24"))
$g.FillRectangle($brush, 90, 115, 320, 30)

# Text
$font = New-Object System.Drawing.Font("Arial", 36, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("PHANEENDRA", $font, $brush, (New-Object System.Drawing.RectangleF(90, 115, 320, 210)), $format)

$bmp.Save("d:\portfolio\preview-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
