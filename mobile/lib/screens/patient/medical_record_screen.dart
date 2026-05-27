import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/consultation.dart';

class MedicalRecordScreen extends StatefulWidget {
  const MedicalRecordScreen({super.key});

  @override
  State<MedicalRecordScreen> createState() => _MedicalRecordScreenState();
}

class _MedicalRecordScreenState extends State<MedicalRecordScreen> {
  late ApiService _apiService;
  List<Consultation> _consultations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadConsultations();
  }

  Future<void> _loadConsultations() async {
    try {
      final consultations = await _apiService.getMyConsultations();
      if (mounted) {
        setState(() {
          _consultations = consultations;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon dossier medical'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _consultations.isEmpty
              ? const Center(child: Text('Aucune consultation'))
              : RefreshIndicator(
                  onRefresh: _loadConsultations,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _consultations.length,
                    itemBuilder: (context, index) {
                      final consultation = _consultations[index];
                      return _ConsultationCard(consultation: consultation);
                    },
                  ),
                ),
    );
  }
}

class _ConsultationCard extends StatelessWidget {
  final Consultation consultation;

  const _ConsultationCard({required this.consultation});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primary,
          child: const Icon(Icons.medical_services, color: Colors.white),
        ),
        title: Text(consultation.medecinNom),
        subtitle: Text(
          DateFormat('dd/MM/yyyy').format(DateTime.parse(consultation.dateConsultation)),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (consultation.motif != null) ...[
                  _InfoRow(label: 'Motif', value: consultation.motif!),
                  const SizedBox(height: 8),
                ],
                if (consultation.symptomes != null) ...[
                  _InfoRow(label: 'Symptomes', value: consultation.symptomes!),
                  const SizedBox(height: 8),
                ],
                if (consultation.diagnostic != null) ...[
                  _InfoRow(label: 'Diagnostic', value: consultation.diagnostic!),
                  const SizedBox(height: 8),
                ],
                if (consultation.compteRendu != null) ...[
                  _InfoRow(label: 'Compte rendu', value: consultation.compteRendu!),
                  const SizedBox(height: 8),
                ],
                if (consultation.prescriptions.isNotEmpty) ...[
                  const Divider(),
                  Text(
                    'Prescriptions',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 8),
                  ...consultation.prescriptions.map((p) => Card(
                    color: Colors.blue.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            p.medicament,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text('${p.dosage} - ${p.frequence}'),
                          Text('Duree: ${p.dureeJours} jours'),
                          if (p.instructions != null)
                            Text(
                              p.instructions!,
                              style: const TextStyle(fontStyle: FontStyle.italic),
                            ),
                        ],
                      ),
                    ),
                  )),
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
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 2),
        Text(value),
      ],
    );
  }
}
