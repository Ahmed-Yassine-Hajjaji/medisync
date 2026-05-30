import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/consultation.dart';
import '../../utils/error_handler.dart';
import 'documents_screen.dart';

class MedicalRecordScreen extends StatefulWidget {
  const MedicalRecordScreen({super.key});

  @override
  State<MedicalRecordScreen> createState() => _MedicalRecordScreenState();
}

class _MedicalRecordScreenState extends State<MedicalRecordScreen>
    with SingleTickerProviderStateMixin {
  late ApiService _apiService;
  late AuthService _authService;
  late TabController _tabController;

  List<Consultation> _consultations = [];
  List<Prescription> _prescriptions = [];
  List<Document> _documents = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _authService = context.read<AuthService>();
    _apiService = ApiService(_authService);
    _loadAll();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAll() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        _apiService.getPatientConsultations(),
        _apiService.getPatientPrescriptions(),
        _loadDocuments(),
      ]);
      if (mounted) {
        setState(() {
          _consultations = results[0] as List<Consultation>;
          _prescriptions = results[1] as List<Prescription>;
          _documents = results[2] as List<Document>;
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

  Future<List<Document>> _loadDocuments() async {
    try {
      final response = await http.get(
        Uri.parse('${AuthService.baseUrl}/patient/documents'),
        headers: _authService.authHeaders,
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((j) => Document.fromJson(j)).toList();
      }
    } catch (_) {}
    return [];
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon dossier médical'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(text: 'Consultations'),
            Tab(text: 'Ordonnances'),
            Tab(text: 'Documents'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadAll,
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildConsultationsTab(),
                  _buildPrescriptionsTab(),
                  _buildDocumentsTab(),
                ],
              ),
            ),
    );
  }

  // ─── Consultations tab ────────────────────────────────────────────────────

  Widget _buildConsultationsTab() {
    if (_consultations.isEmpty) {
      return _buildEmpty(
          Icons.medical_information_outlined, 'Aucune consultation');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _consultations.length,
      itemBuilder: (_, i) =>
          _ConsultationCard(consultation: _consultations[i], fmtDate: _fmtDate),
    );
  }

  // ─── Ordonnances tab ──────────────────────────────────────────────────────

  Widget _buildPrescriptionsTab() {
    if (_prescriptions.isEmpty) {
      return _buildEmpty(Icons.medication_outlined, 'Aucune ordonnance');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _prescriptions.length,
      itemBuilder: (_, i) {
        final p = _prescriptions[i];
        final isActive = p.dateFin != null &&
            DateTime.tryParse(p.dateFin!)?.isAfter(DateTime.now()) == true;

        return Card(
          margin: const EdgeInsets.only(bottom: AppSpacing.sm),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radius),
            side: BorderSide(
              color: (isActive ? AppColors.success : Colors.grey)
                  .withOpacity(0.3),
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
                      radius: 20,
                      backgroundColor:
                          (isActive ? AppColors.success : Colors.grey)
                              .withOpacity(0.15),
                      child: Icon(
                        Icons.medication,
                        size: 20,
                        color: isActive ? AppColors.success : Colors.grey,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Text(
                        p.medicament,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: (isActive ? AppColors.success : Colors.grey)
                            .withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        isActive ? 'En cours' : 'Terminée',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isActive ? AppColors.success : Colors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                _PrescriptionInfoRow(
                    label: 'Dosage', value: p.dosage),
                _PrescriptionInfoRow(
                    label: 'Fréquence', value: p.frequence),
                _PrescriptionInfoRow(
                    label: 'Durée', value: '${p.dureeJours} jours'),
                if (p.medecinNom != null && p.medecinNom!.isNotEmpty)
                  _PrescriptionInfoRow(
                      label: 'Prescrit par',
                      value: 'Dr ${p.medecinNom}'),
                _PrescriptionInfoRow(
                    label: 'Début', value: _fmtDate(p.dateDebut)),
                if (p.dateFin != null)
                  _PrescriptionInfoRow(
                      label: 'Fin', value: _fmtDate(p.dateFin!)),
                if (p.instructions != null && p.instructions!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: Colors.grey.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      p.instructions!,
                      style: const TextStyle(
                          fontStyle: FontStyle.italic, fontSize: 12),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  // ─── Documents tab ────────────────────────────────────────────────────────

  Widget _buildDocumentsTab() {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        if (_documents.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
              child: Column(
                children: [
                  Icon(Icons.folder_open, size: 56, color: Colors.grey[400]),
                  const SizedBox(height: AppSpacing.md),
                  const Text('Aucun document'),
                ],
              ),
            ),
          )
        else
          ..._documents.map(
            (doc) => Card(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.radius),
                side: BorderSide(color: Colors.grey.withOpacity(0.2)),
              ),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  child: Icon(Icons.insert_drive_file,
                      color: AppColors.primary, size: 20),
                ),
                title: Text(
                  doc.originalName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(_fmtDate(doc.uploadDate)),
              ),
            ),
          ),
        const SizedBox(height: AppSpacing.md),
        ElevatedButton.icon(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const DocumentsScreen()),
          ).then((_) => _loadAll()),
          icon: const Icon(Icons.upload_file),
          label: const Text('Gérer mes documents'),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.radius),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmpty(IconData icon, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey[400]),
          const SizedBox(height: AppSpacing.md),
          Text(message, style: TextStyle(color: Colors.grey[500], fontSize: 15)),
        ],
      ),
    );
  }
}

// ─── Consultation card (expandable) ──────────────────────────────────────────

class _ConsultationCard extends StatelessWidget {
  final Consultation consultation;
  final String Function(String?) fmtDate;

  const _ConsultationCard({
    required this.consultation,
    required this.fmtDate,
  });

  @override
  Widget build(BuildContext context) {
    final c = consultation;
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      elevation: 0,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        side: BorderSide(color: Colors.grey.withOpacity(0.2)),
      ),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.primary.withOpacity(0.15),
          child:
              Icon(Icons.medical_services, color: AppColors.primary, size: 20),
        ),
        title: Text(
          c.medecinNom.isEmpty
              ? 'Consultation'
              : 'Dr ${c.medecinNom}',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          fmtDate(c.dateConsultation),
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        childrenPadding: const EdgeInsets.fromLTRB(
          AppSpacing.md, 0, AppSpacing.md, AppSpacing.md),
        children: [
          const Divider(height: 1),
          const SizedBox(height: AppSpacing.sm),
          if (c.motif != null) _InfoSection(label: 'Motif', value: c.motif!),
          if (c.symptomes != null)
            _InfoSection(label: 'Symptômes', value: c.symptomes!),
          if (c.diagnostic != null)
            _InfoSection(label: 'Diagnostic', value: c.diagnostic!),
          if (c.recommandations != null)
            _InfoSection(
                label: 'Recommandations', value: c.recommandations!),
          if (c.compteRendu != null)
            _InfoSection(label: 'Compte rendu', value: c.compteRendu!),
          if (c.prescriptions.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Prescriptions (${c.prescriptions.length})',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            ...c.prescriptions.map(
              (p) => Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      p.medicament,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '${p.dosage} – ${p.frequence} – ${p.dureeJours} jours',
                      style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                    ),
                    if (p.instructions != null)
                      Text(
                        p.instructions!,
                        style: const TextStyle(
                            fontStyle: FontStyle.italic, fontSize: 12),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  final String label;
  final String value;

  const _InfoSection({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Colors.grey[500],
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 14)),
        ],
      ),
    );
  }
}

class _PrescriptionInfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _PrescriptionInfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Row(
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 13)),
          ),
        ],
      ),
    );
  }
}
