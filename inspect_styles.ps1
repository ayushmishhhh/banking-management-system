[xml]$styles = Get-Content "d:\3rd Sem Study\RDBMS\temp_docx\word\styles.xml"
$ns = New-Object System.Xml.XmlNamespaceManager($styles.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$styleNodes = $styles.SelectNodes("//w:style", $ns)
foreach ($s in $styleNodes) {
    Write-Host "$($s.GetAttribute('w:type')): id=$($s.GetAttribute('w:styleId')), name=$($s.name.GetAttribute('w:val'))"
}
