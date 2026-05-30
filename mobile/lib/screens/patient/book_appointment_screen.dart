import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../utils/error_handler.dart';

class BookAppointmentScreen extends StatefulWidget {
  /// When coming from a doctor card, the doctor is pre-selected.
  final Medecin? medecin;

  const BookAppointmentScreen({super.key, this.medecin});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  late ApiService _apiService;

  // Step tracking
  int _step = 0; // 0=doctor, 1=date+slot, 2=motif+confirm

  // Doctor selection
  List<Medecin> _medecins = [];
  Medecin? _selectedMedecin;
  bool _loadingDoctors = true;
  String _doctorSearch = '';
  final TextEditingController _searchController = TextEditingController();

  // Date selection
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));

  // Slot selection
  List<Creneau> _creneaux = [];
  Creneau? _selectedCreneau;
  bool _loadingSlots = false;

  // Motif
  String _selectedMotif = 'CONSULTATION_GENERALE';
  final List<Map<String, String>> _motifs = const [
    {'value': 'CONSULTATION_GENERALE', 'label': 'Consultation générale'},
    {'value': 'SUIVI', 'label': 'Suivi'},
    {'value': 'URGENCE', 'label': 'Urgence'},
    {'value': 'CONTROLE', 'label': 'Contrôle'},
    {'value': 'VACCINATION', 'label': 'Vaccination'},
    {'value': 'AUTRE', 'label': 'Autre'},
  ];

  bool _isBooking = false;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());

    if (widget.medecin != null) {
      _selectedMedecin = widget.medecin;
      _step = 1;
      _loadSlots();
    } else {
      _loadDoctors();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadDoctors() async {
    setState(() => _loadingDoctors = true);
    try {
      final medecins = await _apiService.getMedecins();
      if (mounted) {
        setState(() {
          _medecins = medecins;
          _loadingDoctors = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loadingDoctors = false);
        ErrorHandler.showError(context, e);
      }
    }
  }

  Future<void> _loadSlots() async {
    if (_selectedMedecin == null) return;
    setState(() {
      _loadingSlots = true;
      _selectedCreneau = null;
    });
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final creneaux =
          await _apiService.getCreneaux(_selectedMedecin!.id, dateStr);
      if (mounted) {
        setState(() {
          _creneaux = creneaux;
          _loadingSlots = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loadingSlots = false);
        ErrorHandler.showError(context, e);
      }
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      locale: const Locale('fr'),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
      await _loadSlots();
    }
  }

  Future<void> _bookAppointment() async {
    if (_selectedMedecin == null || _selectedCreneau == null) return;

    setState(() => _isBooking = true);
    try {
      await _apiService.createPatientAppointment(
        medecinId: _selectedMedecin!.id,
        date: DateFormat('yyyy-MM-dd').format(_selectedDate),
        heureDebut: _selectedCreneau!.heureDebut,
        motif: _selectedMotif,
      );
      if (mounted) {
        ErrorHandler.showMessage(context, 'Rendez-vous confirmé !');
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ErrorHandler.showError(context, e);
        setState(() => _isBooking = false);
      }
    }
  }

  List<Medecin> get _filteredMedecins {
    if (_doctorSearch.isEmpty) return _medecins;
    final q = _doctorSearch.toLowerCase();
    return _medecins.where((m) {
      return '${m.prenom} ${m.nom} ${m.specialite}'.toLowerCase().contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Prendre rendez-vous'),
      ),
      body: _step == 0
          ? _buildDoctorStep()
          : _step == 1
              ? _buildDateSlotStep()
              : _buildMotifStep(),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  // ─── Step 0 : Doctor selection ────────────────────────────────────────────

  Widget _buildDoctorStep() {
    return Column(
      children: [
        _buildStepIndicator(0),
        Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Rechercher un médecin…',
              prefixIcon: const Icon(Icons.search),
              filled: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radius),
                borderSide: BorderSide.none,
              ),
              suffixIcon: _doctorSearch.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _doctorSearch = '');
                      },
                    )
                  : null,
            ),
            onChanged: (v) => setState(() => _doctorSearch = v),
          ),
        ),
        Expanded(
          child: _loadingDoctors
              ? const Center(child: CircularProgressIndicator())
              : _filteredMedecins.isEmpty
                  ? Center(
                      child: Text(
                        'Aucun médecin trouvé',
                        style: TextStyle(color: Colors.grey[500]),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md),
                      itemCount: _filteredMedecins.length,
                      itemBuilder: (_, i) {
                        final m = _filteredMedecins[i];
                        final isSelected = _selectedMedecin?.id == m.id;
                        return Card(
                          margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.circular(AppSpacing.radius),
                            side: BorderSide(
                              color: isSelected
                                  ? AppColors.primary
                                  : Colors.grey.withOpacity(0.2),
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: ListTile(
                            onTap: () {
                              setState(() {
                                _selectedMedecin = m;
                                _creneaux = [];
                                _selectedCreneau = null;
                              });
                            },
                            leading: CircleAvatar(
                              backgroundColor: isSelected
                                  ? AppColors.primary
                                  : AppColors.primary.withOpacity(0.15),
                              child: Text(
                                m.initials,
                                style: TextStyle(
                                  color: isSelected
                                      ? Colors.white
                                      : AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              'Dr ${m.prenom} ${m.nom}',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: isSelected ? AppColors.primary : null,
                              ),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(m.specialite),
                                if (m.tarifConsultation != null)
                                  Text(
                                    '${m.tarifConsultation!.toStringAsFixed(0)} DA',
                                    style: TextStyle(
                                      color: AppColors.success,
                                      fontSize: 12,
                                    ),
                                  ),
                              ],
                            ),
                            trailing: isSelected
                                ? Icon(Icons.check_circle,
                                    color: AppColors.primary)
                                : null,
                            isThreeLine: m.tarifConsultation != null,
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }

  // ─── Step 1 : Date + slot ─────────────────────────────────────────────────

  Widget _buildDateSlotStep() {
    final m = _selectedMedecin!;
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        _buildStepIndicator(1),
        const SizedBox(height: AppSpacing.md),

        // Selected doctor recap
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radius),
            side: BorderSide(color: AppColors.primary.withOpacity(0.3)),
          ),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppColors.primary,
              child:
                  Text(m.initials, style: const TextStyle(color: Colors.white)),
            ),
            title: Text('Dr ${m.prenom} ${m.nom}',
                style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text(m.specialite),
            trailing: TextButton(
              onPressed: () => setState(() => _step = 0),
              child: const Text('Changer'),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Date picker
        Text('Date', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: AppSpacing.sm),
        InkWell(
          onTap: _pickDate,
          borderRadius: BorderRadius.circular(AppSpacing.radius),
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(AppSpacing.radius),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.calendar_today,
                        color: AppColors.primary, size: 20),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      DateFormat('EEEE d MMMM yyyy', 'fr').format(_selectedDate),
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                Icon(Icons.arrow_drop_down, color: Colors.grey[600]),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Time slots
        Text('Créneau horaire', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: AppSpacing.sm),
        if (_loadingSlots)
          const Center(
              child: Padding(
            padding: EdgeInsets.all(AppSpacing.lg),
            child: CircularProgressIndicator(),
          ))
        else if (_creneaux.isEmpty)
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radius),
              side: BorderSide(color: Colors.grey.withOpacity(0.3)),
            ),
            child: const Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Center(
                child: Text(
                  'Aucun créneau disponible pour cette date',
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ),
          )
        else
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: _creneaux.map((creneau) {
              final isSelected = _selectedCreneau?.heureDebut == creneau.heureDebut;
              return ChoiceChip(
                label: Text(creneau.heureDebut),
                selected: isSelected,
                onSelected: creneau.disponible
                    ? (selected) {
                        setState(() =>
                            _selectedCreneau = selected ? creneau : null);
                      }
                    : null,
                backgroundColor: creneau.disponible
                    ? null
                    : Colors.grey.shade200,
                selectedColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSelected
                      ? Colors.white
                      : creneau.disponible
                          ? Colors.grey[800]
                          : Colors.grey[400],
                  fontWeight:
                      isSelected ? FontWeight.w600 : FontWeight.normal,
                ),
                padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm, vertical: 6),
              );
            }).toList(),
          ),
        const SizedBox(height: 80),
      ],
    );
  }

  // ─── Step 2 : Motif + confirm ─────────────────────────────────────────────

  Widget _buildMotifStep() {
    final m = _selectedMedecin!;
    final slot = _selectedCreneau!;

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        _buildStepIndicator(2),
        const SizedBox(height: AppSpacing.md),

        // Summary card
        Card(
          elevation: 0,
          color: AppColors.primary.withOpacity(0.06),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radius),
            side: BorderSide(color: AppColors.primary.withOpacity(0.2)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Récapitulatif',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    )),
                const SizedBox(height: AppSpacing.sm),
                _SummaryRow(
                    icon: Icons.person,
                    text: 'Dr ${m.prenom} ${m.nom} – ${m.specialite}'),
                _SummaryRow(
                    icon: Icons.calendar_today,
                    text: DateFormat('EEEE d MMMM yyyy', 'fr')
                        .format(_selectedDate)),
                _SummaryRow(
                    icon: Icons.access_time,
                    text: '${slot.heureDebut} – ${slot.heureFin}'),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Motif
        Text('Motif de consultation',
            style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: AppSpacing.sm),
        DropdownButtonFormField<String>(
          value: _selectedMotif,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radius),
            ),
            contentPadding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md, vertical: AppSpacing.sm),
          ),
          items: _motifs
              .map((m) => DropdownMenuItem(
                    value: m['value'],
                    child: Text(m['label']!),
                  ))
              .toList(),
          onChanged: (v) => setState(() => _selectedMotif = v!),
        ),
        const SizedBox(height: AppSpacing.xl),

        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _isBooking ? null : _bookAppointment,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radius),
              ),
            ),
            icon: _isBooking
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.check_circle_outline),
            label: Text(
              _isBooking ? 'Confirmation…' : 'Confirmer le rendez-vous',
              style: const TextStyle(
                  fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        ),
        const SizedBox(height: 80),
      ],
    );
  }

  // ─── Step indicator ───────────────────────────────────────────────────────

  Widget _buildStepIndicator(int current) {
    const steps = ['Médecin', 'Date & heure', 'Confirmation'];
    return Padding(
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md, vertical: AppSpacing.sm),
      child: Row(
        children: List.generate(steps.length, (i) {
          final isActive = i == current;
          final isDone = i < current;
          return Expanded(
            child: Row(
              children: [
                if (i > 0)
                  Expanded(
                    child: Container(
                      height: 2,
                      color: isDone
                          ? AppColors.primary
                          : Colors.grey.withOpacity(0.3),
                    ),
                  ),
                Column(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isActive || isDone
                            ? AppColors.primary
                            : Colors.grey.withOpacity(0.3),
                      ),
                      child: Center(
                        child: isDone
                            ? const Icon(Icons.check,
                                size: 16, color: Colors.white)
                            : Text(
                                '${i + 1}',
                                style: TextStyle(
                                  color: isActive
                                      ? Colors.white
                                      : Colors.grey[600],
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      steps[i],
                      style: TextStyle(
                        fontSize: 10,
                        color: isActive ? AppColors.primary : Colors.grey[500],
                        fontWeight:
                            isActive ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
                if (i < steps.length - 1)
                  Expanded(
                    child: Container(
                      height: 2,
                      color: i < current
                          ? AppColors.primary
                          : Colors.grey.withOpacity(0.3),
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ─── Bottom navigation bar ────────────────────────────────────────────────

  Widget? _buildBottomBar() {
    if (_step == 0) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _selectedMedecin == null
                  ? null
                  : () async {
                      setState(() => _step = 1);
                      await _loadSlots();
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
              ),
              child: const Text('Continuer',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
          ),
        ),
      );
    }
    if (_step == 1) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              OutlinedButton(
                onPressed: () => setState(() => _step = 0),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                      vertical: 14, horizontal: AppSpacing.lg),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.radius),
                  ),
                ),
                child: const Text('Retour'),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: ElevatedButton(
                  onPressed: _selectedCreneau == null
                      ? null
                      : () => setState(() => _step = 2),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radius),
                    ),
                  ),
                  child: const Text('Suivant',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      );
    }
    if (_step == 2) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: TextButton(
            onPressed: () => setState(() => _step = 1),
            child: const Text('Retour'),
          ),
        ),
      );
    }
    return null;
  }
}

class _SummaryRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _SummaryRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 6),
      child: Row(
        children: [
          Icon(icon, size: 15, color: AppColors.primary.withOpacity(0.7)),
          const SizedBox(width: 8),
          Expanded(
              child: Text(text, style: const TextStyle(fontSize: 13))),
        ],
      ),
    );
  }
}
