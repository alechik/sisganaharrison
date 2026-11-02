import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/utils/date_format.dart';
import '../../../core/utils/validators.dart';
import '../models/informe_diario.dart';
import '../services/informe_service.dart';
import '../state/notification_controller.dart';
import '../../auth/state/auth_controller.dart';

class InformeFormScreen extends StatefulWidget {
  const InformeFormScreen({super.key, this.informeId});

  final int? informeId;

  @override
  State<InformeFormScreen> createState() => _InformeFormScreenState();
}

class _InformeFormScreenState extends State<InformeFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _detalle = TextEditingController();
  DateTime _fecha = DateTime.now();
  InformeDiario? _informe;
  String? _error;
  bool _loading = false;
  bool _saving = false;
  bool _blocked = false;

  bool get _isEdit => widget.informeId != null;

  @override
  void initState() {
    super.initState();
    if (_isEdit) {
      _load();
    }
  }

  @override
  void dispose() {
    _detalle.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final informe = await context.read<InformeService>().show(widget.informeId!);
      _informe = informe;
      _detalle.text = informe.detalleInforme;
      _fecha = DateTime.tryParse(informe.fecha) ?? DateTime.now();
      _blocked = informe.estaRevisado;
      _error = null;
    } on ApiException catch (error) {
      _error = error.message;
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _pickFecha() async {
    if (_blocked) {
      return;
    }
    final selected = await showDatePicker(
      context: context,
      initialDate: _fecha,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 1)),
    );
    if (selected != null) {
      setState(() => _fecha = selected);
    }
  }

  Future<void> _submit() async {
    if (_blocked || _saving) {
      return;
    }
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    final iso = isoDate(_fecha);

    try {
      final service = context.read<InformeService>();
      if (_isEdit) {
        await service.update(id: widget.informeId!, fecha: iso, detalle: _detalle.text.trim());
      } else {
        await service.create(fecha: iso, detalle: _detalle.text.trim());
        if (mounted) {
          await context.read<NotificationController>().refresh(
                canReview: context.read<AuthController>().user?.canReviewInformes ?? false,
              );
        }
      }
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_isEdit ? 'Informe actualizado.' : 'Informe registrado correctamente.')),
      );
      Navigator.of(context).pop(true);
    } on ApiException catch (error) {
      setState(() {
        _error = error.message;
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isEdit ? 'Editar informe' : 'Nuevo informe diario')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  if (_blocked)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 16),
                      child: Text('El informe ya fue revisado y no puede modificarse.'),
                    ),
                  if (_isEdit) ...[
                    Text('Código', style: Theme.of(context).textTheme.bodySmall),
                    Text(_informe?.codigoInforme ?? '—', style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    Text('Trabajador', style: Theme.of(context).textTheme.bodySmall),
                    Text(_informe?.trabajador?.nombre ?? '—', style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 12),
                    Text('Revisado', style: Theme.of(context).textTheme.bodySmall),
                    Text(_informe?.revisado ?? 'NO', style: const TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 16),
                  ],
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Fecha'),
                    subtitle: Text(formatDate(isoDate(_fecha))),
                    trailing: const Icon(Icons.calendar_today_outlined),
                    enabled: !_blocked,
                    onTap: _pickFecha,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _detalle,
                    enabled: !_blocked,
                    maxLines: 8,
                    validator: (value) => Validators.requiredText(value, label: 'El detalle del informe'),
                    decoration: const InputDecoration(
                      labelText: 'Detalle del informe',
                      alignLabelWithHint: true,
                      hintText: 'Eventos y actividades de la jornada',
                    ),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 16),
                    Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  ],
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: _blocked || _saving ? null : _submit,
                    child: _saving
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
                          )
                        : Text(_isEdit ? 'Actualizar informe' : 'Registrar informe'),
                  ),
                ],
              ),
            ),
    );
  }
}
