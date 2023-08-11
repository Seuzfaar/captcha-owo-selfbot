@echo off

echo Gereksinimler kuruluyor...
call npm i
IF %ERRORLEVEL% NEQ 0 (
    echo Gereksinimler kurulamadı.
    exit /b 1
)

echo Gereksinimler kuruluyor...
call npm update
IF %ERRORLEVEL% NEQ 0 (
    echo Gereksinimler kurulamadı.
    exit /b 1
)

echo Bot aktif hale geliyor.
node .

pause
