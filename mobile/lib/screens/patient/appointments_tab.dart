import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../utils/error_handler.dart';
import 'patient_dashboard.dart' show StatusChip;
import 'book_appointment_screen.dart';

class AppointmentsTab extends StatefulWidget {
  const AppointmentsTab({super.key});

  @override
  State<AppointmentsTab> createState() => _AppointmentsTabState();
}

class _AppointmentsTabState extends State<AppointmentsTab>
    with SingleTickerProviderStateMixin {
  late ApiService _apiService;
  late TabController _tabController;
  List<Appointment> _appointments = [];
  bool _isLoading = true;
  int? _cancellingId;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _apiService = ApiService(context.read<AuthService>());
    _loadAppointments();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAppointments() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final appointments = await _apiService.getPatientAppointments();
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

  List<Appointment> get _upcoming => _appointments
      .where((a) => a.statut != 'ANNULE' && a.statut != 'TERMINE')
      .toList()
    ..sort((a, b) => a.date.compareTo(b.date));

  List<Appointment> get _history => _appointments
      .where((a) => a.statut == 'ANNULE' || a.statut == 'TERMINE')
      .toList()
    ..sort((a, b) => b.date.compareTo(a.date));

  Future<void> _cancelAppointment(Appointment apt) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radius),
        ),
        title: const Text('Annuler le rendez-vous'),
        content: Text(
          'Confirmer l\'annulation du rendez-vous avec '
          'Dr ${apt.medecinPrenom} ${apt.medecinNom} ?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Non'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Oui, annuler'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    if (!mounted) return;

    setState(() => _cancellingId = apt.id);
    try {
      await _apiService.cancelPatientAppointment(apt.id);
      if (mounted) {
        ErrorHandler.showMessage(context, 'Rendez-vous annulé');
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
      return DateFormat('EEE d MMM yyyy', 'fr').format(DateTime.parse(date));
    } catch (_) {
      return date;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes rendez-vous'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.primary.withOpacity(0.5),
          tabs: [
            Tab(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('À venir'),
                  if (_upcoming.isNotEmpty) ...[
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${_upcoming.length}',
                        style: const TextStyle(
                            fontSize: 11, color: Colors.white),
                      ),
                    ),
                  ]
                ],
              ),
            ),
            const Tab(text: 'Historique'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadAppointments,
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildList(_upcoming, showCancelButton: true),
                  _buildList(_history, showCancelButton: false),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => const BookAppointmentScreen(),
            ),
          ).then((_) => _loadAppointments());
        },
        icon: const Icon(Icons.add),
        label: const Text('Nouveau RDV'),
        backgroundColor: AppColors.primary,
      ),
    );
  }

  Widget _buildList(List<Appointment> apts, {required bool showCancelButton}) {
    if (apts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, size: 64, color: Colors.grey[400]),
            const SizedBox(height: AppSpacing.md),
            Text(
              showCancelButton ? 'Aucun rendez-vous à venir' : 'Aucun historique',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              showCancelButton
                  ? 'Appuyez sur + pour prendre un rendez-vous'
                  : 'Vos rendez-vous terminés apparaîtront ici',
              style: TextStyle(color: Colors.grey[600], fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.md, AppSpacing.md, AppSpacing.md, 100),
      itemCount: apts.length,
      itemBuilder: (context, index) =>
          _AppointmentCard(
            appointment: apts[index],
            showCancelButton: showCancelButton,
            isCancelling: _cancellingId == apts[index].id,
            onCancel: () => _cancelAppointment(apts[index]),
            formatDate: _formatDate,
          ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  final Appointment appointment;
  final bool showCancelButton;
  final bool isCancelling;
  final VoidCallback onCancel;
  final String Function(String) formatDate;

  const _AppointmentCard({
    required this.appointment,
    required this.showCancelButton,
    required this.isCancelling,
    required this.onCancel,
    required this.formatDate,
  });

  @override
  Widget build(BuildContext context) {
    final apt = appointment;
    final canCancel =
        showCancelButton && apt.statut != 'ANNULE' && apt.statut != 'TERMINE';
    final statusColor = StatusChip.colorFor(apt.statut);

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        side: BorderSide(
          color: statusColor.withOpacity(0.25),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: AppColors.primary.withOpacity(0.15),
                  child: Text(
                    apt.medecinNom.isNotEmpty
                        ? apt.medecinNom[0].toUpperCase()
                        : 'M',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
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
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        apt.medecinSpecialite,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                StatusChip(statut: apt.statut),
              ],
            ),
            const Divider(height: AppSpacing.lg),
            _InfoRow(
              icon: Icons.calendar_today,
              text: formatDate(apt.date),
            ),
            const SizedBox(height: AppSpacing.xs),
            _InfoRow(
              icon: Icons.access_time,
              text: '${apt.heureDebut} – ${apt.heureFin}',
            ),
            const SizedBox(height: AppSpacing.xs),
            _InfoRow(
              icon: Icons.notes,
              text: apt.motif,
            ),
            if (canCancel) ...[
              const SizedBox(height: AppSpacing.sm),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: isCancelling ? null : onCancel,
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.danger,
                  ),
                  icon: isCancelling
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.cancel_outlined, size: 18),
                  label: const Text('Annuler le RDV'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 15, color: Colors.grey[500]),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Text(text, style: TextStyle(fontSize: 13, color: Colors.grey[700])),
        ),
      ],
    );
  }
}
