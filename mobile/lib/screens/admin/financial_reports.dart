import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../utils/error_handler.dart';

/// Ecran des rapports financiers avec KPIs, selecteur de periode et liste de factures.
class FinancialReports extends StatefulWidget {
  const FinancialReports({super.key});

  @override
  State<FinancialReports> createState() => _FinancialReportsState();
}

class _FinancialReportsState extends State<FinancialReports> {
  DashboardStats? _stats;
  List<Invoice> _invoices = [];
  bool _loading = true;

  DateTime _startDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _endDate = DateTime.now();

  final DateFormat _displayFmt = DateFormat('dd/MM/yyyy');
  final DateFormat _apiFmt = DateFormat('yyyy-MM-dd');

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final api = ApiService(context.read<AuthService>());
      final results = await Future.wait([
        api.getAdminDashboard(),
        api.getAdminInvoices(),
      ]);
      if (!mounted) return;
      setState(() {
        _stats = results[0] as DashboardStats;
        _invoices = (results[1] as List).cast<Invoice>();
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ErrorHandler.showError(context, e);
    }
  }

  Future<void> _pickDate({required bool isStart}) async {
    final initial = isStart ? _startDate : _endDate;
    final first = isStart ? DateTime(2020) : _startDate;
    final last = isStart ? _endDate : DateTime.now();

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: first,
      lastDate: last,
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.primary),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
      _load();
    }
  }

  List<Invoice> get _filteredInvoices {
    return _invoices.where((inv) {
      if (inv.dateFacture == null) return true;
      try {
        final d = DateTime.parse(inv.dateFacture!);
        return !d.isBefore(_startDate) &&
            !d.isAfter(_endDate.add(const Duration(days: 1)));
      } catch (_) {
        return true;
      }
    }).toList();
  }

  double get _totalCA =>
      _filteredInvoices.fold(0, (s, i) => s + i.montantTotal);
  double get _totalPaye =>
      _filteredInvoices.fold(0, (s, i) => s + i.montantPaye);
  double get _totalAttente => _filteredInvoices
      .where((i) => i.statut == 'PARTIEL')
      .fold(0, (s, i) => s + i.resteAPayer);
  double get _totalImpaye => _filteredInvoices
      .where((i) => i.statut == 'IMPAYE')
      .fold(0, (s, i) => s + i.montantTotal);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Rapports financiers')),
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.primary,
        child: _loading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildDateRangeSelector(),
                          const SizedBox(height: AppSpacing.md),
                          _buildKpiGrid(),
                          const SizedBox(height: AppSpacing.lg),
                          const Text(
                            'Factures',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1A1F36),
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                        ],
                      ),
                    ),
                  ),
                  _filteredInvoices.isEmpty
                      ? SliverFillRemaining(
                          hasScrollBody: false,
                          child: _buildEmpty(),
                        )
                      : SliverPadding(
                          padding: const EdgeInsets.fromLTRB(
                            AppSpacing.md,
                            0,
                            AppSpacing.md,
                            AppSpacing.xl,
                          ),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (_, i) =>
                                  _InvoiceCard(invoice: _filteredInvoices[i]),
                              childCount: _filteredInvoices.length,
                            ),
                          ),
                        ),
                ],
              ),
      ),
    );
  }

  Widget _buildDateRangeSelector() {
    return Row(
      children: [
        Expanded(
          child: _DateButton(
            label: 'Du',
            date: _displayFmt.format(_startDate),
            onTap: () => _pickDate(isStart: true),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: _DateButton(
            label: 'Au',
            date: _displayFmt.format(_endDate),
            onTap: () => _pickDate(isStart: false),
          ),
        ),
      ],
    );
  }

  Widget _buildKpiGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppSpacing.sm,
      mainAxisSpacing: AppSpacing.sm,
      childAspectRatio: 1.5,
      children: [
        _KpiCard(
          label: "Chiffre d'affaires",
          value: '${_totalCA.toStringAsFixed(0)} DH',
          icon: Icons.trending_up,
          color: AppColors.primary,
        ),
        _KpiCard(
          label: 'Encaisse',
          value: '${_totalPaye.toStringAsFixed(0)} DH',
          icon: Icons.check_circle_outline,
          color: AppColors.success,
        ),
        _KpiCard(
          label: 'En attente',
          value: '${_totalAttente.toStringAsFixed(0)} DH',
          icon: Icons.hourglass_empty,
          color: AppColors.warning,
        ),
        _KpiCard(
          label: 'Impaye',
          value: '${_totalImpaye.toStringAsFixed(0)} DH',
          icon: Icons.cancel_outlined,
          color: AppColors.danger,
        ),
      ],
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey[300]),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Aucune facture pour cette periode',
            style: TextStyle(color: Colors.grey[500], fontSize: 15),
          ),
        ],
      ),
    );
  }
}

class _DateButton extends StatelessWidget {
  final String label;
  final String date;
  final VoidCallback onTap;

  const _DateButton({
    required this.label,
    required this.date,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppSpacing.radius),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(AppSpacing.radius),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today,
                size: 16, color: AppColors.primary),
            const SizedBox(width: AppSpacing.sm),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                Text(date,
                    style: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w600)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _KpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radius),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 24),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: color.withOpacity(0.8),
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 2,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InvoiceCard extends StatelessWidget {
  final Invoice invoice;

  const _InvoiceCard({required this.invoice});

  Color get _statusColor {
    switch (invoice.statut) {
      case 'PAYE':
        return AppColors.success;
      case 'PARTIEL':
        return AppColors.warning;
      case 'IMPAYE':
        return AppColors.danger;
      default:
        return Colors.grey;
    }
  }

  String get _statusLabel {
    switch (invoice.statut) {
      case 'PAYE':
        return 'Paye';
      case 'PARTIEL':
        return 'Partiel';
      case 'IMPAYE':
        return 'Impaye';
      default:
        return invoice.statut;
    }
  }

  String _formatDate(String? raw) {
    if (raw == null) return '-';
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(raw));
    } catch (_) {
      return raw;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _statusColor;
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 56,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        invoice.numeroFacture ?? 'N/A',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _statusLabel,
                          style: TextStyle(
                            fontSize: 11,
                            color: color,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    invoice.patientFullName.isNotEmpty
                        ? invoice.patientFullName
                        : 'Patient inconnu',
                    style: TextStyle(color: Colors.grey[700], fontSize: 13),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatDate(invoice.dateFacture),
                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                      ),
                      Text(
                        '${invoice.montantTotal.toStringAsFixed(2)} DH',
                        style: TextStyle(
                          color: color,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
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
}
