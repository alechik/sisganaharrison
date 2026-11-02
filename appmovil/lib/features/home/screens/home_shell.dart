import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/widgets/harrison_logo.dart';
import '../../auth/state/auth_controller.dart';
import '../../informes/screens/informe_list_screen.dart';
import '../../informes/screens/notification_list_screen.dart';
import '../../informes/state/notification_controller.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthController>();
      context.read<NotificationController>().refresh(
            canReview: auth.user?.canReviewInformes ?? false,
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final notifications = context.watch<NotificationController>();
    final user = auth.user;
    final canView = user?.canViewInformes ?? false;
    final canReview = user?.canReviewInformes ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const HarrisonLogo(height: 32),
        actions: [
          if (canReview)
            IconButton(
              tooltip: 'Notificaciones',
              onPressed: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const NotificationListScreen()),
                );
                if (context.mounted) {
                  await notifications.refresh(canReview: true);
                }
              },
              icon: Badge(
                isLabelVisible: notifications.count > 0,
                label: Text(notifications.count > 9 ? '9+' : '${notifications.count}'),
                child: const Icon(Icons.notifications_outlined),
              ),
            ),
        ],
      ),
      drawer: Drawer(
        child: SafeArea(
          child: Column(
            children: [
              ListTile(
                leading: const HarrisonLogo(height: 32, iconOnly: true),
                title: Text(user?.nombreCompleto ?? ''),
                subtitle: Text(user?.roles.join(', ') ?? ''),
              ),
              const Divider(),
              const ListTile(
                leading: Icon(Icons.assignment_outlined),
                title: Text('Informes diarios'),
              ),
              const Spacer(),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('Cerrar sesión'),
                onTap: () async {
                  Navigator.pop(context);
                  await auth.logout();
                },
              ),
            ],
          ),
        ),
      ),
      body: canView
          ? const InformeListScreen()
          : const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'Su rol no tiene acceso al módulo de Informes Diarios.',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
    );
  }
}
