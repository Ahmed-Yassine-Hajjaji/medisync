import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:printing/printing.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/consultation.dart';
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
  String _filter = 'all'; // 'all' | 'active' | 'expired'

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadPrescriptions();
  }

  Future<void> _loadPrescriptions() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final prescriptions = await _apiService.getPatientPrescriptions();
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

  bool _isActive(Prescription p) {
    if (p.dateFin == null) return true;
    final end = DateTime.tryParse(p.dateFin!);
    return end != null && end.isAfter(DateTime.now());
  }

  List<Prescription> get _filtered {
    switch (_filter) {
      case 'active':
        return _prescriptions.where(_isActive).toList();
      case 'expired':
        return _prescriptions.where((p) => !_isActive(p)).toList();
      default:
        return _prescriptions;
    }
  }

  Future<void> _downloadPdf(Prescription p) async {
    try {
      final pdf = pw.Document();
      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (ctx) => pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Header(
                level: 0,
                child: pw.Text('ORDONNANCE MÉDICALE',
                    style: pw.TextStyle(
                        fontSize: 22, fontWeight: pw.FontWeight.bold)),
              ),
              pw.SizedBox(height: 20),
              if (p.medecinNom != null && p.medecinNom!.isNotEmpty)
                pw.Text('Dr ${p.medecinNom}',
                    style: pw.TextStyle(
                        fontSize: 14, fontWeight: pw.FontWeight.bold)),
              pw.Text(
                  'Date : ${DateFormat('dd/MM/yyyy').format(DateTime.parse(p.dateDebut))}'),
              pw.SizedBox(height: 16),
              if (p.patientNom != null && p.patientNom!.isNotEmpty)
                pw.Text('Patient : ${p.patientNom}',
                    style: pw.TextStyle(fontSize: 13)),
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
                      p.medicament,
                      style: pw.TextStyle(
                          fontSize: 16, fontWeight: pw.FontWeight.bold),
                    ),
                    pw.SizedBox(height: 8),
                    pw.Text('Dosage : ${p.dosage}'),
                    pw.Text('Fréquence : ${p.frequence}'),
                    pw.Text('Durée : ${p.dureeJours} jours'),
                    if (p.instructions != null) ...[
                      pw.SizedBox(height: 8),
                      pw.Text('Instructions : ${p.instructions}'),
                    ],
                  ],
                ),
              ),
              pw.Spacer(),
              pw.Text('Signature du médecin',
                  style:
                      pw.TextStyle(fontStyle: pw.FontStyle.italic)),
            ],
          ),
        ),
      );
      await Printing.layoutPdf(onLayout: (format) async => pdf.save());
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  Future<void> _requestRenewal(Prescription p) async {
    if (p.id == null) return;
    try {
      await _apiService.requestPrescriptionRenewal(p.id!);
      if (mounted) {
        ErrorHandler.showMessage(
            context, 'Demande de renouvellement envoyée');
      }
    } catch (e) {
      if (mounted) ErrorHandler.showError(context, e);
    }
  }

  String _fmtDate(String? date) {
    if (date == null) return '—';
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
        title: const Text('Mes ordonnances'),
      ),
      body: Column(
        children: [
          _buildFilterBar(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filtered.isEmpty
                    ? _buildEmpty()
                    : RefreshIndicator(
                        onRefresh: _loadPrescriptions,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) =>
                              _PrescriptionCard(
                            prescription: _filtered[i],
                            isActive: _isActive(_filtered[i]),
                            onDownload: () => _downloadPdf(_filtered[i]),
                            onRenewal: () => _requestRenewal(_filtered[i]),
                            fmtDate: _fmtDate,
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.sm),
      child: Row(
        children: [
          _FilterChip(
            label: 'Toutes',
            count: _prescriptions.length,
            selected: _filter == 'all',
            onTap: () => setState(() => _filter = 'all'),
          ),
          const SizedBox(width: AppSpacing.sm),
          _FilterChip(
            label: 'En cours',
            count: _prescriptions.where(_isActive).length,
            selected: _filter == 'active',
            onTap: () => setState(() => _filter = 'active'),
            activeColor: AppColors.success,
          ),
          const SizedBox(width: AppSpacing.sm),
          _FilterChip(
            label: 'Terminées',
            count: _prescriptions.where((p) => !_isActive(p)).length,
            selected: _filter == 'expired',
            onTap: () => setState(() => _filter = 'expired'),
            activeColor: Colors.grey,
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.medication_outlined, size: 64, color: Colors.grey[400]),
          const SizedBox(height: AppSpacing.md),
          Text(
            _filter == 'all'
                ? 'Aucune ordonnance'
                : _filter == 'active'
                    ? 'Aucune ordonnance en cours'
                    : 'Aucune ordonnance terminée',
            style: TextStyle(color: Colors.grey[500], fontSize: 15),
          ),
        ],
      ),
    );
  }
}

class _PrescriptionCard extends StatelessWidget {
  final Prescription prescription;
  final bool isActive;
  final VoidCallback onDownload;
  final VoidCallback onRenewal;
  final String Function(String?) fmtDate;

  const _PrescriptionCard({
    required this.prescription,
    required this.isActive,
    required this.onDownload,
    required this.onRenewal,
    required this.fmtDate,
  });

  @override
  Widget build(BuildContext context) {
    final p = prescription;
    final statusColor = isActive ? AppColors.success : Colors.grey;

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        side: BorderSide(color: statusColor.withOpacity(0.25)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: statusColor.withOpacity(0.12),
                  child: Icon(Icons.medication, size: 20, color: statusColor),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p.medicament,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                      if (p.medecinNom != null && p.medecinNom!.isNotEmpty)
                        Text(
                          'Dr ${p.medecinNom}',
                          style: TextStyle(
                              fontSize: 12, color: Colors.grey[600]),
                        ),
                    ],
                  ),
                ),
                // Status badge
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    isActive ? 'En cours' : 'Terminée',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: AppSpacing.lg),

            // Details grid
            Row(
              children: [
                Expanded(
                  child: _DetailItem(label: 'Dosage', value: p.dosage),
                ),
                Expanded(
                  child: _DetailItem(label: 'Fréquence', value: p.frequence),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: _DetailItem(
                      label: 'Durée', value: '${p.dureeJours} jours'),
                ),
                Expanded(
                  child: _DetailItem(label: 'Début', value: fmtDate(p.dateDebut)),
                ),
              ],
            ),
            if (p.dateFin != null) ...[
              const SizedBox(height: AppSpacing.sm),
              _DetailItem(label: 'Fin', value: fmtDate(p.dateFin)),
            ],

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

            // Action buttons
            const SizedBox(height: AppSpacing.sm),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // Download PDF
                OutlinedButton.icon(
                  onPressed: onDownload,
                  icon: const Icon(Icons.download, size: 16),
                  label: const Text('PDF'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    textStyle: const TextStyle(fontSize: 12),
                    side: BorderSide(color: AppColors.primary),
                    foregroundColor: AppColors.primary,
                  ),
                ),
                if (p.renouvellementAutorise) ...[
                  const SizedBox(width: AppSpacing.sm),
                  OutlinedButton.icon(
                    onPressed: onRenewal,
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text('Renouveler'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      textStyle: const TextStyle(fontSize: 12),
                      side: BorderSide(color: AppColors.warning),
                      foregroundColor: AppColors.warning,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailItem extends StatelessWidget {
  final String label;
  final String value;

  const _DetailItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.grey[500],
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(value, style: const TextStyle(fontSize: 13)),
      ],
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;
  final Color? activeColor;

  const _FilterChip({
    required this.label,
    required this.count,
    required this.selected,
    required this.onTap,
    this.activeColor,
  });

  @override
  Widget build(BuildContext context) {
    final color = activeColor ?? AppColors.primary;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? color : color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? color : color.withOpacity(0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color: selected ? Colors.white : color,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                color: selected
                    ? Colors.white.withOpacity(0.3)
                    : color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  fontSize: 11,
                  color: selected ? Colors.white : color,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
