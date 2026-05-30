import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../utils/error_handler.dart';

/// Ecran du journal d'audit affichant les evenements systeme.
class AuditLog extends StatefulWidget {
  const AuditLog({super.key});

  @override
  State<AuditLog> createState() => _AuditLogState();
}

class _AuditLogState extends State<AuditLog> {
  List<Map<String, dynamic>> _logs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final api = ApiService(context.read<AuthService>());
      final logs = await api.getAuditLogs();
      if (!mounted) return;
      setState(() {
        _logs = logs;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ErrorHandler.showError(context, e);
    }
  }

  IconData _iconForAction(String? action) {
    if (action == null) return Icons.info_outline;
    final a = action.toUpperCase();
    if (a.contains('LOGIN') || a.contains('CONNEXION')) {
      return Icons.login;
    }
    if (a.contains('LOGOUT') || a.contains('DECONNEXION')) {
      return Icons.logout;
    }
    if (a.contains('CREATE') || a.contains('CREAT') || a.contains('ADD')) {
      return Icons.add_circle_outline;
    }
    if (a.contains('UPDATE') || a.contains('MODIF') || a.contains('EDIT')) {
      return Icons.edit_outlined;
    }
    if (a.contains('DELETE') || a.contains('SUPPR')) {
      return Icons.delete_outline;
    }
    if (a.contains('TOGGLE') || a.contains('STATUS') || a.contains('STATUT')) {
      return Icons.toggle_on_outlined;
    }
    if (a.contains('PAYMENT') || a.contains('PAIEMENT') ||
        a.contains('INVOICE') || a.contains('FACTURE')) {
      return Icons.receipt_outlined;
    }
    if (a.contains('APPOINTMENT') || a.contains('RDV')) {
      return Icons.calendar_today_outlined;
    }
    if (a.contains('CONSULT')) {
      return Icons.medical_services_outlined;
    }
    if (a.contains('PRESCRIPTION') || a.contains('ORDONNANCE')) {
      return Icons.medication_outlined;
    }
    return Icons.history;
  }

  Color _colorForAction(String? action) {
    if (action == null) return Colors.grey;
    final a = action.toUpperCase();
    if (a.contains('DELETE') || a.contains('SUPPR') || a.contains('DISABLE')) {
      return AppColors.danger;
    }
    if (a.contains('CREATE') || a.contains('ADD') || a.contains('LOGIN')) {
      return AppColors.success;
    }
    if (a.contains('UPDATE') || a.contains('TOGGLE') || a.contains('EDIT')) {
      return AppColors.warning;
    }
    if (a.contains('PAYMENT') || a.contains('INVOICE')) {
      return AppColors.primary;
    }
    return const Color(0xFF7C3AED);
  }

  String _formatTimestamp(dynamic timestamp) {
    if (timestamp == null) return '';
    try {
      final dt = DateTime.parse(timestamp.toString()).toLocal();
      return DateFormat('dd/MM/yyyy HH:mm').format(dt);
    } catch (_) {
      return timestamp.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text("Journal d'audit"),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.primary,
        child: _loading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : _logs.isEmpty
                ? _buildEmpty()
                : ListView.separated(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: _logs.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpacing.sm),
                    itemBuilder: (_, i) => _AuditCard(
                      log: _logs[i],
                      icon: _iconForAction(_logs[i]['action']?.toString()),
                      color: _colorForAction(_logs[i]['action']?.toString()),
                      formattedTime:
                          _formatTimestamp(_logs[i]['timestamp']),
                    ),
                  ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.history, size: 72, color: Colors.grey[300]),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Aucun evenement enregistre',
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Les actions effectuees dans le systeme\napparaitront ici.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[400], fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _AuditCard extends StatelessWidget {
  final Map<String, dynamic> log;
  final IconData icon;
  final Color color;
  final String formattedTime;

  const _AuditCard({
    required this.log,
    required this.icon,
    required this.color,
    required this.formattedTime,
  });

  @override
  Widget build(BuildContext context) {
    final action = log['action']?.toString() ?? 'Action inconnue';
    final details = log['details']?.toString();
    final userName = log['userName']?.toString();

    return Card(
      margin: EdgeInsets.zero,
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(AppSpacing.sm),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _formatAction(action),
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: Color(0xFF1A1F36),
                    ),
                  ),
                  if (details != null && details.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      details,
                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      if (userName != null) ...[
                        Icon(Icons.person_outline,
                            size: 13, color: Colors.grey[500]),
                        const SizedBox(width: 3),
                        Text(
                          userName,
                          style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                      ],
                      if (formattedTime.isNotEmpty) ...[
                        Icon(Icons.access_time,
                            size: 13, color: Colors.grey[400]),
                        const SizedBox(width: 3),
                        Text(
                          formattedTime,
                          style: TextStyle(
                            color: Colors.grey[500],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatAction(String action) {
    // Convert SNAKE_CASE to readable French-ish string
    return action
        .replaceAll('_', ' ')
        .split(' ')
        .map((w) => w.isEmpty
            ? ''
            : '${w[0].toUpperCase()}${w.substring(1).toLowerCase()}')
        .join(' ');
  }
}
