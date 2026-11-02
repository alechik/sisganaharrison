import 'package:flutter_test/flutter_test.dart';

import 'package:appmovil/core/utils/validators.dart';
import 'package:appmovil/features/auth/models/auth_user.dart';
import 'package:appmovil/features/informes/models/informe_diario.dart';

void main() {
  group('Validators', () {
    test('rechaza correo vacío o inválido', () {
      expect(Validators.email(''), isNotNull);
      expect(Validators.email('sin-arroba'), isNotNull);
      expect(Validators.email('admin@gmail.com'), isNull);
    });

    test('exige contraseña', () {
      expect(Validators.password(''), isNotNull);
      expect(Validators.password('secret'), isNull);
    });
  });

  group('AuthUser', () {
    test('identifica trabajador y gestores', () {
      final trabajador = AuthUser.fromJson(
        user: {'id': 3, 'nombre': 'Juan', 'apellido': 'Pérez', 'email': 't@t.com'},
        roles: ['trabajador'],
      );
      expect(trabajador.canCreateInformes, isTrue);
      expect(trabajador.canReviewInformes, isFalse);

      final gerencia = AuthUser.fromJson(
        user: {'id': 2, 'nombre': 'Ana', 'apellido': 'Gómez', 'email': 'g@g.com'},
        roles: ['gerencia'],
      );
      expect(gerencia.canCreateInformes, isFalse);
      expect(gerencia.canReviewInformes, isTrue);
      expect(gerencia.canViewInformes, isTrue);
    });

    test('cuenta notificaciones de informes pendientes', () {
      final admin = AuthUser.fromJson(
        user: {'id': 1, 'nombre': 'Admin', 'apellido': 'Uno', 'email': 'a@a.com'},
        roles: ['administrador'],
        notificaciones: [
          {
            'tipo': 'informe_diario_pendiente_7',
            'titulo': 'Informe diario pendiente de revisión',
            'mensaje': 'INF-000007',
            'ruta': '/informes-diarios/7',
          },
          {
            'tipo': 'informe_diario_pendiente_8',
            'titulo': 'Informe diario pendiente de revisión',
            'mensaje': 'INF-000008',
            'ruta': '/informes-diarios/8',
          },
        ],
      );
      expect(admin.notificaciones.first.informeId, 7);
      expect(admin.informesPendientesCount, 2);
    });
  });

  group('InformeDiario', () {
    test('parsea el payload del backend', () {
      final informe = InformeDiario.fromJson({
        'id': 9,
        'codigo_informe': 'INF-000009',
        'detalle_informe': 'Ronda de potreros',
        'revisado': 'NO',
        'fecha': '2026-10-30',
        'fecha_revision': null,
        'user_trabajador_id': 4,
        'user_revisor_id': null,
        'trabajador': {'id': 4, 'nombre': 'Juan Pérez'},
      });

      expect(informe.codigoInforme, 'INF-000009');
      expect(informe.estaRevisado, isFalse);
      expect(informe.trabajador?.nombre, 'Juan Pérez');
    });
  });
}
