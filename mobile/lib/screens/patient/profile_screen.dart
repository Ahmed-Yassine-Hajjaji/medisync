import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../utils/error_handler.dart';
import 'documents_screen.dart';
import 'medication_reminders_screen.dart';
import 'clinic_map_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late ApiService _apiService;
  late AuthService _authService;

  final _formKey = GlobalKey<FormState>();
  bool _isEditing = false;
  bool _isSaving = false;
  bool _isLoading = false;

  // Form controllers
  late TextEditingController _prenomCtrl;
  late TextEditingController _nomCtrl;
  late TextEditingController _telephoneCtrl;
  late TextEditingController _dateNaissanceCtrl;
  late TextEditingController _adresseCtrl;
  late TextEditingController _antecedentsCtrl;

  String? _groupeSanguin;
  DateTime? _dateNaissance;

  static const List<String> _groupesSanguins = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
  ];

  @override
  void initState() {
    super.initState();
    _authService = context.read<AuthService>();
    _apiService = ApiService(_authService);

    final user = _authService.user;
    _prenomCtrl = TextEditingController(text: user?.prenom ?? '');
    _nomCtrl = TextEditingController(text: user?.nom ?? '');
    _telephoneCtrl = TextEditingController(text: user?.telephone ?? '');
    _dateNaissanceCtrl =
        TextEditingController(text: _fmtDate(user?.dateNaissance));
    _adresseCtrl = TextEditingController(text: user?.adresse ?? '');
    _antecedentsCtrl = TextEditingController();
    _groupeSanguin = user?.groupeSanguin;

    if (user?.dateNaissance != null) {
      _dateNaissance = DateTime.tryParse(user!.dateNaissance!);
    }

    _loadProfile();
  }

  @override
  void dispose() {
    _prenomCtrl.dispose();
    _nomCtrl.dispose();
    _telephoneCtrl.dispose();
    _dateNaissanceCtrl.dispose();
    _adresseCtrl.dispose();
    _antecedentsCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    try {
      final data = await _apiService.getPatientProfile();
      if (mounted) {
        final dn = data['dateNaissance'] as String?;
        setState(() {
          _prenomCtrl.text = data['prenom'] ?? _prenomCtrl.text;
          _nomCtrl.text = data['nom'] ?? _nomCtrl.text;
          _telephoneCtrl.text = data['telephone'] ?? _telephoneCtrl.text;
          _adresseCtrl.text = data['adresse'] ?? _adresseCtrl.text;
          _antecedentsCtrl.text = data['antecedents'] ?? '';
          _groupeSanguin = data['groupeSanguin'] ?? _groupeSanguin;
          if (dn != null) {
            _dateNaissance = DateTime.tryParse(dn);
            _dateNaissanceCtrl.text = _fmtDate(dn);
          }
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    try {
      final data = {
        'prenom': _prenomCtrl.text.trim(),
        'nom': _nomCtrl.text.trim(),
        'telephone': _telephoneCtrl.text.trim(),
        'adresse': _adresseCtrl.text.trim(),
        'groupeSanguin': _groupeSanguin,
        'antecedents': _antecedentsCtrl.text.trim(),
        if (_dateNaissance != null)
          'dateNaissance':
              DateFormat('yyyy-MM-dd').format(_dateNaissance!),
      };
      await _apiService.updatePatientProfile(data);
      if (mounted) {
        setState(() {
          _isSaving = false;
          _isEditing = false;
        });
        ErrorHandler.showMessage(context, 'Profil mis à jour');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ErrorHandler.showError(context, e);
      }
    }
  }

  Future<void> _pickDateNaissance() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateNaissance ?? DateTime(1990),
      firstDate: DateTime(1920),
      lastDate: DateTime.now().subtract(const Duration(days: 365)),
      locale: const Locale('fr'),
    );
    if (picked != null) {
      setState(() {
        _dateNaissance = picked;
        _dateNaissanceCtrl.text = _fmtDate(DateFormat('yyyy-MM-dd').format(picked));
      });
    }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radius),
        ),
        title: const Text('Déconnexion'),
        content: const Text('Voulez-vous vraiment vous déconnecter ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Se déconnecter'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    if (!mounted) return;
    await context.read<AuthService>().logout();
  }

  String _fmtDate(String? date) {
    if (date == null) return '';
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(date));
    } catch (_) {
      return date;
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;
    final initials = user?.initials ?? '?';
    final fullName = '${user?.prenom ?? ''} ${user?.nom ?? ''}'.trim();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon profil'),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              tooltip: 'Modifier',
              onPressed: () => setState(() => _isEditing = true),
            )
          else
            TextButton(
              onPressed: () => setState(() => _isEditing = false),
              child: const Text('Annuler'),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.md),
                children: [
                  // ── Avatar ───────────────────────────────────────────────
                  Center(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 48,
                          backgroundColor: AppColors.primary,
                          child: Text(
                            initials.isEmpty ? '?' : initials,
                            style: const TextStyle(
                              fontSize: 30,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          fullName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          user?.email ?? '',
                          style: TextStyle(
                              color: Colors.grey[600], fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // ── Informations personnelles ────────────────────────────
                  _SectionHeader(
                    icon: Icons.person_outline,
                    title: 'Informations personnelles',
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radius),
                      side: BorderSide(color: Colors.grey.withOpacity(0.2)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: _ProfileField(
                                  controller: _prenomCtrl,
                                  label: 'Prénom',
                                  enabled: _isEditing,
                                  validator: (v) =>
                                      v?.trim().isEmpty == true
                                          ? 'Requis'
                                          : null,
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: _ProfileField(
                                  controller: _nomCtrl,
                                  label: 'Nom',
                                  enabled: _isEditing,
                                  validator: (v) =>
                                      v?.trim().isEmpty == true
                                          ? 'Requis'
                                          : null,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          _ProfileField(
                            controller: TextEditingController(
                                text: user?.email ?? ''),
                            label: 'Email',
                            enabled: false,
                            keyboardType: TextInputType.emailAddress,
                            hint: 'Non modifiable',
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          _ProfileField(
                            controller: _telephoneCtrl,
                            label: 'Téléphone',
                            enabled: _isEditing,
                            keyboardType: TextInputType.phone,
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          _isEditing
                              ? InkWell(
                                  onTap: _pickDateNaissance,
                                  child: AbsorbPointer(
                                    child: _ProfileField(
                                      controller: _dateNaissanceCtrl,
                                      label: 'Date de naissance',
                                      enabled: true,
                                      suffixIcon: Icons.calendar_today,
                                    ),
                                  ),
                                )
                              : _ProfileField(
                                  controller: _dateNaissanceCtrl,
                                  label: 'Date de naissance',
                                  enabled: false,
                                ),
                          const SizedBox(height: AppSpacing.sm),
                          _ProfileField(
                            controller: _adresseCtrl,
                            label: 'Adresse',
                            enabled: _isEditing,
                            maxLines: 2,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // ── Informations médicales ───────────────────────────────
                  _SectionHeader(
                    icon: Icons.medical_information_outlined,
                    title: 'Informations médicales',
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.radius),
                      side: BorderSide(color: Colors.grey.withOpacity(0.2)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Groupe sanguin
                          const Text('Groupe sanguin',
                              style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.grey)),
                          const SizedBox(height: 4),
                          _isEditing
                              ? DropdownButtonFormField<String>(
                                  value: _groupeSanguin,
                                  decoration: InputDecoration(
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(
                                          AppSpacing.radius),
                                    ),
                                    isDense: true,
                                    hintText: 'Sélectionner',
                                  ),
                                  items: _groupesSanguins
                                      .map((g) => DropdownMenuItem(
                                            value: g,
                                            child: Text(g),
                                          ))
                                      .toList(),
                                  onChanged: (v) =>
                                      setState(() => _groupeSanguin = v),
                                )
                              : Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: AppSpacing.md,
                                      vertical: AppSpacing.sm),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.withOpacity(0.06),
                                    borderRadius: BorderRadius.circular(
                                        AppSpacing.radius),
                                    border: Border.all(
                                        color: Colors.grey.withOpacity(0.2)),
                                  ),
                                  child: Text(
                                    _groupeSanguin ?? 'Non renseigné',
                                    style: TextStyle(
                                      color: _groupeSanguin != null
                                          ? null
                                          : Colors.grey[500],
                                    ),
                                  ),
                                ),
                          const SizedBox(height: AppSpacing.md),

                          // Antécédents
                          const Text('Antécédents médicaux',
                              style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.grey)),
                          const SizedBox(height: 4),
                          TextFormField(
                            controller: _antecedentsCtrl,
                            enabled: _isEditing,
                            maxLines: 4,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius:
                                    BorderRadius.circular(AppSpacing.radius),
                              ),
                              hintText: _isEditing
                                  ? 'Allergies, maladies chroniques, opérations…'
                                  : 'Aucun antécédent renseigné',
                              filled: !_isEditing,
                              fillColor: Colors.grey.withOpacity(0.06),
                              isDense: true,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  if (_isEditing) ...[
                    const SizedBox(height: AppSpacing.lg),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isSaving ? null : _saveProfile,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding:
                              const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.circular(AppSpacing.radius),
                          ),
                        ),
                        icon: _isSaving
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.save),
                        label: Text(
                          _isSaving ? 'Enregistrement…' : 'Enregistrer',
                          style: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],

                  // ── Accès rapide ─────────────────────────────────────────
                  if (!_isEditing) ...[
                    const SizedBox(height: AppSpacing.lg),
                    _SectionHeader(
                      icon: Icons.apps_outlined,
                      title: 'Services',
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Card(
                      margin: EdgeInsets.zero,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radius),
                        side:
                            BorderSide(color: Colors.grey.withOpacity(0.2)),
                      ),
                      child: Column(
                        children: [
                          _ServiceTile(
                            icon: Icons.folder_outlined,
                            label: 'Mes documents',
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const DocumentsScreen()),
                            ),
                          ),
                          const Divider(height: 1, indent: 56),
                          _ServiceTile(
                            icon: Icons.alarm,
                            label: 'Rappels médicaments',
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) =>
                                      const MedicationRemindersScreen()),
                            ),
                          ),
                          const Divider(height: 1, indent: 56),
                          _ServiceTile(
                            icon: Icons.map_outlined,
                            label: 'Localiser la clinique',
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const ClinicMapScreen()),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    // Logout
                    Card(
                      margin: EdgeInsets.zero,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radius),
                        side: BorderSide(
                            color: AppColors.danger.withOpacity(0.2)),
                      ),
                      child: _ServiceTile(
                        icon: Icons.logout,
                        label: 'Se déconnecter',
                        iconColor: AppColors.danger,
                        labelColor: AppColors.danger,
                        onTap: _logout,
                      ),
                    ),
                  ],

                  const SizedBox(height: AppSpacing.xl),
                  Center(
                    child: Text(
                      'MediSync v1.0.0',
                      style: TextStyle(
                          color: Colors.grey[400], fontSize: 12),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                ],
              ),
            ),
    );
  }
}

// ─── Helper widgets ──────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;

  const _SectionHeader({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }
}

class _ProfileField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final bool enabled;
  final TextInputType? keyboardType;
  final int maxLines;
  final String? hint;
  final IconData? suffixIcon;
  final String? Function(String?)? validator;

  const _ProfileField({
    required this.controller,
    required this.label,
    required this.enabled,
    this.keyboardType,
    this.maxLines = 1,
    this.hint,
    this.suffixIcon,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      enabled: enabled,
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        suffixIcon: suffixIcon != null ? Icon(suffixIcon) : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radius),
        ),
        filled: !enabled,
        fillColor: Colors.grey.withOpacity(0.06),
        isDense: true,
      ),
    );
  }
}

class _ServiceTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? iconColor;
  final Color? labelColor;

  const _ServiceTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.iconColor,
    this.labelColor,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: iconColor ?? AppColors.primary),
      title: Text(
        label,
        style: TextStyle(color: labelColor),
      ),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    );
  }
}
