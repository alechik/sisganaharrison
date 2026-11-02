import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/utils/date_format.dart';
import '../../../core/widgets/status_chip.dart';
import '../../auth/state/auth_controller.dart';
import '../state/informe_list_controller.dart';
import 'informe_detail_screen.dart';
import 'informe_form_screen.dart';

class InformeListScreen extends StatefulWidget {
  const InformeListScreen({super.key});

  @override
  State<InformeListScreen> createState() => _InformeListScreenState();
}

class _InformeListScreenState extends State<InformeListScreen> {
  final _search = TextEditingController();
  final _scroll = ScrollController();
  String? _revisado;
  DateTime? _desde;
  DateTime? _hasta;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<InformeListController>().load();
    });
  }

  @override
  void dispose() {
    _search.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 240) {
      context.read<InformeListController>().loadMore();
    }
  }

  Future<void> _pickDate({required bool from}) async {
    final selected = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (selected == null) {
      return;
    }
    setState(() {
      if (from) {
        _desde = selected;
      } else {
        _hasta = selected;
      }
    });
    _apply();
  }

  void _apply() {
    context.read<InformeListController>().applyFilters(
          searchText: _search.text.trim(),
          revisadoValue: _revisado,
          from: _desde == null ? null : isoDate(_desde!),
          to: _hasta == null ? null : isoDate(_hasta!),
        );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final list = context.watch<InformeListController>();
    final canCreate = auth.user?.canCreateInformes ?? false;

    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _search,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => _apply(),
              decoration: InputDecoration(
                hintText: 'Buscar por código o contenido',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  onPressed: _apply,
                  icon: const Icon(Icons.arrow_forward),
                ),
              ),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                FilterChip(
                  label: const Text('Todos'),
                  selected: _revisado == null,
                  onSelected: (_) {
                    setState(() => _revisado = null);
                    _apply();
                  },
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Pendientes'),
                  selected: _revisado == 'NO',
                  onSelected: (_) {
                    setState(() => _revisado = 'NO');
                    _apply();
                  },
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Revisados'),
                  selected: _revisado == 'SI',
                  onSelected: (_) {
                    setState(() => _revisado = 'SI');
                    _apply();
                  },
                ),
                const SizedBox(width: 8),
                ActionChip(
                  label: Text(_desde == null ? 'Desde' : formatDate(isoDate(_desde!))),
                  onPressed: () => _pickDate(from: true),
                ),
                const SizedBox(width: 8),
                ActionChip(
                  label: Text(_hasta == null ? 'Hasta' : formatDate(isoDate(_hasta!))),
                  onPressed: () => _pickDate(from: false),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => list.load(),
              child: _buildBody(list),
            ),
          ),
        ],
      ),
      floatingActionButton: canCreate
          ? FloatingActionButton.extended(
              onPressed: () async {
                final created = await Navigator.of(context).push<bool>(
                  MaterialPageRoute(builder: (_) => const InformeFormScreen()),
                );
                if (created == true && mounted) {
                  await list.load();
                }
              },
              icon: const Icon(Icons.add),
              label: const Text('Nuevo informe'),
            )
          : null,
    );
  }

  Widget _buildBody(InformeListController list) {
    if (list.loading && list.items.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (list.error != null && list.items.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 80),
          Icon(Icons.cloud_off, size: 48, color: Theme.of(context).colorScheme.error),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(list.error!, textAlign: TextAlign.center),
          ),
        ],
      );
    }

    if (list.items.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: const [
          SizedBox(height: 80),
          Icon(Icons.assignment_outlined, size: 48),
          SizedBox(height: 12),
          Text('No hay informes diarios para mostrar.', textAlign: TextAlign.center),
        ],
      );
    }

    return ListView.separated(
      controller: _scroll,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 88),
      itemCount: list.items.length + (list.loadingMore ? 1 : 0),
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        if (index >= list.items.length) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        final informe = list.items[index];
        return Card(
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            title: Text(informe.codigoInforme, style: const TextStyle(fontWeight: FontWeight.w700)),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(informe.trabajador?.nombre ?? 'Trabajador'),
                  Text(formatDate(informe.fecha)),
                ],
              ),
            ),
            trailing: StatusChip(revisado: informe.revisado),
            onTap: () async {
              await Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => InformeDetailScreen(informeId: informe.id)),
              );
              if (mounted) {
                await list.load();
              }
            },
          ),
        );
      },
    );
  }
}
