import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../utils/error_handler.dart';
import 'book_appointment_screen.dart';
import 'documents_screen.dart';
import 'medication_reminders_screen.dart';
import 'clinic_map_screen.dart';

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
      final results = await Future.wait([
        _apiService.getPatientAppointments(),
        _apiService.getMedecins(),
      ]);
      if (mounted) {
        setState(() {
          _appointments = results[0] as List<Appointment>;
          _medecins = results[1] as List<Medecin>;
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

  List<Appointment> get _upcoming => _appointments
      .where((a) => a.statut != 'ANNULE' && a.statut != 'TERMINE')
      .toList();

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;
    final prenom = user?.prenom ?? 'Patient';

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerLowest,
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            _buildHeader(prenom),
            if (_isLoading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(AppSpacing.md),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    _buildStatsGrid(),
                    const SizedBox(height: AppSpacing.lg),
                    _buildQuickActions(),
                    const SizedBox(height: AppSpacing.lg),
                    _buildUpcomingSection(),
                    const SizedBox(height: AppSpacing.lg),
                    _buildDoctorsSection(),
                    const SizedBox(height: AppSpacing.xl),
                  ]),
                ),
              ),
          ],
        ),
      ),
    );
  }

  SliverAppBar _buildHeader(String prenom) {
    return SliverAppBar(
      expandedHeight: 130,
      floating: true,
      pinned: false,
      snap: true,
      backgroundColor: AppColors.primary,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primary,
                AppColors.primary.withOpacity(0.78),
              ],
            ),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.md),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Bonjour, $prenom !',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        DateFormat('EEEE d MMMM yyyy', 'fr').format(DateTime.now()),
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.85),
                        ),
                      ),
                    ],
                  ),
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: Colors.white.withOpacity(0.25),
                    child: Text(
                      prenom.isNotEmpty ? prenom[0].toUpperCase() : 'P',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatsGrid() {
    final upcoming = _upcoming;
    final items = [
      _StatItem(
        icon: Icons.calendar_today,
        label: 'RDV à venir',
        value: '${upcoming.length}',
        color: AppColors.primary,
      ),
      _StatItem(
        icon: Icons.local_hospital_outlined,
        label: 'Total RDV',
        value: '${_appointments.length}',
        color: AppColors.success,
      ),
      _StatItem(
        icon: Icons.medication_outlined,
        label: 'Médecins dispo',
        value: '${_medecins.length}',
        color: AppColors.warning,
      ),
      _StatItem(
        icon: Icons.check_circle_outline,
        label: 'Terminés',
        value: '${_appointments.where((a) => a.statut == "TERMINE").length}',
        color: Colors.grey,
      ),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppSpacing.sm,
      mainAxisSpacing: AppSpacing.sm,
      childAspectRatio: 1.6,
      children: items.map(_buildStatCard).toList(),
    );
  }

  Widget _buildStatCard(_StatItem item) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        side: BorderSide(color: item.color.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: item.color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(item.icon, color: item.color, size: 22),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    item.value,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: item.color,
                    ),
                  ),
                  Text(
                    item.label,
                    style: TextStyle(fontSize: 11, color: Colors.grey[600]),
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

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Accès rapide',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Expanded(
              child: _QuickActionCard(
                icon: Icons.folder_open,
                label: 'Documents',
                color: AppColors.primary,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const DocumentsScreen()),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: _QuickActionCard(
                icon: Icons.alarm,
                label: 'Rappels',
                color: AppColors.success,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const MedicationRemindersScreen()),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: _QuickActionCard(
                icon: Icons.map_outlined,
                label: 'Clinique',
                color: AppColors.warning,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ClinicMapScreen()),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildUpcomingSection() {
    final upcoming = _upcoming.take(3).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Prochains rendez-vous',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
            ),
            if (_upcoming.isNotEmpty)
              Text(
                '${_upcoming.length} au total',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        if (upcoming.isEmpty)
          _buildEmptyCard(
            icon: Icons.calendar_today_outlined,
            message: 'Aucun rendez-vous à venir',
          )
        else
          ...upcoming.map(_buildAppointmentCard),
      ],
    );
  }

  Widget _buildAppointmentCard(Appointment apt) {
    DateTime? dateTime;
    try {
      dateTime = DateTime.parse('${apt.date}T${apt.heureDebut}');
    } catch (_) {}

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        side: BorderSide(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: dateTime != null
                  ? Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          DateFormat('d').format(dateTime),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                        Text(
                          DateFormat('MMM', 'fr').format(dateTime).toUpperCase(),
                          style: TextStyle(fontSize: 10, color: AppColors.primary),
                        ),
                      ],
                    )
                  : Icon(Icons.calendar_today, color: AppColors.primary),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dr ${apt.medecinPrenom} ${apt.medecinNom}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  if (apt.medecinSpecialite.isNotEmpty)
                    Text(
                      apt.medecinSpecialite,
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(Icons.access_time, size: 13, color: Colors.grey[500]),
                      const SizedBox(width: 3),
                      Text(
                        apt.heureDebut,
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            StatusChip(statut: apt.statut),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Médecins disponibles',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: AppSpacing.sm),
        if (_medecins.isEmpty)
          _buildEmptyCard(
            icon: Icons.person_search_outlined,
            message: 'Aucun médecin disponible',
          )
        else
          ..._medecins.take(5).map(_buildDoctorCard),
      ],
    );
  }

  Widget _buildDoctorCard(Medecin medecin) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        side: BorderSide(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.primary.withOpacity(0.15),
              child: Text(
                medecin.initials,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                  fontSize: 16,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dr ${medecin.prenom} ${medecin.nom}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    medecin.specialite,
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  if (medecin.tarifConsultation != null)
                    Text(
                      '${medecin.tarifConsultation!.toStringAsFixed(0)} DA',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.success,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => BookAppointmentScreen(medecin: medecin),
                  ),
                ).then((_) => _loadData());
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                textStyle: const TextStyle(fontSize: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Prendre RDV'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyCard({required IconData icon, required String message}) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        side: BorderSide(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Center(
          child: Column(
            children: [
              Icon(icon, size: 40, color: Colors.grey[400]),
              const SizedBox(height: AppSpacing.sm),
              Text(message,
                  style: TextStyle(color: Colors.grey[500], fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Shared status chip (used by AppointmentsTab) ───────────────────────────

class StatusChip extends StatelessWidget {
  final String statut;

  const StatusChip({super.key, required this.statut});

  static Color colorFor(String statut) {
    switch (statut.toUpperCase()) {
      case 'CONFIRME':
        return AppColors.success;
      case 'EN_ATTENTE':
        return AppColors.warning;
      case 'ANNULE':
        return AppColors.danger;
      case 'TERMINE':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  static String labelFor(String statut) {
    switch (statut.toUpperCase()) {
      case 'CONFIRME':
        return 'Confirmé';
      case 'EN_ATTENTE':
        return 'En attente';
      case 'ANNULE':
        return 'Annulé';
      case 'TERMINE':
        return 'Terminé';
      default:
        return statut;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = colorFor(statut);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        labelFor(statut),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

// ─── Internal helpers ────────────────────────────────────────────────────────

class _StatItem {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        side: BorderSide(color: color.withOpacity(0.2)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(label,
                  style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }
}
