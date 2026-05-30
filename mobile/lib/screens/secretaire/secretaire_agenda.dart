import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';

class SecretaireAgenda extends StatefulWidget {
  const SecretaireAgenda({super.key});

  @override
  State<SecretaireAgenda> createState() => _SecretaireAgendaState();
}

class _SecretaireAgendaState extends State<SecretaireAgenda> {
  late ApiService _apiService;
  DateTime _selectedDate = DateTime.now();
  List<Appointment> _appointments = [];
  bool _isLoading = false;

  static const int _startHour = 8;
  static const int _endHour = 18;
  static const double _hourHeight = 72.0;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final apts = await _apiService.getSecretaireAppointmentsByDate(dateStr);
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

  void _goToPreviousDay() {
    setState(() => _selectedDate = _selectedDate.subtract(const Duration(days: 1)));
    _loadAppointments();
  }

  void _goToNextDay() {
    setState(() => _selectedDate = _selectedDate.add(const Duration(days: 1)));
    _loadAppointments();
  }

  void _goToToday() {
    setState(() => _selectedDate = DateTime.now());
    _loadAppointments();
  }

  Future<void> _confirmAppointment(int id) async {
    try {
      await _apiService.confirmSecretaireAppointment(id);
      if (mounted) {
        ErrorHandler.showMessage(context, 'Rendez-vous confirme');
        _loadAppointments();
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
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Non')),
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
        _loadAppointments();
      }
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  int get _totalCount => _appointments.length;
  int get _confirmeCount => _appointments.where((a) => a.statut == 'CONFIRME').length;
  int get _enAttenteCount => _appointments.where((a) => a.statut == 'EN_ATTENTE').length;
  int get _annuleCount => _appointments.where((a) => a.statut == 'ANNULE').length;

  bool get _isToday {
    final now = DateTime.now();
    return _selectedDate.year == now.year &&
        _selectedDate.month == now.month &&
        _selectedDate.day == now.day;
  }

  double _timeToOffset(String timeStr) {
    final parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    final h = int.tryParse(parts[0]) ?? _startHour;
    final m = int.tryParse(parts[1]) ?? 0;
    final totalMinutes = (h - _startHour) * 60 + m;
    return totalMinutes * (_hourHeight / 60);
  }

  double _durationToHeight(String start, String end) {
    final startParts = start.split(':');
    final endParts = end.split(':');
    if (startParts.length < 2 || endParts.length < 2) return _hourHeight;
    final startMin = (int.tryParse(startParts[0]) ?? 0) * 60 + (int.tryParse(startParts[1]) ?? 0);
    final endMin = (int.tryParse(endParts[0]) ?? 0) * 60 + (int.tryParse(endParts[1]) ?? 0);
    final duration = (endMin - startMin).clamp(30, 120);
    return duration * (_hourHeight / 60);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agenda'),
        actions: [
          if (!_isToday)
            TextButton(
              onPressed: _goToToday,
              child: const Text("Aujourd'hui", style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: Column(
        children: [
          _buildDateNavigation(),
          _buildStatsBar(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _buildTimeline(),
          ),
        ],
      ),
    );
  }

  Widget _buildDateNavigation() {
    final dateLabel = DateFormat('EEEE d MMMM yyyy', 'fr_FR').format(_selectedDate);
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: _goToPreviousDay,
            tooltip: 'Jour precedent',
          ),
          Expanded(
            child: GestureDetector(
              onTap: _pickDate,
              child: Column(
                children: [
                  Text(
                    dateLabel,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  if (_isToday)
                    Container(
                      margin: const EdgeInsets.only(top: 2),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        "Aujourd'hui",
                        style: TextStyle(color: Colors.white, fontSize: 10),
                      ),
                    ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: _goToNextDay,
            tooltip: 'Jour suivant',
          ),
        ],
      ),
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      locale: const Locale('fr', 'FR'),
    );
    if (picked != null && mounted) {
      setState(() => _selectedDate = picked);
      _loadAppointments();
    }
  }

  Widget _buildStatsBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.md, 0, AppSpacing.md, AppSpacing.sm),
      child: Row(
        children: [
          _buildStatChip('Total', '$_totalCount', Colors.blueGrey),
          const SizedBox(width: AppSpacing.sm),
          _buildStatChip('Confirmes', '$_confirmeCount', AppColors.success),
          const SizedBox(width: AppSpacing.sm),
          _buildStatChip('En attente', '$_enAttenteCount', AppColors.warning),
          const SizedBox(width: AppSpacing.sm),
          _buildStatChip('Annules', '$_annuleCount', AppColors.danger),
        ],
      ),
    );
  }

  Widget _buildStatChip(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: color, fontSize: 15),
            ),
            Text(
              label,
              style: TextStyle(fontSize: 9, color: color),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline() {
    if (_appointments.isEmpty) {
      return const Center(
        child: Text('Aucun rendez-vous pour ce jour',
            style: TextStyle(color: Colors.grey)),
      );
    }

    const totalHours = _endHour - _startHour;
    const timelineHeight = totalHours * _hourHeight;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hour labels column
          SizedBox(
            width: 44,
            height: timelineHeight,
            child: Stack(
              children: List.generate(totalHours + 1, (i) {
                return Positioned(
                  top: i * _hourHeight - 8,
                  child: Text(
                    '${(_startHour + i).toString().padLeft(2, '0')}:00',
                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          // Timeline with hour lines and appointment cards
          Expanded(
            child: SizedBox(
              height: timelineHeight,
              child: Stack(
                children: [
                  // Hour separator lines
                  ...List.generate(totalHours + 1, (i) {
                    return Positioned(
                      top: i * _hourHeight,
                      left: 0,
                      right: 0,
                      child: Divider(
                        height: 1,
                        color: Colors.grey.shade200,
                      ),
                    );
                  }),
                  // Appointment cards
                  ..._appointments.map((apt) {
                    final top = _timeToOffset(apt.heureDebut);
                    final height = _durationToHeight(apt.heureDebut, apt.heureFin);
                    return Positioned(
                      top: top,
                      left: 0,
                      right: 0,
                      height: height,
                      child: _buildTimelineCard(apt),
                    );
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineCard(Appointment apt) {
    final statusColor = _statusColor(apt.statut);
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 2, horizontal: 2),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border(left: BorderSide(color: statusColor, width: 3)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: () => _showAppointmentDetails(apt),
          child: Padding(
            padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm, vertical: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        apt.patientFullName,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 12),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      apt.heureDebut,
                      style: TextStyle(
                          fontSize: 10,
                          color: statusColor,
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                Text(
                  'Dr. ${apt.medecinFullName}',
                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  apt.medecinSpecialite,
                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showAppointmentDetails(Appointment apt) {
    final statusColor = _statusColor(apt.statut);
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'Details du rendez-vous',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _statusLabel(apt.statut),
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: statusColor),
                  ),
                ),
              ],
            ),
            const Divider(height: AppSpacing.lg),
            _detailRow(Icons.person, 'Patient', apt.patientFullName),
            _detailRow(Icons.medical_services,
                'Medecin', 'Dr. ${apt.medecinFullName}'),
            _detailRow(Icons.local_hospital, 'Specialite', apt.medecinSpecialite),
            _detailRow(Icons.access_time,
                'Horaire', '${apt.heureDebut} - ${apt.heureFin}'),
            _detailRow(Icons.notes, 'Motif', apt.motif),
            if (apt.statut == 'EN_ATTENTE') ...[
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.check, size: 16),
                      label: const Text('Confirmer'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.success,
                        side: const BorderSide(color: AppColors.success),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _confirmAppointment(apt.id);
                      },
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
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _cancelAppointment(apt.id);
                      },
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

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: AppSpacing.sm),
          Text('$label : ', style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
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

  String _statusLabel(String statut) {
    const labels = {
      'EN_ATTENTE': 'En attente',
      'CONFIRME': 'Confirme',
      'ANNULE': 'Annule',
      'TERMINE': 'Termine',
    };
    return labels[statut] ?? statut;
  }
}
