import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';

class SecretairePatients extends StatefulWidget {
  const SecretairePatients({super.key});

  @override
  State<SecretairePatients> createState() => _SecretairePatientsState();
}

class _SecretairePatientsState extends State<SecretairePatients> {
  late ApiService _apiService;
  List<User> _patients = [];
  List<User> _filtered = [];
  bool _isLoading = true;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadPatients();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.trim();
    if (query.isEmpty) {
      setState(() => _filtered = _patients);
    } else {
      _searchPatients(query);
    }
  }

  Future<void> _loadPatients() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final patients = await _apiService.getSecretairePatients();
      if (mounted) {
        setState(() {
          _patients = patients;
          _filtered = patients;
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

  Future<void> _searchPatients(String query) async {
    try {
      final results = await _apiService.searchPatients(query);
      if (mounted) setState(() => _filtered = results);
    } catch (_) {
      if (mounted) {
        setState(() => _filtered = _patients
            .where((p) =>
                p.fullName.toLowerCase().contains(query.toLowerCase()) ||
                p.email.toLowerCase().contains(query.toLowerCase()))
            .toList());
      }
    }
  }

  String _formatDate(String? date) {
    if (date == null) return '-';
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(date));
    } catch (_) {
      return date;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Patients')),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _loadPatients,
                    child: _filtered.isEmpty
                        ? const Center(
                            child: Text(
                              'Aucun patient trouve',
                              style: TextStyle(color: Colors.grey),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            itemCount: _filtered.length,
                            itemBuilder: (_, i) =>
                                _buildPatientCard(_filtered[i]),
                          ),
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showPatientDialog(null),
        icon: const Icon(Icons.person_add),
        label: const Text('Nouveau patient'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(AppSpacing.md),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Rechercher un patient...',
          prefixIcon: const Icon(Icons.search, color: AppColors.primary),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _filtered = _patients);
                  },
                )
              : null,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        ),
      ),
    );
  }

  Widget _buildPatientCard(User patient) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        leading: CircleAvatar(
          radius: 22,
          backgroundColor: AppColors.primary,
          child: Text(
            patient.initials,
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(
          patient.fullName,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Row(
              children: [
                const Icon(Icons.email_outlined, size: 12, color: Colors.grey),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    patient.email,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            if (patient.telephone != null) ...[
              const SizedBox(height: 2),
              Row(
                children: [
                  const Icon(Icons.phone_outlined,
                      size: 12, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    patient.telephone!,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ],
            if (patient.dateNaissance != null) ...[
              const SizedBox(height: 2),
              Row(
                children: [
                  const Icon(Icons.cake_outlined, size: 12, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    _formatDate(patient.dateNaissance),
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ],
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
          tooltip: 'Modifier',
          onPressed: () => _showPatientDialog(patient),
        ),
      ),
    );
  }

  void _showPatientDialog(User? patient) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _PatientFormSheet(
        patient: patient,
        apiService: _apiService,
        onSaved: () {
          _loadPatients();
          ErrorHandler.showMessage(
            context,
            patient == null
                ? 'Patient cree avec succes'
                : 'Patient mis a jour avec succes',
          );
        },
      ),
    );
  }
}

// ─── Patient Form Sheet ────────────────────────────────────────────────────

class _PatientFormSheet extends StatefulWidget {
  final User? patient;
  final ApiService apiService;
  final VoidCallback onSaved;

  const _PatientFormSheet({
    required this.patient,
    required this.apiService,
    required this.onSaved,
  });

  @override
  State<_PatientFormSheet> createState() => _PatientFormSheetState();
}

class _PatientFormSheetState extends State<_PatientFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _prenomCtrl;
  late final TextEditingController _nomCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _telCtrl;
  late final TextEditingController _adresseCtrl;
  late final TextEditingController _passwordCtrl;
  String? _dateNaissance;
  String? _groupeSanguin;
  bool _submitting = false;
  bool _obscurePassword = true;

  static const _groupesSanguins = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  bool get _isEdit => widget.patient != null;

  @override
  void initState() {
    super.initState();
    final p = widget.patient;
    _prenomCtrl = TextEditingController(text: p?.prenom ?? '');
    _nomCtrl = TextEditingController(text: p?.nom ?? '');
    _emailCtrl = TextEditingController(text: p?.email ?? '');
    _telCtrl = TextEditingController(text: p?.telephone ?? '');
    _adresseCtrl = TextEditingController(text: p?.adresse ?? '');
    _passwordCtrl = TextEditingController();
    _dateNaissance = p?.dateNaissance;
    _groupeSanguin = p?.groupeSanguin;
  }

  @override
  void dispose() {
    _prenomCtrl.dispose();
    _nomCtrl.dispose();
    _emailCtrl.dispose();
    _telCtrl.dispose();
    _adresseCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDateNaissance() async {
    final initial = _dateNaissance != null
        ? DateTime.tryParse(_dateNaissance!) ?? DateTime(1990)
        : DateTime(1990);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      locale: const Locale('fr', 'FR'),
    );
    if (picked != null && mounted) {
      setState(() =>
          _dateNaissance = DateFormat('yyyy-MM-dd').format(picked));
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);

    final data = {
      'prenom': _prenomCtrl.text.trim(),
      'nom': _nomCtrl.text.trim(),
      'email': _emailCtrl.text.trim(),
      'telephone': _telCtrl.text.trim().isEmpty ? null : _telCtrl.text.trim(),
      'adresse': _adresseCtrl.text.trim().isEmpty ? null : _adresseCtrl.text.trim(),
      'dateNaissance': _dateNaissance,
      'groupeSanguin': _groupeSanguin,
    };

    try {
      if (_isEdit) {
        await widget.apiService.updatePatientBySecretaire(
            widget.patient!.id, data);
      } else {
        await widget.apiService.createPatientBySecretaire(
            data, _passwordCtrl.text.trim());
      }
      if (mounted) {
        Navigator.pop(context);
        widget.onSaved();
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
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Text(
                    _isEdit ? 'Modifier le patient' : 'Nouveau patient',
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.bold),
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

              Row(
                children: [
                  Expanded(child: _buildField('Prenom *', _prenomCtrl, required: true)),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(child: _buildField('Nom *', _nomCtrl, required: true)),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              _buildField('Email *', _emailCtrl,
                  required: true,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Champ requis';
                    if (!v.contains('@')) return 'Email invalide';
                    return null;
                  }),
              const SizedBox(height: AppSpacing.md),

              _buildField('Telephone', _telCtrl,
                  keyboardType: TextInputType.phone),
              const SizedBox(height: AppSpacing.md),

              // Date Naissance
              const Text('Date de naissance',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: AppSpacing.xs),
              GestureDetector(
                onTap: _pickDateNaissance,
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
                      const Icon(Icons.cake_outlined,
                          size: 16, color: AppColors.primary),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        _dateNaissance != null
                            ? DateFormat('dd/MM/yyyy')
                                .format(DateTime.parse(_dateNaissance!))
                            : 'Selectionner une date',
                        style: TextStyle(
                          fontSize: 14,
                          color: _dateNaissance != null
                              ? Colors.black87
                              : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              _buildField('Adresse', _adresseCtrl),
              const SizedBox(height: AppSpacing.md),

              // Groupe sanguin
              const Text('Groupe sanguin',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: AppSpacing.xs),
              DropdownButtonFormField<String>(
                value: _groupeSanguin,
                hint: const Text('Selectionner'),
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.radius),
                  ),
                ),
                items: _groupesSanguins
                    .map((g) => DropdownMenuItem(
                          value: g,
                          child: Text(g),
                        ))
                    .toList(),
                onChanged: (v) => setState(() => _groupeSanguin = v),
              ),

              if (!_isEdit) ...[
                const SizedBox(height: AppSpacing.md),
                const Text('Mot de passe *',
                    style:
                        TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: AppSpacing.xs),
                TextFormField(
                  controller: _passwordCtrl,
                  obscureText: _obscurePassword,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Champ requis';
                    if (v.length < 6) return 'Minimum 6 caracteres';
                    return null;
                  },
                  decoration: InputDecoration(
                    hintText: 'Mot de passe',
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                      ),
                      onPressed: () => setState(
                          () => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                ),
              ],

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
                      : Text(_isEdit ? 'Enregistrer' : 'Creer le patient'),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(
    String label,
    TextEditingController ctrl, {
    bool required = false,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style:
                const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: AppSpacing.xs),
        TextFormField(
          controller: ctrl,
          keyboardType: keyboardType,
          validator: validator ??
              (required
                  ? (v) =>
                      (v == null || v.trim().isEmpty) ? 'Champ requis' : null
                  : null),
          decoration: InputDecoration(
            hintText: label.replaceAll(' *', ''),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }
}
