$api='http://localhost:5001'

Write-Host "Starting smoke tests against $api"

$login = Invoke-RestMethod -Uri "$api/api/auth/login" -Method Post -Body (ConvertTo-Json @{ email='admin@freshersfoundry.local'; password='Admin@12345' }) -ContentType 'application/json'
if(-not $login) { Write-Error 'Login failed'; exit 1 }
$token = $login.token
Write-Host "Token: $token"
$headers = @{ Authorization = "Bearer $token" }

$job = @{
  Title = 'Smoke Job'
  CompanyName = 'ACME Inc'
  CompanyLogoUrl = 'https://example.com/logo.png'
  Location = 'Remote'
  JobType = 'FullTime'
  ExperienceLevel = 'Junior'
  SalaryRange = '30k-40k'
  SkillTags = 'C#,.NET'
  Description = 'Smoke test job'
  ApplyLink = 'https://apply.example'
}
$jobRes = Invoke-RestMethod -Uri "$api/api/jobs" -Method Post -Body ($job | ConvertTo-Json) -ContentType 'application/json' -Headers $headers
Write-Host "Job created: $($jobRes.id)"

$iq = @{
  Category = 'Algorithms'
  SubTopic = 'Sorting'
  Question = 'What is quicksort?'
  Answer = 'Divide and conquer sorting.'
  DifficultyLevel = 'Easy'
  CodeSnippet = $null
}
try {
  $iqRes = Invoke-RestMethod -Uri "$api/api/InterviewQuestions" -Method Post -Body ($iq | ConvertTo-Json) -ContentType 'application/json' -Headers $headers
  Write-Host "IQ created: $($iqRes.id)"
} catch {
  Write-Host "IQ create failed: $($_.Exception.Message)"
}

$ad = @{
  Type = 1            # AdSlotType.Banner
  Placement = 1       # AdPlacement.HomeTop
  ImageUrl = 'https://example.com/ad.png'
  TargetUrl = 'https://sponsor.example'
  SponsorName = 'SponsorCo'
  StartDate = (Get-Date).ToString('o')
  EndDate = (Get-Date).AddDays(30).ToString('o')
  LinkedContentId = $null
}
try {
  $adRes = Invoke-RestMethod -Uri "$api/api/admin/ads" -Method Post -Body ($ad | ConvertTo-Json) -ContentType 'application/json' -Headers $headers
  Write-Host "Ad created: $($adRes.id)"
} catch {
  Write-Host "Ad create failed: $($_.Exception.Response.StatusCode) - $($_.Exception.Message)"
}

$p = Invoke-RestMethod -Uri "$api/api/admin/pending-content" -Headers $headers
Write-Host "Pending content counts: experiences=$($p.pendingExperiences.count), blogs=$($p.pendingBlogs.count), jobs=$($p.pendingJobs.count)"

$ads = Invoke-RestMethod -Uri "$api/api/admin/ads" -Headers $headers
Write-Host "Ads count: $($ads.ads.count)"
