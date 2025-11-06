<?php
require_once 'config.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        checkUpdates();
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

function checkUpdates() {
    if (!file_exists(CHECK_FILE)) {
        echo json_encode(['hasUpdate' => false, 'message' => '']);
        return;
    }
    
    $content = file_get_contents(CHECK_FILE);
    if ($content === false) {
        throw new Exception('Cannot read check file');
    }
    
    $trimmed = trim($content);
    
    if (empty($trimmed)) {
        echo json_encode(['hasUpdate' => false, 'message' => '']);
    } else {
        // Очищаем файл после чтения
        if (file_put_contents(CHECK_FILE, '') === false) {
            throw new Exception('Cannot clear check file');
        }
        echo json_encode([
            'hasUpdate' => true, 
            'message' => $trimmed
        ], JSON_UNESCAPED_UNICODE);
    }
}
?>