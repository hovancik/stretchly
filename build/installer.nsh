!include "WinMessages.nsh"

!macro customInstall
  CreateDirectory "$INSTDIR\bin"
  ClearErrors
  FileOpen $0 "$INSTDIR\bin\stretchly.cmd" w
  ${if} ${Errors}
    DetailPrint "Stretchly: failed to create CLI shim at $INSTDIR\bin\stretchly.cmd"
  ${else}
    FileWrite $0 "@echo off$\r$\nsetlocal$\r$\nset $\"STRETCHLY_EXE=%~dp0..\Stretchly.exe$\"$\r$\ntasklist /FI $\"IMAGENAME eq Stretchly.exe$\" 2>NUL | find /I $\"Stretchly.exe$\" >NUL$\r$\nif errorlevel 1 ($\r$\n  powershell -NoProfile -Command $\"Start-Process -FilePath $$env:STRETCHLY_EXE$\"$\r$\n) else ($\r$\n  $\"%STRETCHLY_EXE%$\" %*$\r$\n)$\r$\n"
    FileClose $0
  ${endif}

  ${if} $installMode == "all"
    EnVar::SetHKLM
  ${else}
    EnVar::SetHKCU
  ${endif}
  EnVar::AddValue "Path" "$INSTDIR\bin"
  Pop $0

  SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000
!macroend

!macro customUnInstall
  ${ifNot} ${isUpdated}
    ${if} $installMode == "all"
      EnVar::SetHKLM
    ${else}
      EnVar::SetHKCU
    ${endif}
    EnVar::DeleteValue "Path" "$INSTDIR\bin"
    Pop $0

    SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000
  ${endif}
!macroend
