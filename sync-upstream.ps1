<#
.SYNOPSIS
  Reproduce en "main" los commits nuevos de "upstream" con mi autoria.

.DESCRIPTION
  Mecanismo (nunca merge / rebase / cherry-pick contra upstream):

      upstream parent  ->  upstream commit
                              |
                         git diff --binary
                              |
                          git apply --check
                              |
                       commit nuevo de Omar

  .gitignore es un caso especial: NUNCA se reemplaza por la version de
  upstream. Se integra como "mi .gitignore + reglas de upstream sin
  duplicados", con prioridad absoluta para .env.

  El script NUNCA hace push. Para publicar:   git push origin main

  Prioridad: CORRECCION > SEGURIDAD > REPRODUCIBILIDAD > VELOCIDAD.
  Ante cualquier situacion inesperada el script se detiene sin tocar main.

.PARAMETER DryRun
  Solo inspecciona. No crea commits, no modifica main, no modifica archivos,
  no crea stashes, y no hace push / merge / rebase / reset. Solo hace fetch.

.PARAMETER Sync
  Ejecuta la sincronizacion. Solo tiene sentido si hay commits nuevos.

.EXAMPLE
  .\sync-upstream.ps1 -DryRun     # inspeccionar
  .\sync-upstream.ps1             # seguro: informa, no modifica historia
  .\sync-upstream.ps1 -Sync       # modificar la historia

.NOTES
  Ref local de control:  refs/omar-sync/upstream-last
  Significado: "ultimo commit de upstream ya reproducido correctamente en
  mi repositorio". Solo avanza si la sincronizacion termina bien.

  NOTA DE CODIFICACION: el fichero se escribe en ASCII puro a proposito.
  PowerShell 5.1 decodifica los .ps1 sin BOM como ANSI, por lo que si
  hubiera caracteres acentuados se romperian. Los valores con acentos
  (p. ej. el nombre de usuario) se construyen con [char].
#>

[CmdletBinding(DefaultParameterSetName = 'Safe')]
param(
    [Parameter(ParameterSetName = 'Dry', Mandatory = $true)]
    [switch]$DryRun,

    [Parameter(ParameterSetName = 'Sync', Mandatory = $true)]
    [switch]$Sync
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Continue'

# --------------------------------------------------------------------------
# Constantes
# --------------------------------------------------------------------------
$Utf8 = New-Object System.Text.UTF8Encoding($false)

$IdentityName  = 'Omar Vallejos Pe' + [char]0x00F1 + 'a'   # "Pena" con enye
$IdentityEmail = 'omalevp@hotmail.com'
$OriginUrl     = 'https://github.com/alechik/sisganaharrison.git'
$UpstreamUrl   = 'https://github.com/Ricardo-kjin/sisganaderia.git'

$MainBranch = 'main'
$LastSyncRef = 'refs/omar-sync/upstream-last'

# Primera ejecucion: valores ya verificados manualmente el 2026-10-07.
# Solo se usan si refs/omar-sync/upstream-last todavia no existe.
$BootstrapUpstream = '765c32c005fec0631fd5b1bdd8f00303832ea006'
$BootstrapMain     = 'b673c95254f7ab28686946d850192a884b957e17'

$GitignorePath = '.gitignore'
$EnvPath       = '.env'

$RepoRoot = $PSScriptRoot
$TempDir  = Join-Path $env:TEMP 'opencode\sync-upstream'

$script:LastExit = 0
$script:LastOut  = @()

# --------------------------------------------------------------------------
# Utilidades
# --------------------------------------------------------------------------
function Write-Line([string]$Text = '') { Write-Host $Text }

# Lanza la senal de parada. El mensaje se imprime aqui; el finally de abajo
# se encarga de restaurar el entorno y del codigo de salida.
function Abort([string]$Msg, [string]$Hint = '') {
    Write-Host ''
    Write-Host 'ABORTADO:' -ForegroundColor Red
    Write-Host $Msg -ForegroundColor Red
    if ($Hint) { Write-Host $Hint -ForegroundColor Yellow }
    throw (New-Object System.Exception 'SYNC_UPSTREAM_ABORT')
}

# Unica puerta de entrada a git. Bloquea por diseno toda operacion peligrosa.
function Invoke-Git {
    param(
        [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
        [string[]]$ArgList
    )

    if ($null -eq $ArgList -or $ArgList.Count -eq 0) { Abort 'Invoke-Git: sin argumentos.' }

    $op = $ArgList[0]
    $blocked = @('push', 'pull', 'reset', 'rebase', 'cherry-pick', 'stash', 'clean', 'revert', 'am')
    if ($blocked -contains $op) {
        Abort ('Operacion prohibida por el script:  git ' + ($ArgList -join ' '))
    }
    if ($op -eq 'merge' -and ($ArgList -notcontains '--ff-only')) {
        Abort ('Solo se permite "git merge --ff-only". Recibido:  git ' + ($ArgList -join ' '))
    }

    $out = & git.exe @ArgList 2>&1
    $script:LastExit = $LASTEXITCODE
    $script:LastOut  = @($out | ForEach-Object { $_.ToString() })
    return $script:LastExit
}

function GitText([string[]]$A) {
    $null = Invoke-Git @A
    return (($script:LastOut -join "`n").Trim())
}

function GitLines([string[]]$A) {
    $null = Invoke-Git @A
    # El "unary comma" es imprescindible: sin el, un array vacio se deshace
    # a $null en la asignacion del llamante y ".Count" fallaria con StrictMode.
    return , @($script:LastOut | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $_.Trim() })
}

# Lectura de bytes crudos de git (formatos %an / %cn / %B / %aI).
# Se redirige con cmd para obtener los bytes tal cual los escribe git,
# evitando cualquier problema de decodificacion intermedia.
function Get-GitFieldBytes([string]$Format, [string]$Ref) {
    $f = Join-Path $TempDir ('field_' + [guid]::NewGuid().ToString('N') + '.bin')
    $null = cmd /c ("git show -s --format=" + $Format + " " + $Ref + " > `"" + $f + "`"")
    if ($LASTEXITCODE -ne 0) {
        Remove-Item -LiteralPath $f -Force -ErrorAction SilentlyContinue
        Abort ('No se pudo leer --format=' + $Format + ' de ' + $Ref)
    }
    $b = [System.IO.File]::ReadAllBytes($f)
    Remove-Item -LiteralPath $f -Force -ErrorAction SilentlyContinue
    if ($b.Length -ge 2 -and $b[$b.Length - 1] -eq 10) {
        $r = New-Object byte[] ($b.Length - 1)
        [Array]::Copy($b, $r, $b.Length - 1)
        return , $r
    }
    if ($b.Length -eq 1 -and $b[0] -eq 10) { return , (New-Object byte[] 0) }
    return , $b
}

function Get-GitField([string]$Format, [string]$Ref) {
    return $Utf8.GetString((Get-GitFieldBytes $Format $Ref))
}

function Test-BytesEqual([byte[]]$A, [byte[]]$B) {
    if ($null -eq $A) { $A = New-Object byte[] 0 }
    if ($null -eq $B) { $B = New-Object byte[] 0 }
    if ($A.Length -ne $B.Length) { return $false }
    for ($i = 0; $i -lt $A.Length; $i++) { if ($A[$i] -ne $B[$i]) { return $false } }
    return $true
}

# Clave normalizada para detectar reglas equivalentes sin duplicarlas.
#   /docs/      -> docs
#   /docs/*     -> docs
#   ./.cursor/* -> .cursor
#   .env        -> .env
function Get-RuleKey([string]$Line) {
    $k = $Line.Trim()
    if ($k -eq '' -or $k.StartsWith('#')) { return '' }
    $neg = $false
    if ($k.StartsWith('!')) { $neg = $true; $k = $k.Substring(1) }
    while ($true) {
        if ($k.EndsWith('/**')) { $k = $k.Substring(0, $k.Length - 3); continue }
        if ($k.EndsWith('/*'))  { $k = $k.Substring(0, $k.Length - 2); continue }
        if ($k.EndsWith('/'))   { $k = $k.Substring(0, $k.Length - 1); continue }
        break
    }
    if ($k.StartsWith('./')) { $k = $k.Substring(2) }
    while ($k.StartsWith('/')) { $k = $k.Substring(1) }
    while ($k.EndsWith('/'))   { $k = $k.Substring(0, $k.Length - 1) }
    if ($neg) { $k = '!' + $k }
    return $k
}

function Split-Lines([string]$Text) {
    $list = New-Object System.Collections.Generic.List[string]
    foreach ($l in ($Text -split "`n")) { $list.Add($l.TrimEnd("`r")) }
    return , $list
}

# Politica Opcion B:
#   mi .gitignore (linea a linea, intacto) + reglas de upstream que no esten
#   ya representadas por una regla equivalente.  NUNCA se borra nada local.
function Merge-Gitignore([string]$LocalBase, [string]$UpstreamText) {
    $out = New-Object System.Collections.Generic.List[string]
    $seen = New-Object 'System.Collections.Generic.HashSet[string]'

    $hadEol = $false
    $localLines = Split-Lines $LocalBase
    if ($localLines.Count -gt 0 -and $localLines[$localLines.Count - 1] -eq '') {
        $localLines.RemoveAt($localLines.Count - 1)
        $hadEol = $true
    }
    foreach ($l in $localLines) {
        $out.Add($l)
        $k = Get-RuleKey $l
        if ($k -ne '') { $null = $seen.Add($k) }
    }

    $imported = 0
    foreach ($l in (Split-Lines $UpstreamText)) {
        $t = $l.Trim()
        if ($t -eq '' -or $t.StartsWith('#')) { continue }   # solo reglas
        $k = Get-RuleKey $l
        if ($k -eq '') { continue }
        if ($k -eq '!.env' -or $k -eq '!/.env' -or $k -eq '!.env.*') {
            Write-Host ('  [gitignore] descartada regla que desprotegeria .env: ' + $t)
            continue
        }
        if ($seen.Contains($k)) { continue }
        $out.Add($l)
        $null = $seen.Add($k)
        $imported++
    }

    $text = ($out -join "`n")
    if ($hadEol) { $text = $text + "`n" }
    return , @($text, $imported)
}

function Read-FileText([string]$Path) {
    return $Utf8.GetString([System.IO.File]::ReadAllBytes($Path))
}

# --------------------------------------------------------------------------
# Programa principal
# --------------------------------------------------------------------------
$OriginalEnc = [Console]::OutputEncoding
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)

$Aborted = $false
$ExitCode = 0

if (-not (Test-Path -LiteralPath $TempDir)) {
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
}

Push-Location -LiteralPath $RepoRoot
try {
    if ($DryRun)      { $Mode = 'DRY RUN' }
    elseif ($Sync)    { $Mode = 'SYNC' }
    else              { $Mode = 'MODO SEGURO' }

    Write-Host ''
    Write-Host ('=== SYNC UPSTREAM - ' + $Mode + ' ===')

    # ---------------- guardas de entorno (tambien en DryRun) ----------------
    $branch = GitText @('branch', '--show-current')
    Write-Host ('Branch: ' + $branch)
    if ($branch -ne $MainBranch) {
        Abort ('La rama actual no es main. Es: ' + $branch)
    }

    $porcelain = GitLines @('status', '--porcelain')
    if ($porcelain.Count -gt 0) {
        foreach ($p in $porcelain) { Write-Host ('  ' + $p) }
        Abort 'El working tree contiene cambios locales.' `
             'No se hace stash automatico ni se borra nada. Guarda o descarta los cambios y vuelve a ejecutar.'
    }
    Write-Host 'Working tree: CLEAN'

    $oUrl = GitText @('remote', 'get-url', 'origin')
    $uUrl = GitText @('remote', 'get-url', 'upstream')
    if ($oUrl -ne $OriginUrl) {
        Abort ('origin no es el repositorio personal esperado.' + "`n  actual:   " + $oUrl + "`n  esperado: " + $OriginUrl)
    }
    if ($uUrl -ne $UpstreamUrl) {
        Abort ('upstream no es el repositorio de trabajo esperado.' + "`n  actual:   " + $uUrl + "`n  esperado: " + $UpstreamUrl)
    }
    Write-Host 'Origin: OK'
    Write-Host 'Upstream: OK'

    $null = Invoke-Git check-ignore -q $EnvPath
    if ($script:LastExit -ne 0) {
        Abort ($EnvPath + ' no esta ignorado por .gitignore.') 'No se corrige automaticamente.'
    }
    $null = Invoke-Git ls-files --error-unmatch $EnvPath
    if ($script:LastExit -eq 0) {
        Abort ($EnvPath + ' esta trackeado.') 'No se corrige automaticamente. Revisa el indice de git.'
    }
    Write-Host ($EnvPath + ': IGNORADO (no trackeado)')

    # Identidad efectiva. Se comprueba, NUNCA se modifica la config global.
    $cfgName  = GitText @('config', 'user.name')
    $cfgEmail = GitText @('config', 'user.email')
    $wantName = 'Omar Vallejos Pe' + [char]0x00F1 + 'a'
    if ($cfgName -ne $wantName -or $cfgEmail -ne 'omalevp@hotmail.com') {
        Abort ('La identidad Git efectiva no es la esperada.' + "`n  user.name : " + $cfgName + "`n  user.email: " + $cfgEmail + "`n  esperado  : " + $wantName + ' <omalevp@hotmail.com>') `
             'Corrigela con:  git config --global user.name "..."   (el script no la cambia solo)'
    }
    Write-Host ('Identidad: ' + $cfgName + ' <' + $cfgEmail + '>')

    # ---------------- fetch (unico acceso de escritura a remotos: ninguno) ---
    $null = Invoke-Git fetch origin
    if ($script:LastExit -ne 0) { Abort 'Fallo  git fetch origin.' }
    $null = Invoke-Git fetch upstream
    if ($script:LastExit -ne 0) { Abort 'Fallo  git fetch upstream.' }

    $mainSha = GitText @('rev-parse', 'main')
    $upSha   = GitText @('rev-parse', 'upstream/main')

    # ---------------- ref local: ultimo upstream sincronizado ---------------
    $refExists = $true
    $bootstrapCreated = $false
    $null = Invoke-Git rev-parse --verify --quiet $LastSyncRef
    if ($script:LastExit -eq 0) {
        $lastSha = GitText @('rev-parse', $LastSyncRef)
    }
    else {
        $refExists = $false
        $lastSha = $BootstrapUpstream

        # Primera ejecucion: comprobaciones estrictas antes de crear la ref.
        if ($upSha -ne $BootstrapUpstream) {
            Abort ('No existe ' + $LastSyncRef + ' y upstream/main no es el valor esperado.' + "`n  upstream/main: " + $upSha + "`n  esperado    : " + $BootstrapUpstream) `
                 'Se detiene para no arriesgar la historia. Revisa el estado a mano.'
        }
        if ($mainSha -ne $BootstrapMain) {
            Abort ('No existe ' + $LastSyncRef + ' y main no es el valor esperado.' + "`n  main: " + $mainSha + "`n  esperado: " + $BootstrapMain)
        }
        if (-not $DryRun) {
            $null = Invoke-Git update-ref $LastSyncRef $BootstrapUpstream
            if ($script:LastExit -ne 0) { Abort ('No se pudo crear ' + $LastSyncRef + '.') }
            $bootstrapCreated = $true
            $refExists = $true
            Write-Host ('Ref creada: ' + $LastSyncRef + ' -> ' + $lastSha)
        }
    }

    $null = Invoke-Git merge-base --is-ancestor $lastSha $upSha
    if ($script:LastExit -ne 0) {
        Abort ($LastSyncRef + ' no es ancestro de upstream/main (historia reescrita o force-push?).' + "`n  ref     : " + $lastSha + "`n  upstream: " + $upSha)
    }

    # ---------------- deteccion de commits nuevos ---------------------------
    $range = $lastSha + '..' + $upSha

    $merges = GitLines @('rev-list', '--min-parents=2', $range)
    if ($merges.Count -gt 0) {
        Abort 'Se detecto un merge commit en upstream.' `
             'La sincronizacion automatica no lo procesa. No se modifico main.'
    }
    $roots = GitLines @('rev-list', '--max-parents=0', $range)
    if ($roots.Count -gt 0) {
        Abort 'Se detecto un commit raiz dentro del rango de upstream.' `
             'La sincronizacion automatica no lo procesa. No se modifico main.'
    }

    $newShas = GitLines @('rev-list', '--reverse', $range)

    # Archivos que difieren entre mi main y el upstream ya sincronizado.
    # Sirve para detectar si upstream toca algo que difiere localmente.
    $dStart = GitLines @('diff', '--name-only', $mainSha, $lastSha)

    # ---------------- informe comun ----------------------------------------
    Write-Host ''
    Write-Host ('Ultimo upstream sincronizado:')
    Write-Host ('  ' + $LastSyncRef + ' = ' + $lastSha)
    if (-not $refExists) {
        Write-Host ('  (la ref aun no existe; se crearia con ' + $BootstrapUpstream + ')')
    }
    Write-Host ''
    Write-Host ('main         : ' + $mainSha)
    Write-Host ('origin/main  : ' + (GitText @('rev-parse', 'origin/main')))
    Write-Host ('upstream/main: ' + $upSha)
    Write-Host ''
    Write-Host ('Nuevos commits: ' + $newShas.Count)

    if ($newShas.Count -eq 0) {
        Write-Host ''
        Write-Host 'No hay nada que sincronizar.'
    }
    else {
        $i = 0
        foreach ($s in $newShas) {
            $i++
            $parent = GitText @('rev-parse', ($s + '^'))
            $msg    = Get-GitField '%s' $s
            $author = Get-GitField '%an' $s
            $date   = Get-GitField '%aI' $s
            $files  = GitLines @('diff', '--name-only', $parent, $s)
            $stat   = GitText @('diff', '--shortstat', $parent, $s)
            $giNote = ''
            if ($files -contains $GitignorePath) {
                $giNote = '   [.gitignore -> integracion segura]'
            }
            Write-Host ''
            Write-Host ('  ' + $i + '. ' + $s.Substring(0, 7) + '  ' + $msg)
            Write-Host ('       autor: ' + $author + '   fecha: ' + $date)
            Write-Host ('       archivos: ' + $files.Count + '   ' + $stat + $giNote)
        }
        Write-Host ''
        $giCommits = 0
        foreach ($s in $newShas) {
            $p = GitText @('rev-parse', ($s + '^'))
            $f = GitLines @('diff', '--name-only', $p, $s)
            if ($f -contains $GitignorePath) { $giCommits++ }
        }
        if ($giCommits -gt 0) {
            Write-Host ('Advertencia: ' + $giCommits + ' commit(s) modifican .gitignore.')
            Write-Host '             Se integraran con la politica local + upstream (nunca se reemplaza).'
        }
    }

    # --------------------------------------------------------------------------
    # Modo DryRun: termina aqui. Nada ha sido modificado.
    # --------------------------------------------------------------------------
    if ($DryRun) {
        Write-Host ''
        Write-Host 'DryRun: no se modifico nada (sin commits, sin cambios de archivos, sin push, sin merge, sin reset).'
        if ($newShas.Count -gt 0) {
            Write-Host 'Para ejecutar la sincronizacion:   .\sync-upstream.ps1 -Sync'
        }
        Write-Host ''
        return
    }

    # --------------------------------------------------------------------------
    # Sin commits nuevos: solo informa (y deja creada la ref en la 1a ejecucion)
    # --------------------------------------------------------------------------
    if ($newShas.Count -eq 0) {
        if ($bootstrapCreated) {
            Write-Host ''
            Write-Host ('Inicializada ' + $LastSyncRef + ' -> ' + $lastSha)
            Write-Host 'La ultima sincronizacion manual ya estaba completa; no hay nada nuevo.'
        }
        Write-Host ''
        Write-Host 'No hay nuevos commits de upstream.  main no se modifico.'
        Write-Host 'No se realizo ningun push.'
        Write-Host ''
        return
    }

    # --------------------------------------------------------------------------
    # Modo seguro sin -Sync: informa y se detiene sin tocar la historia.
    # --------------------------------------------------------------------------
    if (-not $Sync) {
        Abort ('Se detectaron ' + $newShas.Count + ' commits nuevos de upstream.') `
             'El modo seguro no modifica la historia. Re-ejecuta con:   .\sync-upstream.ps1 -Sync'
    }

    # ==========================================================================
    # SINCRONIZACION
    # ==========================================================================
    $timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
    $shortMain = $mainSha.Substring(0, 7)

    # --- 1) backup local (nunca se borra) ------------------------------------
    $backupRef = 'refs/omar-sync/backup-' + $timestamp + '-' + $shortMain
    $null = Invoke-Git update-ref $backupRef $mainSha
    if ($script:LastExit -ne 0) { Abort ('No se pudo crear el backup local ' + $backupRef + '.') }
    Write-Host ''
    Write-Host ('Backup local: ' + $backupRef + ' -> ' + $mainSha)

    # --- 2) rama temporal desde main ----------------------------------------
    $tempBranch = 'sync/omar-' + $timestamp
    $null = Invoke-Git switch -c $tempBranch
    if ($script:LastExit -ne 0) { Abort ('No se pudo crear la rama temporal ' + $tempBranch + '.') }
    Write-Host ('Rama temporal: ' + $tempBranch + '  (nace en main, no en upstream)')

    # base del .gitignore en este lote; se conserva intacta durante todo el replay
    if (Test-Path -LiteralPath $GitignorePath) {
        $gitignoreBase = Read-FileText $GitignorePath
    }
    else {
        $gitignoreBase = ''
    }

    $msgFile = Join-Path $TempDir 'commit-msg.txt'
    $patchFile = Join-Path $TempDir 'current.patch'
    $created = @()
    $idx = 0
    $gitignoreCommits = 0

    # --- 3) replay de commits ------------------------------------------------
    foreach ($s in $newShas) {
        $idx++
        Write-Host ''
        Write-Host ('===== COMMIT ' + $idx + '/' + $newShas.Count + ' : ' + $s.Substring(0, 7) + ' =====')

        $null = Invoke-Git show -s --format=%P $s
        $parents = @(($script:LastOut -join ' ') -split '\s+' | Where-Object { $_ -ne '' })
        if ($parents.Count -eq 0) {
            Abort ('El commit upstream ' + $s + ' es un commit raiz. No se procesa.')
        }
        if ($parents.Count -gt 1) {
            Abort 'Se detecto un merge commit en upstream.' `
                 'La sincronizacion automatica no lo procesa. No se modifico main.'
        }
        $upParent = $parents[0]

        $upMsgBytes  = Get-GitFieldBytes '%B'  $s
        $upDateBytes = Get-GitFieldBytes '%aI' $s
        $upMsg  = $Utf8.GetString($upMsgBytes)
        $upDate = $Utf8.GetString($upDateBytes)

        $upFiles   = GitLines @('diff', '--name-only', $upParent, $s)
        $otherUp   = @($upFiles | Where-Object { $_ -ne $GitignorePath })
        $touchesGi = ($upFiles -contains $GitignorePath)

        # upstream toca algo que difiere localmente (fuera de .gitignore)?
        foreach ($f in $otherUp) {
            if ($dStart -contains $f) {
                Abort ('El commit upstream modifica "' + $f + '", que difiere entre mi repositorio y upstream.') `
                     'No se resuelve automaticamente. Revisa el caso a mano.'
            }
        }

        # ---- patch -----------------------------------------------------------
        if ($otherUp.Count -gt 0) {
            $null = Invoke-Git diff --binary ('--output=' + $patchFile) $upParent $s
            if ($script:LastExit -ne 0) { Abort ('No se pudo generar el patch de ' + $s + '.') }

            if ($touchesGi) {
                $null = Invoke-Git apply --check --exclude=.gitignore $patchFile
            }
            else {
                $null = Invoke-Git apply --check $patchFile
            }
            if ($script:LastExit -ne 0) {
                Write-Host ($script:LastOut -join "`n")
                Abort ('El commit ' + $s.Substring(0, 7) + ' no puede aplicarse limpiamente.') `
                     'NO se fuerza, NO se sobrescriben archivos, NO se hace checkout desde upstream.'
            }

            if ($touchesGi) {
                $null = Invoke-Git apply --exclude=.gitignore $patchFile
            }
            else {
                $null = Invoke-Git apply $patchFile
            }
            if ($script:LastExit -ne 0) {
                Abort ('Fallo al aplicar el patch de ' + $s.Substring(0, 7) + '.')
            }
        }

        # ---- .gitignore: integracion segura ---------------------------------
        if ($touchesGi) {
            $gitignoreCommits++
            $null = Invoke-Git cat-file -e ($s + ':' + $GitignorePath)
            if ($script:LastExit -eq 0) {
                $giTmp = Join-Path $TempDir 'up-gitignore.txt'
                $null = cmd /c ('git show "' + $s + ':' + $GitignorePath + '" > "' + $giTmp + '"')
                if ($LASTEXITCODE -ne 0) { Abort ('No se pudo leer el .gitignore upstream de ' + $s + '.') }
                $upGi = Read-FileText $giTmp
                Remove-Item -LiteralPath $giTmp -Force -ErrorAction SilentlyContinue

                $merged = Merge-Gitignore $gitignoreBase $upGi
                $mergedText = $merged[0]
                $imported = $merged[1]

                [System.IO.File]::WriteAllBytes($GitignorePath, $Utf8.GetBytes($mergedText))

                # validacion obligatoria del .gitignore resultante
                $null = Invoke-Git check-ignore -q $EnvPath
                if ($script:LastExit -ne 0) {
                    [System.IO.File]::WriteAllBytes($GitignorePath, $Utf8.GetBytes($gitignoreBase))
                    Abort ($EnvPath + ' dejo de estar ignorado tras integrar .gitignore.') `
                         'Se restauro el .gitignore original. No se hizo commit.'
                }
                $null = Invoke-Git ls-files --error-unmatch $EnvPath
                if ($script:LastExit -eq 0) {
                    [System.IO.File]::WriteAllBytes($GitignorePath, $Utf8.GetBytes($gitignoreBase))
                    Abort ($EnvPath + ' aparece trackeado tras integrar .gitignore.') 'Se restauro el .gitignore original.'
                }
                $statusGi = GitLines @('status', '--porcelain', '--', $EnvPath)
                if ($statusGi.Count -gt 0) {
                    [System.IO.File]::WriteAllBytes($GitignorePath, $Utf8.GetBytes($gitignoreBase))
                    Abort ($EnvPath + ' aparece en git status tras integrar .gitignore.') 'Se restauro el .gitignore original.'
                }

                Write-Host ('  [gitignore] reglas nuevas importadas de upstream: ' + $imported + ' (la version upstream no se aplica)')
            }
            else {
                Write-Host '  [gitignore] upstream elimino el archivo: se conserva la version local.'
            }
        }

        # ---- commit ----------------------------------------------------------
        $null = Invoke-Git add -A
        if ($script:LastExit -ne 0) { Abort ('Fallo git add -A tras ' + $s.Substring(0, 7) + '.') }

        [System.IO.File]::WriteAllText($msgFile, $upMsg + "`n", $Utf8)

        $staged = GitLines @('diff', '--cached', '--name-only')
        $allowEmpty = $false
        if ($staged.Count -eq 0) {
            if ($touchesGi -or $upFiles.Count -eq 0) {
                $allowEmpty = $true
                Write-Host '  [vacio] el cambio de upstream ya esta incorporado en mi arbol; se recrea el commit igualmente.'
            }
            else {
                Abort ('El commit upstream ' + $s.Substring(0, 7) + ' no produjo ningun cambio aplicable.')
            }
        }

        # La identidad NO se pasa por variables de entorno de nombre/email:
        # eso provocaba el truncamiento "Omar Vallejos Pe". Se usa la config.
        $env:GIT_COMMITTER_DATE = $upDate
        try {
            if ($allowEmpty) {
                $null = Invoke-Git commit ('--file=' + $msgFile) ('--date=' + $upDate) --allow-empty
            }
            else {
                $null = Invoke-Git commit ('--file=' + $msgFile) ('--date=' + $upDate)
            }
        }
        finally {
            Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
        }
        if ($script:LastExit -ne 0) {
            Write-Host ($script:LastOut -join "`n")
            Abort ('Fallo la creacion del commit para upstream ' + $s.Substring(0, 7) + '.')
        }

        $mySha = GitText @('rev-parse', 'HEAD')
        $created += $mySha

        # ---- validacion por commit (pares parent->commit, no arboles) --------
        $myMsgBytes  = Get-GitFieldBytes '%B'  $mySha
        $myDateBytes = Get-GitFieldBytes '%aI' $mySha
        $myAn = Get-GitField '%an' $mySha
        $myCn = Get-GitField '%cn' $mySha
        $myEm = Get-GitField '%ae' $mySha

        if (-not (Test-BytesEqual $upMsgBytes $myMsgBytes)) {
            Abort ('El mensaje del commit recreado (' + $s.Substring(0, 7) + ') no coincide con upstream.')
        }
        if (-not (Test-BytesEqual $upDateBytes $myDateBytes)) {
            Abort ('La fecha del commit recreado (' + $s.Substring(0, 7) + ') no coincide con upstream.')
        }
        if ($myAn -ne $wantName -or $myCn -ne $wantName -or $myEm -ne 'omalevp@hotmail.com') {
            Abort ('La autoria del commit recreado no es la esperada.' + "`n  author   : " + $myAn + ' <' + $myEm + '>' + "`n  committer: " + $myCn)
        }

        if ($idx -eq 1) { $myParent = $mainSha } else { $myParent = $created[-2] }
        $myFiles = GitLines @('diff', '--name-only', $myParent, $mySha)

        if (($upFiles -join '|') -ne ($myFiles -join '|')) {
            Abort ('El cambio recreado no corresponde al commit upstream ' + $s.Substring(0, 7) + '.' + "`n  upstream: " + ($upFiles -join ', ') + "`n  local   : " + ($myFiles -join ', '))
        }

        foreach ($f in $otherUp) {
            # Se comparan los BLOBS (ids de contenido) de ambos lados:
            # identico id de blob == identico contenido, sin leer bytes.
            $null = Invoke-Git rev-parse ($mySha + ':' + $f)
            $e1 = $script:LastExit
            $b1 = if ($e1 -eq 0) { ($script:LastOut -join '').Trim() } else { '' }
            $null = Invoke-Git rev-parse ($s + ':' + $f)
            $e2 = $script:LastExit
            $b2 = if ($e2 -eq 0) { ($script:LastOut -join '').Trim() } else { '' }
            if ($e1 -ne $e2) {
                Abort ('La existencia del archivo "' + $f + '" no coincide con upstream en ' + $s.Substring(0, 7) + '.')
            }
            if ($e1 -eq 0 -and $b1 -ne $b2) {
                Abort ('El contenido de "' + $f + '" no coincide con upstream en ' + $s.Substring(0, 7) + '.')
            }
        }

        Write-Host ('  OK  local=' + $mySha.Substring(0, 7) + '  upstream=' + $s.Substring(0, 7) + '  autor=Omar  fecha=OK  archivos=OK')
    }

    # --- 4) validacion final de la rama temporal -----------------------------
    Write-Host ''
    Write-Host '===== VALIDACION DE LA RAMA TEMPORAL ====='

    $porcelain2 = GitLines @('status', '--porcelain')
    if ($porcelain2.Count -gt 0) { Abort 'El working tree de la rama temporal no quedo limpio.' }
    Write-Host '  working tree      : CLEAN'

    $mergesLocal = GitLines @('rev-list', '--count', '--merges', ($mainSha + '..HEAD'))
    if ($mergesLocal.Count -gt 0 -and $mergesLocal[0] -ne '0') {
        Abort 'La rama temporal contiene merges.'
    }
    Write-Host '  merges            : 0'

    $null = Invoke-Git check-ignore -q $EnvPath
    if ($script:LastExit -ne 0) { Abort ($EnvPath + ' dejo de estar ignorado.') }
    $null = Invoke-Git ls-files --error-unmatch $EnvPath
    if ($script:LastExit -eq 0) { Abort ($EnvPath + ' esta trackeado.') }
    Write-Host ('  ' + ($EnvPath.PadRight(17)) + ': IGNORADO')

    $bad = 0
    foreach ($c in $created) {
        $a = Get-GitField '%an' $c
        if ($a -ne $wantName) { $bad++ }
    }
    if ($bad -gt 0) { Abort ('Hay ' + $bad + ' commit(s) sin la autoria esperada.') }
    Write-Host ('  autoria Omar       : SI (' + $created.Count + '/' + $created.Count + ')')
    Write-Host '  .gitignore         : OK (integracion local+upstream)'

    # --- 5) main avanza en fast-forward -------------------------------------
    $null = Invoke-Git switch $MainBranch
    if ($script:LastExit -ne 0) { Abort 'No se pudo volver a main.' }

    $null = Invoke-Git merge --ff-only $tempBranch
    if ($script:LastExit -ne 0) {
        Abort 'git merge --ff-only fallo.' `
             'main NO se actualizo. La rama temporal queda para inspeccion: ' + $tempBranch
    }

    $finalMain = GitText @('rev-parse', 'main')
    if ($finalMain -ne $created[-1]) { Abort 'main no apunta al HEAD esperado tras el fast-forward.' }
    Write-Host ''
    Write-Host ('main actualizado: ' + $mainSha.Substring(0, 7) + ' -> ' + $finalMain.Substring(0, 7) + ' (fast-forward)')

    # --- 6) la ref de control SOLO avanza si todo salio bien -----------------
    $null = Invoke-Git update-ref $LastSyncRef $upSha
    if ($script:LastExit -ne 0) { Abort ('No se pudo actualizar ' + $LastSyncRef + '.') }
    Write-Host ($LastSyncRef + ' -> ' + $upSha)

    # --- 7) resumen (sin push) ----------------------------------------------
    $originMain = GitText @('rev-parse', 'origin/main')
    Write-Host ''
    Write-Host '========================================'
    Write-Host 'SINCRONIZACION COMPLETADA'
    Write-Host '========================================'
    Write-Host ('main          : ' + $finalMain)
    Write-Host ('origin/main   : ' + $originMain)
    Write-Host ('upstream/main : ' + $upSha)
    Write-Host ('Commits recreados : ' + $created.Count)
    Write-Host 'Todos con autoria Omar : SI'
    Write-Host ('.gitignore     : OK (' + $gitignoreCommits + ' commit(s) integrados)')
    Write-Host '.env           : IGNORADO'
    Write-Host 'Working tree   : CLEAN'
    Write-Host ''
    Write-Host 'No se realizo ningun push.'
    Write-Host ''
    Write-Host 'Rama temporal conservada para inspeccion:'
    Write-Host ('  ' + $tempBranch)
    Write-Host ('Backup local: ' + $backupRef)
    Write-Host ''
    Write-Host 'Para publicar:'
    Write-Host '  git push origin main'
    Write-Host '========================================'
}
catch {
    if ($_.Exception.Message -eq 'SYNC_UPSTREAM_ABORT') {
        $Aborted = $true
    }
    else {
        Write-Host ''
        Write-Host 'ABORTADO:' -ForegroundColor Red
        Write-Host ('Error inesperado: ' + $_.Exception.Message) -ForegroundColor Red
        Write-Host ($_.ScriptStackTrace) -ForegroundColor Yellow
        $Aborted = $true
    }
}
finally {
    Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
    [Console]::OutputEncoding = $OriginalEnc
    Pop-Location -ErrorAction SilentlyContinue
}

if ($Aborted) { exit 1 }
exit $ExitCode
