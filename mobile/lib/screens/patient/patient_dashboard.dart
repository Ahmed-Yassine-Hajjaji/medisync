import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';
import 'book_appointment_screen.dart';
import 'documents_screen.dart';
import 'medication_reminders_screen.dart';
import 'clinic_map_screen.dart';

/// Onglet "Accueil" : tableau de bord du patient avec un apercu des
/// prochains rendez-vous, des raccourcis et la liste des medecins.
class PatientDashboard extends StatefulWidget {
  const PatientDashboard({super.key});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  late ApiService _apiService;
  List<Appointment> _appointments = [];
  List<Medecin> _medecins = [];
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
      final appointments = await _apiService.getMyAppointments();
      final medecins = await _apiService.getMedecins();
      if (mounted) {
        setState(() {
          _appointments = appointments;
          _medecins = medecins;
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

  String _formatDate(String date) {
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(date));
    } catch (_) {
      return date;
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;
    final upcoming = _appointments
        .where((a) => a.statut != 'ANNULE' && a.statut != 'TERMINE')
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: Text('Bonjour, ${user?.prenom ?? ""}'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  _buildSummaryCard(upcoming.length),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'Acces rapide',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _buildQuickActions(),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'Prochains rendez-vous',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  if (upcoming.isEmpty)
                    _buildEmptyCard('Aucun rendez-vous a venir')
                  else
                    ...upcoming.take(3).map(_buildAppointmentTile),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    'Nos medecins',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  if (_medecins.isEmpty)
                    _buildEmptyCard('Aucun medecin disponible')
                  else
                    ..._medecins.map(_buildMedecinTile),
                ],
              ),
            ),
    );
  }

  Widget _buildSummaryCard(int count) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.12),
                borderRadius: BorderRadius.circular(AppSpacing.radius),
              ),
              child: const Icon(Icons.calendar_today, color: AppColors.primary),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$count',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                  ),
                  const Text('Rendez-vous a venir'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      _QuickAction(
        icon: Icons.folder_open,
        label: 'Documents',
        color: AppColors.primary,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const DocumentsScreen()),
        ),
      ),
      _QuickAction(
        icon: Icons.alarm,
        label: 'Rappels',
        color: AppColors.success,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const MedicationRemindersScreen()),
        ),
      ),
      _QuickAction(
        icon: Icons.map,
        label: 'Clinique',
        color: AppColors.warning,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ClinicMapScreen()),
        ),
      ),
    ];

    return Row(
      children: [
        for (final action in actions) ...[
          Expanded(child: action),
          if (action != actions.last) const SizedBox(width: AppSpacing.sm),
        ],
      ],
    );
  }

  Widget _buildAppointmentTile(Appointment apt) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.primary,
          child: Text(
            apt.medecinNom.isNotEmpty ? apt.medecinNom[0] : '?',
            style: const TextStyle(color: Colors.white),
          ),
        ),
        title: Text('Dr. ${apt.medecinPrenom} ${apt.medecinNom}'),
        subtitle: Text('${_formatDate(apt.date)} a ${apt.heureDebut}'),
        trailing: StatusChip(statut: apt.statut),
      ),
    );
  }

  Widget _buildMedecinTile(Medecin medecin) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.primary,
          child: Text(
            '${medecin.prenom[0]}${medecin.nom[0]}',
            style: const TextStyle(color: Colors.white),
          ),
        ),
        title: Text('Dr. ${medecin.prenom} ${medecin.nom}'),
        subtitle: Text(medecin.specialite),
        trailing: ElevatedButton(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
          ),
          onPressed: () async {
            final result = await Navigator.push<bool>(
              context,
              MaterialPageRoute(
                builder: (_) => BookAppointmentScreen(medecin: medecin),
              ),
            );
            if (result == true) _loadData();
          },
          child: const Text('RDV'),
        ),
      ),
    );
  }

  Widget _buildEmptyCard(String message) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Text(message, style: const TextStyle(color: Colors.grey)),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
          child: Column(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: AppSpacing.sm),
              Text(label, style: const TextStyle(fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Puce affichant le statut d'un rendez-vous avec un code couleur.
class StatusChip extends StatelessWidget {
  final String statut;

  const StatusChip({super.key, required this.statut});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (statut) {
      case 'CONFIRME':
        color = AppColors.success;
        break;
      case 'EN_ATTENTE':
        color = AppColors.warning;
        break;
      case 'ANNULE':
        color = AppColors.danger;
        break;
      default:
        color = Colors.grey;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(AppSpacing.radius),
      ),
      child: Text(
        statut,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
