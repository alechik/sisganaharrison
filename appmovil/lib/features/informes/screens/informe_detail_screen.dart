import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/utils/date_format.dart';
import '../../../core/widgets/status_chip.dart';
import '../../auth/state/auth_controller.dart';
import '../models/informe_diario.dart';
import '../services/informe_service.dart';
import '../state/notification_controller.dart';
import 'informe_form_screen.dart';

class InformeDetailScreen extends StatefulWidget {
  const InformeDetailScreen({super.key, required this.informeId});

  final int informeId;

  @override
  State<InformeDetailScreen> createState() => _InformeDetailScreenState();
}

class _InformeDetailScreenState extends State<InformeDetailScreen> {
  InformeDiario? _informe;
  String? _error;
  bool _loading = true;
  bool _reviewing = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final informe = await context.read<InformeService>().show(widget.informeId);
      setState(() {
        _informe = informe;
        _loading = false;
      });
    } on ApiException catch (error) {
      setState(() {
        _error = error.message;
        _loading = false;
      });
    }
  }

  Future<void> _review() async {
    final informe = _informe;
    if (informe == null || informe.estaRevisado) {
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Marcar como revisado'),
        content: Text(
          '¿Desea marcar el informe ${informe.codigoInforme} como revisado? El trabajador ya no podrá modificarlo.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Revisado')),
        ],
      ),
    );

    if (confirmed != true || !mounted) {
      return;
    }

    setState(() => _reviewing = true);
    try {
      final updated = await context.read<InformeService>().revisar(informe.id);
      if (!mounted) {
        return;
      }
      setState(() {
        _informe = updated;
        _reviewing = false;
      });
      await context.read<NotificationController>().refresh(canReview: true);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Informe marcado como revisado.')),
      );
    } on ApiException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() => _reviewing = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final informe = _informe;
    final canEdit = auth.user?.canCreateInformes == true &&
        informe != null &&
        !informe.estaRevisado &&
        auth.user?.id == informe.userTrabajadorId;
    final canReview = auth.user?.canReviewInformes == true;

    return Scaffold(
      appBar: AppBar(
        title: Text(informe?.codigoInforme ?? 'Informe diario'),
        actions: [
          if (canEdit)
            IconButton(
              tooltip: 'Editar',
              onPressed: () async {
                final changed = await Navigator.of(context).push<bool>(
                  MaterialPageRoute(
                    builder: (_) => InformeFormScreen(informeId: informe.id),
                  ),
                );
                if (changed == true) {
                  await _load();
                }
              },
              icon: const Icon(Icons.edit_outlined),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!)))
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            informe!.codigoInforme,
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                          ),
                        ),
                        StatusChip(revisado: informe.revisado),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _row('Trabajador', informe.trabajador?.nombre ?? '—'),
                    _row('Fecha', formatDate(informe.fecha)),
                    _row('Revisor', informe.revisor?.nombre ?? '—'),
                    _row('Fecha de revisión', formatDate(informe.fechaRevision)),
                    const SizedBox(height: 16),
                    Text('Detalle del informe', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    Text(informe.detalleInforme),
                    if (canReview) ...[
                      const SizedBox(height: 28),
                      FilledButton(
                        onPressed: informe.estaRevisado || _reviewing ? null : _review,
                        child: _reviewing
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
                              )
                            : const Text('Revisado'),
                      ),
                    ],
                  ],
                ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
