import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:appmovil/app.dart';
import 'package:appmovil/core/storage/secure_store.dart';

void main() {
  testWidgets('muestra el inicio de sesión cuando no hay sesión', (tester) async {
    await tester.pumpWidget(HarrisonApp(secureStore: MemorySecureStore()));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.text('Iniciar sesión'), findsWidgets);
    expect(find.text('Correo electrónico'), findsOneWidget);
    expect(find.text('Contraseña'), findsOneWidget);
  });

  testWidgets('exige correo y contraseña', (tester) async {
    await tester.pumpWidget(HarrisonApp(secureStore: MemorySecureStore()));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));

    await tester.tap(find.widgetWithText(FilledButton, 'Iniciar sesión'));
    await tester.pump();

    expect(find.text('Ingrese su correo electrónico.'), findsOneWidget);
    expect(find.text('Ingrese su contraseña.'), findsOneWidget);
  });
}
