<?php
// Конфигурация API для PHP 5.4
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Включаем вывод ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Настройки
$baseDir = dirname(dirname(__FILE__));
define('DATA_FILE', $baseDir . '/data/tasks.json');
define('CHECK_FILE', $baseDir . '/data/check.txt');

// Создаем папку data если не существует
if (!file_exists(dirname(DATA_FILE))) {
    if (!mkdir(dirname(DATA_FILE), 0755, true)) {
        http_response_code(500);
        echo json_encode(array('error' => 'Cannot create data directory'));
        exit;
    }
}

// Создаем пустой файл задач если не существует
if (!file_exists(DATA_FILE)) {
    if (file_put_contents(DATA_FILE, json_encode(array())) === false) {
        http_response_code(500);
        echo json_encode(array('error' => 'Cannot create tasks file'));
        exit;
    }
}

// Создаем пустой файл для проверки если не существует
if (!file_exists(CHECK_FILE)) {
    file_put_contents(CHECK_FILE, '');
}
?>