<?php
// Простой тест для проверки работы PHP
header('Content-Type: text/plain; charset=utf-8');

echo "PHP is working!\n";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "PHP Version: " . phpversion() . "\n";

// Проверка записи файлов
$testDir = dirname(__DIR__) . '/data';
if (!file_exists($testDir)) {
    if (mkdir($testDir, 0755, true)) {
        echo "Data directory created successfully\n";
    } else {
        echo "ERROR: Cannot create data directory\n";
    }
} else {
    echo "Data directory exists\n";
}

// Проверка прав записи
$testFile = $testDir . '/test.txt';
if (file_put_contents($testFile, 'test') !== false) {
    echo "File writing is working\n";
    unlink($testFile);
} else {
    echo "ERROR: Cannot write to file\n";
}
?>