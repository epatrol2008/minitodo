<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$dataFile = dirname(__DIR__) . '/data/tasks.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Чтение
    if (!file_exists($dataFile)) {
        file_put_contents($dataFile, '[]');
    }
    echo file_get_contents($dataFile) ?: '[]';
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Запись
    $input = file_get_contents('php://input');
    if (file_put_contents($dataFile, $input) !== false) {
        echo json_encode(array('success' => true, 'message' => 'Saved'));
    } else {
        echo json_encode(array('success' => false, 'error' => 'Write failed'));
    }
    
} else {
    http_response_code(405);
    echo json_encode(array('error' => 'Method not allowed'));
}
?>