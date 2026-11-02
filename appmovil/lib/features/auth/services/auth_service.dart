import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_store.dart';
import '../models/auth_user.dart';

class AuthService {
  AuthService({
    required ApiClient apiClient,
    required SecureStore secureStore,
  })  : _api = apiClient,
        _store = secureStore;

  static const tokenKey = 'auth_token';

  final ApiClient _api;
  final SecureStore _store;

  Future<String?> readToken() => _store.read(tokenKey);

  Future<AuthUser> login(String email, String password) async {
    final payload = await _api.post('/auth/login', body: {
      'email': email.trim(),
      'password': password,
    });

    final token = payload['token']?.toString();
    if (token == null || token.isEmpty) {
      throw StateError('El servidor no devolvió un token de acceso.');
    }

    await _store.write(tokenKey, token);
    return _userFromPayload(payload);
  }

  Future<AuthUser> me() async {
    final payload = await _api.get('/auth/me');
    return _userFromPayload(payload);
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } finally {
      await clearSession();
    }
  }

  Future<void> clearSession() => _store.delete(tokenKey);

  AuthUser _userFromPayload(Map<String, dynamic> payload) {
    final user = payload['user'];
    if (user is! Map) {
      throw StateError('Respuesta de autenticación incompleta.');
    }

    return AuthUser.fromJson(
      user: Map<String, dynamic>.from(user),
      roles: payload['roles'] as List<dynamic>?,
      permissions: payload['permissions'] as List<dynamic>?,
      notificaciones: payload['notificaciones'] as List<dynamic>?,
    );
  }
}
