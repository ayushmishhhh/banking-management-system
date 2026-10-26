Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir = "d:\3rd Sem Study\RDBMS\temp_docx"
$targetZip = "d:\3rd Sem Study\RDBMS\Bank_of_Bagru_Research_Project_Report.docx"
$docsTarget = "d:\3rd Sem Study\RDBMS\docs\Bank_of_Bagru_Research_Project_Report.docx"

if (Test-Path $targetZip) { Remove-Item -Force $targetZip }
if (Test-Path $docsTarget) { Remove-Item -Force $docsTarget }

[System.IO.Compression.ZipFile]::CreateFromDirectory($sourceDir, $targetZip)
Copy-Item $targetZip $docsTarget

Write-Host "Created $targetZip ($((Get-Item $targetZip).Length) bytes)"
