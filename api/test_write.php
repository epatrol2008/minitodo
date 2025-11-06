<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$dataFile = dirname(__DIR__) . '/data/tasks.json';

// Тестовые данные
$testData = array(
    array(
        'id' => 'test1',
        'text' => 'Тестовая задача',
        'flags' => array('тест'),
        'priority' => 'medium',
        'completed' => false,
        'createdAt' => date('c')
    )
);

$result = file_put_contents($dataFile, json_encode($testData));

if ($result !== false) {
    echo json_encode(array(
        'success' => true,
        'message' => 'File written successfully',
        'bytes' => $result
    ));
} else {
    echo json_encode(array(
        'success' => false,
        'error' => 'Cannot write to file'
    ));
}
?>