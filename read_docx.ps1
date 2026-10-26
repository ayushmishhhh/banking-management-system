Add-Type -AssemblyName System.IO.Compression.FileSystem

$docx = "C:\Users\ASUS\.gemini\antigravity\brain\375e8285-cc2f-4720-a922-320032334fbb\.user_uploaded\media_1792997353476_397bf099.docx"
$extractDir = "d:\3rd Sem Study\RDBMS\temp_docx"
if (Test-Path $extractDir) { Remove-Item -Recurse -Force $extractDir }

[System.IO.Compression.ZipFile]::ExtractToDirectory($docx, $extractDir)

[xml]$xml = Get-Content "$extractDir\word\document.xml"
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)
$lines = @()
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//w:t", $ns) | ForEach-Object { $_.InnerText }
    $line = $texts -join ""
    if ($line.Trim().Length -gt 0) {
        $lines += $line
    }
}
$lines | Out-File "d:\3rd Sem Study\RDBMS\docx_text.txt" -Encoding utf8
Write-Host "Extracted $($lines.Count) lines to docx_text.txt"
