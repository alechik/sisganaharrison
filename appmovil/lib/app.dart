import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/network/api_client.dart';
import 'core/storage/secure_store.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/services/auth_service.dart';
import 'features/auth/state/auth_controller.dart';
import 'features/home/screens/home_shell.dart';
import 'features/informes/services/informe_service.dart';
import 'features/informes/state/informe_list_controller.dart';
import 'features/informes/state/notification_controller.dart';

class HarrisonApp extends StatefulWidget {
  const HarrisonApp({super.key, this.secureStore, this.apiClient});

  final SecureStore? secureStore;
  final ApiClient? apiClient;

  @override
  State<HarrisonApp> createState() => _HarrisonAppState();
}

class _HarrisonAppState extends State<HarrisonApp> {
  late final AuthController _authController;
  late final InformeService _informeService;

  @override
  void initState() {
    super.initState();
    final store = widget.secureStore ?? FlutterSecureStore();
    late final AuthController authController;
    final apiClient = widget.apiClient ??
        ApiClient(
          tokenReader: () => store.read(AuthService.tokenKey),
          onUnauthorized: () => authController.forceLogout(),
        );
    final authService = AuthService(apiClient: apiClient, secureStore: store);
    authController = AuthController(authService);
    _authController = authController;
    _informeService = InformeService(apiClient);
    _authController.restoreSession();
  }

  @override
  void dispose() {
    _authController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<InformeService>.value(value: _informeService),
        ChangeNotifierProvider<AuthController>.value(value: _authController),
        ChangeNotifierProvider(create: (_) => InformeListController(_informeService)),
        ChangeNotifierProvider(create: (_) => NotificationController(_informeService)),
      ],
      child: MaterialApp(
        title: 'Agropecuaria Harrison',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        themeMode: ThemeMode.system,
        home: Consumer<AuthController>(
          builder: (context, auth, _) {
            if (auth.status == AuthStatus.unknown) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            if (auth.isAuthenticated) {
              return const HomeShell();
            }
            return const LoginScreen();
          },
        ),
      ),
    );
  }
}
