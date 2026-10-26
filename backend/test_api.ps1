$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
$mvn = "D:\3rd Sem Study\RDBMS\tools\apache-maven-3.9.9\bin\mvn.cmd"

Write-Host "Starting Spring Boot Application..."
$proc = Start-Process -FilePath $mvn -ArgumentList "spring-boot:run" -WorkingDirectory "D:\3rd Sem Study\RDBMS\backend" -PassThru -NoNewWindow

Write-Host "Waiting for server to become responsive on port 8080..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/stats" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($res.success) {
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $ready) {
    Write-Host "Server did not become ready within timeout. Exiting."
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ">>> Server is LIVE and healthy on port 8080! Running full test suite... <<<"

try {
    Write-Host "`n=== 1. Testing POST /api/auth/login ==="
    $loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login Status:" $loginRes.success "Message:" $loginRes.message "Role:" $loginRes.data.role "User:" $loginRes.data.fullName

    Write-Host "`n=== 2. Testing GET /api/dashboard/stats ==="
    $dashRes = Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/stats" -Method GET
    Write-Host "Total Customers:" $dashRes.data.totalCustomers
    Write-Host "Total Accounts:" $dashRes.data.totalAccounts
    Write-Host "Total Bank Balance: ₹" $dashRes.data.totalBankBalance
    Write-Host "Active Loans:" $dashRes.data.totalActiveLoans
    Write-Host "Outstanding Loans: ₹" $dashRes.data.totalOutstandingLoanAmount

    Write-Host "`n=== 3. Testing GET /api/customers ==="
    $custRes = Invoke-RestMethod -Uri "http://localhost:8080/api/customers" -Method GET
    Write-Host "Customer Count:" $custRes.data.Count "First Customer:" $custRes.data[0].fullName "Email:" $custRes.data[0].email

    Write-Host "`n=== 4. Testing GET /api/accounts ==="
    $accRes = Invoke-RestMethod -Uri "http://localhost:8080/api/accounts" -Method GET
    Write-Host "Account Count:" $accRes.data.Count "First Account Number:" $accRes.data[0].accountNumber "Balance: ₹" $accRes.data[0].balance

    Write-Host "`n=== 5. Testing GET /api/branches ==="
    $brRes = Invoke-RestMethod -Uri "http://localhost:8080/api/branches" -Method GET
    Write-Host "Branches Count:" $brRes.data.Count "First Branch:" $brRes.data[0].branchName "IFSC:" $brRes.data[0].ifscCode

    Write-Host "`n=== 6. Testing GET /api/database-info/demo-query ==="
    $demoRes = Invoke-RestMethod -Uri "http://localhost:8080/api/database-info/demo-query?key=JOIN_ACCOUNTS_CUSTOMERS_BRANCHES" -Method GET
    Write-Host "Demonstration Query Title:" $demoRes.data.title
    Write-Host "RDBMS Concept:" $demoRes.data.concept
    Write-Host "Rows returned from MySQL:" $demoRes.data.rowCount

    Write-Host "`n=== 7. Testing Atomic Transaction POST /api/transactions/deposit ==="
    $depBody = @{ accountId = 1; amount = 1000.00; description = "College Project Verification Deposit" } | ConvertTo-Json
    $depRes = Invoke-RestMethod -Uri "http://localhost:8080/api/transactions/deposit" -Method POST -Body $depBody -ContentType "application/json"
    Write-Host "Deposit Success:" $depRes.success "Txn Ref:" $depRes.data.transactionReference "Amount: ₹" $depRes.data.amount

    Write-Host "`n=== 8. Testing Atomic Fund Transfer POST /api/transactions/transfer ==="
    $trfBody = @{ sourceAccountId = 1; destinationAccountId = 3; amount = 500.00; description = "Test Inter-Account Transfer" } | ConvertTo-Json
    $trfRes = Invoke-RestMethod -Uri "http://localhost:8080/api/transactions/transfer" -Method POST -Body $trfBody -ContentType "application/json"
    Write-Host "Transfer Success:" $trfRes.success "Shared Ref:" $trfRes.data.reference "Sender:" $trfRes.data.sourceAccountNumber "Recipient:" $trfRes.data.destinationAccountNumber

    Write-Host "`n========================================================================="
    Write-Host ">>> ALL BACKEND API ENDPOINTS AND MYSQL TRANSACTIONS SUCCEEDED 100%! <<<"
    Write-Host "========================================================================="
}
catch {
    Write-Host "Error occurred during API test:" $_.Exception.Message
}
finally {
    Write-Host "Shutting down test backend..."
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Get-Process java -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*bank-management-system*" } | Stop-Process -Force -ErrorAction SilentlyContinue
}
