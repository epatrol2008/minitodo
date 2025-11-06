<?php
require_once 'config.php';

// Логируем запрос
error_log("Tasks API called: " . $_SERVER['REQUEST_METHOD']);

try {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            getTasks();
            break;
        case 'POST':
            saveTasks();
            break;
        default:
            http_response_code(405);
            echo json_encode(array('error' => 'Method not allowed'));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('error' => 'Server error: ' . $e->getMessage()));
}

function getTasks() {
    if (!file_exists(DATA_FILE)) {
        echo json_encode(array());
        return;
    }
    
    $data = file_get_contents(DATA_FILE);
    if ($data === false) {
        throw new Exception('Cannot read tasks file');
    }
    
    $tasks = json_decode($data, true);
    if ($tasks === null) {
        // Если файл поврежден, создаем заново
        file_put_contents(DATA_FILE, json_encode(array()));
        $tasks = array();
    }
    
    echo json_encode($tasks);
}

function saveTasks() {
    // Получаем raw input
    $input = file_get_contents('php://input');
    if ($input === false) {
        throw new Exception('Cannot read input data');
    }
    
    $data = json_decode($input, true);
    if ($data === null) {
        http_response_code(400);
        echo json_encode(array('error' => 'Invalid JSON data'));
        return;
    }
    
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(array('error' => 'Data must be an array'));
        return;
    }
    
    // Валидация данных для PHP 5.4
    $validatedTasks = array();
    foreach ($data as $task) {
        if (isset($task['id']) && isset($task['text'])) {
            $validatedTask = array(
                'id' => strval($task['id']),
                'text' => strval($task['text']),
                'flags' => isset($task['flags']) && is_array($task['flags']) ? $task['flags'] : array(),
                'priority' => isset($task['priority']) ? strval($task['priority']) : 'medium',
                'completed' => isset($task['completed']) ? (bool)$task['completed'] : false,
                'createdAt' => isset($task['createdAt']) ? strval($task['createdAt']) : date('c')
            );
            $validatedTasks[] = $validatedTask;
        }
    }
    
    $jsonData = json_encode($validatedTasks);
    if ($jsonData === false) {
        throw new Exception('JSON encoding failed');
    }
    
    if (file_put_contents(DATA_FILE, $jsonData) === false) {
        throw new Exception('Cannot write to tasks file');
    }
    
    echo json_encode(array(
        'success' => true, 
        'count' => count($validatedTasks),
        'message' => 'Tasks saved successfully'
    ));
}

// Функция для отладки - посмотреть что приходит
function debugInput() {
    $input = file_get_contents('php://input');
    error_log("Raw input: " . $input);
    return $input;
}
?>