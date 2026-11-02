import '../../../core/network/api_client.dart';
import '../models/informe_diario.dart';

class InformeService {
  InformeService(this._api);

  final ApiClient _api;

  Future<PaginatedInformes> list({
    int page = 1,
    String? search,
    String? revisado,
    String? fechaDesde,
    String? fechaHasta,
  }) async {
    final payload = await _api.get('/informes-diarios', query: {
      'page': page,
      'per_page': 10,
      'search': search,
      'revisado': revisado,
      'fecha_desde': fechaDesde,
      'fecha_hasta': fechaHasta,
      'sort_by': 'fecha',
      'sort_dir': 'desc',
    });
    return PaginatedInformes.fromJson(payload);
  }

  Future<InformeDiario> show(int id) async {
    final payload = await _api.get('/informes-diarios/$id');
    return InformeDiario.fromJson(Map<String, dynamic>.from(payload['data'] as Map));
  }

  Future<InformeDiario> create({required String fecha, required String detalle}) async {
    final payload = await _api.post('/informes-diarios', body: {
      'fecha': fecha,
      'detalle_informe': detalle,
    });
    return InformeDiario.fromJson(Map<String, dynamic>.from(payload['data'] as Map));
  }

  Future<InformeDiario> update({
    required int id,
    required String fecha,
    required String detalle,
  }) async {
    final payload = await _api.put('/informes-diarios/$id', body: {
      'fecha': fecha,
      'detalle_informe': detalle,
    });
    return InformeDiario.fromJson(Map<String, dynamic>.from(payload['data'] as Map));
  }

  Future<InformeDiario> revisar(int id) async {
    final payload = await _api.patch('/informes-diarios/$id/revisar');
    return InformeDiario.fromJson(Map<String, dynamic>.from(payload['data'] as Map));
  }

  Future<List<InformePendiente>> pendientes() async {
    final payload = await _api.get('/informes-diarios/pendientes');
    return (payload['data'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((item) => InformePendiente.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }
}
