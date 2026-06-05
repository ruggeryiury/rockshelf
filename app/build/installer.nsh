!macro customInstall
  WriteRegStr HKCU "Software\Classes\.rb3" "" "AppRockshelf"
  WriteRegStr HKCU "Software\Classes\AppRockshelf" "" "Rock Band 3 Song Package File"
  WriteRegStr HKCU "Software\Classes\AppRockshelf\DefaultIcon" "" "$INSTDIR\resources\app.asar.unpacked\resources\rb3.ico"
!macroend