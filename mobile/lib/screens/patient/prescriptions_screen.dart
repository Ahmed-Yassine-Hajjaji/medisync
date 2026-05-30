import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:printing/printing.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/consultation.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';

class PrescriptionsScreen extends StatefulWidget {
  const PrescriptionsScreen({super.key});

  @override
  State<PrescriptionsScreen> createState() => _PrescriptionsScreenState();
}

class _PrescriptionsScreenState extends State<PrescriptionsScreen> {
  late ApiService _apiService;
  List<Prescription> _prescriptions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadPrescriptions();
  }

  Future<void> _loadPrescriptions() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final prescriptions = await _apiService.getMyPrescriptions();
      if (mounted) {
        setState(() {
          _prescriptions = prescriptions;
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

  Future<void> _requestRenewal(Prescription prescription) async {
    if (prescription.id == null) return;
    try {
      await _apiService.requestPrescriptionRenewal(prescription.id!);
      if (mounted) {
        ErrorHandler.showMessage(
          context,
          'Demande de renouvellement envoyee',
        );
      }
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  Future<void> _downloadPdfSafe(Prescription prescription) async {
    try {
      await _downloadPdf(prescription);
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  Future<void> _downloadPdf(Prescription prescription) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Header(
              level: 0,
              child: pw.Text('ORDONNANCE MEDICALE', style: pw.TextStyle(fontSize: 24)),
            ),
            pw.SizedBox(height: 20),
            pw.Text('Dr. ${prescription.medecinNom}', style: pw.TextStyle(fontSize: 14)),
            pw.Text('Date: ${DateFormat('dd/MM/yyyy').format(DateTime.parse(prescription.dateDebut))}'),
            pw.SizedBox(height: 30),
            pw.Text('Patient: ${prescription.patientNom}', style: pw.TextStyle(fontSize: 14)),
            pw.Divider(),
            pw.SizedBox(height: 20),
            pw.Container(
              padding: const pw.EdgeInsets.all(16),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(),
                borderRadius: pw.BorderRadius.circular(8),
              ),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text(
                    prescription.medicament,
                    style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold),
                  ),
                  pw.SizedBox(height: 8),
                  pw.Text('Dosage: ${prescription.dosage}'),
                  pw.Text('Frequence: ${prescription.frequence}'),
                  pw.Text('Duree: ${prescription.dureeJours} jours'),
                  if (prescription.instructions != null) ...[
                    pw.SizedBox(height: 8),
                    pw.Text('Instructions: ${prescription.instructions}'),
                  ],
                ],
              ),
            ),
            pw.Spacer(),
            pw.Text('Signature du medecin', style: pw.TextStyle(fontStyle: pw.FontStyle.italic)),
          ],
        ),
      ),
    );

    await Printing.layoutPdf(onLayout: (format) async => pdf.save());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes ordonnances'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _prescriptions.isEmpty
              ? _buildEmpty()
              : RefreshIndicator(
                  onRefresh: _loadPrescriptions,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    itemCount: _prescriptions.length,
                    itemBuilder: (context, index) {
                      final prescription = _prescriptions[index];
                      final isActive = prescription.dateFin != null &&
                          DateTime.parse(prescription.dateFin!)
                              .isAfter(DateTime.now());

                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: isActive
                                        ? AppColors.success
                                        : Colors.grey,
                                    child: const Icon(Icons.medication,
                                        color: Colors.white),
                                  ),
                                  const SizedBox(width: AppSpacing.md),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          prescription.medicament,
                                          style: const TextStyle(
                                              fontWeight: FontWeight.w600),
                                        ),
                                        Text(
                                          '${prescription.dosage} - ${prescription.frequence}',
                                        ),
                                        Text(
                                          'Du ${prescription.dateDebut} au ${prescription.dateFin ?? "..."}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey.shade600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.download,
                                        color: AppColors.primary),
                                    tooltip: 'Telecharger en PDF',
                                    onPressed: () =>
                                        _downloadPdfSafe(prescription),
                                  ),
                                ],
                              ),
                              if (prescription.renouvellementAutorise) ...[
                                const SizedBox(height: AppSpacing.sm),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: OutlinedButton.icon(
                                    onPressed: () =>
                                        _requestRenewal(prescription),
                                    icon: const Icon(Icons.refresh, size: 18),
                                    label: const Text('Demander renouvellement'),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.medication_outlined,
              size: 64, color: Colors.grey.shade400),
          const SizedBox(height: AppSpacing.md),
          const Text('Aucune ordonnance'),
        ],
      ),
    );
  }
}
