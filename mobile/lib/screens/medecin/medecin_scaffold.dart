import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'medecin_dashboard.dart';
import 'medecin_planning.dart';
import 'medecin_consultations.dart';
import 'medecin_profile.dart';

/// Shell principal du medecin avec navigation par onglets.
class MedecinScaffold extends StatefulWidget {
  const MedecinScaffold({super.key});

  @override
  State<MedecinScaffold> createState() => _MedecinScaffoldState();
}

class _MedecinScaffoldState extends State<MedecinScaffold> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    MedecinDashboard(),
    MedecinPlanning(),
    MedecinConsultations(),
    MedecinProfile(),
  ];

  final List<NavigationDestination> _destinations = const [
    NavigationDestination(
      icon: Icon(Icons.dashboard_outlined),
      selectedIcon: Icon(Icons.dashboard),
      label: 'Tableau de bord',
    ),
    NavigationDestination(
      icon: Icon(Icons.calendar_month_outlined),
      selectedIcon: Icon(Icons.calendar_month),
      label: 'Planning',
    ),
    NavigationDestination(
      icon: Icon(Icons.medical_services_outlined),
      selectedIcon: Icon(Icons.medical_services),
      label: 'Consultations',
    ),
    NavigationDestination(
      icon: Icon(Icons.person_outline),
      selectedIcon: Icon(Icons.person),
      label: 'Profil',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: _destinations,
        indicatorColor: AppColors.primary.withOpacity(0.15),
        surfaceTintColor: Colors.transparent,
        backgroundColor: Theme.of(context).colorScheme.surface,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        animationDuration: const Duration(milliseconds: 300),
      ),
    );
  }
}
