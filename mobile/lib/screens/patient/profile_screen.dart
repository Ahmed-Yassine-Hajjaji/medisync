import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import 'documents_screen.dart';
import 'medication_reminders_screen.dart';
import 'clinic_map_screen.dart';

/// Onglet "Profil" : informations de l'utilisateur, raccourcis et
/// deconnexion.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radius),
        ),
        title: const Text('Deconnexion'),
        content: const Text('Voulez-vous vraiment vous deconnecter ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Deconnexion'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    if (!context.mounted) return;
    await context.read<AuthService>().logout();
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().user;
    final initials =
        '${user?.prenom.isNotEmpty == true ? user!.prenom[0] : ''}'
        '${user?.nom.isNotEmpty == true ? user!.nom[0] : ''}';

    return Scaffold(
      appBar: AppBar(title: const Text('Mon profil')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.md),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: AppColors.primary,
                    child: Text(
                      initials.isEmpty ? '?' : initials,
                      style: const TextStyle(
                        fontSize: 28,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    '${user?.prenom ?? ""} ${user?.nom ?? ""}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    user?.email ?? '',
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Services',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Card(
            margin: EdgeInsets.zero,
            child: Column(
              children: [
                _buildTile(
                  context,
                  icon: Icons.folder_outlined,
                  label: 'Mes documents',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const DocumentsScreen()),
                  ),
                ),
                const Divider(height: 1),
                _buildTile(
                  context,
                  icon: Icons.alarm,
                  label: 'Rappels de medicaments',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const MedicationRemindersScreen()),
                  ),
                ),
                const Divider(height: 1),
                _buildTile(
                  context,
                  icon: Icons.map_outlined,
                  label: 'Localiser la clinique',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ClinicMapScreen()),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Card(
            margin: EdgeInsets.zero,
            child: _buildTile(
              context,
              icon: Icons.logout,
              label: 'Deconnexion',
              color: AppColors.danger,
              onTap: () => _logout(context),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Center(
            child: Text(
              'MediSync v1.0.0',
              style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTile(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color? color,
  }) {
    return ListTile(
      leading: Icon(icon, color: color ?? AppColors.primary),
      title: Text(label, style: TextStyle(color: color)),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
