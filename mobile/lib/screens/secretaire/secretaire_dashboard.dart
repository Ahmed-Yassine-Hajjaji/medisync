import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';
import 'secretaire_appointments.dart';
import 'secretaire_patients.dart';

class SecretaireDashboard extends StatefulWidget {
  const SecretaireDashboard({super.key});

  @override
  State<SecretaireDashboard> createState() => _SecretaireDashboardState();
}

class _SecretaireDashboardState extends State<SecretaireDashboard> {
  late ApiService _apiService;
  List<Appointment> _todayAppointments = [];
  List<User> _patients = [];
  List<Invoice> _invoices = [];
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
      final results = await Future.wait([
        _apiService.getSecretaireAppointmentsByDate(today),
        _apiService.getSecretairePatients(),
        _apiService.getSecretaireInvoices(),
      ]);
      if (mounted) {
        setState(() {
          _todayAppointments = results[0] as List<Appointment>;
          _patients = results[1] as List<User>;
          _invoices = results[2] as List<Invoice>;
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
      await _apiService.confirmSecretaireAppointment(id);
      if (mounted) {
        ErrorHandler.showMessage(context, 'Rendez-vous confirme');
        _loadData();
      }
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  Future<void> _cancelAppointment(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Annuler le rendez-vous ?'),
        content: const Text('Cette action est irreversible.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Non'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Oui, annuler', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await _apiService.cancelSecretaireAppointment(id);
      if (mounted) {
        ErrorHandler.showMessage(context, 'Rendez-vous annule');
        _loadData();
      }
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  int get _enAttenteCount =>
      _todayAppointments.where((a) => a.statut == 'EN_ATTENTE').length;

  double get _impayeAmount => _invoices
      .where((i) => i.statut == 'IMPAYE' || i.statut == 'EN_ATTENTE')
      .fold(0.0, (sum, i) => sum + i.resteAPayer);

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;
    final now = DateTime.now();
    final dateStr = DateFormat('EEEE d MMMM yyyy', 'fr_FR').format(now);

    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: CustomScrollView(
                slivers: [
                  SliverAppBar(
                    expandedHeight: 130,
                    pinned: true,
                    flexibleSpace: FlexibleSpaceBar(
                      background: Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [AppColors.primaryDark, AppColors.primary],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: SafeArea(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(
                                AppSpacing.md, AppSpacing.sm, AppSpacing.md, 0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Bonjour, ${user?.prenom ?? ""}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  dateStr,
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.85),
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        _buildKpiGrid(),
                        const SizedBox(height: AppSpacing.lg),
                        _buildSectionTitle('Planning du jour'),
                        const SizedBox(height: AppSpacing.sm),
                        if (_todayAppointments.isEmpty)
                          _buildEmptyCard('Aucun rendez-vous aujourd\'hui')
                        else
                          ..._todayAppointments.map(_buildAppointmentCard),
                        const SizedBox(height: AppSpacing.lg),
                        _buildSectionTitle('Actions rapides'),
                        const SizedBox(height: AppSpacing.sm),
                        _buildQuickActions(),
                        const SizedBox(height: AppSpacing.xl),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: Colors.black87,
          ),
    );
  }

  Widget _buildKpiGrid() {
    final kpis = [
      _KpiData(
        label: 'RDV aujourd\'hui',
        value: '${_todayAppointments.length}',
        icon: Icons.today,
        color: AppColors.primary,
      ),
      _KpiData(
        label: 'En attente confirmation',
        value: '$_enAttenteCount',
        icon: Icons.hourglass_top,
        color: AppColors.warning,
      ),
      _KpiData(
        label: 'Patients enregistres',
        value: '${_patients.length}',
        icon: Icons.people,
        color: AppColors.success,
      ),
      _KpiData(
        label: 'Factures impayees',
        value: NumberFormat.currency(locale: 'fr_FR', symbol: 'DH', decimalDigits: 0).format(_impayeAmount),
        icon: Icons.receipt_long,
        color: AppColors.danger,
      ),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppSpacing.sm,
      mainAxisSpacing: AppSpacing.sm,
      childAspectRatio: 1.55,
      children: kpis.map(_buildKpiCard).toList(),
    );
  }

  Widget _buildKpiCard(_KpiData kpi) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: kpi.color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(kpi.icon, color: kpi.color, size: 20),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  kpi.value,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: kpi.color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  kpi.label,
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentCard(Appointment apt) {
    final statusColor = _statusColor(apt.statut);
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${apt.heureDebut} - ${apt.heureFin}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const Spacer(),
                _buildStatusBadge(apt.statut, statusColor),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.primary.withOpacity(0.15),
                  child: Text(
                    apt.patientFullName.isNotEmpty
                        ? apt.patientFullName[0].toUpperCase()
                        : '?',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        apt.patientFullName,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        'Dr. ${apt.medecinFullName} - ${apt.medecinSpecialite}',
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Motif : ${apt.motif}',
              style: const TextStyle(fontSize: 12, color: Colors.black54),
            ),
            if (apt.statut == 'EN_ATTENTE') ...[
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.check, size: 16),
                      label: const Text('Confirmer'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.success,
                        side: const BorderSide(color: AppColors.success),
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        textStyle: const TextStyle(fontSize: 13),
                      ),
                      onPressed: () => _confirmAppointment(apt.id),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.close, size: 16),
                      label: const Text('Annuler'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.danger,
                        side: const BorderSide(color: AppColors.danger),
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        textStyle: const TextStyle(fontSize: 13),
                      ),
                      onPressed: () => _cancelAppointment(apt.id),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String statut, Color color) {
    final labels = {
      'EN_ATTENTE': 'En attente',
      'CONFIRME': 'Confirme',
      'ANNULE': 'Annule',
      'TERMINE': 'Termine',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        labels[statut] ?? statut,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Color _statusColor(String statut) {
    switch (statut) {
      case 'CONFIRME':
        return AppColors.success;
      case 'EN_ATTENTE':
        return AppColors.warning;
      case 'ANNULE':
        return AppColors.danger;
      case 'TERMINE':
        return Colors.blueGrey;
      default:
        return Colors.grey;
    }
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            icon: const Icon(Icons.add),
            label: const Text('Nouveau RDV'),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SecretaireAppointments()),
              );
            },
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: OutlinedButton.icon(
            icon: const Icon(Icons.person_add_outlined),
            label: const Text('Nouveau patient'),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SecretairePatients()),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyCard(String message) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Center(
          child: Text(message, style: const TextStyle(color: Colors.grey)),
        ),
      ),
    );
  }
}

class _KpiData {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _KpiData({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });
}
