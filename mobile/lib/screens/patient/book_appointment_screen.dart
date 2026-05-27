import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../models/user.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';

class BookAppointmentScreen extends StatefulWidget {
  final Medecin medecin;

  const BookAppointmentScreen({super.key, required this.medecin});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  late ApiService _apiService;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  List<Creneau> _creneaux = [];
  Creneau? _selectedCreneau;
  String _selectedMotif = 'CONSULTATION_GENERALE';
  bool _isLoading = false;
  bool _isBooking = false;

  final List<Map<String, String>> _motifs = [
    {'value': 'CONSULTATION_GENERALE', 'label': 'Consultation generale'},
    {'value': 'SUIVI', 'label': 'Suivi'},
    {'value': 'URGENCE', 'label': 'Urgence'},
    {'value': 'VACCINATION', 'label': 'Vaccination'},
    {'value': 'CERTIFICAT_MEDICAL', 'label': 'Certificat medical'},
    {'value': 'RENOUVELLEMENT_ORDONNANCE', 'label': 'Renouvellement ordonnance'},
  ];

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadCreneaux();
  }

  Future<void> _loadCreneaux() async {
    setState(() => _isLoading = true);
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final creneaux = await _apiService.getCreneaux(widget.medecin.id, dateStr);
      if (mounted) {
        setState(() {
          _creneaux = creneaux;
          _selectedCreneau = null;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
      _loadCreneaux();
    }
  }

  Future<void> _bookAppointment() async {
    if (_selectedCreneau == null) return;

    setState(() => _isBooking = true);
    try {
      await _apiService.createAppointment(
        medecinId: widget.medecin.id,
        date: DateFormat('yyyy-MM-dd').format(_selectedDate),
        heureDebut: _selectedCreneau!.heureDebut,
        motif: _selectedMotif,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Rendez-vous confirme!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red),
        );
        setState(() => _isBooking = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Prendre rendez-vous'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: Text(
                    '${widget.medecin.prenom[0]}${widget.medecin.nom[0]}',
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                title: Text('Dr. ${widget.medecin.prenom} ${widget.medecin.nom}'),
                subtitle: Text(widget.medecin.specialite),
              ),
            ),
            const SizedBox(height: 24),
            Text('Date', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            InkWell(
              onTap: _selectDate,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(DateFormat('EEEE d MMMM yyyy', 'fr').format(_selectedDate)),
                    const Icon(Icons.calendar_today),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('Creneau horaire', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_creneaux.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('Aucun creneau disponible pour cette date'),
                ),
              )
            else
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _creneaux.map((creneau) {
                  final isSelected = _selectedCreneau == creneau;
                  return ChoiceChip(
                    label: Text(creneau.heureDebut),
                    selected: isSelected,
                    onSelected: creneau.disponible
                        ? (selected) => setState(() => _selectedCreneau = creneau)
                        : null,
                    backgroundColor: creneau.disponible ? null : Colors.grey.shade200,
                    selectedColor: Theme.of(context).colorScheme.primary,
                    labelStyle: TextStyle(
                      color: isSelected
                          ? Colors.white
                          : creneau.disponible
                              ? null
                              : Colors.grey,
                    ),
                  );
                }).toList(),
              ),
            const SizedBox(height: 24),
            Text('Motif de consultation', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedMotif,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
              ),
              items: _motifs.map((m) {
                return DropdownMenuItem(value: m['value'], child: Text(m['label']!));
              }).toList(),
              onChanged: (value) => setState(() => _selectedMotif = value!),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _selectedCreneau != null && !_isBooking
                    ? _bookAppointment
                    : null,
                child: _isBooking
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Confirmer le rendez-vous'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
