class InformeUsuario {
  const InformeUsuario({required this.id, required this.nombre});

  final int id;
  final String nombre;

  factory InformeUsuario.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const InformeUsuario(id: 0, nombre: '—');
    }
    return InformeUsuario(
      id: (json['id'] as num?)?.toInt() ?? 0,
      nombre: json['nombre']?.toString() ?? '—',
    );
  }
}

class InformeDiario {
  const InformeDiario({
    required this.id,
    required this.codigoInforme,
    required this.detalleInforme,
    required this.revisado,
    required this.fecha,
    required this.userTrabajadorId,
    this.fechaRevision,
    this.userRevisorId,
    this.trabajador,
    this.revisor,
  });

  final int id;
  final String codigoInforme;
  final String detalleInforme;
  final String revisado;
  final String fecha;
  final String? fechaRevision;
  final int userTrabajadorId;
  final int? userRevisorId;
  final InformeUsuario? trabajador;
  final InformeUsuario? revisor;

  bool get estaRevisado => revisado.toUpperCase() == 'SI';

  factory InformeDiario.fromJson(Map<String, dynamic> json) {
    return InformeDiario(
      id: (json['id'] as num?)?.toInt() ?? 0,
      codigoInforme: json['codigo_informe']?.toString() ?? '',
      detalleInforme: json['detalle_informe']?.toString() ?? '',
      revisado: json['revisado']?.toString() ?? 'NO',
      fecha: json['fecha']?.toString() ?? '',
      fechaRevision: json['fecha_revision']?.toString(),
      userTrabajadorId: (json['user_trabajador_id'] as num?)?.toInt() ?? 0,
      userRevisorId: (json['user_revisor_id'] as num?)?.toInt(),
      trabajador: json['trabajador'] is Map
          ? InformeUsuario.fromJson(Map<String, dynamic>.from(json['trabajador'] as Map))
          : null,
      revisor: json['revisor'] is Map
          ? InformeUsuario.fromJson(Map<String, dynamic>.from(json['revisor'] as Map))
          : null,
    );
  }
}

class PaginatedInformes {
  const PaginatedInformes({
    required this.data,
    required this.currentPage,
    required this.lastPage,
    required this.total,
  });

  final List<InformeDiario> data;
  final int currentPage;
  final int lastPage;
  final int total;

  bool get hasMore => currentPage < lastPage;

  factory PaginatedInformes.fromJson(Map<String, dynamic> json) {
    final items = (json['data'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => InformeDiario.fromJson(Map<String, dynamic>.from(item)))
        .toList();
    final meta = json['meta'] is Map ? Map<String, dynamic>.from(json['meta'] as Map) : <String, dynamic>{};

    return PaginatedInformes(
      data: items,
      currentPage: (meta['current_page'] as num?)?.toInt() ?? 1,
      lastPage: (meta['last_page'] as num?)?.toInt() ?? 1,
      total: (meta['total'] as num?)?.toInt() ?? items.length,
    );
  }
}

class InformePendiente {
  const InformePendiente({
    required this.id,
    required this.codigoInforme,
    this.fecha,
    this.trabajadorNombre,
  });

  final int id;
  final String codigoInforme;
  final String? fecha;
  final String? trabajadorNombre;

  factory InformePendiente.fromJson(Map<String, dynamic> json) {
    final trabajador = json['trabajador'];
    return InformePendiente(
      id: (json['id'] as num?)?.toInt() ?? 0,
      codigoInforme: json['codigo_informe']?.toString() ?? '',
      fecha: json['fecha']?.toString(),
      trabajadorNombre: trabajador is Map ? trabajador['nombre']?.toString() : null,
    );
  }
}
