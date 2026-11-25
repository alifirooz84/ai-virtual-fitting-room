<?php
// High-Reliability Database Manager (MySQL PDO with Graceful JSON/SQLite fallback)
// Multi-Store AI Virtual Fitting Room

class DatabaseManager {
    private static $instance = null;
    private $pdo = null;
    private $isMysql = false;
    private $dataDir;
    private $productsFile;
    private $storesFile;

    private function __construct() {
        $this->dataDir = __DIR__ . '/data';
        $this->productsFile = $this->dataDir . '/products.json';
        $this->storesFile = $this->dataDir . '/stores.json';

        if (!file_exists($this->dataDir)) {
            @mkdir($this->dataDir, 0777, true);
        }

        $this->connect();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function connect() {
        $config = require __DIR__ . '/config.php';

        if (!empty($config['database']) && !empty($config['username'])) {
            try {
                $dsn = sprintf(
                    'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                    $config['host'],
                    $config['port'],
                    $config['database'],
                    $config['charset'] ?? 'utf8mb4'
                );

                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ];

                $this->pdo = new PDO($dsn, $config['username'], $config['password'], $options);
                $this->isMysql = true;

                // Auto-create tables if they don't exist yet!
                $this->initMysqlTables();
                return;
            } catch (PDOException $e) {
                error_log('[DB Error] MySQL Connection Failed: ' . $e->getMessage());
                $this->isMysql = false;
                $this->pdo = null;
            }
        }

        // Fallback: file-based JSON storage
        $this->isMysql = false;
    }

    public function isMysqlConnected() {
        return $this->isMysql && $this->pdo !== null;
    }

    /**
     * Automatically creates the MySQL tables if they do not exist.
     */
    public function initMysqlTables() {
        if (!$this->isMysql || !$this->pdo) return;

        // 1. Stores Table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS `stores` (
                `id` VARCHAR(64) NOT NULL,
                `slug` VARCHAR(64) NOT NULL,
                `name_fa` VARCHAR(255) NOT NULL,
                `name_en` VARCHAR(255) DEFAULT '',
                `city` VARCHAR(100) DEFAULT 'تهران',
                `description` TEXT,
                `badge` VARCHAR(100) DEFAULT '',
                `logo_emoji` VARCHAR(32) DEFAULT '🛍️',
                `theme_color` VARCHAR(32) DEFAULT '#1e293b',
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `idx_slug` (`slug`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 2. Products Table (With JSON specifications)
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS `products` (
                `id` VARCHAR(128) NOT NULL,
                `store_slug` VARCHAR(64) NOT NULL,
                `store_name` VARCHAR(255) NOT NULL,
                `title` VARCHAR(255) NOT NULL,
                `price` INT NOT NULL DEFAULT 0,
                `category` VARCHAR(64) NOT NULL DEFAULT 'tshirt',
                `slot` VARCHAR(32) NOT NULL DEFAULT 'slot_top',
                `image_url` LONGTEXT NOT NULL,
                `placement_json` LONGTEXT NOT NULL,
                `spec_json` LONGTEXT NOT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                KEY `idx_store` (`store_slug`),
                KEY `idx_slot` (`slot`),
                KEY `idx_category` (`category`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed default store if table is empty
        $count = $this->pdo->query("SELECT COUNT(*) FROM `stores`")->fetchColumn();
        if ($count == 0) {
            $stmt = $this->pdo->prepare("
                INSERT INTO `stores` (`id`, `slug`, `name_fa`, `name_en`, `city`, `description`, `badge`, `logo_emoji`, `theme_color`)
                VALUES (:id, :slug, :name_fa, :name_en, :city, :description, :badge, :logo_emoji, :theme_color)
            ");
            $stmt->execute([
                ':id' => 'store-zara',
                ':slug' => 'zara-modern',
                ':name_fa' => 'زارا استودیو مدرن',
                ':name_en' => 'ZARA Modern Studio',
                ':city' => 'تهران - سعادت‌آباد',
                ':description' => 'کالکشن جدید مینیمال و ترند روز',
                ':badge' => 'برند بین‌المللی',
                ':logo_emoji' => '🏛️',
                ':theme_color' => '#1e293b'
            ]);
        }
    }

    /**
     * Get All Products for a given store and/or slot
     */
    public function getProducts($storeSlug = null, $slot = null) {
        if ($this->isMysql && $this->pdo) {
            try {
                $sql = "SELECT * FROM `products` WHERE 1=1";
                $params = [];

                if ($storeSlug && $storeSlug !== 'all') {
                    $sql .= " AND `store_slug` = :store_slug";
                    $params[':store_slug'] = $storeSlug;
                }
                if ($slot && $slot !== 'all') {
                    $sql .= " AND `slot` = :slot";
                    $params[':slot'] = $slot;
                }
                $sql .= " ORDER BY `created_at` DESC";

                $stmt = $this->pdo->prepare($sql);
                $stmt->execute($params);
                $rows = $stmt->fetchAll();

                return array_map(function($r) {
                    return [
                        'id' => $r['id'],
                        'storeSlug' => $r['store_slug'],
                        'storeName' => $r['store_name'],
                        'title' => $r['title'],
                        'price' => (int)$r['price'],
                        'category' => $r['category'],
                        'slot' => $r['slot'],
                        'imageUrl' => $r['image_url'],
                        'placement' => json_decode($r['placement_json'], true) ?: [],
                        'spec' => json_decode($r['spec_json'], true) ?: [],
                        'createdAt' => $r['created_at'],
                    ];
                }, $rows);
            } catch (Exception $e) {
                error_log('[DB Error] getProducts query failed: ' . $e->getMessage());
            }
        }

        // File-based fallback
        if (file_exists($this->productsFile)) {
            $raw = @file_get_contents($this->productsFile);
            $list = @json_decode($raw, true) ?: [];
            if ($storeSlug && $storeSlug !== 'all') {
                $list = array_filter($list, function($p) use ($storeSlug) {
                    return isset($p['storeSlug']) && $p['storeSlug'] === $storeSlug;
                });
            }
            if ($slot && $slot !== 'all') {
                $list = array_filter($list, function($p) use ($slot) {
                    return isset($p['slot']) && $p['slot'] === $slot;
                });
            }
            return array_values($list);
        }

        return [];
    }

    /**
     * Create/Insert Product into Database
     */
    public function createProduct($product) {
        $id = $product['id'] ?? ('prod-' . time() . '-' . rand(100, 999));
        $storeSlug = $product['storeSlug'] ?? 'zara-modern';
        $storeName = $product['storeName'] ?? 'فروشگاه اختصاصی';
        $title = $product['title'] ?? 'لباس جدید';
        $price = (int)($product['price'] ?? 0);
        $category = $product['category'] ?? 'tshirt';
        $slot = $product['slot'] ?? 'slot_top';
        $imageUrl = $product['imageUrl'] ?? '';
        $placementJson = json_encode($product['placement'] ?? [], JSON_UNESCAPED_UNICODE);
        $specJson = json_encode($product['spec'] ?? [], JSON_UNESCAPED_UNICODE);
        $createdAt = $product['createdAt'] ?? date('c');

        $normalizedProduct = [
            'id' => $id,
            'storeSlug' => $storeSlug,
            'storeName' => $storeName,
            'title' => $title,
            'price' => $price,
            'category' => $category,
            'slot' => $slot,
            'imageUrl' => $imageUrl,
            'placement' => $product['placement'] ?? [],
            'spec' => $product['spec'] ?? [],
            'createdAt' => $createdAt,
        ];

        // 1. MySQL Insert
        if ($this->isMysql && $this->pdo) {
            try {
                $stmt = $this->pdo->prepare("
                    INSERT INTO `products` 
                    (`id`, `store_slug`, `store_name`, `title`, `price`, `category`, `slot`, `image_url`, `placement_json`, `spec_json`, `created_at`)
                    VALUES 
                    (:id, :store_slug, :store_name, :title, :price, :category, :slot, :image_url, :placement_json, :spec_json, :created_at)
                    ON DUPLICATE KEY UPDATE
                    `title` = VALUES(`title`),
                    `price` = VALUES(`price`),
                    `image_url` = VALUES(`image_url`),
                    `placement_json` = VALUES(`placement_json`),
                    `spec_json` = VALUES(`spec_json`)
                ");
                $stmt->execute([
                    ':id' => $id,
                    ':store_slug' => $storeSlug,
                    ':store_name' => $storeName,
                    ':title' => $title,
                    ':price' => $price,
                    ':category' => $category,
                    ':slot' => $slot,
                    ':image_url' => $imageUrl,
                    ':placement_json' => $placementJson,
                    ':spec_json' => $specJson,
                    ':created_at' => date('Y-m-d H:i:s', strtotime($createdAt)),
                ]);
            } catch (Exception $e) {
                error_log('[DB Error] createProduct MySQL insert failed: ' . $e->getMessage());
            }
        }

        // 2. Always maintain backup in products.json
        $existing = [];
        if (file_exists($this->productsFile)) {
            $existing = @json_decode(@file_get_contents($this->productsFile), true) ?: [];
        }
        $existing = array_filter($existing, function($p) use ($id) { return $p['id'] !== $id; });
        array_unshift($existing, $normalizedProduct);
        @file_put_contents($this->productsFile, json_encode(array_values($existing), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return $normalizedProduct;
    }

    /**
     * Delete Product from Database
     */
    public function deleteProduct($id) {
        if ($this->isMysql && $this->pdo) {
            try {
                $stmt = $this->pdo->prepare("DELETE FROM `products` WHERE `id` = :id");
                $stmt->execute([':id' => $id]);
            } catch (Exception $e) {
                error_log('[DB Error] deleteProduct MySQL failed: ' . $e->getMessage());
            }
        }

        if (file_exists($this->productsFile)) {
            $existing = @json_decode(@file_get_contents($this->productsFile), true) ?: [];
            $existing = array_filter($existing, function($p) use ($id) { return $p['id'] !== $id; });
            @file_put_contents($this->productsFile, json_encode(array_values($existing), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        return true;
    }
}
