import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';

class PatientDashboard extends StatefulWidget {
  const PatientDashboard({super.key});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  late ApiService _apiService;
  List<Appointment> _appointments = [];
  List<Medecin> _medecins = [];
  bool _isLoading = true;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService(context.read<AuthService>());
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final appointments = await _apiService.getMyAppointments();
      final medecins = await _apiService.getMedecins();
      if (mounted) {
        setState(() {
          _appointments = appointments;
          _medecins = medecins;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;

    return Scaffold(
      appBar: AppBar(
        title: Text('Bonjour, ${user?.prenom ?? ""}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await context.read<AuthService>().logout();
              if (mounted) {
                Navigator.pushReplacementNamed(context, '/home');
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : IndexedStack(
              index: _currentIndex,
              children: [
                _buildHomeTab(),
                _buildAppointmentsTab(),
                _buildMedecinsTab(),
                _buildProfileTab(),
              ],
            ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.calendar_today), label: 'RDV'),
          NavigationDestination(icon: Icon(Icons.medical_services), label: 'Medecins'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }

  Widget _buildHomeTab() {
    final upcomingAppointments = _appointments
        .where((a) => a.statut != 'ANNULE' && a.statut != 'TERMINE')
        .toList();

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.calendar_today, color: Colors.blue),
              title: Text('${upcomingAppointments.length}'),
              subtitle: const Text('Rendez-vous a venir'),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Prochains rendez-vous',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          if (upcomingAppointments.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('Aucun rendez-vous a venir'),
              ),
            )
          else
            ...upcomingAppointments.take(3).map((apt) => Card(
              child: ListTile(
                leading: CircleAvatar(
                  child: Text(apt.medecinNom[0]),
                ),
                title: Text('Dr. ${apt.medecinPrenom} ${apt.medecinNom}'),
                subtitle: Text('${apt.date} a ${apt.heureDebut}'),
                trailing: _buildStatusChip(apt.statut),
              ),
            )),
        ],
      ),
    );
  }

  Widget _buildAppointmentsTab() {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _appointments.length,
        itemBuilder: (context, index) {
          final apt = _appointments[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircleAvatar(child: Text(apt.medecinNom[0])),
              title: Text('Dr. ${apt.medecinPrenom} ${apt.medecinNom}'),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${apt.date} a ${apt.heureDebut}'),
                  Text(apt.motif, style: const TextStyle(fontSize: 12)),
                ],
              ),
              trailing: _buildStatusChip(apt.statut),
              isThreeLine: true,
            ),
          );
        },
      ),
    );
  }

  Widget _buildMedecinsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _medecins.length,
      itemBuilder: (context, index) {
        final medecin = _medecins[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Theme.of(context).colorScheme.primary,
              child: Text(
                '${medecin.prenom[0]}${medecin.nom[0]}',
                style: const TextStyle(color: Colors.white),
              ),
            ),
            title: Text('Dr. ${medecin.prenom} ${medecin.nom}'),
            subtitle: Text(medecin.specialite),
            trailing: medecin.noteMoyenne != null
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 16),
                      Text(medecin.noteMoyenne!.toStringAsFixed(1)),
                    ],
                  )
                : null,
            onTap: () {
              // Navigate to medecin detail
            },
          ),
        );
      },
    );
  }

  Widget _buildProfileTab() {
    final user = context.watch<AuthService>().user;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: Text(
                    '${user?.prenom[0] ?? ""}${user?.nom[0] ?? ""}',
                    style: const TextStyle(fontSize: 24, color: Colors.white),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  '${user?.prenom ?? ""} ${user?.nom ?? ""}',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                Text(user?.email ?? ""),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        ListTile(
          leading: const Icon(Icons.edit),
          title: const Text('Modifier mes informations'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {},
        ),
        ListTile(
          leading: const Icon(Icons.notifications),
          title: const Text('Notifications'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {},
        ),
        ListTile(
          leading: const Icon(Icons.logout, color: Colors.red),
          title: const Text('Deconnexion', style: TextStyle(color: Colors.red)),
          onTap: () async {
            await context.read<AuthService>().logout();
            if (mounted) {
              Navigator.pushReplacementNamed(context, '/home');
            }
          },
        ),
      ],
    );
  }

  Widget _buildStatusChip(String statut) {
    Color color;
    switch (statut) {
      case 'CONFIRME':
        color = Colors.green;
        break;
      case 'EN_ATTENTE':
        color = Colors.orange;
        break;
      case 'ANNULE':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }
    return Chip(
      label: Text(statut, style: const TextStyle(fontSize: 10)),
      backgroundColor: color.withOpacity(0.2),
      labelStyle: TextStyle(color: color),
      padding: EdgeInsets.zero,
      visualDensity: VisualDensity.compact,
    );
  }
}
