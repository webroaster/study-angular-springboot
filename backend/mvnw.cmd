@if ""=="" @echo off

@rem
@rem Licensed to the Apache Software Foundation (ASF) under one
@rem or more contributor license agreements.  See the NOTICE file
@rem distributed with this work for additional information
@rem regarding copyright ownership.  The ASF licenses this file
@rem to you under the Apache License, Version 2.0 (the
@rem "License"); you may not use this file except in compliance
@rem with the License.  You may obtain a copy of the License at
@rem
@rem   http://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing,
@rem software distributed under the License is distributed on an
@rem "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@rem KIND, either express or implied.  See the License for the
@rem specific language governing permissions and limitations
@rem under the License.
@rem

@rem ----------------------------------------------------------------------------
@rem Maven Start Up Script
@rem
@rem Required ENV vars:
@rem ------------------
@rem   JAVA_HOME - location of a JDK home dir
@rem
@rem Optional ENV vars
@rem -----------------
@rem   MAVEN_OPTS - parameters passed to the Java VM when running Maven
@rem     e.g. -Xms256m -Xmx512m
@rem   MAVEN_SKIP_RC - flag to disable loading of etc/mavenrc and %USERPROFILE%\.mavenrc
@rem ----------------------------------------------------------------------------

@rem Begin all commands with @ to disable echoing.
@echo off

@rem set title of command window
@title %0

@rem set %~dp0 to the directory of the batch file
set MAVEN_PROJECT_ROOT_DIR_PATH=%~dp0

set MAVEN_PROJECT_SETTINGS_PATH=%MAVEN_PROJECT_ROOT_DIR_PATH%\.mvn\wrapper\settings.xml

if exist "%MAVEN_PROJECT_SETTINGS_PATH%" (
  set MAVEN_PROJECT_SETTINGS_ARGS=--settings "%MAVEN_PROJECT_SETTINGS_PATH%"
) else (
  set MAVEN_PROJECT_SETTINGS_ARGS=
)

set MAVEN_WRAPPER_JAR_PATH=%MAVEN_PROJECT_ROOT_DIR_PATH%\.mvn\wrapper\maven-wrapper.jar

for /f "usebackq tokens=*" %%a in ("%MAVEN_PROJECT_ROOT_DIR_PATH%\.mvn\wrapper\maven-wrapper.properties") do set MAVEN_WRAPPER_DOWNLOAD_URL=%%a
set MAVEN_WRAPPER_DOWNLOAD_URL=%MAVEN_WRAPPER_DOWNLOAD_URL:distributionUrl=%

if not exist "%MAVEN_WRAPPER_JAR_PATH%" (
  echo Downloading Maven Wrapper from %MAVEN_WRAPPER_DOWNLOAD_URL%
  powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%MAVEN_WRAPPER_DOWNLOAD_URL%', '%MAVEN_WRAPPER_JAR_PATH%')"
)

if "%MAVEN_HOME%" == "" (
  set MAVEN_TARGET_DIR=%MAVEN_PROJECT_ROOT_DIR_PATH%\.mvn\wrapper\maven
  set MAVEN_TARGET_ZIP=%MAVEN_TARGET_DIR%\maven.zip

  if not exist "%MAVEN_TARGET_DIR%" (
    echo Downloading Maven from %MAVEN_WRAPPER_DOWNLOAD_URL%
    mkdir "%MAVEN_TARGET_DIR%"
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%MAVEN_WRAPPER_DOWNLOAD_URL%', '%MAVEN_TARGET_ZIP%')"
    powershell -Command "Expand-Archive -Path '%MAVEN_TARGET_ZIP%' -DestinationPath '%MAVEN_TARGET_DIR%'"
    del "%MAVEN_TARGET_ZIP%"
    for /d %%i in (%MAVEN_TARGET_DIR%\*) do set MAVEN_HOME=%%i
  ) else (
    for /d %%i in (%MAVEN_TARGET_DIR%\*) do set MAVEN_HOME=%%i
  )
)

set MAVEN_CMD_LINE_ARGS=%*

"%MAVEN_HOME%\bin\mvn" %MAVEN_PROJECT_SETTINGS_ARGS% %MAVEN_CMD_LINE_ARGS%
