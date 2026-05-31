import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';

/// Onglet Profil du medecin : affichage, modification et deconnexion.
class MedecinProfile extends StatefulWidget {
  const MedecinProfile({super.key});

  @override
  State<MedecinProfile> createState() => _MedecinProfileState();
}

class _MedecinProfileState extends State<MedecinProfile> {
  late ApiService _apiService;

  final _formKey = GlobalKey<FormState>();
  final _prenomCtrl = TextEditingController();
  final _nomCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _telephoneCtrl = TextEditingController();
  final _biographieCtrl = TextEditingController();
  final _tarifCtrl = TextEditingController();
  final _dureeCtrl = TextEditingController();

  String _specialite = '';
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadProfile();
  }

  @override
  void dispose() {
    _prenomCtrl.dispose();
    _nomCtrl.dispose();
    _emailCtrl.dispose();
    _telephoneCtrl.dispose();
    _biographieCtrl.dispose();
    _tarifCtrl.dispose();
    _dureeCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final data = await _apiService.getMedecinProfile();
      if (mounted) {
        setState(() {
          _prenomCtrl.text = data['prenom'] ?? '';
          _nomCtrl.text = data['nom'] ?? '';
          _emailCtrl.text = data['email'] ?? '';
          _telephoneCtrl.text = data['telephone'] ?? '';
          _biographieCtrl.text = data['description'] ?? '';
          _tarifCtrl.text = data['tarifConsultation']?.toString() ?? '';
          _dureeCtrl.text = data['dureeConsultation']?.toString() ?? '';
          _specialite = data['specialite'] ?? '';
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

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      await _apiService.updateMedecinProfile({
        'prenom': _prenomCtrl.text.trim(),
        'nom': _nomCtrl.text.trim(),
        'telephone': _telephoneCtrl.text.trim(),
        'description': _biographieCtrl.text.trim(),
        'tarifConsultation': double.tryParse(_tarifCtrl.text.trim()),
        'dureeConsultation': int.tryParse(_dureeCtrl.text.trim()),
      });
      if (mounted) {
        setState(() => _isSaving = false);
        ErrorHandler.showMessage(context, 'Profil mis a jour avec succes');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ErrorHandler.showError(context, e);
      }
    }
  }

  Future<void> _confirmLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Deconnexion'),
        content:
            const Text('Voulez-vous vraiment vous deconnecter ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style:
                ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Deconnexion'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      await context.read<AuthService>().logout();
    }
  }

  String get _initials {
    final prenom = _prenomCtrl.text;
    final nom = _nomCtrl.text;
    final p = prenom.isNotEmpty ? prenom[0].toUpperCase() : '';
    final n = nom.isNotEmpty ? nom[0].toUpperCase() : '';
    return '$p$n';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mon Profil')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadProfile,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Avatar + name + specialty
                      _buildProfileHeader(),

                      const SizedBox(height: AppSpacing.lg),

                      // Personal info section
                      _buildSectionTitle('Informations personnelles'),
                      const SizedBox(height: AppSpacing.sm),

                      _buildField(
                        controller: _prenomCtrl,
                        label: 'Prenom',
                        icon: Icons.person_outline,
                        required: true,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _buildField(
                        controller: _nomCtrl,
                        label: 'Nom',
                        icon: Icons.person_outline,
                        required: true,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _buildField(
                        controller: _emailCtrl,
                        label: 'Email',
                        icon: Icons.email_outlined,
                        readOnly: true,
                        hint: 'Non modifiable',
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _buildField(
                        controller: _telephoneCtrl,
                        label: 'Telephone',
                        icon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                      ),

                      const SizedBox(height: AppSpacing.lg),

                      // Professional info section
                      _buildSectionTitle('Informations professionnelles'),
                      const SizedBox(height: AppSpacing.sm),

                      _buildField(
                        controller: _biographieCtrl,
                        label: 'Biographie / Description',
                        icon: Icons.info_outline,
                        maxLines: 4,
                        hint:
                            'Decrivez votre parcours et votre expertise...',
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Row(
                        children: [
                          Expanded(
                            child: _buildField(
                              controller: _tarifCtrl,
                              label: 'Tarif (DH)',
                              icon: Icons.payments_outlined,
                              keyboardType:
                                  const TextInputType.numberWithOptions(
                                      decimal: true),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: _buildField(
                              controller: _dureeCtrl,
                              label: 'Duree (min)',
                              icon: Icons.timer_outlined,
                              keyboardType: TextInputType.number,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: AppSpacing.xl),

                      // Save button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _isSaving ? null : _saveProfile,
                          icon: _isSaving
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white),
                                )
                              : const Icon(Icons.save_outlined),
                          label: const Text('Enregistrer les modifications'),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.md),

                      // Logout button
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.danger,
                            side: const BorderSide(color: AppColors.danger),
                          ),
                          onPressed: _confirmLogout,
                          icon: const Icon(Icons.logout),
                          label: const Text('Deconnexion'),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.lg),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildProfileHeader() {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Row(
          children: [
            CircleAvatar(
              radius: 34,
              backgroundColor: AppColors.primary,
              child: Text(
                _initials.isNotEmpty ? _initials : 'DR',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
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
                    'Dr. ${_prenomCtrl.text} ${_nomCtrl.text}'.trim() == 'Dr.'
                        ? 'Dr. ...'
                        : 'Dr. ${_prenomCtrl.text} ${_nomCtrl.text}',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  if (_specialite.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius:
                            BorderRadius.circular(AppSpacing.sm),
                      ),
                      child: Text(
                        _specialite,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    children: [
                      if (_tarifCtrl.text.isNotEmpty) ...[
                        const Icon(Icons.payments, size: 13,
                            color: AppColors.success),
                        const SizedBox(width: 3),
                        Text(
                          '${_tarifCtrl.text} DH',
                          style: const TextStyle(
                              fontSize: 12, color: AppColors.success),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                      ],
                      if (_dureeCtrl.text.isNotEmpty) ...[
                        const Icon(Icons.timer, size: 13,
                            color: Colors.grey),
                        const SizedBox(width: 3),
                        Text(
                          '${_dureeCtrl.text} min',
                          style: const TextStyle(
                              fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ],
                  ),
                ],
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
      style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.primaryDark,
          ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    IconData? icon,
    int maxLines = 1,
    bool readOnly = false,
    bool required = false,
    String? hint,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      readOnly: readOnly,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: icon != null ? Icon(icon) : null,
        filled: true,
        fillColor: readOnly ? Colors.grey.shade100 : Colors.white,
        alignLabelWithHint: maxLines > 1,
      ),
      validator: required
          ? (v) => (v == null || v.trim().isEmpty) ? 'Champ requis' : null
          : null,
    );
  }
}
