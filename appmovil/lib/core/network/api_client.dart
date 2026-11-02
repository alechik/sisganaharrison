import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import 'api_exception.dart';

typedef TokenReader = Future<String?> Function();
typedef UnauthorizedHandler = Future<void> Function();

class ApiClient {
  ApiClient({
    http.Client? httpClient,
    this._tokenReader,
    this._onUnauthorized,
    String? baseUrl,
  })  : _httpClient = httpClient ?? http.Client(),
        _baseUrl = baseUrl ?? ApiConfig.baseUrl;

  final http.Client _httpClient;
  final TokenReader? _tokenReader;
  final UnauthorizedHandler? _onUnauthorized;
  final String _baseUrl;

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? query,
  }) {
    return _send('GET', path, query: query);
  }

  Future<Map<String, dynamic>> post(String path, {Object? body}) {
    return _send('POST', path, body: body);
  }

  Future<Map<String, dynamic>> put(String path, {Object? body}) {
    return _send('PUT', path, body: body);
  }

  Future<Map<String, dynamic>> patch(String path, {Object? body}) {
    return _send('PATCH', path, body: body);
  }

  Future<Map<String, dynamic>> _send(
    String method,
    String path, {
    Map<String, dynamic>? query,
    Object? body,
  }) async {
    final filteredQuery = <String, String>{};
    query?.forEach((key, value) {
      if (value == null) {
        return;
      }
      final text = value.toString();
      if (text.isNotEmpty) {
        filteredQuery[key] = text;
      }
    });

    final uri = Uri.parse('$_baseUrl$path').replace(
      queryParameters: filteredQuery.isEmpty ? null : filteredQuery,
    );

    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    final token = await _tokenReader?.call();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    late http.Response response;
    try {
      final request = http.Request(method, uri)..headers.addAll(headers);
      if (body != null) {
        request.body = jsonEncode(body);
      }
      final streamed = await _httpClient.send(request).timeout(const Duration(seconds: 25));
      response = await http.Response.fromStream(streamed);
    } on TimeoutException {
      throw const ApiException('La solicitud tardó demasiado. Intente nuevamente.');
    } on http.ClientException {
      throw const ApiException(
        'No se pudo conectar con el servidor. Verifique su conexión.',
      );
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw const ApiException(
        'No se pudo conectar con el servidor. Verifique su conexión.',
      );
    }

    return _decode(response);
  }

  Future<Map<String, dynamic>> _decode(http.Response response) async {
    Map<String, dynamic> payload = {};
    if (response.body.isNotEmpty) {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        payload = decoded;
      } else if (decoded is List) {
        payload = {'data': decoded};
      }
    }

    if (response.statusCode == 401) {
      await _onUnauthorized?.call();
      throw ApiException(
        payload['message']?.toString() ?? 'Sesión expirada. Inicie sesión nuevamente.',
        statusCode: 401,
      );
    }

    if (response.statusCode >= 400) {
      throw ApiException(_errorMessage(payload, response.statusCode), statusCode: response.statusCode);
    }

    return payload;
  }

  String _errorMessage(Map<String, dynamic> payload, int statusCode) {
    final errors = payload['errors'];
    if (errors is Map && errors.isNotEmpty) {
      final first = errors.values.first;
      if (first is List && first.isNotEmpty) {
        return first.first.toString();
      }
    }

    final message = payload['message']?.toString();
    if (message != null && message.isNotEmpty) {
      return message;
    }

    if (statusCode == 403) {
      return 'No tiene permiso para realizar esta acción.';
    }
    if (statusCode == 404) {
      return 'El recurso solicitado no existe.';
    }
    if (statusCode == 422) {
      return 'Revise los datos ingresados.';
    }
    return 'Ocurrió un error inesperado ($statusCode).';
  }
}
