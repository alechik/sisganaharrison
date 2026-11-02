class AppNotification {
  const AppNotification({
    required this.tipo,
    required this.titulo,
    required this.mensaje,
    required this.ruta,
  });

  final String tipo;
  final String titulo;
  final String mensaje;
  final String ruta;

  int? get informeId {
    final match = RegExp(r'informe_diario_pendiente_(\d+)').firstMatch(tipo);
    if (match != null) {
      return int.tryParse(match.group(1)!);
    }
    final path = RegExp(r'/informes-diarios/(\d+)').firstMatch(ruta);
    if (path != null) {
      return int.tryParse(path.group(1)!);
    }
    return null;
  }

  bool get isInformePendiente => tipo.startsWith('informe_diario_pendiente_');

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      tipo: json['tipo']?.toString() ?? '',
      titulo: json['titulo']?.toString() ?? 'Notificación',
      mensaje: json['mensaje']?.toString() ?? '',
      ruta: json['ruta']?.toString() ?? '',
    );
  }
}

class AuthUser {
  const AuthUser({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.email,
    required this.roles,
    required this.permissions,
    this.notificaciones = const [],
  });

  final int id;
  final String nombre;
  final String apellido;
  final String email;
  final List<String> roles;
  final List<String> permissions;
  final List<AppNotification> notificaciones;

  String get nombreCompleto {
    final full = '$nombre $apellido'.trim();
    return full.isEmpty ? email : full;
  }

  bool hasRole(String role) => roles.contains(role);

  bool get isTrabajador => hasRole('trabajador');

  bool get isGestor =>
      hasRole('administrador') || hasRole('gerencia') || hasRole('super-admin');

  bool get canViewInformes => isTrabajador || isGestor;

  bool get canCreateInformes => isTrabajador;

  bool get canReviewInformes => isGestor;

  int get informesPendientesCount =>
      notificaciones.where((item) => item.isInformePendiente).length;

  factory AuthUser.fromJson({
    required Map<String, dynamic> user,
    List<dynamic>? roles,
    List<dynamic>? permissions,
    List<dynamic>? notificaciones,
  }) {
    return AuthUser(
      id: (user['id'] as num?)?.toInt() ?? 0,
      nombre: user['nombre']?.toString() ?? '',
      apellido: user['apellido']?.toString() ?? '',
      email: user['email']?.toString() ?? '',
      roles: _stringList(roles),
      permissions: _stringList(permissions),
      notificaciones: (notificaciones ?? const [])
          .whereType<Map>()
          .map((item) => AppNotification.fromJson(Map<String, dynamic>.from(item)))
          .toList(),
    );
  }

  static List<String> _stringList(List<dynamic>? values) {
    if (values == null) {
      return const [];
    }
    return values.map((item) => item.toString()).toList();
  }
}
