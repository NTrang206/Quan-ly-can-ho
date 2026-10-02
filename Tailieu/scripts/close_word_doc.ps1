try {
    $word = [System.Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
    for ($i = 1; $i -le $word.Documents.Count; $i++) {
        $d = $word.Documents.Item($i)
        Write-Host "OPEN DOC: $($d.FullName)"
        if ($d.FullName -like "*06_GenAI*") {
            Write-Host "Closing document 06 to allow regeneration..."
            $d.Close(0)
        }
    }
} catch {
    Write-Host "Error or Word not running: $_"
}
