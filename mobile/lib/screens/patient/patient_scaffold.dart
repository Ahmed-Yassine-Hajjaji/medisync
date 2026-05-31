import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'patient_dashboard.dart';
import 'appointments_tab.dart';
import 'medical_record_screen.dart';
import 'prescriptions_screen.dart';
import 'profile_screen.dart';

class PatientScaffold extends StatefulWidget {
  const PatientScaffold({super.key});

  @override
  State<PatientScaffold> createState() => _PatientScaffoldState();
}

class _PatientScaffoldState extends State<PatientScaffold> {
  int _selectedIndex = 0;

  static const List<Widget> _screens = [
    PatientDashboard(),
    AppointmentsTab(),
    MedicalRecordScreen(),
    PrescriptionsScreen(),
    ProfileScreen(),
  ];

  static const List<NavigationDestination> _destinations = [
    NavigationDestination(
      icon: Icon(Icons.home_outlined),
      selectedIcon: Icon(Icons.home),
      label: 'Accueil',
    ),
    NavigationDestination(
      icon: Icon(Icons.calendar_today_outlined),
      selectedIcon: Icon(Icons.calendar_today),
      label: 'RDV',
    ),
    NavigationDestination(
      icon: Icon(Icons.folder_outlined),
      selectedIcon: Icon(Icons.folder),
      label: 'Dossier',
    ),
    NavigationDestination(
      icon: Icon(Icons.medication_outlined),
      selectedIcon: Icon(Icons.medication),
      label: 'Ordonn.',
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
          setState(() => _selectedIndex = index);
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
