import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';

/// Tableau de bord du medecin : KPIs du jour et liste des rendez-vous.
class MedecinDashboard extends StatefulWidget {
  const MedecinDashboard({super.key});

  @override
  State<MedecinDashboard> createState() => _MedecinDashboardState();
}

class _MedecinDashboardState extends State<MedecinDashboard> {
  late ApiService _apiService;
  List<Appointment> _appointments = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadData();
  }

  Future<void> _loadData() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final apts = await _apiService.getMedecinAppointmentsByDate(today);
      if (mounted) {
        setState(() {
          _appointments = apts;
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

  Future<void> _confirmAppointment(int id) async {
    try {
      await _apiService.confirmAppointment(id);
      if (mounted) ErrorHandler.showMessage(context, 'Rendez-vous confirme');
      await _loadData();
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  Future<void> _cancelAppointment(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Annuler le rendez-vous'),
        content: const Text('Voulez-vous vraiment annuler ce rendez-vous ?'),
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
    try {
      await _apiService.cancelMedecinAppointment(id);
      if (mounted) ErrorHandler.showMessage(context, 'Rendez-vous annule');
      await _loadData();
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;
    final now = DateTime.now();
    final dateLabel = DateFormat('EEEE d MMMM yyyy', 'fr_FR').format(now);

    final total = _appointments.length;
    final enAttente = _appointments.where((a) => a.statut == 'EN_ATTENTE').length;
    final confirmes = _appointments.where((a) => a.statut == 'CONFIRME').length;
    final patientsUniques = _appointments.map((a) => a.patientId).toSet().length;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Bonjour, Dr. ${user?.prenom ?? ''}',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            Text(
              dateLabel[0].toUpperCase() + dateLabel.substring(1),
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  // KPI cards
                  _buildKpiRow(total, enAttente, confirmes, patientsUniques),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'Planning du jour',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  if (_appointments.isEmpty)
                    _buildEmptyCard('Aucun rendez-vous aujourd\'hui')
                  else
                    ..._appointments.map(_buildAppointmentCard),
                ],
              ),
            ),
    );
  }

  Widget _buildKpiRow(int total, int enAttente, int confirmes, int patients) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: AppSpacing.sm,
      mainAxisSpacing: AppSpacing.sm,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.6,
      children: [
        _KpiCard(label: 'RDV aujourd\'hui', value: '$total', color: AppColors.primary, icon: Icons.event),
        _KpiCard(label: 'En attente', value: '$enAttente', color: AppColors.warning, icon: Icons.hourglass_empty),
        _KpiCard(label: 'Confirmes', value: '$confirmes', color: AppColors.success, icon: Icons.check_circle_outline),
        _KpiCard(label: 'Patients du jour', value: '$patients', color: AppColors.primaryDark, icon: Icons.people_outline),
      ],
    );
  }

  Widget _buildAppointmentCard(Appointment apt) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Time indicator
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.sm),
                  ),
                  child: Text(
                    apt.heureDebut.length >= 5
                        ? apt.heureDebut.substring(0, 5)
                        : apt.heureDebut,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                      fontSize: 13,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    apt.patientFullName.isNotEmpty
                        ? apt.patientFullName
                        : 'Patient #${apt.patientId}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                ),
                _StatusBadge(statut: apt.statut),
              ],
            ),
            if (apt.motif.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.xs),
              Text(
                apt.motif,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: AppSpacing.sm),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (apt.statut == 'EN_ATTENTE')
                  TextButton.icon(
                    onPressed: () => _confirmAppointment(apt.id),
                    icon: const Icon(Icons.check, size: 16,
                        color: AppColors.success),
                    label: const Text('Confirmer',
                        style: TextStyle(color: AppColors.success)),
                  ),
                if (apt.statut != 'ANNULE' && apt.statut != 'TERMINE')
                  TextButton.icon(
                    onPressed: () => _cancelAppointment(apt.id),
                    icon: Icon(Icons.close, size: 16, color: AppColors.danger),
                    label: Text('Annuler',
                        style: TextStyle(color: AppColors.danger)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyCard(String message) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.event_available, size: 40, color: Colors.grey.shade400),
              const SizedBox(height: AppSpacing.sm),
              Text(message, style: TextStyle(color: Colors.grey.shade500)),
            ],
          ),
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _KpiCard({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(AppSpacing.sm),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                  Text(
                    label,
                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String statut;
  const _StatusBadge({required this.statut});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    switch (statut) {
      case 'CONFIRME':
        color = AppColors.success;
        label = 'Confirme';
        break;
      case 'EN_ATTENTE':
        color = AppColors.warning;
        label = 'En attente';
        break;
      case 'ANNULE':
        color = AppColors.danger;
        label = 'Annule';
        break;
      case 'TERMINE':
        color = Colors.grey;
        label = 'Termine';
        break;
      default:
        color = Colors.grey;
        label = statut;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.13),
        borderRadius: BorderRadius.circular(AppSpacing.sm),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
