import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/utils/date_format.dart';
import '../state/notification_controller.dart';
import 'informe_detail_screen.dart';

class NotificationListScreen extends StatelessWidget {
  const NotificationListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<NotificationController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Notificaciones')),
      body: RefreshIndicator(
        onRefresh: () => controller.refresh(canReview: true),
        child: controller.loading && controller.items.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : controller.items.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: const [
                      SizedBox(height: 80),
                      Icon(Icons.notifications_none, size: 48),
                      SizedBox(height: 12),
                      Text('No hay informes pendientes de revisión.', textAlign: TextAlign.center),
                    ],
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: controller.items.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final item = controller.items[index];
                      return Card(
                        child: ListTile(
                          leading: const Icon(Icons.assignment_late_outlined),
                          title: const Text('Informe diario pendiente de revisión'),
                          subtitle: Text(
                            '${item.codigoInforme} — ${item.trabajadorNombre ?? 'Trabajador'} ${formatDate(item.fecha)}',
                          ),
                          onTap: () async {
                            await Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => InformeDetailScreen(informeId: item.id),
                              ),
                            );
                            if (context.mounted) {
                              await controller.refresh(canReview: true);
                            }
                          },
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
