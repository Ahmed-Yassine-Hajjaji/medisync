import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Utilitaires de gestion des erreurs reseau et d'affichage des SnackBars.
class ErrorHandler {
  ErrorHandler._();

  /// Convertit une exception en message d'erreur convivial en francais.
  static String friendlyMessage(Object error) {
    if (error is SocketException) {
      return 'Impossible de joindre le serveur. Verifiez votre connexion internet.';
    }
    if (error is TimeoutException) {
      return 'Le serveur met trop de temps a repondre. Veuillez reessayer.';
    }
    if (error is HttpException) {
      return 'Une erreur reseau est survenue. Veuillez reessayer.';
    }
    if (error is FormatException) {
      return 'Reponse invalide du serveur. Veuillez reessayer plus tard.';
    }
    return 'Une erreur est survenue. Veuillez reessayer.';
  }

  /// Affiche un SnackBar d'erreur (rouge) avec un message convivial.
  static void showError(BuildContext context, Object error) {
    if (!context.mounted) return;
    showMessage(context, friendlyMessage(error), isError: true);
  }

  /// Affiche un SnackBar generique (succes ou erreur).
  static void showMessage(
    BuildContext context,
    String message, {
    bool isError = false,
  }) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: isError ? AppColors.danger : AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radius),
          ),
        ),
      );
  }
}
