import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../theme/app_theme.dart';
import '../../utils/error_handler.dart';

class SecretaireBilling extends StatefulWidget {
  const SecretaireBilling({super.key});

  @override
  State<SecretaireBilling> createState() => _SecretaireBillingState();
}

class _SecretaireBillingState extends State<SecretaireBilling> {
  late ApiService _apiService;
  List<Invoice> _invoices = [];
  bool _isLoading = true;

  final _currencyFmt = NumberFormat.currency(
      locale: 'fr_FR', symbol: 'DZD', decimalDigits: 2);

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadInvoices();
  }

  Future<void> _loadInvoices() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final invoices = await _apiService.getSecretaireInvoices();
      if (mounted) {
        setState(() {
          _invoices = invoices;
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

  // ─── KPI calculations ───────────────────────────────────────────────────

  double get _totalFactures =>
      _invoices.fold(0.0, (s, i) => s + i.montantTotal);

  double get _payeesCeMois {
    final now = DateTime.now();
    return _invoices
        .where((i) {
          if (i.statut != 'PAYE') return false;
          if (i.dateFacture == null) return false;
          try {
            final d = DateTime.parse(i.dateFacture!);
            return d.year == now.year && d.month == now.month;
          } catch (_) {
            return false;
          }
        })
        .fold(0.0, (s, i) => s + i.montantPaye);
  }

  double get _enAttente => _invoices
      .where((i) => i.statut == 'EN_ATTENTE')
      .fold(0.0, (s, i) => s + i.resteAPayer);

  double get _impayees => _invoices
      .where((i) => i.statut == 'IMPAYE')
      .fold(0.0, (s, i) => s + i.resteAPayer);

  // ─── Status helpers ─────────────────────────────────────────────────────

  Color _statusColor(String statut) {
    switch (statut) {
      case 'PAYE':
        return AppColors.success;
      case 'PARTIEL':
        return AppColors.warning;
      case 'IMPAYE':
        return AppColors.danger;
      case 'EN_ATTENTE':
        return const Color(0xFFF59E0B);
      default:
        return Colors.grey;
    }
  }

  String _statusLabel(String statut) {
    const labels = {
      'PAYE': 'Paye',
      'PARTIEL': 'Partiel',
      'IMPAYE': 'Impaye',
      'EN_ATTENTE': 'En attente',
    };
    return labels[statut] ?? statut;
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
      appBar: AppBar(title: const Text('Facturation')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadInvoices,
              child: CustomScrollView(
                slivers: [
                  SliverPadding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        _buildKpiGrid(),
                        const SizedBox(height: AppSpacing.lg),
                        Text(
                          'Liste des factures',
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        if (_invoices.isEmpty)
                          const Card(
                            child: Padding(
                              padding: EdgeInsets.all(AppSpacing.md),
                              child: Center(
                                child: Text('Aucune facture',
                                    style: TextStyle(color: Colors.grey)),
                              ),
                            ),
                          )
                        else
                          ..._invoices.map(_buildInvoiceCard),
                        const SizedBox(height: AppSpacing.xl),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildKpiGrid() {
    final kpis = [
      _KpiData(
        label: 'Total factures',
        value: _currencyFmt.format(_totalFactures),
        icon: Icons.receipt_long,
        color: AppColors.primary,
      ),
      _KpiData(
        label: 'Payees ce mois',
        value: _currencyFmt.format(_payeesCeMois),
        icon: Icons.check_circle_outline,
        color: AppColors.success,
      ),
      _KpiData(
        label: 'En attente',
        value: _currencyFmt.format(_enAttente),
        icon: Icons.hourglass_top,
        color: AppColors.warning,
      ),
      _KpiData(
        label: 'Impayees',
        value: _currencyFmt.format(_impayees),
        icon: Icons.warning_amber_outlined,
        color: AppColors.danger,
      ),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppSpacing.sm,
      mainAxisSpacing: AppSpacing.sm,
      childAspectRatio: 1.5,
      children: kpis.map(_buildKpiCard).toList(),
    );
  }

  Widget _buildKpiCard(_KpiData kpi) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: kpi.color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(kpi.icon, color: kpi.color, size: 20),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  kpi.value,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: kpi.color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  kpi.label,
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                  maxLines: 1,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInvoiceCard(Invoice invoice) {
    final statusColor = _statusColor(invoice.statut);
    final canPay = invoice.statut == 'IMPAYE' ||
        invoice.statut == 'EN_ATTENTE' ||
        invoice.statut == 'PARTIEL';

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row
            Row(
              children: [
                Expanded(
                  child: Text(
                    invoice.numeroFacture ?? 'Facture #${invoice.id}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
                  ),
                ),
                _buildStatusBadge(invoice.statut, statusColor),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),

            // Patient
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppColors.primary.withOpacity(0.15),
                  child: Text(
                    invoice.patientFullName.isNotEmpty
                        ? invoice.patientFullName[0].toUpperCase()
                        : '?',
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 12),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        invoice.patientFullName,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        _formatDate(invoice.dateFacture),
                        style:
                            const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            const Divider(height: 1),
            const SizedBox(height: AppSpacing.sm),

            // Amounts
            Row(
              children: [
                Expanded(
                  child: _amountItem(
                      'Total', _currencyFmt.format(invoice.montantTotal)),
                ),
                Expanded(
                  child: _amountItem(
                      'Paye', _currencyFmt.format(invoice.montantPaye),
                      color: AppColors.success),
                ),
                Expanded(
                  child: _amountItem(
                      'Reste', _currencyFmt.format(invoice.resteAPayer),
                      color: invoice.resteAPayer > 0
                          ? AppColors.danger
                          : AppColors.success),
                ),
              ],
            ),

            if (invoice.modePaiement != null) ...[
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Mode : ${invoice.modePaiement}',
                style: const TextStyle(fontSize: 11, color: Colors.grey),
              ),
            ],

            if (canPay) ...[
              const SizedBox(height: AppSpacing.sm),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.payments_outlined, size: 16),
                  label: const Text('Enregistrer paiement'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    textStyle: const TextStyle(fontSize: 13),
                  ),
                  onPressed: () => _showPaymentDialog(invoice),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _amountItem(String label, String value, {Color? color}) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 12,
            color: color ?? Colors.black87,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Colors.grey),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildStatusBadge(String statut, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        _statusLabel(statut),
        style: TextStyle(
            fontSize: 11, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }

  // ─── Payment Dialog ──────────────────────────────────────────────────────

  void _showPaymentDialog(Invoice invoice) {
    showDialog(
      context: context,
      builder: (ctx) => _PaymentDialog(
        invoice: invoice,
        apiService: _apiService,
        currencyFmt: _currencyFmt,
        onPaid: () {
          _loadInvoices();
          ErrorHandler.showMessage(context, 'Paiement enregistre avec succes');
        },
      ),
    );
  }
}

// ─── Payment Dialog Widget ─────────────────────────────────────────────────

class _PaymentDialog extends StatefulWidget {
  final Invoice invoice;
  final ApiService apiService;
  final NumberFormat currencyFmt;
  final VoidCallback onPaid;

  const _PaymentDialog({
    required this.invoice,
    required this.apiService,
    required this.currencyFmt,
    required this.onPaid,
  });

  @override
  State<_PaymentDialog> createState() => _PaymentDialogState();
}

class _PaymentDialogState extends State<_PaymentDialog> {
  final _amountCtrl = TextEditingController();
  String _modePaiement = 'Especes';
  bool _submitting = false;

  static const _modes = ['Especes', 'Carte', 'Cheque', 'Virement'];

  @override
  void initState() {
    super.initState();
    _amountCtrl.text =
        widget.invoice.resteAPayer.toStringAsFixed(2);
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final montant = double.tryParse(_amountCtrl.text.replaceAll(',', '.'));
    if (montant == null || montant <= 0) {
      ErrorHandler.showMessage(context, 'Montant invalide', isError: true);
      return;
    }
    setState(() => _submitting = true);
    try {
      await widget.apiService
          .recordPayment(widget.invoice.id, montant, _modePaiement);
      if (mounted) {
        Navigator.pop(context);
        widget.onPaid();
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
    final invoice = widget.invoice;
    return AlertDialog(
      title: const Text('Enregistrer un paiement'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Invoice summary
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(AppSpacing.radius),
              ),
              child: Column(
                children: [
                  _summaryRow('Patient', invoice.patientFullName),
                  _summaryRow(
                      'Facture', invoice.numeroFacture ?? '#${invoice.id}'),
                  _summaryRow('Montant total',
                      widget.currencyFmt.format(invoice.montantTotal)),
                  _summaryRow('Deja paye',
                      widget.currencyFmt.format(invoice.montantPaye)),
                  _summaryRow(
                    'Reste a payer',
                    widget.currencyFmt.format(invoice.resteAPayer),
                    valueColor: AppColors.danger,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            const Text('Montant du paiement',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: AppSpacing.xs),
            TextField(
              controller: _amountCtrl,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                hintText: '0.00',
                suffixText: 'DZD',
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),

            const Text('Mode de paiement',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: AppSpacing.xs),
            DropdownButtonFormField<String>(
              value: _modePaiement,
              decoration: InputDecoration(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
              ),
              items: _modes
                  .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                  .toList(),
              onChanged: (v) =>
                  setState(() => _modePaiement = v ?? _modes.first),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          onPressed: _submitting ? null : _submit,
          child: _submitting
              ? const SizedBox(
                  height: 16,
                  width: 16,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Colors.white),
                )
              : const Text('Confirmer'),
        ),
      ],
    );
  }

  Widget _summaryRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Text('$label : ',
              style:
                  const TextStyle(color: Colors.grey, fontSize: 12)),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 12,
                color: valueColor ?? Colors.black87,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _KpiData {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _KpiData({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });
}
