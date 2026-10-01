@echo off
chcp 65001 > nul
echo ========================================================
echo  KHOI CHAY HE THONG QUAN LY THUE CAN HO (SUNSHINE HOMES)
echo ========================================================
echo.
echo [1/2] Dang khoi chay Backend FastAPI (Port 8000)...
start "Backend - Sunshine Homes (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Dang khoi chay Frontend Vite (Port 5173)...
start "Frontend - Sunshine Homes (Vite React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo  DA KHOI CHAY THANH CONG!
echo  - Frontend:     http://localhost:5173
echo  - Backend Docs: http://localhost:8000/docs
echo ========================================================
pause
