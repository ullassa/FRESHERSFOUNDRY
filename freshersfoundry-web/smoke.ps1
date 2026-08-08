 = Invoke-RestMethod -Uri 'http://localhost:5001/api/auth/login' -Method Post -Body (ConvertTo-Json @{email='admin@freshersfoundry.local'; password='Admin@12345'}) -ContentType 'application/json'
 = .token
Write-Output " Token: \
 = @{ Authorization = \Bearer \ }
 = @{ Title='Smoke Job'; CompanyName='ACME Inc'; CompanyLogoUrl='https://example.com/logo.png'; Location='Remote'; JobType='FullTime'; ExperienceLevel='Junior'; SalaryRange='30k-40k'; SkillTags='C#,.NET'; Description='Smoke test job'; ApplyLink='https://apply.example' }
 = | ConvertTo-Json
 = Invoke-RestMethod -Uri 'http://localhost:5001/api/jobs' -Method Post -Body -ContentType 'application/json' -Headers 
Write-Output \Job created:  \
 = @{ Category='Algorithms'; SubTopic='Sorting'; Question='What is quicksort?'; Answer='Divide and conquer sorting.' ; DifficultyLevel='Easy'; CodeSnippet= }
 = | ConvertTo-Json
 = Invoke-RestMethod -Uri 'http://localhost:5001/api/interview-questions' -Method Post -Body -ContentType 'application/json' -Headers 
Write-Output \IQ created:  \
 = @{ Type='Banner'; Placement='HomeTop'; ImageUrl='https://example.com/ad.png'; TargetUrl='https://sponsor.example'; SponsorName='SponsorCo'; StartDate=(Get-Date).ToString('yyyy-MM-dd'); EndDate=(Get-Date).AddDays(30).ToString('yyyy-MM-dd'); LinkedContentId = }
 = Invoke-RestMethod -Uri 'http://localhost:5001/api/admin/ads' -Method Post -Body ( | ConvertTo-Json) -ContentType 'application/json' -Headers 
Write-Output \Ad created:  \
 = Invoke-RestMethod -Uri 'http://localhost:5001/api/admin/pending-content' -Headers 
Write-Output \Pending content counts: experiences=0 blogs=0 jobs=0\
 = Invoke-RestMethod -Uri 'http://localhost:5001/api/admin/ads' -Headers 
Write-Output \Ads count: 0 \
