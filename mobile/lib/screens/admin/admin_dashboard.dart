import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../utils/error_handler.dart';
import 'staff_management.dart';

/// Tableau de bord administrateur avec KPIs, liste des medecins et patients recents.
class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  DashboardStats? _stats;
  List<Medecin> _medecins = [];
  List<User> _patients = [];
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
      final results = await Future.wait([
        api.getAdminDashboard(),
        api.getAdminMedecins(),
        api.getAdminPatients(),
      ]);
      if (!mounted) return;
      setState(() {
        _stats = results[0] as DashboardStats;
        _medecins = (results[1] as List).cast<Medecin>();
        _patients = (results[2] as List).cast<User>();
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ErrorHandler.showError(context, e);
    }
  }

  Future<void> _toggleMedecinStatus(Medecin medecin) async {
    try {
      final api = ApiService(context.read<AuthService>());
      final newStatus = !(medecin.enabled ?? true);
      await api.toggleUserStatus(medecin.id, newStatus);
      if (!mounted) return;
      ErrorHandler.showMessage(
        context,
        newStatus ? 'Medecin active' : 'Medecin desactive',
      );
      _load();
    } catch (e) {
      if (!mounted) return;
      ErrorHandler.showError(context, e);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.read<AuthService>().user;
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 100,
              pinned: true,
              backgroundColor: AppColors.primary,
              flexibleSpace: FlexibleSpaceBar(
                titlePadding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  0,
                  AppSpacing.md,
                  AppSpacing.md,
                ),
                title: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Tableau de bord',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Bonjour, ${user?.prenom ?? 'Admin'}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (_loading)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(AppSpacing.md),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    _buildKpiGrid(),
                    const SizedBox(height: AppSpacing.lg),
                    _buildMedecinsSection(),
                    const SizedBox(height: AppSpacing.lg),
                    _buildPatientsSection(),
                    const SizedBox(height: AppSpacing.xl),
                  ]),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiGrid() {
    final stats = _stats;
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppSpacing.sm,
      mainAxisSpacing: AppSpacing.sm,
      childAspectRatio: 1.5,
      children: [
        _KpiCard(
          label: 'Total Patients',
          value: '${stats?.totalPatients ?? 0}',
          icon: Icons.people,
          color: AppColors.primary,
        ),
        _KpiCard(
          label: 'Total Medecins',
          value: '${stats?.totalMedecins ?? 0}',
          icon: Icons.medical_services,
          color: AppColors.success,
        ),
        _KpiCard(
          label: "RDV aujourd'hui",
          value: '${stats?.rdvAujourdhui ?? 0}',
          icon: Icons.calendar_today,
          color: AppColors.warning,
        ),
        _KpiCard(
          label: 'Revenus du mois',
          value: '${(stats?.revenusMois ?? 0).toStringAsFixed(0)} DH',
          icon: Icons.euro,
          color: const Color(0xFF7C3AED),
        ),
      ],
    );
  }

  Widget _buildMedecinsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Medecins',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1F36),
              ),
            ),
            TextButton.icon(
              onPressed: () {
                // Navigate to staff management
              },
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Ajouter'),
              style: TextButton.styleFrom(foregroundColor: AppColors.primary),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        if (_medecins.isEmpty)
          _buildEmptyState('Aucun medecin enregistre')
        else
          Card(
            margin: EdgeInsets.zero,
            elevation: 1,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radius),
            ),
            child: Column(
              children: _medecins
                  .take(5)
                  .map((m) => _buildMedecinRow(m))
                  .toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildMedecinRow(Medecin medecin) {
    final isEnabled = medecin.enabled ?? true;
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: AppColors.primary.withOpacity(0.12),
        child: Text(
          medecin.initials,
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ),
      title: Text(
        medecin.fullName,
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            medecin.specialite,
            style: TextStyle(color: Colors.grey[600], fontSize: 12),
          ),
          if (medecin.tarifConsultation != null)
            Text(
              '${medecin.tarifConsultation!.toStringAsFixed(0)} DH',
              style: TextStyle(
                color: AppColors.success,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
        ],
      ),
      trailing: Switch(
        value: isEnabled,
        onChanged: (_) => _toggleMedecinStatus(medecin),
        activeColor: AppColors.success,
        inactiveThumbColor: Colors.grey,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }

  Widget _buildPatientsSection() {
    final fmt = DateFormat('dd/MM/yyyy');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Patients recents',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A1F36),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        if (_patients.isEmpty)
          _buildEmptyState('Aucun patient enregistre')
        else
          Card(
            margin: EdgeInsets.zero,
            elevation: 1,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radius),
            ),
            child: Column(
              children: _patients
                  .take(5)
                  .map((p) => _buildPatientRow(p, fmt))
                  .toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildPatientRow(User patient, DateFormat fmt) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: AppColors.success.withOpacity(0.12),
        child: Text(
          patient.initials,
          style: const TextStyle(
            color: AppColors.success,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ),
      title: Text(
        patient.fullName,
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (patient.telephone != null)
            Text(
              patient.telephone!,
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
            ),
          if (patient.dateNaissance != null)
            Text(
              'Inscrit le ${_formatDate(patient.dateNaissance!, fmt)}',
              style: TextStyle(color: Colors.grey[500], fontSize: 11),
            ),
        ],
      ),
    );
  }

  String _formatDate(String raw, DateFormat fmt) {
    try {
      return fmt.format(DateTime.parse(raw));
    } catch (_) {
      return raw;
    }
  }

  Widget _buildEmptyState(String message) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radius),
      ),
      child: Center(
        child: Text(
          message,
          style: TextStyle(color: Colors.grey[500], fontSize: 14),
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _KpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 24),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: color.withOpacity(0.8),
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
