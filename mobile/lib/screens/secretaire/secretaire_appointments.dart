import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';

class SecretaireAppointments extends StatefulWidget {
  const SecretaireAppointments({super.key});

  @override
  State<SecretaireAppointments> createState() => _SecretaireAppointmentsState();
}

class _SecretaireAppointmentsState extends State<SecretaireAppointments> {
  late ApiService _apiService;
  List<Appointment> _appointments = [];
  bool _isLoading = true;

  DateTime _filterDateFrom = DateTime.now();
  DateTime _filterDateTo = DateTime.now();
  bool _rangeMode = false;
  String? _filterStatut;

  static const _statuts = ['Tous', 'EN_ATTENTE', 'CONFIRME', 'ANNULE', 'TERMINE'];
  static const _statutLabels = {
    'Tous': 'Tous',
    'EN_ATTENTE': 'En attente',
    'CONFIRME': 'Confirme',
    'ANNULE': 'Annule',
    'TERMINE': 'Termine',
  };

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      List<Appointment> apts;
      if (_rangeMode) {
        final from = DateFormat('yyyy-MM-dd').format(_filterDateFrom);
        final to = DateFormat('yyyy-MM-dd').format(_filterDateTo);
        apts = await _apiService.getSecretaireAppointmentsBetween(from, to);
      } else {
        final dateStr = DateFormat('yyyy-MM-dd').format(_filterDateFrom);
        apts = await _apiService.getSecretaireAppointmentsByDate(dateStr);
      }
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

  List<Appointment> get _filtered {
    return _appointments.where((a) {
      if (_filterStatut != null && _filterStatut != 'Tous') {
        return a.statut == _filterStatut;
      }
      return true;
    }).toList();
  }

  Future<void> _pickDate({required bool isFrom}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isFrom ? _filterDateFrom : _filterDateTo,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      locale: const Locale('fr', 'FR'),
    );
    if (picked != null && mounted) {
      setState(() {
        if (isFrom) {
          _filterDateFrom = picked;
          if (!_rangeMode) _filterDateTo = picked;
          if (_filterDateTo.isBefore(_filterDateFrom)) _filterDateTo = _filterDateFrom;
        } else {
          _filterDateTo = picked;
          if (_filterDateTo.isBefore(_filterDateFrom)) _filterDateFrom = _filterDateTo;
        }
      });
      _loadAppointments();
    }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rendez-vous')),
      body: Column(
        children: [
          _buildFilterBar(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _loadAppointments,
                    child: _filtered.isEmpty
                        ? const Center(
                            child: Text(
                              'Aucun rendez-vous',
                              style: TextStyle(color: Colors.grey),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            itemCount: _filtered.length,
                            itemBuilder: (_, i) =>
                                _buildAppointmentCard(_filtered[i]),
                          ),
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateAppointmentSheet,
        icon: const Icon(Icons.add),
        label: const Text('Nouveau RDV'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildFilterBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => _pickDate(isFrom: true),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(AppSpacing.radius),
                      color: Colors.white,
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today,
                            size: 14, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            _rangeMode ? 'Du ${DateFormat('dd/MM').format(_filterDateFrom)}' : DateFormat('dd/MM/yyyy').format(_filterDateFrom),
                            style: const TextStyle(fontSize: 12),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              if (_rangeMode) ...[
                const SizedBox(width: 6),
                Expanded(
                  child: GestureDetector(
                    onTap: () => _pickDate(isFrom: false),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(AppSpacing.radius),
                        color: Colors.white,
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today,
                              size: 14, color: AppColors.primary),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Au ${DateFormat('dd/MM').format(_filterDateTo)}',
                              style: const TextStyle(fontSize: 12),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
              const SizedBox(width: 6),
              GestureDetector(
                onTap: () {
                  setState(() {
                    _rangeMode = !_rangeMode;
                    if (!_rangeMode) _filterDateTo = _filterDateFrom;
                  });
                  _loadAppointments();
                },
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: _rangeMode ? AppColors.primary.withOpacity(0.1) : Colors.white,
                    border: Border.all(color: _rangeMode ? AppColors.primary : Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(AppSpacing.radius),
                  ),
                  child: Icon(Icons.date_range,
                      size: 18, color: _rangeMode ? AppColors.primary : Colors.grey),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _filterStatut ?? 'Tous',
                  decoration: InputDecoration(
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radius),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radius),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  items: _statuts
                      .map((s) => DropdownMenuItem(
                            value: s,
                            child: Text(_statutLabels[s] ?? s,
                                style: const TextStyle(fontSize: 12)),
                          ))
                      .toList(),
                  onChanged: (val) => setState(() => _filterStatut = val),
                ),
              ),
            ],
          ),
        ],
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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
                        color: AppColors.primary, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(apt.patientFullName,
                          style: const TextStyle(fontWeight: FontWeight.w600)),
                      Text(
                        'Dr. ${apt.medecinFullName} - ${apt.medecinSpecialite}',
                        style:
                            const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Text('Motif : ${apt.motif}',
                style: const TextStyle(fontSize: 12, color: Colors.black54)),
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
    const labels = {
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
            fontSize: 11, fontWeight: FontWeight.w600, color: color),
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

  // ─── CREATE APPOINTMENT ───────────────────────────────────────────────────

  void _showCreateAppointmentSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _CreateAppointmentSheet(
        apiService: _apiService,
        onCreated: () {
          _loadAppointments();
          ErrorHandler.showMessage(context, 'Rendez-vous cree avec succes');
        },
      ),
    );
  }
}

// ─── Create Appointment Bottom Sheet ───────────────────────────────────────

class _CreateAppointmentSheet extends StatefulWidget {
  final ApiService apiService;
  final VoidCallback onCreated;

  const _CreateAppointmentSheet({
    required this.apiService,
    required this.onCreated,
  });

  @override
  State<_CreateAppointmentSheet> createState() =>
      _CreateAppointmentSheetState();
}

class _CreateAppointmentSheetState extends State<_CreateAppointmentSheet> {
  final _searchController = TextEditingController();
  final _motifController = TextEditingController();

  User? _selectedPatient;
  Medecin? _selectedMedecin;
  Creneau? _selectedCreneau;
  DateTime _selectedDate = DateTime.now();
  String _selectedMotif = 'CONSULTATION_GENERALE';

  List<User> _patientSuggestions = [];
  List<Medecin> _medecins = [];
  List<Creneau> _creneaux = [];

  bool _loadingMedecins = false;
  bool _loadingCreneaux = false;
  bool _loadingPatients = false;
  bool _submitting = false;
  bool _showSuggestions = false;

  static const _motifs = [
    'CONSULTATION_GENERALE',
    'SUIVI',
    'URGENCE',
    'VACCINATION',
    'CERTIFICAT_MEDICAL',
    'RENOUVELLEMENT_ORDONNANCE',
    'AUTRE',
  ];

  static const _motifLabels = {
    'CONSULTATION_GENERALE': 'Consultation generale',
    'SUIVI': 'Suivi',
    'URGENCE': 'Urgence',
    'VACCINATION': 'Vaccination',
    'CERTIFICAT_MEDICAL': 'Certificat medical',
    'RENOUVELLEMENT_ORDONNANCE': 'Renouvellement ordonnance',
    'AUTRE': 'Autre',
  };

  @override
  void initState() {
    super.initState();
    _loadMedecins();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _motifController.dispose();
    super.dispose();
  }

  Future<void> _loadMedecins() async {
    setState(() => _loadingMedecins = true);
    try {
      final medecins = await widget.apiService.getMedecins();
      if (mounted) {
        setState(() {
          _medecins = medecins;
          _loadingMedecins = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loadingMedecins = false);
    }
  }

  Future<void> _searchPatients(String query) async {
    if (query.length < 2) {
      setState(() {
        _patientSuggestions = [];
        _showSuggestions = false;
      });
      return;
    }
    setState(() => _loadingPatients = true);
    try {
      final patients = await widget.apiService.searchPatients(query);
      if (mounted) {
        setState(() {
          _patientSuggestions = patients;
          _showSuggestions = true;
          _loadingPatients = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingPatients = false);
    }
  }

  Future<void> _loadCreneaux() async {
    if (_selectedMedecin == null) return;
    setState(() {
      _loadingCreneaux = true;
      _creneaux = [];
      _selectedCreneau = null;
    });
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final creneaux = await widget.apiService.getCreneaux(
          _selectedMedecin!.id, dateStr);
      if (mounted) {
        setState(() {
          _creneaux = creneaux.where((c) => c.disponible).toList();
          _loadingCreneaux = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loadingCreneaux = false);
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      locale: const Locale('fr', 'FR'),
    );
    if (picked != null && mounted) {
      setState(() => _selectedDate = picked);
      _loadCreneaux();
    }
  }

  Future<void> _submit() async {
    if (_selectedPatient == null) {
      ErrorHandler.showMessage(context, 'Veuillez selectionner un patient', isError: true);
      return;
    }
    if (_selectedMedecin == null) {
      ErrorHandler.showMessage(context, 'Veuillez selectionner un medecin', isError: true);
      return;
    }
    if (_selectedCreneau == null) {
      ErrorHandler.showMessage(context, 'Veuillez selectionner un creneau', isError: true);
      return;
    }

    setState(() => _submitting = true);
    try {
      String heureDebut = _selectedCreneau!.heureDebut;
      if (heureDebut.length == 5) heureDebut = '$heureDebut:00';
      await widget.apiService.createSecretaireAppointment({
        'patientId': _selectedPatient!.id,
        'medecinId': _selectedMedecin!.id,
        'date': DateFormat('yyyy-MM-dd').format(_selectedDate),
        'heureDebut': heureDebut,
        'motif': _selectedMotif,
      });
      if (mounted) {
        Navigator.pop(context);
        widget.onCreated();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ErrorHandler.showError(context, e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                const Text(
                  'Nouveau Rendez-vous',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: AppSpacing.sm),

            // Patient Search
            const Text('Patient *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: AppSpacing.xs),
            if (_selectedPatient != null)
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.primary,
                      child: Text(
                        _selectedPatient!.initials,
                        style: const TextStyle(
                            color: Colors.white, fontSize: 12),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_selectedPatient!.fullName,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600)),
                          Text(_selectedPatient!.email,
                              style: const TextStyle(
                                  fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 18),
                      onPressed: () =>
                          setState(() => _selectedPatient = null),
                    ),
                  ],
                ),
              )
            else
              Column(
                children: [
                  TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Rechercher un patient...',
                      prefixIcon: _loadingPatients
                          ? const Padding(
                              padding: EdgeInsets.all(12),
                              child: SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                            )
                          : const Icon(Icons.search),
                      contentPadding:
                          const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                    ),
                    onChanged: _searchPatients,
                  ),
                  if (_showSuggestions && _patientSuggestions.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(top: 2),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radius),
                        boxShadow: const [
                          BoxShadow(
                              color: Colors.black12,
                              blurRadius: 6,
                              offset: Offset(0, 2)),
                        ],
                      ),
                      child: Column(
                        children: _patientSuggestions
                            .take(5)
                            .map(
                              (p) => ListTile(
                                dense: true,
                                leading: CircleAvatar(
                                  radius: 14,
                                  backgroundColor:
                                      AppColors.primary.withOpacity(0.15),
                                  child: Text(
                                    p.initials,
                                    style: const TextStyle(
                                        fontSize: 10,
                                        color: AppColors.primary),
                                  ),
                                ),
                                title: Text(p.fullName,
                                    style: const TextStyle(fontSize: 13)),
                                subtitle: Text(p.email,
                                    style: const TextStyle(fontSize: 11)),
                                onTap: () {
                                  setState(() {
                                    _selectedPatient = p;
                                    _showSuggestions = false;
                                    _searchController.clear();
                                  });
                                },
                              ),
                            )
                            .toList(),
                      ),
                    ),
                ],
              ),

            const SizedBox(height: AppSpacing.md),

            // Doctor Dropdown
            const Text('Medecin *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: AppSpacing.xs),
            _loadingMedecins
                ? const Center(child: CircularProgressIndicator())
                : DropdownButtonFormField<Medecin>(
                    value: _selectedMedecin,
                    hint: const Text('Selectionner un medecin'),
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radius),
                      ),
                    ),
                    items: _medecins
                        .map((m) => DropdownMenuItem(
                              value: m,
                              child: Text(
                                  'Dr. ${m.fullName} - ${m.specialite}',
                                  style: const TextStyle(fontSize: 13)),
                            ))
                        .toList(),
                    onChanged: (m) {
                      setState(() => _selectedMedecin = m);
                      _loadCreneaux();
                    },
                  ),

            const SizedBox(height: AppSpacing.md),

            // Date Picker
            const Text('Date *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: AppSpacing.xs),
            GestureDetector(
              onTap: _pickDate,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 14),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                  color: Colors.white,
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today,
                        size: 16, color: AppColors.primary),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      DateFormat('dd/MM/yyyy').format(_selectedDate),
                      style: const TextStyle(fontSize: 14),
                    ),
                    const Spacer(),
                    const Icon(Icons.arrow_drop_down, color: Colors.grey),
                  ],
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // Time Slots
            const Text('Creneau horaire *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: AppSpacing.xs),
            if (_loadingCreneaux)
              const Center(child: CircularProgressIndicator())
            else if (_creneaux.isEmpty && _selectedMedecin != null)
              const Text('Aucun creneau disponible pour cette date',
                  style: TextStyle(color: Colors.grey, fontSize: 13))
            else if (_selectedMedecin == null)
              const Text('Selectionner un medecin pour voir les creneaux',
                  style: TextStyle(color: Colors.grey, fontSize: 13))
            else
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: _creneaux.map((c) {
                  final isSelected = _selectedCreneau == c;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedCreneau = c),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.primary.withOpacity(0.08),
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radius),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.primary.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        c.heureDebut,
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : AppColors.primary,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

            const SizedBox(height: AppSpacing.md),

            // Motif
            const Text('Motif *',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: AppSpacing.xs),
            DropdownButtonFormField<String>(
              value: _selectedMotif,
              decoration: InputDecoration(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
              ),
              items: _motifs
                  .map((m) => DropdownMenuItem(
                        value: m,
                        child: Text(_motifLabels[m] ?? m, style: const TextStyle(fontSize: 13)),
                      ))
                  .toList(),
              onChanged: (v) => setState(() => _selectedMotif = v ?? _motifs.first),
            ),

            const SizedBox(height: AppSpacing.lg),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submitting ? null : _submit,
                child: _submitting
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Creer le rendez-vous'),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
          ],
        ),
      ),
    );
  }
}
