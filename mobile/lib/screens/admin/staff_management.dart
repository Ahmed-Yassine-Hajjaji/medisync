import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../utils/error_handler.dart';

const List<String> _specialites = [
  'GENERALISTE',
  'CARDIOLOGUE',
  'DERMATOLOGUE',
  'PEDIATRE',
  'OPHTALMOLOGUE',
  'ORL',
  'GYNECO',
  'NEUROLOGUE',
  'PSYCHIATRE',
  'RADIOLOGUE',
];

/// Ecran de gestion du personnel (medecins et secretaires).
class StaffManagement extends StatefulWidget {
  const StaffManagement({super.key});

  @override
  State<StaffManagement> createState() => _StaffManagementState();
}

class _StaffManagementState extends State<StaffManagement>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Medecin> _medecins = [];
  List<User> _secretaires = [];
  bool _loading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final api = ApiService(context.read<AuthService>());
      final results = await Future.wait([
        api.getAdminMedecins(),
        // Secretaires are fetched via patient endpoint substitute; adapt if backend adds dedicated route.
        api.getAdminPatients(),
      ]);
      if (!mounted) return;
      setState(() {
        _medecins = (results[0] as List).cast<Medecin>();
        // Filter secretaires from admin patients list (role-based)
        // In practice the backend may have a dedicated /admin/secretaires endpoint.
        _secretaires = (results[1] as List)
            .cast<User>()
            .where((u) => u.role == 'SECRETAIRE')
            .toList();
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ErrorHandler.showError(context, e);
    }
  }

  Future<void> _toggleStatus(int id, bool currentStatus) async {
    try {
      final api = ApiService(context.read<AuthService>());
      await api.toggleUserStatus(id, !currentStatus);
      if (!mounted) return;
      ErrorHandler.showMessage(
        context,
        !currentStatus ? 'Compte active' : 'Compte desactive',
      );
      _load();
    } catch (e) {
      if (!mounted) return;
      ErrorHandler.showError(context, e);
    }
  }

  void _showAddDialog() {
    showDialog(
      context: context,
      builder: (_) => _AddStaffDialog(
        onCreated: () {
          _load();
        },
      ),
    );
  }

  List<Medecin> get _filteredMedecins {
    if (_searchQuery.isEmpty) return _medecins;
    final q = _searchQuery.toLowerCase();
    return _medecins.where((m) {
      return m.fullName.toLowerCase().contains(q) ||
          m.specialite.toLowerCase().contains(q) ||
          (m.email?.toLowerCase().contains(q) ?? false);
    }).toList();
  }

  List<User> get _filteredSecretaires {
    if (_searchQuery.isEmpty) return _secretaires;
    final q = _searchQuery.toLowerCase();
    return _secretaires.where((s) {
      return s.fullName.toLowerCase().contains(q) ||
          s.email.toLowerCase().contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Gestion du personnel'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'Medecins'),
            Tab(text: 'Secretaires'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddDialog,
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.person_add),
        label: const Text('Ajouter'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.sm,
            ),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v),
              decoration: InputDecoration(
                hintText: 'Rechercher...',
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () => setState(() => _searchQuery = ''),
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(
                  vertical: AppSpacing.sm,
                  horizontal: AppSpacing.md,
                ),
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildMedecinsList(),
                      _buildSecretairesList(),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildMedecinsList() {
    final items = _filteredMedecins;
    if (items.isEmpty) {
      return _buildEmpty('Aucun medecin trouve');
    }
    return RefreshIndicator(
      onRefresh: _load,
      color: AppColors.primary,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          AppSpacing.sm,
          AppSpacing.md,
          100,
        ),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
        itemBuilder: (_, i) => _MedecinCard(
          medecin: items[i],
          onToggleStatus: () =>
              _toggleStatus(items[i].id, items[i].enabled ?? true),
        ),
      ),
    );
  }

  Widget _buildSecretairesList() {
    final items = _filteredSecretaires;
    if (items.isEmpty) {
      return _buildEmpty('Aucune secretaire trouvee');
    }
    return RefreshIndicator(
      onRefresh: _load,
      color: AppColors.primary,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          AppSpacing.sm,
          AppSpacing.md,
          100,
        ),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
        itemBuilder: (_, i) => _SecretaireCard(
          user: items[i],
          onToggleStatus: () =>
              _toggleStatus(items[i].id, items[i].enabled ?? true),
        ),
      ),
    );
  }

  Widget _buildEmpty(String message) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.people_outline, size: 64, color: Colors.grey[300]),
          const SizedBox(height: AppSpacing.md),
          Text(
            message,
            style: TextStyle(color: Colors.grey[500], fontSize: 15),
          ),
        ],
      ),
    );
  }
}

class _MedecinCard extends StatelessWidget {
  final Medecin medecin;
  final VoidCallback onToggleStatus;

  const _MedecinCard({required this.medecin, required this.onToggleStatus});

  @override
  Widget build(BuildContext context) {
    final isEnabled = medecin.enabled ?? true;
    return Card(
      margin: EdgeInsets.zero,
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.primary.withOpacity(0.12),
                  child: Text(
                    medecin.initials,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: isEnabled ? AppColors.success : Colors.grey,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          medecin.fullName,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Medecin',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    medecin.specialite,
                    style: TextStyle(color: Colors.grey[600], fontSize: 13),
                  ),
                  if (medecin.email != null)
                    Text(
                      medecin.email!,
                      style: TextStyle(color: Colors.grey[500], fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  if (medecin.tarifConsultation != null)
                    Text(
                      'Tarif: ${medecin.tarifConsultation!.toStringAsFixed(0)} DH',
                      style: const TextStyle(
                        color: AppColors.success,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            IconButton(
              onPressed: onToggleStatus,
              icon: Icon(
                isEnabled ? Icons.toggle_on : Icons.toggle_off,
                size: 36,
                color: isEnabled ? AppColors.success : Colors.grey,
              ),
              tooltip: isEnabled ? 'Desactiver' : 'Activer',
            ),
          ],
        ),
      ),
    );
  }
}

class _SecretaireCard extends StatelessWidget {
  final User user;
  final VoidCallback onToggleStatus;

  const _SecretaireCard({required this.user, required this.onToggleStatus});

  @override
  Widget build(BuildContext context) {
    final isEnabled = user.enabled ?? true;
    return Card(
      margin: EdgeInsets.zero,
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.warning.withOpacity(0.15),
                  child: Text(
                    user.initials,
                    style: const TextStyle(
                      color: AppColors.warning,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: isEnabled ? AppColors.success : Colors.grey,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          user.fullName,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Secretaire',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.warning,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    user.email,
                    style: TextStyle(color: Colors.grey[500], fontSize: 12),
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (user.telephone != null)
                    Text(
                      user.telephone!,
                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                    ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            IconButton(
              onPressed: onToggleStatus,
              icon: Icon(
                isEnabled ? Icons.toggle_on : Icons.toggle_off,
                size: 36,
                color: isEnabled ? AppColors.success : Colors.grey,
              ),
              tooltip: isEnabled ? 'Desactiver' : 'Activer',
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Add Staff Dialog ───────────────────────────────────────────────────────

class _AddStaffDialog extends StatefulWidget {
  final VoidCallback onCreated;

  const _AddStaffDialog({required this.onCreated});

  @override
  State<_AddStaffDialog> createState() => _AddStaffDialogState();
}

class _AddStaffDialogState extends State<_AddStaffDialog>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _formKeyMedecin = GlobalKey<FormState>();
  final _formKeySecretaire = GlobalKey<FormState>();
  bool _saving = false;

  // Medecin fields
  final _medecinPrenom = TextEditingController();
  final _medecinNom = TextEditingController();
  final _medecinEmail = TextEditingController();
  final _medecinTel = TextEditingController();
  final _medecinTarif = TextEditingController();
  final _medecinPassword = TextEditingController();
  String _selectedSpecialite = _specialites.first;
  bool _obscureMedecin = true;

  // Secretaire fields
  final _secPrenom = TextEditingController();
  final _secNom = TextEditingController();
  final _secEmail = TextEditingController();
  final _secTel = TextEditingController();
  final _secPassword = TextEditingController();
  bool _obscureSec = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _medecinPrenom.dispose();
    _medecinNom.dispose();
    _medecinEmail.dispose();
    _medecinTel.dispose();
    _medecinTarif.dispose();
    _medecinPassword.dispose();
    _secPrenom.dispose();
    _secNom.dispose();
    _secEmail.dispose();
    _secTel.dispose();
    _secPassword.dispose();
    super.dispose();
  }

  Future<void> _saveMedecin() async {
    if (!_formKeyMedecin.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final api = ApiService(context.read<AuthService>());
      await api.createMedecin(
        {
          'prenom': _medecinPrenom.text.trim(),
          'nom': _medecinNom.text.trim(),
          'email': _medecinEmail.text.trim(),
          'telephone': _medecinTel.text.trim(),
          'specialite': _selectedSpecialite,
          'tarifConsultation': double.tryParse(_medecinTarif.text.trim()) ?? 0,
        },
        _medecinPassword.text,
      );
      if (!mounted) return;
      Navigator.pop(context);
      widget.onCreated();
      ErrorHandler.showMessage(context, 'Medecin cree avec succes');
    } catch (e) {
      if (!mounted) return;
      ErrorHandler.showError(context, e);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _saveSecretaire() async {
    if (!_formKeySecretaire.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final api = ApiService(context.read<AuthService>());
      await api.createSecretaire(
        {
          'prenom': _secPrenom.text.trim(),
          'nom': _secNom.text.trim(),
          'email': _secEmail.text.trim(),
          'telephone': _secTel.text.trim(),
        },
        _secPassword.text,
      );
      if (!mounted) return;
      Navigator.pop(context);
      widget.onCreated();
      ErrorHandler.showMessage(context, 'Secretaire creee avec succes');
    } catch (e) {
      if (!mounted) return;
      ErrorHandler.showError(context, e);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
      ),
      insetPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppSpacing.radius),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.person_add, color: Colors.white),
                const SizedBox(width: AppSpacing.sm),
                const Expanded(
                  child: Text(
                    'Ajouter un membre',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.white),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ),
          // Tabs
          TabBar(
            controller: _tabController,
            labelColor: AppColors.primary,
            unselectedLabelColor: Colors.grey,
            indicatorColor: AppColors.primary,
            tabs: const [
              Tab(text: 'Medecin'),
              Tab(text: 'Secretaire'),
            ],
          ),
          // Content
          ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.55,
            ),
            child: TabBarView(
              controller: _tabController,
              children: [
                SingleChildScrollView(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: _buildMedecinForm(),
                ),
                SingleChildScrollView(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: _buildSecretaireForm(),
                ),
              ],
            ),
          ),
          // Actions
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              0,
              AppSpacing.md,
              AppSpacing.md,
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _saving ? null : () => Navigator.pop(context),
                    child: const Text('Annuler'),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _saving
                        ? null
                        : () {
                            if (_tabController.index == 0) {
                              _saveMedecin();
                            } else {
                              _saveSecretaire();
                            }
                          },
                    child: _saving
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text('Enregistrer'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMedecinForm() {
    return Form(
      key: _formKeyMedecin,
      child: Column(
        children: [
          _field(_medecinPrenom, 'Prenom', required: true),
          const SizedBox(height: AppSpacing.sm),
          _field(_medecinNom, 'Nom', required: true),
          const SizedBox(height: AppSpacing.sm),
          _field(_medecinEmail, 'Email',
              required: true,
              keyboardType: TextInputType.emailAddress),
          const SizedBox(height: AppSpacing.sm),
          _field(_medecinTel, 'Telephone',
              keyboardType: TextInputType.phone),
          const SizedBox(height: AppSpacing.sm),
          DropdownButtonFormField<String>(
            value: _selectedSpecialite,
            decoration: InputDecoration(
              labelText: 'Specialite',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radius),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
            ),
            items: _specialites
                .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                .toList(),
            onChanged: (v) {
              if (v != null) setState(() => _selectedSpecialite = v);
            },
          ),
          const SizedBox(height: AppSpacing.sm),
          _field(_medecinTarif, 'Tarif (DH)',
              keyboardType: TextInputType.number),
          const SizedBox(height: AppSpacing.sm),
          TextFormField(
            controller: _medecinPassword,
            obscureText: _obscureMedecin,
            decoration: InputDecoration(
              labelText: 'Mot de passe *',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radius),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureMedecin ? Icons.visibility : Icons.visibility_off,
                ),
                onPressed: () =>
                    setState(() => _obscureMedecin = !_obscureMedecin),
              ),
            ),
            validator: (v) =>
                (v == null || v.length < 6) ? 'Min. 6 caracteres' : null,
          ),
        ],
      ),
    );
  }

  Widget _buildSecretaireForm() {
    return Form(
      key: _formKeySecretaire,
      child: Column(
        children: [
          _field(_secPrenom, 'Prenom', required: true),
          const SizedBox(height: AppSpacing.sm),
          _field(_secNom, 'Nom', required: true),
          const SizedBox(height: AppSpacing.sm),
          _field(_secEmail, 'Email',
              required: true,
              keyboardType: TextInputType.emailAddress),
          const SizedBox(height: AppSpacing.sm),
          _field(_secTel, 'Telephone', keyboardType: TextInputType.phone),
          const SizedBox(height: AppSpacing.sm),
          TextFormField(
            controller: _secPassword,
            obscureText: _obscureSec,
            decoration: InputDecoration(
              labelText: 'Mot de passe *',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radius),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureSec ? Icons.visibility : Icons.visibility_off,
                ),
                onPressed: () => setState(() => _obscureSec = !_obscureSec),
              ),
            ),
            validator: (v) =>
                (v == null || v.length < 6) ? 'Min. 6 caracteres' : null,
          ),
        ],
      ),
    );
  }

  Widget _field(
    TextEditingController controller,
    String label, {
    bool required = false,
    TextInputType? keyboardType,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: required ? '$label *' : label,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radius),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
      ),
      validator: required
          ? (v) => (v == null || v.trim().isEmpty) ? 'Champ requis' : null
          : null,
    );
  }
}
