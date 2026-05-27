import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as path;
import 'dart:convert';
import '../../services/auth_service.dart';

class Document {
  final int id;
  final String filename;
  final String originalName;
  final String mimeType;
  final int size;
  final String category;
  final String uploadDate;
  final String? url;

  Document({
    required this.id,
    required this.filename,
    required this.originalName,
    required this.mimeType,
    required this.size,
    required this.category,
    required this.uploadDate,
    this.url,
  });

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      id: json['id'],
      filename: json['filename'],
      originalName: json['originalName'],
      mimeType: json['mimeType'],
      size: json['size'],
      category: json['category'] ?? 'AUTRE',
      uploadDate: json['uploadDate'],
      url: json['url'],
    );
  }
}

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  late AuthService _authService;
  List<Document> _documents = [];
  bool _isLoading = true;
  bool _isUploading = false;
  double _uploadProgress = 0;
  String _selectedCategory = '';

  final List<Map<String, String>> _categories = [
    {'value': '', 'label': 'Tous'},
    {'value': 'ORDONNANCE', 'label': 'Ordonnances'},
    {'value': 'ANALYSE', 'label': 'Analyses'},
    {'value': 'RADIOLOGIE', 'label': 'Radiologie'},
    {'value': 'COMPTE_RENDU', 'label': 'Comptes rendus'},
    {'value': 'CERTIFICAT', 'label': 'Certificats'},
    {'value': 'AUTRE', 'label': 'Autres'},
  ];

  @override
  void initState() {
    super.initState();
    _authService = context.read<AuthService>();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    try {
      final response = await http.get(
        Uri.parse('${AuthService.baseUrl}/patient/documents'),
        headers: _authService.authHeaders,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            _documents = data.map((json) => Document.fromJson(json)).toList();
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<Document> get _filteredDocuments {
    if (_selectedCategory.isEmpty) return _documents;
    return _documents.where((d) => d.category == _selectedCategory).toList();
  }

  Future<void> _pickAndUploadFile() async {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Galerie photo'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Prendre une photo'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.insert_drive_file),
              title: const Text('Fichier (PDF, DICOM)'),
              onTap: () {
                Navigator.pop(context);
                _pickFile();
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: source,
      maxWidth: 2000,
      maxHeight: 2000,
      imageQuality: 85,
    );

    if (image != null) {
      _showCategoryDialog(File(image.path));
    }
  }

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'dcm', 'dicom'],
    );

    if (result != null && result.files.single.path != null) {
      final file = File(result.files.single.path!);

      // Check file size (max 20MB)
      if (await file.length() > 20 * 1024 * 1024) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Le fichier depasse la taille maximale de 20MB'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return;
      }

      _showCategoryDialog(file);
    }
  }

  void _showCategoryDialog(File file) {
    String selectedCat = 'AUTRE';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Categorie du document'),
        content: StatefulBuilder(
          builder: (context, setDialogState) => DropdownButtonFormField<String>(
            value: selectedCat,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Categorie',
            ),
            items: _categories.skip(1).map((cat) {
              return DropdownMenuItem(
                value: cat['value'],
                child: Text(cat['label']!),
              );
            }).toList(),
            onChanged: (value) {
              setDialogState(() => selectedCat = value!);
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              _uploadFile(file, selectedCat);
            },
            child: const Text('Telecharger'),
          ),
        ],
      ),
    );
  }

  Future<void> _uploadFile(File file, String category) async {
    setState(() {
      _isUploading = true;
      _uploadProgress = 0;
    });

    try {
      final uri = Uri.parse('${AuthService.baseUrl}/patient/documents/upload');
      final request = http.MultipartRequest('POST', uri);

      request.headers.addAll({
        'Authorization': 'Bearer ${_authService.token}',
      });

      final extension = path.extension(file.path).toLowerCase();
      String mimeType;
      switch (extension) {
        case '.pdf':
          mimeType = 'application/pdf';
          break;
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        case '.png':
          mimeType = 'image/png';
          break;
        case '.dcm':
        case '.dicom':
          mimeType = 'application/dicom';
          break;
        default:
          mimeType = 'application/octet-stream';
      }

      request.files.add(await http.MultipartFile.fromPath(
        'file',
        file.path,
        contentType: MediaType.parse(mimeType),
      ));
      request.fields['category'] = category;

      final streamedResponse = await request.send();

      // Simulate progress for UX
      for (int i = 0; i <= 100; i += 10) {
        await Future.delayed(const Duration(milliseconds: 50));
        if (mounted) setState(() => _uploadProgress = i / 100);
      }

      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Document telecharge avec succes'),
              backgroundColor: Colors.green,
            ),
          );
          _loadDocuments();
        }
      } else {
        throw Exception('Upload failed');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
          _uploadProgress = 0;
        });
      }
    }
  }

  Future<void> _deleteDocument(Document doc) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le document'),
        content: Text('Supprimer "${doc.originalName}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final response = await http.delete(
        Uri.parse('${AuthService.baseUrl}/patient/documents/${doc.id}'),
        headers: _authService.authHeaders,
      );

      if (response.statusCode == 200) {
        if (mounted) {
          setState(() {
            _documents.removeWhere((d) => d.id == doc.id);
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Document supprime')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _downloadDocument(Document doc) {
    // Open document URL in browser/viewer
    // In a real app, you would use url_launcher or open_file
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Telechargement de ${doc.originalName}')),
    );
  }

  String _formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  String _getCategoryLabel(String category) {
    final cat = _categories.firstWhere(
      (c) => c['value'] == category,
      orElse: () => {'label': category},
    );
    return cat['label'] ?? category;
  }

  IconData _getFileIcon(String mimeType) {
    if (mimeType.startsWith('image/')) return Icons.image;
    if (mimeType == 'application/pdf') return Icons.picture_as_pdf;
    if (mimeType.contains('dicom')) return Icons.medical_information;
    return Icons.insert_drive_file;
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'ORDONNANCE':
        return Colors.blue;
      case 'ANALYSE':
        return Colors.green;
      case 'RADIOLOGIE':
        return Colors.purple;
      case 'COMPTE_RENDU':
        return Colors.orange;
      case 'CERTIFICAT':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes documents'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDocuments,
          ),
        ],
      ),
      body: Column(
        children: [
          // Upload progress
          if (_isUploading)
            LinearProgressIndicator(value: _uploadProgress),

          // Category filter
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat['value'];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(cat['label']!),
                    selected: isSelected,
                    onSelected: (_) {
                      setState(() => _selectedCategory = cat['value']!);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Documents list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredDocuments.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.folder_open,
                                size: 64, color: Colors.grey.shade400),
                            const SizedBox(height: 16),
                            const Text('Aucun document'),
                            const SizedBox(height: 8),
                            const Text(
                              'Ajoutez vos documents medicaux\npour les retrouver facilement',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadDocuments,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _filteredDocuments.length,
                          itemBuilder: (context, index) {
                            final doc = _filteredDocuments[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor:
                                      _getCategoryColor(doc.category)
                                          .withOpacity(0.2),
                                  child: Icon(
                                    _getFileIcon(doc.mimeType),
                                    color: _getCategoryColor(doc.category),
                                  ),
                                ),
                                title: Text(
                                  doc.originalName,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _getCategoryLabel(doc.category),
                                      style: TextStyle(
                                        color: _getCategoryColor(doc.category),
                                        fontSize: 12,
                                      ),
                                    ),
                                    Text(
                                      '${_formatFileSize(doc.size)} - ${doc.uploadDate}',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                                  ],
                                ),
                                isThreeLine: true,
                                trailing: PopupMenuButton(
                                  itemBuilder: (context) => [
                                    const PopupMenuItem(
                                      value: 'download',
                                      child: Row(
                                        children: [
                                          Icon(Icons.download),
                                          SizedBox(width: 8),
                                          Text('Telecharger'),
                                        ],
                                      ),
                                    ),
                                    const PopupMenuItem(
                                      value: 'delete',
                                      child: Row(
                                        children: [
                                          Icon(Icons.delete, color: Colors.red),
                                          SizedBox(width: 8),
                                          Text('Supprimer',
                                              style:
                                                  TextStyle(color: Colors.red)),
                                        ],
                                      ),
                                    ),
                                  ],
                                  onSelected: (value) {
                                    if (value == 'download') {
                                      _downloadDocument(doc);
                                    } else if (value == 'delete') {
                                      _deleteDocument(doc);
                                    }
                                  },
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isUploading ? null : _pickAndUploadFile,
        icon: const Icon(Icons.add),
        label: const Text('Ajouter'),
      ),
    );
  }
}
