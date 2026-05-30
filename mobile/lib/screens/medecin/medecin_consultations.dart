import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../models/consultation.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';

/// Onglet Consultations : historique et creation de nouvelles consultations.
class MedecinConsultations extends StatefulWidget {
  const MedecinConsultations({super.key});

  @override
  State<MedecinConsultations> createState() => _MedecinConsultationsState();
}

class _MedecinConsultationsState extends State<MedecinConsultations> {
  late ApiService _apiService;
  List<Consultation> _consultations = [];
  bool _isLoading = true;
  final Set<int> _expandedIds = {};

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadData();
  }

  Future<void> _loadData() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final consultations = await _apiService.getMedecinConsultations();
      if (mounted) {
        setState(() {
          _consultations = consultations;
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

  String _formatDate(String date) {
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(date));
    } catch (_) {
      return date;
    }
  }

  void _toggleExpanded(int id) {
    setState(() {
      if (_expandedIds.contains(id)) {
        _expandedIds.remove(id);
      } else {
        _expandedIds.add(id);
      }
    });
  }

  Future<void> _showNewConsultationSheet() async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.lg)),
      ),
      builder: (_) => _NewConsultationSheet(
        apiService: _apiService,
        onCreated: _loadData,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Consultations')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showNewConsultationSheet,
        icon: const Icon(Icons.add),
        label: const Text('Nouvelle consultation'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: _consultations.isEmpty
                  ? ListView(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(AppSpacing.xl),
                          child: Column(
                            children: [
                              Icon(Icons.medical_services_outlined,
                                  size: 56, color: Colors.grey.shade400),
                              const SizedBox(height: AppSpacing.md),
                              Text(
                                'Aucune consultation enregistree',
                                style: TextStyle(color: Colors.grey.shade500),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(
                          AppSpacing.md, AppSpacing.md, AppSpacing.md, 80),
                      itemCount: _consultations.length,
                      itemBuilder: (_, i) =>
                          _buildConsultationCard(_consultations[i]),
                    ),
            ),
    );
  }

  Widget _buildConsultationCard(Consultation c) {
    final isExpanded = _expandedIds.contains(c.id);
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        onTap: () => _toggleExpanded(c.id),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.primary.withOpacity(0.12),
                    child: Text(
                      c.patientNom.isNotEmpty ? c.patientNom[0].toUpperCase() : 'P',
                      style: const TextStyle(
                          color: AppColors.primary, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(c.patientNom,
                            style: const TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 15)),
                        Text(
                          _formatDate(c.dateConsultation),
                          style: TextStyle(
                              color: Colors.grey.shade600, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    isExpanded
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    color: Colors.grey,
                  ),
                ],
              ),

              if (c.motif != null && c.motif!.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Motif : ${c.motif}',
                  style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                  maxLines: isExpanded ? null : 1,
                  overflow: isExpanded ? null : TextOverflow.ellipsis,
                ),
              ],

              if (c.diagnostic != null && c.diagnostic!.isNotEmpty &&
                  !isExpanded) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Diagnostic : ${c.diagnostic}',
                  style: const TextStyle(
                      color: Colors.grey, fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],

              // Expanded details
              if (isExpanded) ...[
                const Divider(height: AppSpacing.lg),
                if (c.symptomes != null && c.symptomes!.isNotEmpty)
                  _buildDetailSection('Examen clinique / Symptomes', c.symptomes!),
                if (c.diagnostic != null && c.diagnostic!.isNotEmpty)
                  _buildDetailSection('Diagnostic', c.diagnostic!),
                if (c.compteRendu != null && c.compteRendu!.isNotEmpty)
                  _buildDetailSection('Compte rendu', c.compteRendu!),
                if (c.recommandations != null && c.recommandations!.isNotEmpty)
                  _buildDetailSection('Recommandations', c.recommandations!),

                if (c.prescriptions.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.sm),
                  const Text('Prescriptions',
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                          color: AppColors.primary)),
                  const SizedBox(height: AppSpacing.xs),
                  ...c.prescriptions.map(_buildPrescriptionChip),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailSection(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: Colors.black87)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 13, color: Colors.black54)),
        ],
      ),
    );
  }

  Widget _buildPrescriptionChip(Prescription p) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.xs),
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.success.withOpacity(0.08),
        borderRadius: BorderRadius.circular(AppSpacing.sm),
        border: Border.all(color: AppColors.success.withOpacity(0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.medication, size: 16, color: AppColors.success),
          const SizedBox(width: AppSpacing.xs),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${p.medicament} - ${p.dosage}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13)),
                Text('${p.frequence} • ${p.dureeJours} jours',
                    style: const TextStyle(
                        fontSize: 12, color: Colors.black54)),
                if (p.instructions != null && p.instructions!.isNotEmpty)
                  Text(p.instructions!,
                      style: const TextStyle(
                          fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── New Consultation Bottom Sheet ───────────────────────────────────────────

class _NewConsultationSheet extends StatefulWidget {
  final ApiService apiService;
  final VoidCallback onCreated;

  const _NewConsultationSheet({
    required this.apiService,
    required this.onCreated,
  });

  @override
  State<_NewConsultationSheet> createState() => _NewConsultationSheetState();
}

class _NewConsultationSheetState extends State<_NewConsultationSheet> {
  final _formKey = GlobalKey<FormState>();
  final _motifCtrl = TextEditingController();
  final _symptomesCtrl = TextEditingController();
  final _diagnosticCtrl = TextEditingController();
  final _compteRenduCtrl = TextEditingController();
  final _recommandationsCtrl = TextEditingController();

  // Appointment selection
  List<Appointment> _appointments = [];
  Appointment? _selectedAppointment;
  bool _isLoadingApts = true;

  // Prescriptions
  final List<_PrescriptionForm> _prescriptions = [];

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadAppointments();
  }

  @override
  void dispose() {
    _motifCtrl.dispose();
    _symptomesCtrl.dispose();
    _diagnosticCtrl.dispose();
    _compteRenduCtrl.dispose();
    _recommandationsCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadAppointments() async {
    try {
      final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final apts = await widget.apiService.getMedecinAppointmentsByDate(today);
      final confirmed = apts.where((a) => a.statut == 'CONFIRME').toList();
      if (mounted) {
        setState(() {
          _appointments = confirmed;
          if (confirmed.isNotEmpty) _selectedAppointment = confirmed.first;
          _isLoadingApts = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingApts = false);
    }
  }

  void _addPrescription() {
    setState(() => _prescriptions.add(_PrescriptionForm()));
  }

  void _removePrescription(int index) {
    setState(() => _prescriptions.removeAt(index));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedAppointment == null) {
      ErrorHandler.showMessage(context,
          'Veuillez selectionner un rendez-vous', isError: true);
      return;
    }

    setState(() => _isSaving = true);
    try {
      final consultation = await widget.apiService.createConsultation(
        _selectedAppointment!.id,
        {
          'motif': _motifCtrl.text.trim(),
          'symptomes': _symptomesCtrl.text.trim(),
          'diagnostic': _diagnosticCtrl.text.trim(),
          'compteRendu': _compteRenduCtrl.text.trim(),
          'recommandations': _recommandationsCtrl.text.trim(),
        },
      );

      // Add prescriptions one by one
      for (final p in _prescriptions) {
        if (p.medicamentCtrl.text.isNotEmpty) {
          await widget.apiService.addPrescription(consultation.id, {
            'medicament': p.medicamentCtrl.text.trim(),
            'dosage': p.dosageCtrl.text.trim(),
            'frequence': p.frequenceCtrl.text.trim(),
            'dureeJours': int.tryParse(p.dureeCtrl.text.trim()) ?? 7,
            'instructions': p.instructionsCtrl.text.trim(),
            'dateDebut': DateFormat('yyyy-MM-dd').format(DateTime.now()),
            'renouvellementAutorise': false,
          });
        }
      }

      if (mounted) {
        Navigator.pop(context);
        ErrorHandler.showMessage(context, 'Consultation enregistree avec succes');
        widget.onCreated();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
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
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, scrollCtrl) => Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Row(
                children: [
                  const Expanded(
                    child: Text('Nouvelle consultation',
                        style: TextStyle(
                            fontSize: 17, fontWeight: FontWeight.w700)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: SingleChildScrollView(
                controller: scrollCtrl,
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Appointment selector
                      const Text('Rendez-vous',
                          style: TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 13)),
                      const SizedBox(height: AppSpacing.xs),
                      if (_isLoadingApts)
                        const Center(child: CircularProgressIndicator())
                      else if (_appointments.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.sm),
                          decoration: BoxDecoration(
                            color: AppColors.warning.withOpacity(0.1),
                            borderRadius:
                                BorderRadius.circular(AppSpacing.radius),
                          ),
                          child: const Text(
                            'Aucun rendez-vous confirme aujourd\'hui. Vous pouvez quand meme creer une consultation manuellement.',
                            style:
                                TextStyle(color: AppColors.warning, fontSize: 12),
                          ),
                        )
                      else
                        DropdownButtonFormField<Appointment>(
                          value: _selectedAppointment,
                          decoration: const InputDecoration(
                            contentPadding: EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                          ),
                          items: _appointments.map((a) {
                            return DropdownMenuItem(
                              value: a,
                              child: Text(
                                '${a.patientFullName.isNotEmpty ? a.patientFullName : 'Patient #${a.patientId}'} - ${a.heureDebut.length >= 5 ? a.heureDebut.substring(0, 5) : a.heureDebut}',
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (v) =>
                              setState(() => _selectedAppointment = v),
                          validator: (v) =>
                              v == null ? 'Selectionnez un rendez-vous' : null,
                        ),

                      const SizedBox(height: AppSpacing.md),

                      // Consultation fields
                      _buildField(
                        controller: _motifCtrl,
                        label: 'Motif de consultation',
                        hint: 'Ex: Douleurs abdominales...',
                        required: true,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _buildField(
                        controller: _symptomesCtrl,
                        label: 'Examen clinique / Symptomes',
                        hint: 'Observations cliniques...',
                        maxLines: 4,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _buildField(
                        controller: _diagnosticCtrl,
                        label: 'Diagnostic',
                        hint: 'Diagnostic principal...',
                        maxLines: 3,
                        required: true,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _buildField(
                        controller: _compteRenduCtrl,
                        label: 'Compte rendu',
                        hint: 'Details de la consultation...',
                        maxLines: 4,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _buildField(
                        controller: _recommandationsCtrl,
                        label: 'Recommandations',
                        hint: 'Conseils au patient...',
                        maxLines: 3,
                      ),

                      const SizedBox(height: AppSpacing.lg),

                      // Prescriptions
                      Row(
                        children: [
                          const Expanded(
                            child: Text('Prescriptions',
                                style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 15)),
                          ),
                          TextButton.icon(
                            onPressed: _addPrescription,
                            icon: const Icon(Icons.add, size: 16),
                            label: const Text('Ajouter'),
                          ),
                        ],
                      ),

                      if (_prescriptions.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              vertical: AppSpacing.sm),
                          child: Text(
                            'Aucune prescription pour cette consultation.',
                            style: TextStyle(
                                color: Colors.grey.shade500, fontSize: 13),
                          ),
                        )
                      else
                        ...List.generate(
                          _prescriptions.length,
                          (i) => _buildPrescriptionSection(i),
                        ),

                      const SizedBox(height: AppSpacing.xl),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isSaving ? null : _save,
                          child: _isSaving
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white),
                                )
                              : const Text('Enregistrer la consultation'),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.md),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    String? hint,
    int maxLines = 1,
    bool required = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: AppSpacing.xs),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            alignLabelWithHint: maxLines > 1,
          ),
          validator: required
              ? (v) => (v == null || v.trim().isEmpty) ? 'Champ requis' : null
              : null,
        ),
      ],
    );
  }

  Widget _buildPrescriptionSection(int index) {
    final p = _prescriptions[index];
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      color: AppColors.success.withOpacity(0.04),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        side: BorderSide(color: AppColors.success.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.medication, color: AppColors.success, size: 18),
                const SizedBox(width: AppSpacing.xs),
                Text('Medicament ${index + 1}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppColors.success)),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.delete_outline,
                      color: AppColors.danger, size: 18),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => _removePrescription(index),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: p.medicamentCtrl,
              decoration: const InputDecoration(
                labelText: 'Medicament *',
                hintText: 'Ex: Paracetamol',
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Requis' : null,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: p.dosageCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Dosage *',
                      hintText: 'Ex: 500mg',
                    ),
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Requis' : null,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: TextFormField(
                    controller: p.dureeCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Duree (jours) *',
                      hintText: 'Ex: 7',
                    ),
                    keyboardType: TextInputType.number,
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Requis' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: p.frequenceCtrl,
              decoration: const InputDecoration(
                labelText: 'Frequence *',
                hintText: 'Ex: 3 fois par jour',
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Requis' : null,
            ),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: p.instructionsCtrl,
              decoration: const InputDecoration(
                labelText: 'Instructions',
                hintText: 'Ex: A prendre avec de la nourriture',
              ),
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }
}

class _PrescriptionForm {
  final TextEditingController medicamentCtrl = TextEditingController();
  final TextEditingController dosageCtrl = TextEditingController();
  final TextEditingController frequenceCtrl = TextEditingController();
  final TextEditingController dureeCtrl = TextEditingController();
  final TextEditingController instructionsCtrl = TextEditingController();
}
