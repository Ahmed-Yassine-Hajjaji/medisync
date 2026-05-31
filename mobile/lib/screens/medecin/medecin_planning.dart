import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';

/// Onglet Planning : navigation par jour et gestion des disponibilites.
class MedecinPlanning extends StatefulWidget {
  const MedecinPlanning({super.key});

  @override
  State<MedecinPlanning> createState() => _MedecinPlanningState();
}

class _MedecinPlanningState extends State<MedecinPlanning> {
  late ApiService _apiService;
  DateTime _selectedDate = DateTime.now();
  List<Appointment> _appointments = [];
  List<Disponibilite> _disponibilites = [];
  bool _isLoadingApts = true;
  bool _isLoadingDispos = true;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadAppointments();
    _loadDisponibilites();
  }

  Future<void> _loadAppointments() async {
    if (mounted) setState(() => _isLoadingApts = true);
    try {
      final date = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final apts = await _apiService.getMedecinAppointmentsByDate(date);
      if (mounted) setState(() { _appointments = apts; _isLoadingApts = false; });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingApts = false);
        ErrorHandler.showError(context, e);
      }
    }
  }

  Future<void> _loadDisponibilites() async {
    if (mounted) setState(() => _isLoadingDispos = true);
    try {
      final dispos = await _apiService.getMedecinDisponibilites();
      if (mounted) setState(() { _disponibilites = dispos; _isLoadingDispos = false; });
    } catch (e) {
      if (mounted) setState(() => _isLoadingDispos = false);
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

  Future<void> _showAddDisponibiliteDialog() async {
    final joursOptions = [
      'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'
    ];
    final joursLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    String selectedJour = joursOptions[0];
    TimeOfDay heureDebut = const TimeOfDay(hour: 8, minute: 0);
    TimeOfDay heureFin = const TimeOfDay(hour: 17, minute: 0);
    bool isSubmitting = false;

    String _timeToString(TimeOfDay t) =>
        '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}:00';

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Ajouter une disponibilite'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Jour de la semaine',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: AppSpacing.xs),
                DropdownButtonFormField<String>(
                  value: selectedJour,
                  decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                  items: List.generate(
                    joursOptions.length,
                    (i) => DropdownMenuItem(value: joursOptions[i], child: Text(joursLabels[i])),
                  ),
                  onChanged: (v) { if (v != null) setDialogState(() => selectedJour = v); },
                ),
                const SizedBox(height: AppSpacing.md),
                const Text('Heure de debut',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: AppSpacing.xs),
                OutlinedButton.icon(
                  icon: const Icon(Icons.access_time, size: 16),
                  label: Text(heureDebut.format(ctx)),
                  onPressed: () async {
                    final t = await showTimePicker(context: ctx, initialTime: heureDebut);
                    if (t != null) setDialogState(() => heureDebut = t);
                  },
                ),
                const SizedBox(height: AppSpacing.md),
                const Text('Heure de fin',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: AppSpacing.xs),
                OutlinedButton.icon(
                  icon: const Icon(Icons.access_time, size: 16),
                  label: Text(heureFin.format(ctx)),
                  onPressed: () async {
                    final t = await showTimePicker(context: ctx, initialTime: heureFin);
                    if (t != null) setDialogState(() => heureFin = t);
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      setDialogState(() => isSubmitting = true);
                      try {
                        await _apiService.addDisponibilite({
                          'jourSemaine': selectedJour,
                          'heureDebut': _timeToString(heureDebut),
                          'heureFin': _timeToString(heureFin),
                          'conge': false,
                        });
                        if (mounted) Navigator.pop(ctx);
                        if (mounted) ErrorHandler.showMessage(context, 'Disponibilite ajoutee');
                        _loadDisponibilites();
                      } catch (e) {
                        setDialogState(() => isSubmitting = false);
                        if (mounted) ErrorHandler.showError(context, e);
                      }
                    },
              child: isSubmitting
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Ajouter'),
            ),
          ],
        ),
      ),
    );
  }

  String _dayLabel(String jourSemaine) {
    const map = {
      'LUNDI': 'Lundi',
      'MARDI': 'Mardi',
      'MERCREDI': 'Mercredi',
      'JEUDI': 'Jeudi',
      'VENDREDI': 'Vendredi',
      'SAMEDI': 'Samedi',
      'DIMANCHE': 'Dimanche',
    };
    return map[jourSemaine] ?? jourSemaine;
  }

  @override
  Widget build(BuildContext context) {
    final dateLabel = DateFormat('EEE d MMM yyyy', 'fr_FR').format(_selectedDate);
    final isToday = DateFormat('yyyy-MM-dd').format(_selectedDate) ==
        DateFormat('yyyy-MM-dd').format(DateTime.now());

    return Scaffold(
      appBar: AppBar(title: const Text('Planning')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddDisponibiliteDialog,
        icon: const Icon(Icons.add),
        label: const Text('Disponibilite'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await _loadAppointments();
          await _loadDisponibilites();
        },
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.md),
          children: [
            // Date selector
            Card(
              margin: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    vertical: AppSpacing.sm, horizontal: AppSpacing.md),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chevron_left),
                      onPressed: _goToPreviousDay,
                      tooltip: 'Jour precedent',
                    ),
                    Expanded(
                      child: Column(
                        children: [
                          Text(
                            dateLabel[0].toUpperCase() + dateLabel.substring(1),
                            style: const TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 15),
                            textAlign: TextAlign.center,
                          ),
                          if (isToday)
                            Container(
                              margin: const EdgeInsets.only(top: 2),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                "Aujourd'hui",
                                style: TextStyle(
                                    fontSize: 11,
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w600),
                              ),
                            ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.chevron_right),
                      onPressed: _goToNextDay,
                      tooltip: 'Jour suivant',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Appointments section
            Text(
              'Rendez-vous',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: AppSpacing.sm),
            if (_isLoadingApts)
              const Center(
                  child: Padding(
                padding: EdgeInsets.all(AppSpacing.lg),
                child: CircularProgressIndicator(),
              ))
            else if (_appointments.isEmpty)
              _buildEmptyCard('Aucun rendez-vous ce jour')
            else
              ..._appointments.map(_buildAppointmentTile),

            const SizedBox(height: AppSpacing.lg),

            // Disponibilites section
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Mes disponibilites',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            if (_isLoadingDispos)
              const Center(
                  child: Padding(
                padding: EdgeInsets.all(AppSpacing.lg),
                child: CircularProgressIndicator(),
              ))
            else if (_disponibilites.isEmpty)
              _buildEmptyCard('Aucune disponibilite configuree')
            else
              ..._disponibilites.map(_buildDisponibiliteTile),

            const SizedBox(height: 80), // FAB clearance
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentTile(Appointment apt) {
    Color statusColor;
    switch (apt.statut) {
      case 'CONFIRME': statusColor = AppColors.success; break;
      case 'EN_ATTENTE': statusColor = AppColors.warning; break;
      case 'ANNULE': statusColor = AppColors.danger; break;
      default: statusColor = Colors.grey;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: ListTile(
        leading: Container(
          width: 4,
          height: 40,
          decoration: BoxDecoration(
            color: statusColor,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        title: Text(
          apt.patientFullName.isNotEmpty
              ? apt.patientFullName
              : 'Patient #${apt.patientId}',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          '${apt.heureDebut.length >= 5 ? apt.heureDebut.substring(0, 5) : apt.heureDebut}'
          ' - '
          '${apt.heureFin.length >= 5 ? apt.heureFin.substring(0, 5) : apt.heureFin}'
          '  •  ${apt.motif}',
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.12),
            borderRadius: BorderRadius.circular(AppSpacing.sm),
          ),
          child: Text(
            apt.statut,
            style: TextStyle(
              fontSize: 10,
              color: statusColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _deleteDisponibilite(Disponibilite dispo) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer la disponibilite ?'),
        content: Text('Supprimer le creneau du ${_dayLabel(dispo.jourSemaine)} ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Supprimer', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
    if (confirm != true || dispo.id == null) return;
    try {
      await _apiService.deleteDisponibilite(dispo.id!);
      if (mounted) {
        ErrorHandler.showMessage(context, 'Disponibilite supprimee');
        _loadDisponibilites();
      }
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  Widget _buildDisponibiliteTile(Disponibilite dispo) {
    final isConge = dispo.conge ?? false;
    return Dismissible(
      key: ValueKey(dispo.id ?? dispo.jourSemaine + dispo.heureDebut),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        decoration: BoxDecoration(
          color: AppColors.danger,
          borderRadius: BorderRadius.circular(AppSpacing.radius),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      confirmDismiss: (_) async {
        await _deleteDisponibilite(dispo);
        return false;
      },
      child: Card(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor:
                (isConge ? AppColors.warning : AppColors.success).withOpacity(0.15),
            child: Icon(
              isConge ? Icons.beach_access : Icons.schedule,
              color: isConge ? AppColors.warning : AppColors.success,
              size: 20,
            ),
          ),
          title: Text(
            _dayLabel(dispo.jourSemaine),
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          subtitle: isConge
              ? const Text('Conge / Indisponible',
                  style: TextStyle(color: AppColors.warning))
              : Text(
                  '${dispo.heureDebut.length >= 5 ? dispo.heureDebut.substring(0, 5) : dispo.heureDebut}'
                  ' - '
                  '${dispo.heureFin.length >= 5 ? dispo.heureFin.substring(0, 5) : dispo.heureFin}',
                ),
          trailing: IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.danger, size: 20),
            onPressed: () => _deleteDisponibilite(dispo),
            tooltip: 'Supprimer',
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyCard(String message) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Center(
          child: Text(message, style: TextStyle(color: Colors.grey.shade500)),
        ),
      ),
    );
  }
}
