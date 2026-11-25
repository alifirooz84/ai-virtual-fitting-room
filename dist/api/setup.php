<?php
// One-Click cPanel MySQL Database Setup & Table Installer
// Multi-Store AI Virtual Fitting Room

header('Content-Type: text/html; charset=utf-8');

$configFile = __DIR__ . '/data/db_config.json';
$dataDir = __DIR__ . '/data';
if (!file_exists($dataDir)) {
    @mkdir($dataDir, 0777, true);
}

$currentConfig = [
    'host' => 'localhost',
    'port' => 3306,
    'database' => '',
    'username' => '',
    'password' => ''
];

if (file_exists($configFile)) {
    $saved = json_decode(@file_get_contents($configFile), true);
    if (is_array($saved)) {
        $currentConfig = array_merge($currentConfig, $saved);
    }
}

$message = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $host = trim($_POST['host'] ?? 'localhost');
    $port = (int)($_POST['port'] ?? 3306);
    $database = trim($_POST['database'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($database) || empty($username)) {
        $error = 'لطفاً نام دیتابیس و نام کاربری را وارد کنید.';
    } else {
        try {
            $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $database);
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ]);

            // 1. Create Tables
            $pdo->exec("
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

            $pdo->exec("
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

            // 2. Save Config
            $saveData = [
                'driver' => 'mysql',
                'host' => $host,
                'port' => $port,
                'database' => $database,
                'username' => $username,
                'password' => $password,
                'charset' => 'utf8mb4'
            ];
            file_put_contents($configFile, json_encode($saveData, JSON_PRETTY_PRINT));
            $currentConfig = $saveData;

            // 3. Migrate any existing JSON products into MySQL
            $productsJsonFile = $dataDir . '/products.json';
            $migratedCount = 0;
            if (file_exists($productsJsonFile)) {
                $existingProducts = json_decode(@file_get_contents($productsJsonFile), true) ?: [];
                $stmt = $pdo->prepare("
                    INSERT INTO `products` 
                    (`id`, `store_slug`, `store_name`, `title`, `price`, `category`, `slot`, `image_url`, `placement_json`, `spec_json`, `created_at`)
                    VALUES 
                    (:id, :store_slug, :store_name, :title, :price, :category, :slot, :image_url, :placement_json, :spec_json, :created_at)
                    ON DUPLICATE KEY UPDATE `title` = VALUES(`title`)
                ");
                foreach ($existingProducts as $p) {
                    $stmt->execute([
                        ':id' => $p['id'],
                        ':store_slug' => $p['storeSlug'] ?? 'zara-modern',
                        ':store_name' => $p['storeName'] ?? 'فروشگاه اختصاصی',
                        ':title' => $p['title'] ?? 'لباس جدید',
                        ':price' => $p['price'] ?? 0,
                        ':category' => $p['category'] ?? 'tshirt',
                        ':slot' => $p['slot'] ?? 'slot_top',
                        ':image_url' => $p['imageUrl'] ?? '',
                        ':placement_json' => json_encode($p['placement'] ?? [], JSON_UNESCAPED_UNICODE),
                        ':spec_json' => json_encode($p['spec'] ?? [], JSON_UNESCAPED_UNICODE),
                        ':created_at' => date('Y-m-d H:i:s', strtotime($p['createdAt'] ?? 'now')),
                    ]);
                    $migratedCount++;
                }
            }

            $message = "اتصال با موفقیت برقرار شد! جداول `stores` و `products` در دیتابیس ساخته شدند ($migratedCount لباس موجود نیز به دیتابیس منتقل شد).";
        } catch (Exception $e) {
            $error = 'خطا در اتصال به دیتابیس MySQL: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>اتصال به دیتابیس MySQL هاست - پرو مجازی</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 30px 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
        }
        .card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            max-width: 540px;
            width: 100%;
            padding: 32px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
        }
        h1 {
            font-size: 20px;
            font-weight: 900;
            margin: 0 0 8px 0;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        p.subtitle {
            font-size: 13px;
            color: #64748b;
            margin: 0 0 24px 0;
            line-height: 1.6;
        }
        .form-group {
            margin-bottom: 16px;
        }
        label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: #334155;
            margin-bottom: 6px;
        }
        input {
            width: 100%;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            font-size: 13px;
            color: #0f172a;
            box-sizing: border-box;
            transition: all 0.2s;
            direction: ltr;
            text-align: left;
        }
        input:focus {
            outline: none;
            border-color: #f59e0b;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
        }
        button {
            width: 100%;
            padding: 14px;
            background: #0f172a;
            color: #ffffff;
            border: none;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 10px;
        }
        button:hover {
            background: #000000;
            transform: translateY(-1px);
        }
        .alert {
            padding: 14px;
            border-radius: 14px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .alert-success {
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        .alert-error {
            background: #fff1f2;
            color: #9f1239;
            border: 1px solid #fecdd3;
        }
        .badge {
            background: #fef3c7;
            color: #92400e;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
        }
        .links {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
        }
        .links a {
            color: #d97706;
            text-decoration: none;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>
            <span>🗄️ اتصال خودکار به دیتابیس MySQL هاست</span>
        </h1>
        <p class="subtitle">
            اطلاعات دیتابیس ساخته‌شده در cPanel (بخش MySQL Databases) را وارد کنید تا جداول و ستون‌های ذخیره‌سازی لباس‌ها و مشخصات JSON به طور خودکار ساخته شوند.
        </p>

        <?php if ($message): ?>
            <div class="alert alert-success">
                ✅ <?= htmlspecialchars($message) ?>
            </div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-error">
                ❌ <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label>آدرس هاست دیتابیس (Host):</label>
                <input type="text" name="host" value="<?= htmlspecialchars($currentConfig['host']) ?>" placeholder="localhost" required>
            </div>

            <div class="form-group">
                <label>نام دیتابیس (Database Name): <span class="badge">مثلا: jeanwalk_vton</span></label>
                <input type="text" name="database" value="<?= htmlspecialchars($currentConfig['database']) ?>" placeholder="jeanwalk_vton" required>
            </div>

            <div class="form-group">
                <label>نام کاربری دیتابیس (Username): <span class="badge">مثلا: jeanwalk_dbuser</span></label>
                <input type="text" name="username" value="<?= htmlspecialchars($currentConfig['username']) ?>" placeholder="jeanwalk_dbuser" required>
            </div>

            <div class="form-group">
                <label>رمز عبور دیتابیس (Password):</label>
                <input type="password" name="password" value="<?= htmlspecialchars($currentConfig['password']) ?>" placeholder="••••••••••••">
            </div>

            <button type="submit">
                ⚡ تست اتصال، ساخت خودکار جداول و اتصال دائم
            </button>
        </form>

        <div class="links">
            <a href="/">← بازگشت به استودیو پرو مجازی هوشمند (jeanwalk.ir)</a>
        </div>
    </div>
</body>
</html>
