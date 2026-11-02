import 'package:flutter/foundation.dart';

import '../../../core/network/api_exception.dart';
import '../models/informe_diario.dart';
import '../services/informe_service.dart';

class InformeListController extends ChangeNotifier {
  InformeListController(this._service);

  final InformeService _service;

  List<InformeDiario> items = [];
  bool loading = false;
  bool loadingMore = false;
  String? error;
  int page = 1;
  int lastPage = 1;
  int total = 0;
  String search = '';
  String? revisado;
  String? fechaDesde;
  String? fechaHasta;

  Future<void> load({bool refresh = true}) async {
    if (refresh) {
      page = 1;
      loading = true;
      error = null;
      notifyListeners();
    } else {
      loadingMore = true;
      notifyListeners();
    }

    try {
      final result = await _service.list(
        page: page,
        search: search,
        revisado: revisado,
        fechaDesde: fechaDesde,
        fechaHasta: fechaHasta,
      );
      items = refresh ? result.data : [...items, ...result.data];
      lastPage = result.lastPage;
      total = result.total;
      error = null;
    } on ApiException catch (err) {
      error = err.message;
      if (refresh) {
        items = [];
      }
    } finally {
      loading = false;
      loadingMore = false;
      notifyListeners();
    }
  }

  Future<void> loadMore() async {
    if (loading || loadingMore || page >= lastPage) {
      return;
    }
    page += 1;
    await load(refresh: false);
  }

  void applyFilters({
    String? searchText,
    String? revisadoValue,
    String? from,
    String? to,
  }) {
    search = searchText ?? search;
    revisado = revisadoValue;
    fechaDesde = from;
    fechaHasta = to;
    load();
  }
}
