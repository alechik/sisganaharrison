import 'package:flutter/foundation.dart';

class ApiConfig {
  const ApiConfig._();

  static const String _fromEnvironment = String.fromEnvironment('API_BASE_URL');

  /// Coincide con el cliente web (`http://127.0.0.1:8000/api`).
  /// En emulador Android se usa `10.0.2.2` para alcanzar el host.
  /// En Flutter web se usa el mismo hostname de la página (localhost → 127.0.0.1)
  /// para coincidir con `php artisan serve`.
  /// Sobrescribir con `--dart-define=API_BASE_URL=http://IP:8000/api`.
  static String get baseUrl {
    if (_fromEnvironment.isNotEmpty) {
      return _stripTrailingSlash(_fromEnvironment);
    }

    if (kIsWeb) {
      final host = Uri.base.host;
      final apiHost = (host.isEmpty || host == 'localhost') ? '127.0.0.1' : host;
      return 'http://$apiHost:8000/api';
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8000/api';
    }

    return 'http://127.0.0.1:8000/api';
  }

  static String _stripTrailingSlash(String value) {
    if (value.endsWith('/')) {
      return value.substring(0, value.length - 1);
    }
    return value;
  }
}
