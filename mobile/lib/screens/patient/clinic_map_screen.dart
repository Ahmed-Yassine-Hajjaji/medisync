import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

class ClinicMapScreen extends StatefulWidget {
  final String? clinicName;
  final double? clinicLat;
  final double? clinicLng;
  final String? clinicAddress;

  const ClinicMapScreen({
    super.key,
    this.clinicName,
    this.clinicLat,
    this.clinicLng,
    this.clinicAddress,
  });

  @override
  State<ClinicMapScreen> createState() => _ClinicMapScreenState();
}

class _ClinicMapScreenState extends State<ClinicMapScreen> {
  final MapController _mapController = MapController();
  LatLng? _currentPosition;
  bool _isLoading = true;

  // Default clinic location (Paris) - replace with actual clinic coordinates
  late LatLng _clinicPosition;

  @override
  void initState() {
    super.initState();
    _clinicPosition = LatLng(
      widget.clinicLat ?? 48.8566,
      widget.clinicLng ?? 2.3522,
    );
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      if (mounted) {
        setState(() {
          _currentPosition = LatLng(position.latitude, position.longitude);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _centerOnClinic() {
    _mapController.move(_clinicPosition, 15);
  }

  void _centerOnMe() {
    if (_currentPosition != null) {
      _mapController.move(_currentPosition!, 15);
    }
  }

  Future<void> _openInMaps() async {
    final url = Uri.parse(
      'https://www.openstreetmap.org/directions?from=${_currentPosition?.latitude ?? ""},${_currentPosition?.longitude ?? ""}&to=${_clinicPosition.latitude},${_clinicPosition.longitude}',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.clinicName ?? 'Localisation clinique'),
        actions: [
          IconButton(
            icon: const Icon(Icons.directions),
            onPressed: _openInMaps,
            tooltip: 'Itineraire',
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _clinicPosition,
              initialZoom: 14,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.medisync.mobile',
              ),
              MarkerLayer(
                markers: [
                  // Clinic marker
                  Marker(
                    point: _clinicPosition,
                    width: 80,
                    height: 80,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(4),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.2),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: Text(
                            widget.clinicName ?? 'Clinique',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const Icon(Icons.local_hospital, color: Colors.red, size: 40),
                      ],
                    ),
                  ),
                  // Current position marker
                  if (_currentPosition != null)
                    Marker(
                      point: _currentPosition!,
                      width: 40,
                      height: 40,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                        ),
                        child: const Icon(Icons.person, color: Colors.white, size: 20),
                      ),
                    ),
                ],
              ),
            ],
          ),
          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
          Positioned(
            bottom: 100,
            right: 16,
            child: Column(
              children: [
                FloatingActionButton.small(
                  heroTag: 'clinic',
                  onPressed: _centerOnClinic,
                  child: const Icon(Icons.local_hospital),
                ),
                const SizedBox(height: 8),
                FloatingActionButton.small(
                  heroTag: 'me',
                  onPressed: _centerOnMe,
                  child: const Icon(Icons.my_location),
                ),
              ],
            ),
          ),
          if (widget.clinicAddress != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      widget.clinicName ?? 'Clinique MediSync',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Expanded(child: Text(widget.clinicAddress!)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: _openInMaps,
                        icon: const Icon(Icons.directions),
                        label: const Text('Obtenir l\'itineraire'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
