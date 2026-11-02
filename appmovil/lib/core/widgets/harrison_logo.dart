import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class HarrisonLogo extends StatelessWidget {
  const HarrisonLogo({super.key, this.height = 40, this.iconOnly = false});

  final double height;
  final bool iconOnly;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final asset = iconOnly
        ? 'assets/images/logo-icon.svg'
        : (dark ? 'assets/images/logo-dark.svg' : 'assets/images/logo.svg');

    return SvgPicture.asset(asset, height: height, fit: BoxFit.contain);
  }
}
