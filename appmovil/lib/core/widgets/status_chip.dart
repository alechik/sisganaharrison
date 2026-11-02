import 'package:flutter/material.dart';

class StatusChip extends StatelessWidget {
  const StatusChip({super.key, required this.revisado});

  final String revisado;

  @override
  Widget build(BuildContext context) {
    final pending = revisado.toUpperCase() != 'SI';
    final color = pending ? const Color(0xFFDC6803) : const Color(0xFF079455);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        pending ? 'PENDIENTE' : 'REVISADO',
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
