class Validators {
  const Validators._();

  static String? email(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) {
      return 'Ingrese su correo electrónico.';
    }
    final regex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!regex.hasMatch(text)) {
      return 'Ingrese un correo electrónico válido.';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'Ingrese su contraseña.';
    }
    return null;
  }

  static String? requiredText(String? value, {String label = 'Este campo'}) {
    if (value == null || value.trim().isEmpty) {
      return '$label es obligatorio.';
    }
    return null;
  }
}
