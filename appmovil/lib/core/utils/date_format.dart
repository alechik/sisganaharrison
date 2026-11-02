import 'package:intl/intl.dart';

String formatDate(String? value) {
  if (value == null || value.isEmpty) {
    return '—';
  }

  final parsed = DateTime.tryParse(value);
  if (parsed == null) {
    return value;
  }

  return DateFormat('dd/MM/yyyy').format(parsed);
}

String todayIsoDate() {
  return isoDate(DateTime.now());
}

String isoDate(DateTime date) {
  return DateFormat('yyyy-MM-dd').format(date);
}
