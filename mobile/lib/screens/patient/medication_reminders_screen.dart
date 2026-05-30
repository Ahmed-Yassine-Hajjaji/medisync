import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class MedicationRemindersScreen extends StatefulWidget {
  const MedicationRemindersScreen({super.key});

  @override
  State<MedicationRemindersScreen> createState() => _MedicationRemindersScreenState();
}

class _MedicationRemindersScreenState extends State<MedicationRemindersScreen> {
  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  List<MedicationReminder> _reminders = [];

  @override
  void initState() {
    super.initState();
    _initNotifications();
    _loadReminders();
  }

  Future<void> _initNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings();
    const initSettings = InitializationSettings(android: androidSettings, iOS: iosSettings);
    await _notifications.initialize(initSettings);
  }

  Future<void> _loadReminders() async {
    final prefs = await SharedPreferences.getInstance();
    final remindersJson = prefs.getStringList('medication_reminders') ?? [];
    setState(() {
      _reminders = remindersJson
          .map((json) => MedicationReminder.fromJson(jsonDecode(json)))
          .toList();
    });
  }

  Future<void> _saveReminders() async {
    final prefs = await SharedPreferences.getInstance();
    final remindersJson = _reminders.map((r) => jsonEncode(r.toJson())).toList();
    await prefs.setStringList('medication_reminders', remindersJson);
  }

  void _addReminder() {
    showDialog(
      context: context,
      builder: (context) => _AddReminderDialog(
        onAdd: (reminder) {
          setState(() => _reminders.add(reminder));
          _saveReminders();
          _scheduleNotification(reminder);
        },
      ),
    );
  }

  Future<void> _scheduleNotification(MedicationReminder reminder) async {
    // Schedule daily notification at the specified time
    final androidDetails = AndroidNotificationDetails(
      'medication_reminders',
      'Rappels medicaments',
      channelDescription: 'Notifications pour la prise de medicaments',
      importance: Importance.high,
      priority: Priority.high,
    );
    final notificationDetails = NotificationDetails(android: androidDetails);

    // Show a notification immediately as a test
    await _notifications.show(
      reminder.id,
      'Rappel: ${reminder.medicament}',
      'Il est temps de prendre ${reminder.dosage}',
      notificationDetails,
    );
  }

  void _toggleReminder(MedicationReminder reminder) {
    setState(() {
      final index = _reminders.indexWhere((r) => r.id == reminder.id);
      if (index != -1) {
        _reminders[index] = reminder.copyWith(enabled: !reminder.enabled);
      }
    });
    _saveReminders();
  }

  void _deleteReminder(MedicationReminder reminder) {
    setState(() => _reminders.removeWhere((r) => r.id == reminder.id));
    _saveReminders();
    _notifications.cancel(reminder.id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rappels medicaments'),
      ),
      body: _reminders.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_off, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  const Text('Aucun rappel configure'),
                  const SizedBox(height: 8),
                  const Text(
                    'Ajoutez des rappels pour ne jamais\noublier vos medicaments',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _reminders.length,
              itemBuilder: (context, index) {
                final reminder = _reminders[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: reminder.enabled ? Colors.green : Colors.grey,
                      child: const Icon(Icons.alarm, color: Colors.white),
                    ),
                    title: Text(reminder.medicament),
                    subtitle: Text('${reminder.dosage} - ${reminder.time}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Switch(
                          value: reminder.enabled,
                          onChanged: (_) => _toggleReminder(reminder),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _deleteReminder(reminder),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addReminder,
        child: const Icon(Icons.add),
      ),
    );
  }
}

class MedicationReminder {
  final int id;
  final String medicament;
  final String dosage;
  final String time;
  final bool enabled;

  MedicationReminder({
    required this.id,
    required this.medicament,
    required this.dosage,
    required this.time,
    this.enabled = true,
  });

  MedicationReminder copyWith({bool? enabled}) {
    return MedicationReminder(
      id: id,
      medicament: medicament,
      dosage: dosage,
      time: time,
      enabled: enabled ?? this.enabled,
    );
  }

  factory MedicationReminder.fromJson(Map<String, dynamic> json) {
    return MedicationReminder(
      id: json['id'],
      medicament: json['medicament'],
      dosage: json['dosage'],
      time: json['time'],
      enabled: json['enabled'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'medicament': medicament,
    'dosage': dosage,
    'time': time,
    'enabled': enabled,
  };
}

class _AddReminderDialog extends StatefulWidget {
  final Function(MedicationReminder) onAdd;

  const _AddReminderDialog({required this.onAdd});

  @override
  State<_AddReminderDialog> createState() => _AddReminderDialogState();
}

class _AddReminderDialogState extends State<_AddReminderDialog> {
  final _medicamentController = TextEditingController();
  final _dosageController = TextEditingController();
  TimeOfDay _selectedTime = TimeOfDay.now();

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Nouveau rappel'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _medicamentController,
            decoration: const InputDecoration(labelText: 'Medicament'),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _dosageController,
            decoration: const InputDecoration(labelText: 'Dosage'),
          ),
          const SizedBox(height: 16),
          ListTile(
            title: const Text('Heure'),
            trailing: Text(_selectedTime.format(context)),
            onTap: () async {
              final time = await showTimePicker(
                context: context,
                initialTime: _selectedTime,
              );
              if (time != null) setState(() => _selectedTime = time);
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          onPressed: () {
            if (_medicamentController.text.isNotEmpty) {
              widget.onAdd(MedicationReminder(
                id: DateTime.now().millisecondsSinceEpoch,
                medicament: _medicamentController.text,
                dosage: _dosageController.text,
                time: _selectedTime.format(context),
              ));
              Navigator.pop(context);
            }
          },
          child: const Text('Ajouter'),
        ),
      ],
    );
  }
}
