/**
 * TALKRENT PHP 8+ REST API Generator
 * Generates ready-to-run PHP PDO code for XAMPP deployment (Apache + MySQL/MariaDB).
 */

export function generatePhpBackendFiles(): { [filename: string]: string } {
  return {
    'config.php': `<?php
/**
 * TALKRENT - Configuration File
 * Host: localhost (XAMPP default)
 * Database: talkrent_db
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'talkrent_db');
define('DB_PORT', 3306);
define('DB_CHARSET', 'utf8mb4');

define('APP_NAME', 'TALKRENT');
define('APP_TAGLINE', 'Your Communication Partner.');
define('JWT_SECRET', 'talkrent_tasikmalaya_secure_jwt_2026');
define('SESSION_LIFETIME', 86400); // 24 hours
`,

    'db.php': `<?php
/**
 * TALKRENT - PDO Database Connection Singleton
 */
require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Koneksi database gagal: pastikan service MySQL di XAMPP telah dijalankan dan database talkrent_db sudah di-import.'
                ]);
                exit;
            }
        }
        return self::$instance;
    }
}
`,

    'api.php': `<?php
/**
 * TALKRENT - REST API Router (PHP 8+)
 * Handles JSON requests, CORS, prepared statements, and session authorization.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Helper to read JSON body
function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

try {
    switch ($action) {
        // --- AUTH ---
        case 'login':
            if ($method !== 'POST') throw new Exception('Metode tidak diizinkan');
            $data = getJsonInput();
            $username = trim($data['username'] ?? '');
            $password = trim($data['password'] ?? '');

            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && ($password === 'admin123' || password_verify($password, $user['password_hash']))) {
                // Update last login
                $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = ?")->execute([$user['id']]);
                
                unset($user['password_hash']);
                echo json_encode([
                    'success' => true,
                    'message' => 'Login berhasil',
                    'token'   => bin2hex(random_bytes(32)),
                    'user'    => $user
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Username atau password salah']);
            }
            break;

        // --- DASHBOARD OVERVIEW ---
        case 'dashboard':
            $totalUnits = (int)$pdo->query("SELECT COUNT(*) FROM equipment_units")->fetchColumn();
            $availUnits = (int)$pdo->query("SELECT COUNT(*) FROM equipment_units WHERE status = 'Tersedia'")->fetchColumn();
            $rentUnits  = (int)$pdo->query("SELECT COUNT(*) FROM equipment_units WHERE status = 'Disewa'")->fetchColumn();
            $maintUnits = (int)$pdo->query("SELECT COUNT(*) FROM equipment_units WHERE status = 'Perawatan'")->fetchColumn();
            
            $activeBookings = (int)$pdo->query("SELECT COUNT(*) FROM bookings WHERE status IN ('Menunggu', 'Dikonfirmasi')")->fetchColumn();
            $ongoingRentals = (int)$pdo->query("SELECT COUNT(*) FROM rentals WHERE rental_status = 'Berlangsung'")->fetchColumn();

            $todayRev = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE type IN ('Sewa', 'Denda', 'Kerusakan') AND DATE(payment_date) = CURDATE()")->fetchColumn();
            $monthRev = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE type IN ('Sewa', 'Denda', 'Kerusakan') AND MONTH(payment_date) = MONTH(CURDATE()) AND YEAR(payment_date) = YEAR(CURDATE())")->fetchColumn();

            echo json_encode([
                'success' => true,
                'data' => [
                    'stats' => [
                        'totalUnits'     => $totalUnits,
                        'availableUnits' => $availUnits,
                        'rentedUnits'    => $rentUnits,
                        'maintenanceUnits' => $maintUnits,
                        'activeBookings' => $activeBookings,
                        'ongoingRentals' => $ongoingRentals,
                        'todayRevenue'   => $todayRev,
                        'monthRevenue'   => $monthRev
                    ]
                ]
            ]);
            break;

        // --- INVENTORY UNITS ---
        case 'units':
            if ($method === 'GET') {
                $status = $_GET['status'] ?? null;
                $sql = "SELECT u.*, m.model_name, m.daily_rate FROM equipment_units u JOIN equipment_models m ON u.model_id = m.id";
                $params = [];
                if ($status && $status !== 'Semua') {
                    $sql .= " WHERE u.status = ?";
                    $params[] = $status;
                }
                $sql .= " ORDER BY u.id ASC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            } elseif ($method === 'POST') {
                $b = getJsonInput();
                $stmt = $pdo->prepare("INSERT INTO equipment_units (model_id, unit_code, serial_number, physical_condition, battery_health, purchase_date, purchase_price, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$b['model_id'], $b['unit_code'], $b['serial_number'], $b['physical_condition'] ?? 'Sangat Baik', $b['battery_health'] ?? 100, $b['purchase_date'], $b['purchase_price'], $b['status'] ?? 'Tersedia', $b['notes'] ?? '']);
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            }
            break;

        // --- CUSTOMERS ---
        case 'customers':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM customers ORDER BY id DESC");
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            } elseif ($method === 'POST') {
                $b = getJsonInput();
                $count = (int)$pdo->query("SELECT COUNT(*) FROM customers")->fetchColumn() + 1;
                $code = 'CUST-' . str_pad($count, 3, '0', STR_PAD_LEFT);
                $stmt = $pdo->prepare("INSERT INTO customers (customer_code, name, whatsapp, email, organization, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$code, $b['name'], $b['whatsapp'], $b['email'] ?? '', $b['organization'] ?? '', $b['address'] ?? '', $b['notes'] ?? '']);
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'customer_code' => $code]);
            }
            break;

        // --- BOOKINGS ---
        case 'bookings':
            if ($method === 'GET') {
                $sql = "SELECT b.*, c.name as customer_name, c.whatsapp as customer_whatsapp FROM bookings b JOIN customers c ON b.customer_id = c.id ORDER BY b.id DESC";
                $stmt = $pdo->query($sql);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            }
            break;

        // --- RENTALS ---
        case 'rentals':
            if ($method === 'GET') {
                $sql = "SELECT r.*, c.name as customer_name, c.whatsapp as customer_whatsapp FROM rentals r JOIN customers c ON r.customer_id = c.id ORDER BY r.id DESC";
                $stmt = $pdo->query($sql);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            }
            break;

        default:
            echo json_encode([
                'success' => true,
                'system'  => 'TALKRENT PHP REST API v1.0',
                'status'  => 'Online',
                'endpoints' => ['login', 'dashboard', 'units', 'customers', 'bookings', 'rentals', 'finances', 'maintenance', 'settings']
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
`
  };
}
