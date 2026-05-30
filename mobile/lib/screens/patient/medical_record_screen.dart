import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/consultation.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';
import 'documents_screen.dart';

/// Onglet "Dossier" : dossier medical complet du patient organise en
/// trois sections - consultations, ordonnances et documents.
class MedicalRecordScreen extends StatefulWidget {
  const MedicalRecordScreen({super.key});

  @override
  State<MedicalRecordScreen> createState() => _MedicalRecordScreenState();
}

class _MedicalRecordScreenState extends State<MedicalRecordScreen> {
  late ApiService _apiService;
  late AuthService _authService;

  List<Consultation> _consultations = [];
  List<Prescription> _prescriptions = [];
  List<Document> _documents = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _authService = context.read<AuthService>();
    _apiService = ApiService(_authService);
    _loadAll();
  }

  Future<void> _loadAll() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final consultations = await _apiService.getMyConsultations();
      final prescriptions = await _apiService.getMyPrescriptions();
      final documents = await _loadDocuments();
      if (mounted) {
        setState(() {
          _consultations = consultations;
          _prescriptions = prescriptions;
          _documents = documents;
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
    final response = await http.get(
      Uri.parse('${AuthService.baseUrl}/patient/documents'),
      headers: _authService.authHeaders,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Document.fromJson(json)).toList();
    }
    return [];
  }

  String _formatDate(String date) {
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(date));
    } catch (_) {
      return date;
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Mon dossier medical'),
          bottom: const TabBar(
            indicatorColor: Colors.white,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            tabs: [
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
                  children: [
                    _buildConsultations(),
                    _buildPrescriptions(),
                    _buildDocuments(),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildConsultations() {
    if (_consultations.isEmpty) {
      return _buildEmpty(Icons.medical_information, 'Aucune consultation');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _consultations.length,
      itemBuilder: (context, index) =>
          _ConsultationCard(consultation: _consultations[index]),
    );
  }

  Widget _buildPrescriptions() {
    if (_prescriptions.isEmpty) {
      return _buildEmpty(Icons.medication_outlined, 'Aucune ordonnance');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _prescriptions.length,
      itemBuilder: (context, index) {
        final p = _prescriptions[index];
        return Card(
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: AppColors.primary,
              child: Icon(Icons.medication, color: Colors.white),
            ),
            title: Text(
              p.medicament,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${p.dosage} - ${p.frequence}'),
                Text(
                  'Duree: ${p.dureeJours} jours',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
            isThreeLine: true,
          ),
        );
      },
    );
  }

  Widget _buildDocuments() {
    if (_documents.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.folder_open, size: 64, color: Colors.grey.shade400),
            const SizedBox(height: AppSpacing.md),
            const Text('Aucun document'),
            const SizedBox(height: AppSpacing.md),
            ElevatedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DocumentsScreen()),
              ),
              icon: const Icon(Icons.upload_file),
              label: const Text('Gerer mes documents'),
            ),
          ],
        ),
      );
    }
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.md),
      children: [
        ..._documents.map(
          (doc) => Card(
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppColors.primary,
                child: Icon(Icons.insert_drive_file, color: Colors.white),
              ),
              title: Text(
                doc.originalName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              subtitle: Text(_formatDate(doc.uploadDate)),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        ElevatedButton.icon(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const DocumentsScreen()),
          ),
          icon: const Icon(Icons.upload_file),
          label: const Text('Gerer mes documents'),
        ),
      ],
    );
  }

  Widget _buildEmpty(IconData icon, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: AppSpacing.md),
          Text(message, style: const TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

class _ConsultationCard extends StatelessWidget {
  final Consultation consultation;

  const _ConsultationCard({required this.consultation});

  String _formatDate(String date) {
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(date));
    } catch (_) {
      return date;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: ExpansionTile(
        leading: const CircleAvatar(
          backgroundColor: AppColors.primary,
          child: Icon(Icons.medical_services, color: Colors.white),
        ),
        title: Text(
          consultation.medecinNom.isEmpty
              ? 'Consultation'
              : 'Dr. ${consultation.medecinNom}',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(_formatDate(consultation.dateConsultation)),
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (consultation.motif != null) ...[
                  _InfoRow(label: 'Motif', value: consultation.motif!),
                  const SizedBox(height: AppSpacing.sm),
                ],
                if (consultation.symptomes != null) ...[
                  _InfoRow(label: 'Symptomes', value: consultation.symptomes!),
                  const SizedBox(height: AppSpacing.sm),
                ],
                if (consultation.diagnostic != null) ...[
                  _InfoRow(label: 'Diagnostic', value: consultation.diagnostic!),
                  const SizedBox(height: AppSpacing.sm),
                ],
                if (consultation.compteRendu != null) ...[
                  _InfoRow(
                      label: 'Compte rendu', value: consultation.compteRendu!),
                  const SizedBox(height: AppSpacing.sm),
                ],
                if (consultation.recommandations != null) ...[
                  _InfoRow(
                      label: 'Recommandations',
                      value: consultation.recommandations!),
                  const SizedBox(height: AppSpacing.sm),
                ],
                if (consultation.prescriptions.isNotEmpty) ...[
                  const Divider(),
                  Text(
                    'Prescriptions',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  ...consultation.prescriptions.map(
                    (p) => Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(AppSpacing.radius),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            p.medicament,
                            style:
                                const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text('${p.dosage} - ${p.frequence}'),
                          Text('Duree: ${p.dureeJours} jours'),
                          if (p.instructions != null)
                            Text(
                              p.instructions!,
                              style: const TextStyle(
                                  fontStyle: FontStyle.italic),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 2),
        Text(value),
      ],
    );
  }
}
