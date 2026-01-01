# PowerShell API 测试脚本
# PersonalMoneyManagement Backend API Tests

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PersonalMoneyManagement API Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 测试用户注册
Write-Host "1. Testing User Registration..." -ForegroundColor Yellow

$registerBody = @{
    email = "jason.test@example.com"
    password = "password123"
    firstName = "Jason"
    lastName = "Test"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json"
    
    Write-Host "✅ Registration Successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.userId)" -ForegroundColor White
    Write-Host "Email: $($registerResponse.email)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Registration Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

# 2. 测试用户登录
Write-Host "2. Testing User Login..." -ForegroundColor Yellow

$loginBody = @{
    email = "jason.test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token.Substring(0, 50))..." -ForegroundColor White
    Write-Host ""
    
    # 保存 Token 用于后续请求
    $token = $loginResponse.token
    
} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit
}

# 3. 获取分类列表（需要认证）
Write-Host "3. Testing Get Categories (Authenticated)..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $categories = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/categories" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Categories Retrieved!" -ForegroundColor Green
    Write-Host "Total Categories: $($categories.Count)" -ForegroundColor White
    
    # 显示前5个分类
    Write-Host "`nFirst 5 Categories:" -ForegroundColor Cyan
    $categories | Select-Object -First 5 | ForEach-Object {
        Write-Host "  - $($_.categoryName) ($($_.categoryType))" -ForegroundColor White
    }
    Write-Host ""
    
} catch {
    Write-Host "❌ Failed to Get Categories!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

# 4. 创建一个收入交易
Write-Host "4. Testing Create Transaction (Income)..." -ForegroundColor Yellow

# 先找到一个收入类别的 ID
$incomeCategory = $categories | Where-Object { $_.categoryType -eq "INCOME" } | Select-Object -First 1

if ($incomeCategory) {
    $transactionBody = @{
        transactionType = "INCOME"
        categoryId = $incomeCategory.id
        amount = 5000.00
        transactionDate = (Get-Date).ToString("yyyy-MM-dd")
        description = "December Salary"
        notes = "Monthly salary payment"
    } | ConvertTo-Json
    
    try {
        $transactionResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/transactions" `
            -Method Post `
            -Body $transactionBody `
            -Headers $headers `
            -ContentType "application/json"
        
        Write-Host "✅ Transaction Created!" -ForegroundColor Green
        Write-Host "Transaction ID: $($transactionResponse.id)" -ForegroundColor White
        Write-Host "Amount: `$$($transactionResponse.amount)" -ForegroundColor White
        Write-Host "Category: $($transactionResponse.categoryName)" -ForegroundColor White
        Write-Host ""
        
    } catch {
        Write-Host "❌ Failed to Create Transaction!" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
    }
}

# 5. 获取所有交易
Write-Host "5. Testing Get All Transactions..." -ForegroundColor Yellow

try {
    $transactions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/transactions" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Transactions Retrieved!" -ForegroundColor Green
    Write-Host "Total Transactions: $($transactions.content.Count)" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Failed to Get Transactions!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All Tests Completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
