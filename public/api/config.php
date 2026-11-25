<?php
// Database Configuration Manager for cPanel MySQL / MariaDB
// Allows settings via file, environment variables, or Web Setup Wizard.

$configFile = __DIR__ . '/data/db_config.json';
$defaultConfig = [
    'driver' => 'mysql',
    'host' => 'localhost',
    'port' => 3306,
    'database' => '',
    'username' => '',
    'password' => '',
    'charset' => 'utf8mb4'
];

if (file_exists($configFile)) {
    $raw = @file_get_contents($configFile);
    $saved = @json_decode($raw, true);
    if (is_array($saved)) {
        $defaultConfig = array_merge($defaultConfig, $saved);
    }
}

// Allow environment variable overrides
if (getenv('DB_HOST')) $defaultConfig['host'] = getenv('DB_HOST');
if (getenv('DB_NAME')) $defaultConfig['database'] = getenv('DB_NAME');
if (getenv('DB_USER')) $defaultConfig['username'] = getenv('DB_USER');
if (getenv('DB_PASS')) $defaultConfig['password'] = getenv('DB_PASS');

return $defaultConfig;
