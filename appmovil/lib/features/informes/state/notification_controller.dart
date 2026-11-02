import 'package:flutter/foundation.dart';

import '../../../core/network/api_exception.dart';
import '../models/informe_diario.dart';
import '../services/informe_service.dart';

class NotificationController extends ChangeNotifier {
  NotificationController(this._service);

  final InformeService _service;

  List<InformePendiente> items = [];
  bool loading = false;
  String? error;

  int get count => items.length;

  Future<void> refresh({required bool canReview}) async {
    if (!canReview) {
      items = [];
      notifyListeners();
      return;
    }

    loading = true;
    error = null;
    notifyListeners();

    try {
      items = await _service.pendientes();
    } on ApiException catch (err) {
      if (err.isForbidden) {
        items = [];
      } else {
        error = err.message;
      }
    } finally {
      loading = false;
      notifyListeners();
    }
  }
}
