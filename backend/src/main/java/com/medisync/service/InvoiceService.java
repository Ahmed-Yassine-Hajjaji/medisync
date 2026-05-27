package com.medisync.service;

import com.medisync.dto.InvoiceDTO;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;

    public List<InvoiceDTO> getInvoicesByPatient(Long patientId) {
        return invoiceRepository.findByPatientId(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<InvoiceDTO> getUnpaidInvoices(Long patientId) {
        return invoiceRepository.findUnpaidByPatientId(patientId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture non trouvee"));
        return toDTO(invoice);
    }

    @Transactional
    public InvoiceDTO createInvoice(Long consultationId, InvoiceDTO dto) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new RuntimeException("Consultation non trouvee"));

        Invoice invoice = new Invoice();
        invoice.setConsultation(consultation);
        invoice.setPatient(consultation.getPatient());
        invoice.setMontantTotal(dto.getMontantTotal());
        invoice.setActes(dto.getActes());
        invoice.setDetails(dto.getDetails());
        invoice.setDateEcheance(dto.getDateEcheance() != null ? dto.getDateEcheance() : LocalDate.now().plusDays(30));

        invoice = invoiceRepository.save(invoice);
        return toDTO(invoice);
    }

    @Transactional
    public InvoiceDTO processPayment(Long id, BigDecimal montant, String modePaiement) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture non trouvee"));

        BigDecimal newMontantPaye = invoice.getMontantPaye().add(montant);
        invoice.setMontantPaye(newMontantPaye);
        invoice.setModePaiement(modePaiement);

        if (newMontantPaye.compareTo(invoice.getMontantTotal()) >= 0) {
            invoice.setStatut(StatutPaiement.PAYE);
        } else if (newMontantPaye.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatut(StatutPaiement.PARTIEL);
        }

        invoice = invoiceRepository.save(invoice);
        return toDTO(invoice);
    }

    public BigDecimal getTotalRevenue(LocalDate start, LocalDate end) {
        BigDecimal total = invoiceRepository.getTotalRevenueBetween(start, end);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getTotalPaid(LocalDate start, LocalDate end) {
        BigDecimal total = invoiceRepository.getTotalPaidBetween(start, end);
        return total != null ? total : BigDecimal.ZERO;
    }

    private InvoiceDTO toDTO(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(invoice.getId());
        dto.setNumeroFacture(invoice.getNumeroFacture());
        if (invoice.getConsultation() != null) {
            dto.setConsultationId(invoice.getConsultation().getId());
        }
        dto.setPatientId(invoice.getPatient().getId());
        dto.setPatientNom(invoice.getPatient().getNom() + " " + invoice.getPatient().getPrenom());
        dto.setDateFacture(invoice.getDateFacture());
        dto.setDateEcheance(invoice.getDateEcheance());
        dto.setMontantTotal(invoice.getMontantTotal());
        dto.setMontantPaye(invoice.getMontantPaye());
        dto.setStatut(invoice.getStatut());
        dto.setActes(invoice.getActes());
        dto.setDetails(invoice.getDetails());
        dto.setModePaiement(invoice.getModePaiement());
        return dto;
    }
}
