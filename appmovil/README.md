# Agropecuaria Harrison — app móvil

Cliente Flutter de autenticación e Informes Diarios. Consume la API Laravel (`/api`) con Sanctum Bearer. No duplica reglas de negocio.

## Arranque

Requiere el backend en `http://127.0.0.1:8000` (`php artisan serve` desde `backend/`).

```bash
cd appmovil
flutter pub get
flutter run -d chrome
```

Por defecto la API es `http://127.0.0.1:8000/api`. En emulador Android, `http://10.0.2.2:8000/api`. En un dispositivo físico: `php artisan serve --host=0.0.0.0` y `flutter run --dart-define=API_BASE_URL=http://IP_LAN:8000/api`.

El token se guarda con `flutter_secure_storage` (no SharedPreferences).
