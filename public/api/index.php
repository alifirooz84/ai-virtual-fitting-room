<?php
// Multi-Store AI Virtual Fitting Room - cPanel Native Storage API
// Automatically handles persistent storage of products and uploaded garments in MySQL and disk.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
$db = DatabaseManager::getInstance();

$uploadsDir = __DIR__ . '/uploads';
if (!file_exists($uploadsDir)) {
    @mkdir($uploadsDir, 0777, true);
}

// Parse request URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Health check
if (strpos($uri, '/api/health') !== false) {
    echo json_encode([
        'status' => 'ok',
        'service' => 'cPanel MySQL & JSON Fitting Room Storage Engine',
        'version' => '2.1.0',
        'mysql_connected' => $db->isMysqlConnected(),
        'totalProducts' => count($db->getProducts()),
        'timestamp' => date('c'),
    ]);
    exit;
}

// 1. GET Products
if ($method === 'GET') {
    $storeSlug = null;
    $slot = $_GET['slot'] ?? null;

    if (preg_match('#/api/stores/([^/]+)/products#', $uri, $matches)) {
        $storeSlug = $matches[1];
    }

    $products = $db->getProducts($storeSlug, $slot);
    echo json_encode(array_values($products), JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. POST Product
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if (!$body || empty($body['image'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ارسال تصویر لباس (image) الزامی است.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $storeSlug = 'zara-modern';
    if (preg_match('#/api/stores/([^/]+)/products#', $uri, $matches)) {
        $storeSlug = $matches[1];
    } elseif (!empty($body['storeSlug'])) {
        $storeSlug = $body['storeSlug'];
    }

    $newId = 'prod-' . $storeSlug . '-' . time() . '-' . rand(100, 999);
    $imageUrl = $body['image'];

    // If image is a base64 string, write it to a physical file in /uploads/
    if (preg_match('#^data:image/(\w+);base64,(.+)$#', $body['image'], $imgMatches)) {
        $ext = strtolower($imgMatches[1]);
        if ($ext === 'jpeg') $ext = 'jpg';
        $decodedImg = base64_decode($imgMatches[2]);
        if ($decodedImg) {
            $fileName = $newId . '.' . $ext;
            $filePath = $uploadsDir . '/' . $fileName;
            if (@file_put_contents($filePath, $decodedImg)) {
                $imageUrl = '/api/uploads/' . $fileName;
            }
        }
    }

    $jsonSpec = isset($body['jsonSpec']) && is_array($body['jsonSpec']) ? $body['jsonSpec'] : [];
    $title = !empty($body['customTitle']) ? $body['customTitle'] : (isset($jsonSpec['name_fa']) ? $jsonSpec['name_fa'] : 'لباس جدید');
    $price = !empty($body['customPrice']) ? (int)$body['customPrice'] : (isset($jsonSpec['style_details']['estimated_price_toman']) ? (int)$jsonSpec['style_details']['estimated_price_toman'] : 850000);
    $slot = isset($jsonSpec['slot']) ? $jsonSpec['slot'] : 'slot_top';
    $category = isset($jsonSpec['category']) ? $jsonSpec['category'] : 'tshirt';

    $placement = isset($jsonSpec['placement']) && is_array($jsonSpec['placement']) ? $jsonSpec['placement'] : [
        'anchor' => $slot === 'slot_bottom' ? 'waist' : ($slot === 'slot_outer' ? 'shoulders' : 'torso'),
        'offset_x_percent' => 0,
        'offset_y_percent' => $slot === 'slot_bottom' ? 64 : 30,
        'scale' => $slot === 'slot_outer' ? 1.05 : 1.0,
        'z_index' => $slot === 'slot_outer' ? 40 : ($slot === 'slot_top' ? 30 : 20),
    ];

    $productObj = [
        'id' => $newId,
        'storeSlug' => $storeSlug,
        'storeName' => !empty($body['storeName']) ? $body['storeName'] : 'فروشگاه اختصاصی',
        'title' => $title,
        'price' => $price,
        'category' => $category,
        'slot' => $slot,
        'imageUrl' => $imageUrl,
        'placement' => $placement,
        'spec' => $jsonSpec,
        'createdAt' => date('c'),
    ];

    $saved = $db->createProduct($productObj);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'product' => $saved,
        'storage_type' => $db->isMysqlConnected() ? 'mysql' : 'json_disk',
        'message' => 'محصول با موفقیت در دیتابیس هاست ذخیره شد.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. DELETE Product
if ($method === 'DELETE') {
    if (preg_match('#/api/products/([^/]+)#', $uri, $matches) || preg_match('#/api/stores/[^/]+/products/([^/]+)#', $uri, $matches)) {
        $targetId = $matches[1];
        $db->deleteProduct($targetId);
        echo json_encode(['success' => true, 'deletedId' => $targetId]);
        exit;
    }
}

// Default fallback
echo json_encode([
    'status' => 'api_running',
    'mysql_connected' => $db->isMysqlConnected(),
    'uri' => $uri
]);
