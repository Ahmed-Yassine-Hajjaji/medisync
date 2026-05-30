import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';
import 'patient_dashboard.dart' show StatusChip;

/// Onglet "RDV" : liste complete des rendez-vous du patient avec
/// possibilite d'annulation.
class AppointmentsTab extends StatefulWidget {
  const AppointmentsTab({super.key});

  @override
  State<AppointmentsTab> createState() => _AppointmentsTabState();
}

class _AppointmentsTabState extends State<AppointmentsTab> {
  late ApiService _apiService;
  List<Appointment> _appointments = [];
  bool _isLoading = true;
  int? _cancellingId;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final appointments = await _apiService.getMyAppointments();
      if (mounted) {
        setState(() {
          _appointments = appointments;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ErrorHandler.showError(context, e);
      }
    }
  }

  Future<void> _cancelAppointment(Appointment apt) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radius),
        ),
        title: const Text('Annuler le rendez-vous'),
        content: Text(
          'Voulez-vous annuler le rendez-vous avec '
          'Dr. ${apt.medecinPrenom} ${apt.medecinNom} ?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Non'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Oui, annuler'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _cancellingId = apt.id);
    try {
      await _apiService.cancelAppointment(apt.id);
      if (mounted) {
        ErrorHandler.showMessage(context, 'Rendez-vous annule');
        await _loadAppointments();
      }
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    } finally {
      if (mounted) setState(() => _cancellingId = null);
    }
  }

  String _formatDate(String date) {
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(date));
    } catch (_) {
      return date;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mes rendez-vous')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _appointments.isEmpty
              ? _buildEmpty()
              : RefreshIndicator(
                  onRefresh: _loadAppointments,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: _appointments.length,
                    itemBuilder: (context, index) {
                      final apt = _appointments[index];
                      final canCancel = apt.statut != 'ANNULE' &&
                          apt.statut != 'TERMINE';
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: AppColors.primary,
                                    child: Text(
                                      apt.medecinNom.isNotEmpty
                                          ? apt.medecinNom[0]
                                          : '?',
                                      style: const TextStyle(
                                          color: Colors.white),
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.md),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Dr. ${apt.medecinPrenom} ${apt.medecinNom}',
                                          style: const TextStyle(
                                              fontWeight: FontWeight.w600),
                                        ),
                                        Text(
                                          apt.medecinSpecialite,
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey.shade600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  StatusChip(statut: apt.statut),
                                ],
                              ),
                              const Divider(height: AppSpacing.lg),
                              Row(
                                children: [
                                  const Icon(Icons.calendar_today,
                                      size: 16, color: Colors.grey),
                                  const SizedBox(width: AppSpacing.sm),
                                  Text(
                                    '${_formatDate(apt.date)} a ${apt.heureDebut}',
                                  ),
                                ],
                              ),
                              const SizedBox(height: AppSpacing.xs),
                              Row(
                                children: [
                                  const Icon(Icons.notes,
                                      size: 16, color: Colors.grey),
                                  const SizedBox(width: AppSpacing.sm),
                                  Expanded(child: Text(apt.motif)),
                                ],
                              ),
                              if (canCancel) ...[
                                const SizedBox(height: AppSpacing.sm),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: TextButton.icon(
                                    onPressed: _cancellingId == apt.id
                                        ? null
                                        : () => _cancelAppointment(apt),
                                    style: TextButton.styleFrom(
                                      foregroundColor: AppColors.danger,
                                    ),
                                    icon: _cancellingId == apt.id
                                        ? const SizedBox(
                                            width: 16,
                                            height: 16,
                                            child: CircularProgressIndicator(
                                                strokeWidth: 2),
                                          )
                                        : const Icon(Icons.close, size: 18),
                                    label: const Text('Annuler'),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_busy, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: AppSpacing.md),
          const Text('Aucun rendez-vous'),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Prenez rendez-vous depuis l\'accueil',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
