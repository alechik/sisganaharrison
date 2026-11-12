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

## Docker (Flutter Web)

El contenedor `appmovil` compila la app a web y la sirve con Nginx en el puerto `8081`. Reenvía `/api` al reverse proxy principal, por lo que usa el mismo origen y no requiere CORS.

```bash
docker compose build appmovil
docker compose up -d appmovil
```

Luego abrir `http://localhost:8081`. Para cambiar el puerto, definir `MOVIL_PORT` en `.env`. Este servicio es independiente del frontend React: no lo reemplaza ni modifica su puerto.
