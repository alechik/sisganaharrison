import 'package:flutter/foundation.dart';

import '../../../core/network/api_exception.dart';
import '../models/auth_user.dart';
import '../services/auth_service.dart';

enum AuthStatus { unknown, unauthenticated, authenticated }

class AuthController extends ChangeNotifier {
  AuthController(this._authService);

  final AuthService _authService;

  AuthStatus status = AuthStatus.unknown;
  AuthUser? user;
  String? errorMessage;
  bool busy = false;

  bool get isAuthenticated => status == AuthStatus.authenticated && user != null;

  Future<void> restoreSession() async {
    final token = await _authService.readToken();
    if (token == null || token.isEmpty) {
      status = AuthStatus.unauthenticated;
      notifyListeners();
      return;
    }

    try {
      user = await _authService.me();
      status = AuthStatus.authenticated;
      errorMessage = null;
    } on ApiException catch (error) {
      if (error.isUnauthorized) {
        await _authService.clearSession();
      }
      user = null;
      status = AuthStatus.unauthenticated;
    } catch (_) {
      user = null;
      status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    busy = true;
    errorMessage = null;
    notifyListeners();

    try {
      user = await _authService.login(email, password);
      status = AuthStatus.authenticated;
      busy = false;
      notifyListeners();
      return true;
    } on ApiException catch (error) {
      errorMessage = error.message;
    } catch (_) {
      errorMessage = 'No se pudo iniciar sesión. Intente nuevamente.';
    }

    status = AuthStatus.unauthenticated;
    busy = false;
    notifyListeners();
    return false;
  }

  Future<void> refreshProfile() async {
    if (!isAuthenticated) {
      return;
    }

    try {
      user = await _authService.me();
      notifyListeners();
    } on ApiException catch (error) {
      if (error.isUnauthorized) {
        await forceLogout();
      }
    }
  }

  Future<void> logout() async {
    busy = true;
    notifyListeners();
    try {
      await _authService.logout();
    } catch (_) {
      await _authService.clearSession();
    }
    user = null;
    status = AuthStatus.unauthenticated;
    busy = false;
    notifyListeners();
  }

  Future<void> forceLogout() async {
    await _authService.clearSession();
    user = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
